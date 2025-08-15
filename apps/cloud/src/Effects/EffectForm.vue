<script setup lang="ts">
import { ref, watch, onErrorCaptured } from 'vue'
import { useEfx, useLayout, type Effect } from '@repo/modules'
import { efxTypes } from '@repo/modules/effects/constants'
import { useSound } from '@vueuse/sound'
import ViewJson from '@/Core/UI/ViewJson.vue'
import MacroForm from '@/Effects/MacroForm.vue'
import IALEDForm from '@/Effects//IALEDForm.vue'
import ColorPicker from '@/Common/Color/ColorPicker.vue'
import TagPicker from '@/Common/Tags/TagPicker.vue'
import LcdDisplay from '@/Core/UI/LcdDisplay.vue'
import SoundPicker from './SoundPicker.vue'
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
const sound = ref(props.efx?.sound || '')
const soundBlobUrl = ref(props.efx?.soundBlobUrl || '')
const soundDuration = ref(props.efx?.soundDuration || 0)
const soundObj = ref(null as null | HTMLAudioElement)
const efxType = ref(props.efx?.type)
const efxTypeObj = ref(props.efx?.type ? getEfxType(props.efx?.type) : undefined)
const color = ref(props.efx?.color || efxTypeObj.value?.color || 'purple')  
const tags = ref<string[]>(props.efx?.tags || [])
const allowGuest = ref<boolean>(props.efx?.allowGuest || false)
const loading = ref(false)
const rules: ValidationRules = {
  required: [(val) => !!val || 'Required.']
}
const devices = getDevices()
console.log('EffectForm initialized with:', {
  props: props.efx,
  devices,
  efxType: efxType.value,
  efxTypeObj: efxTypeObj.value
})


watch(sound, (newSound) => {
  console.log('sound', newSound)
  soundObj.value = new Audio(newSound)
  
  // Auto-detect sound duration when sound is set
  if (newSound) {
    const audio = new Audio(newSound)
    audio.addEventListener('loadedmetadata', () => {
      soundDuration.value = Math.round(audio.duration * 100) / 100 // Round to 2 decimal places
    })
    audio.addEventListener('error', () => {
      console.warn('Could not load audio to detect duration:', newSound)
      soundDuration.value = 0
    })
  } else {
    soundDuration.value = 0
  }
})

watch(efxType, (newType) => {
  if (newType) {
    efxTypeObj.value = getEfxType(newType)
    // Set default device if the effect type has one and no device is currently set
    if (efxTypeObj.value?.defaultDevice && !props.efx?.device) {
      device.value = efxTypeObj.value.defaultDevice
    }
    // For sound effects, always set device to deja-server
    if (newType === 'sound') {
      device.value = 'deja-server'
    }
  } else {
    efxTypeObj.value = undefined
  }
})

async function submit () {
  loading.value = true

  // Validate that sound effects have a device set
  if (efxType.value === 'sound' && !device.value) {
    console.error('Device is required for sound effects')
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
  if (efxTypeObj.value?.require?.includes('device') || efxType.value === 'sound') {
    newEfx.device = device.value
  }
  //  set pin
  if (efxTypeObj.value?.require?.includes('pin') && pin.value) {
    newEfx.pin = parseInt(pin.value as unknown as string)
  }
  //  set sound
  if (efxTypeObj.value?.require?.includes('sound')) {
    newEfx.sound = sound.value
    newEfx.soundBlobUrl = soundBlobUrl.value
    newEfx.soundDuration = soundDuration.value || undefined
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

const newSound = useSound(sound.value || '')

function playSound() {
  console.log('playSound', sound.value, newSound)
  soundObj.value?.play()
}
function stopSound() {
  console.log('stopSound', sound.value)
  soundObj.value?.pause()
}
// /Users/jmcdannel/trains/trestle-tt-suite/packages/ttt-action-api/sounds/departing-train.wav

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const parts = []
  if (h > 0) {
    parts.push(`${h}h`)
  }
  if (m > 0) {
    parts.push(`${m}m`)
  }
  if (s > 0 || parts.length === 0) {
    parts.push(`${s}s`)
  }
  return parts.join('')
}

</script>
<template>
  <div>
    <h1>EffectForm Component Loaded</h1>
    
    <div class="debug-info" style="background: #f0f0f0; padding: 10px; margin: 10px; border: 1px solid #ccc;">
      <strong>Debug Info:</strong><br>
      efx: {{ efx ? JSON.stringify(efx) : 'undefined' }}<br>
      efxType: {{ efxType || 'undefined' }}<br>
      efxTypeObj: {{ efxTypeObj ? 'exists' : 'undefined' }}<br>
      devices: {{ devices?.length || 0 }} devices<br>
      efxTypes length: {{ efxTypes?.length || 0 }}
    </div>
    
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
    <template v-if="!efx.device && efxTypeObj?.require?.includes('device')">
      <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
      <v-label class="m-2">Device</v-label>
      <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
      <v-btn-toggle v-model="device" divided class="flex-wrap h-auto" size="x-large">
          <v-btn v-for="deviceOpt in devices" :value="deviceOpt.id" :key="deviceOpt.id" 
            class="min-h-24 min-w-48 border"
            :color="color" >
              {{ deviceOpt.id }}
          </v-btn>
      </v-btn-toggle>
    </template>
    
    <!-- Show device selection for sound effects -->
    <template v-if="efxType === 'sound'">
      <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
      <v-label class="m-2">Device (Required for Sound Effects)</v-label>
      <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
      <v-btn-toggle v-model="device" divided class="flex-wrap h-auto" size="x-large">
          <v-btn v-for="deviceOpt in devices" :value="deviceOpt.id" :key="deviceOpt.id" 
            class="min-h-24 min-w-48 border"
            :color="color" >
              {{ deviceOpt.id }}
          </v-btn>
      </v-btn-toggle>
    </template>
    
    <!-- Show device info for sound effects -->
    <template v-if="efxType === 'sound' && device">
      <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
      <v-alert
        type="info"
        variant="tonal"
        :title="`Sound Effect Device: ${device}`"
        :text="`This sound will be played on the DEJA Server. ${soundDuration ? `Duration: ${formatDuration(soundDuration)}` : 'No duration set'}. No additional hardware required.`"
      ></v-alert>
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

    <!-- sound -->
    <template v-else-if="efxTypeObj?.require?.includes('sound')">
      <SoundPicker 
        v-model="sound" 
        @update:soundBlobUrl="soundBlobUrl = $event" 
      />
      
      <!-- Sound Duration -->
      <div class="mt-4">
        <v-label class="text-sm opacity-70">Sound Duration</v-label>
        <div class="flex items-center gap-4 mt-2">
          <v-text-field
            v-model="soundDuration"
            label="Duration (seconds)"
            type="number"
            variant="outlined"
            density="compact"
            min="0"
            step="0.01"
            class="max-w-32"
            :hint="soundDuration ? `${formatDuration(soundDuration)}` : 'No duration set'"
            persistent-hint
          ></v-text-field>
          <v-chip
            v-if="soundDuration"
            size="small"
            color="info"
            variant="tonal"
            prepend-icon="mdi-clock-outline"
          >
            {{ formatDuration(soundDuration) }}
          </v-chip>
        </div>
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