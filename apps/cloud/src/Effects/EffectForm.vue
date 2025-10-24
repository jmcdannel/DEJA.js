<script setup lang="ts">
import { ref, watch, onErrorCaptured, computed } from 'vue'
import { useEfx, useLayout, type Effect } from '@repo/modules'
import { efxTypes } from '@repo/modules/effects/constants'
import ViewJson from '@/Core/UI/ViewJson.vue'
import MacroForm from '@/Effects/MacroForm.vue'
import IALEDForm from '@/Effects//IALEDForm.vue'
import ColorPicker from '@/Common/Color/ColorPicker.vue'
import TagPicker from '@/Common/Tags/TagPicker.vue'
import LcdDisplay from '@/Core/UI/LcdDisplay.vue'
import SoundFileList from '@/Effects/Sounds/SoundFileList.vue'
// TODO: icon picker

// Error handling
onErrorCaptured((error, instance, info) => {
  console.error('EffectForm: Error captured:', error)
  console.error('EffectForm: Instance:', instance)
  console.error('EffectForm: Info:', info)
  return false // Prevent error from propagating
})

interface ValidationRules {
  required: ((val: any) => boolean | string)[];
}

const props = defineProps<{
  efx: Effect
}>()

const emit = defineEmits(['close'])
const DEFAULT_DEVICE = 'dccex'
let getDevices: any

try {
  const layoutHook = useLayout()
  getDevices = layoutHook.getDevices
  console.log('EffectForm: useLayout hook loaded successfully')
} catch (error) {
  console.error('EffectForm: Failed to load useLayout hook:', error)
  getDevices = () => []
}

let setEfx: any, getEfxType: any

try {
  const efxHook = useEfx()
  setEfx = efxHook.setEfx
  getEfxType = efxHook.getEfxType
  console.log('EffectForm: useEfx hook loaded successfully')
} catch (error) {
  console.error('EffectForm: Failed to load useEfx hook:', error)
  setEfx = () => console.log('setEfx mock called')
  getEfxType = () => ({})
}

// Debug imports
console.log('EffectForm: Imports check:', {
  useEfx: !!useEfx,
  efxTypes: !!efxTypes,
  useLayout: !!useLayout
})

console.log('EffectForm: efxTypes value:', efxTypes)
console.log('EffectForm: Component mounting with props:', props.efx)

const editColor = ref(false)

const device = ref(props.efx?.device || DEFAULT_DEVICE)
const name = ref(props.efx?.name || '')
const pin = ref(props.efx?.pin)
// signal wiring: reference existing pin effects
const red = ref((props.efx as any)?.red || '')
const yellow = ref((props.efx as any)?.yellow || '')
const green = ref((props.efx as any)?.green || '')
const macroOn = ref(props.efx?.on || [])
const macroOff = ref(props.efx?.off || [])
const pattern = ref(props.efx?.pattern || undefined)
const range = ref(props.efx?.range || undefined)
const config = ref(props.efx?.config || undefined)
const efxType = ref(props.efx?.type)
const efxTypeObj = ref(props.efx?.type ? getEfxType(props.efx?.type) : undefined)
const color = ref(props.efx?.color || efxTypeObj.value?.color || 'purple')  
const tags = ref<string[]>(props.efx?.tags || [])
const allowGuest = ref<boolean>(props.efx?.allowGuest || false)
const loading = ref(false)
const selectedSoundFile = ref<string>(props.efx?.sound || '')
const soundDuration = ref<number>(props.efx?.soundDuration || 0)
const loadingSoundDuration = ref(false)
const showSoundDialog = ref(false)
const rules: ValidationRules = {
  required: [(val) => !!val || 'Required.']
}

// Validation for device when required
const deviceRules = computed(() => {
  if (efxTypeObj.value?.require?.includes('device')) {
    return [(val: any) => !!val || 'Device is required for this effect type.']
  }
  return []
})

// Validation for sound file when required
const soundFileRules = computed(() => {
  if (efxType.value === 'sound') {
    return [(val: any) => !!val || 'Sound file is required for sound effects.']
  }
  return []
})
const devices = getDevices()
console.log('EffectForm initialized with:', {
  props: props.efx,
  devices,
  efxType: efxType.value,
  efxTypeObj: efxTypeObj.value
})


watch(efxType, (newType) => {
  if (newType) {
    efxTypeObj.value = getEfxType(newType)
    // Set default device if the effect type has one and no device is currently set
    if (efxTypeObj.value?.defaultDevice && !props.efx?.device) {
      device.value = efxTypeObj.value.defaultDevice
    }   
  } else {
    efxTypeObj.value = undefined
  }
})

// Watch for changes to selectedSoundFile to determine duration
watch(selectedSoundFile, (newSoundFile) => {
  if (newSoundFile && soundDuration.value === 0) {
    determineSoundDuration(newSoundFile)
  }
}, { immediate: true }) // immediate: true to run on component mount

async function submit () {
  loading.value = true

  // Validate device is selected when required
  if (efxTypeObj.value?.require?.includes('device') && !device.value) {
    console.error('Device is required for this effect type')
    loading.value = false
    return
  }

  // Validate sound file is selected for sound effects
  if (efxType.value === 'sound' && !selectedSoundFile.value) {
    console.error('Sound file is required for sound effects')
    loading.value = false
    return
  }

  const newEfx: Effect = {
    name: name.value,
    type: efxType.value || '',
    color: color.value,
    tags: tags.value,
    allowGuest: allowGuest.value,
    state: false,
    id: props.efx?.id || ''
  }
  // set device
  if (efxTypeObj.value?.require?.includes('device')) {
    newEfx.device = device.value
  }
  //  set pin
  if (efxTypeObj.value?.require?.includes('pin') && pin.value) {
    newEfx.pin = parseInt(pin.value as unknown as string)
  }
  //  set macro
  if (efxType.value === 'macro') {
    newEfx.on = macroOn.value
    newEfx.off = macroOff.value
  }
  //  set macro
  if (efxType.value === 'ialed') {
    newEfx.pin = pin.value
    newEfx.pattern = pattern.value
    newEfx.range = range.value
    newEfx.config = config.value
  }
  // set signal references
  if (efxType.value === 'signal') {
    const efxAny: any = newEfx
    efxAny.red = red.value || undefined
    efxAny.yellow = yellow.value || undefined
    efxAny.green = green.value || undefined
  }

  // set sound file for sound effects
  if (efxType.value === 'sound') {
    newEfx.sound = selectedSoundFile.value
    newEfx.soundDuration = soundDuration.value
  }

  await setEfx(props.efx?.id || '', newEfx)
  loading.value = false
  emit('close')
}

function handleMacro({on , off}: {on: string[], off: string[]}) {
  macroOn.value = on
  macroOff.value = off
}

function handleIALED(ialedEffectConfig: {
    pattern: string;
    range: string;
    config: string;
  }): void {  
  pattern.value = ialedEffectConfig.pattern
  range.value = ialedEffectConfig.range
  config.value = ialedEffectConfig.config
}

function handleSoundFileSelect(soundFile: string) {
  selectedSoundFile.value = soundFile
  showSoundDialog.value = false
  
  // Determine sound duration
  if (soundFile) {
    determineSoundDuration(soundFile)
  } else {
    soundDuration.value = 0
  }
}

async function determineSoundDuration(soundUrl: string): Promise<void> {
  loadingSoundDuration.value = true
  try {
    // Create a temporary audio element to get duration
    const tempAudio = document.createElement('audio')
    tempAudio.src = soundUrl
    tempAudio.preload = 'metadata'
    
    // Return a promise that resolves when metadata is loaded
    await new Promise<void>((resolve, reject) => {
      tempAudio.addEventListener('loadedmetadata', () => {
        soundDuration.value = tempAudio.duration
        console.log(`Sound duration determined: ${tempAudio.duration} seconds for ${soundUrl}`)
        resolve()
      })
      
      tempAudio.addEventListener('error', (error) => {
        console.error('Error loading audio metadata:', error)
        soundDuration.value = 0
        reject(error)
      })
      
      // Trigger metadata loading
      tempAudio.load()
    })
  } catch (error) {
    console.error('Failed to determine sound duration:', error)
    soundDuration.value = 0
  } finally {
    loadingSoundDuration.value = false
  }
}


</script>
<template>
  <div>
    <h1>EffectForm Component Loaded</h1>
    
    <v-form validate-on="submit lazy" @submit.prevent="submit">
    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
    <div class="flex items-center justify-between">
    <v-label class="m-2 text-4xl">
      <v-icon v-if="efxTypeObj?.icon" size="32" class="stroke-none">{{efxTypeObj.icon}}</v-icon>
      {{ efx ? 'Edit' : 'Add'}} Effect
    </v-label>
    <v-chip class="m-2" :color="color" size="x-large">
      <v-icon v-if="efxTypeObj?.icon" :icon="efxTypeObj.icon" class="mr-2"></v-icon>
      {{ efxType }}
    </v-chip>
    </div>
    <template v-if="efxTypeObj?.require?.includes('device')">
      <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
      <v-label class="m-2">
        Device <span class="text-red-500">*</span>
        <div class="text-sm opacity-70 mt-1">Required for {{ efxType }} effects</div>
      </v-label>
      <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
      <v-btn-toggle v-model="device" divided class="flex-wrap h-auto" size="x-large" :rules="deviceRules">
          <v-btn v-for="deviceOpt in devices" :value="deviceOpt.id" :key="deviceOpt.id" 
            class="min-h-24 min-w-48 border"
            :color="color" >
              {{ deviceOpt.id }}
          </v-btn>
      </v-btn-toggle>
      <div v-if="efxTypeObj?.defaultDevice" class="text-xs opacity-70 mt-1">
        Default device: {{ efxTypeObj.defaultDevice }}
      </div>
    </template>
    
    <template v-if="!efx.type">
      <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
      <v-label class="m-2">Type</v-label>
      <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
      <v-btn-toggle v-model="efxType" divided class="flex-wrap h-auto" size="x-large">
        <v-btn v-for="efxOpt in efxTypes" :value="efxOpt.value" :key="efxOpt.value"
          class="min-h-48 min-w-48 border"
          :color="color">
          <div class="flex flex-col">
            <v-icon v-if="efxOpt.icon" size="32" :color="efxOpt.color" class="stroke-none">{{efxOpt.icon}}</v-icon>
            <div class="mt-4">{{ efxOpt.label }}</div>
          </div>
          
        </v-btn>
      </v-btn-toggle>
    </template>
    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
    <!-- name -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <v-text-field
        v-model="name"
        label="Name"
        variant="outlined"
        :rules="rules.required"
      ></v-text-field>
    </div>   
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <LcdDisplay 
        :content="`efxType: ${efxType}`"
        title="EFFECT TYPE"
        color="blue"
        size="sm"
        :max-lines="3"
      />
      <LcdDisplay 
        :content="efxTypeObj ? JSON.stringify(efxTypeObj, null, 2).split('\n') : []"
        title="TYPE OBJECT"
        color="green"
        size="sm"
        :max-lines="8"
      />
    </div>

    <!-- pin -->
    <template v-if="efxTypeObj?.require?.includes('pin')">
      <v-text-field
        v-model="pin"
        label="Pin"
        variant="outlined"
        min-width="100"
        max-width="200"
      >
      </v-text-field>
    </template>

    <!-- signal references -->
    <template v-else-if="efxType === 'signal'">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <v-text-field v-model="red" label="Red Effect ID" variant="outlined" />
        <v-text-field v-model="yellow" label="Yellow Effect ID" variant="outlined" />
        <v-text-field v-model="green" label="Green Effect ID" variant="outlined" />
      </div>
      <div class="text-xs opacity-70 mt-1">Enter the IDs of existing pin effects for each color.</div>
    </template>

    <!-- sound file selection -->
    <template v-else-if="efxType === 'sound'">
      <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
      <v-label class="m-2">
        Sound File <span class="text-red-500">*</span>
        <div class="text-sm opacity-70 mt-1">Select a sound file to play when this effect is triggered</div>
      </v-label>
      <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
      
      <!-- Selected sound file display -->
      <div v-if="selectedSoundFile" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <v-icon icon="mdi-check-circle" color="green" class="mr-2"></v-icon>
            <div>
              <span class="text-green-800">Selected: {{ selectedSoundFile.split('/').pop() }}</span>
              <div v-if="loadingSoundDuration" class="text-sm text-blue-600 mt-1 flex items-center">
                <v-progress-circular size="12" width="2" indeterminate class="mr-1"></v-progress-circular>
                Determining duration...
              </div>
              <div v-else-if="soundDuration > 0" class="text-sm text-green-600 mt-1">
                Duration: {{ Math.floor(soundDuration / 60) }}:{{ String(Math.floor(soundDuration % 60)).padStart(2, '0') }}
              </div>
            </div>
          </div>
          <v-btn 
            size="small" 
            variant="text" 
            color="red" 
            @click="selectedSoundFile = ''; soundDuration = 0"
            title="Clear selection"
          >
            <v-icon icon="mdi-close"></v-icon>
          </v-btn>
        </div>
      </div>
      
      <!-- Sound file selection button -->
      <div class="mb-4">
        <v-btn
          class="min-h-48 min-w-48 border flex"
          :color="color"
          @click="showSoundDialog = true"
        >
          <div class="relative flex flex-col justify-center items-center">
            <v-icon size="64">mdi-volume-high</v-icon>
            <div class="mt-4">
              {{ selectedSoundFile ? 'Change Sound File' : 'Select Sound File' }}
            </div>
          </div>
        </v-btn>
      </div>
    </template>

    <!-- macro -->
    <template v-else-if="efxType === 'macro'">
      <MacroForm @change="handleMacro" :on="macroOn" :off="macroOff"></MacroForm>
    </template>

    <!-- macro -->
    <template v-if="efxType === 'ialed'">
      <IALEDForm 
        @change="handleIALED" :efx="efx"
        :color="color"
        :device="device"
        v-model:pattern="pattern"
        v-model:range="range"
        v-model:config="config"
        v-model:strip="pin"
      ></IALEDForm>
      <LcdDisplay 
        :content="config ? JSON.stringify(config, null, 2).split('\n') : []"
        title="CONFIG"
        color="amber"
        size="sm"
        :max-lines="10"
      />
    </template>
    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>

    <!-- color -->
    <section class="h-auto  my-4">
      <v-btn
        class="min-h-48 min-w-48 border flex"
        :color="color"
        @click="editColor = true" >
        <!-- <v-icon :icon="efxOpt.icon" :color="efxOpt.color"></v-icon> -->
        <div class="relative flex flex-col justify-center items-center">
          <v-icon size="64">mdi-palette</v-icon>
          <div class="mt-4">Color [{{ color }}]</div>
        </div>        
      </v-btn>
    </section>
    <v-dialog max-width="80vw" v-model="editColor">
      <ColorPicker v-model="color" @select="editColor = false" @cancel="editColor = false; color = props.efx?.color ?? 'purple'"></ColorPicker>
    </v-dialog>

    <!-- Sound File Selection Dialog -->
    <v-dialog max-width="90vw" v-model="showSoundDialog">
      <v-card>
        <v-card-title class="flex items-center justify-between">
          <span>Select Sound File</span>
          <v-btn icon @click="showSoundDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <SoundFileList 
            :selection-mode="true" 
            :selected-sound="selectedSoundFile"
            @select="handleSoundFileSelect"
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn 
            variant="tonal" 
            @click="showSoundDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn 
            :color="color" 
            @click="showSoundDialog = false"
            :disabled="!selectedSoundFile"
          >
            Confirm Selection
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
    <TagPicker class="my-4 " v-model="tags"></TagPicker>
    
    <!-- Guest Access -->
    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
    <div class="flex items-center justify-between my-4">
      <div>
        <v-label class="text-lg">Guest Access</v-label>
        <div class="text-sm opacity-70 mt-1">Allow visitors to control this effect in the tour app</div>
      </div>
      <v-switch
        v-model="allowGuest"
        :color="color"
        hide-details
      >
        <template #label>
          <v-icon 
            :icon="allowGuest ? 'mdi-account-check' : 'mdi-account-off'" 
            class="mr-2"
          ></v-icon>
          {{ allowGuest ? 'Enabled' : 'Disabled' }}
        </template>
      </v-switch>
    </div>
    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 my-4">
      <v-btn
        class="mt-2"
        text="Close"
        type="button"
        variant="tonal"
        @click="$emit('close')"
      ></v-btn>
      <v-btn
        :loading="loading"
        class="mt-2"
        text="Submit"
        type="submit"
        :color="color"
      ></v-btn>  
    </div>
    <ViewJson :json="efx" label="Efx" />
    <ViewJson :json="efxTypeObj" label="efxTypeObj" />
    <ViewJson :json="efxTypes" label="efxTypes" />
  </v-form>
  </div>
</template>