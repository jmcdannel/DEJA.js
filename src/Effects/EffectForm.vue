<script setup lang="ts">
import { ref, watch } from 'vue'
import { useEfx } from '@/Effects/useEfx'
import { useSound } from '@vueuse/sound'
import { useLayout } from '@/Layout/useLayout'
import ViewJson from '@/Core/UI/ViewJson.vue'
import MacroForm from '@/Effects/MacroForm.vue'
import IALEDForm from '@/Effects//IALEDForm.vue'
import ColorPicker from '@/Common/Color/ColorPicker.vue'
import type { IEfx } from '@/Effects/types'
import TagPicker from '@/Common/Tags/TagPicker.vue'
// TODO: icon picker

const props = defineProps<{
  efx: IEfx
}>()

const emit = defineEmits(['close'])
const DEFAULT_DEVICE = 'dccex'
const { getDevices } = useLayout()

const { setEfx, efxTypes, getEfxType, DEFAULT_TYPE } = useEfx()

const editColor = ref(false)

const device = ref(props.efx?.device || DEFAULT_DEVICE)
const name = ref(props.efx?.name || '')
const pin = ref(props.efx?.pin)
const macroOn = ref(props.efx?.on || [])
const macroOff = ref(props.efx?.off || [])
const pattern = ref(props.efx?.pattern || undefined)
const range = ref(props.efx?.range || undefined)
const config = ref(props.efx?.config || undefined)
const sound = ref('')
const soundObj = ref(null as null | HTMLAudioElement)
const efxType = ref(props.efx?.type || DEFAULT_TYPE?.value as string | undefined)
const efxTypeObj = ref(props.efx?.type ?  getEfxType(props.efx?.type) : DEFAULT_TYPE)
const color = ref(props.efx?.color || efxTypeObj.value?.color || 'purple')  
const tags = ref<string[]>(props.efx?.tags || [])
const loading = ref(false)
const rules = {
  required: [(val) => !!val || 'Required.']
}
const devices = getDevices()

// watch(data, (newData) => {
//   console.log('data', newData)
// })

watch(sound, (newSound) => {
  console.log('sound', newSound)
  soundObj.value = new Audio(newSound)
})

watch(efxType, (newType) => {
  console.log('efxType', newType)
  efxTypeObj.value = getEfxType(newType)
})

async function submit () {
  loading.value = true

  const newEfx: IEfx = {
    name: name.value,
    type: efxType.value,
    color: color.value,
    tags: tags.value
  }
  // set device
  if (efxTypeObj.value?.require.includes('device')) {
    newEfx.device = device.value
  }
  //  set pin
  if (efxTypeObj.value?.require.includes('pin') && pin.value) {
    newEfx.pin = parseInt(pin.value as unknown as string)
  }
  //  set sound
  if (efxTypeObj.value?.require.includes('sound')) {
    // newEfx.sound = sound.value
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

  await setEfx(props.efx?.id, newEfx)

  console.log(props.efx, newEfx)
  loading.value = false
  emit('close')
}

function handleMacro({on , off}: {on: string[], off: string[]}) {
  console.log('handleMacro', on, off)
  macroOn.value = on
  macroOff.value = off
}

function handleIALED(ialedEffectConfig: {
    pattern: string;
    range: string;
    config: string;
  }): void {  
  console.log('handleIALED', ialedEffectConfig)
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
  console.log('playSound', sound.value)
  soundObj.value?.pause()
}
// /Users/jmcdannel/trains/trestle-tt-suite/packages/ttt-action-api/sounds/departing-train.wav

</script>
<template>
  <v-form validate-on="submit lazy" @submit.prevent="submit">
    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
    <div class="flex items-center justify-between">
    <v-label class="m-2 text-4xl">
      <component v-if="efxTypeObj?.icon" :is="efxTypeObj?.icon" :color="color" class="w-16 h-16 stoke-none mr-4"></component>
      {{ efx ? 'Edit' : 'Add'}} Effect
    </v-label>
    <v-chip class="m-2" :color="color" size="x-large">
      <v-icon v-if="efxTypeObj?.icon" :icon="efxTypeObj.icon" class="mr-2"></v-icon>
      {{ efxType }}
    </v-chip>
    </div>
    <template v-if="!efx.device">
      <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
      <v-label class="m-2">Device</v-label>
      <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
      <v-btn-toggle v-model="device" divided class="flex-wrap h-auto" size="x-large">
          <v-btn v-for="deviceOpt in devices" :value="deviceOpt.id" :key="deviceOpt.id" 
            class="min-h-48 min-w-48 border"
            :color="color" >
            <!-- <v-icon :icon="efxOpt.icon" :color="efxOpt.color"></v-icon> -->
            <div class="flex flex-col justify-center items-center">
              <component :is="deviceOpt.icon" class="w-16 h-16 stroke-none "></component>
              <div class="mt-4">{{ deviceOpt.id }}</div>
            </div>        
          </v-btn>
      </v-btn-toggle>
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
            <component :is="efxOpt.icon" :color="efxOpt.color" class="w-16 h-16 stroke-none"></component>
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

    <!-- sound -->
    <template v-else-if="efxTypeObj?.require?.includes('sound')">
      <div class="flex items-center">
        <v-text-field
          v-model="sound"
          label="Sound URL"
          variant="outlined"
          min-width="300"
        ></v-text-field>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
          <v-btn v-id="sound" @click="playSound" icon="mdi-play"></v-btn>
          <v-btn v-id="sound" @click="stopSound" icon="mdi-stop"></v-btn>
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
      <pre>{{ config }}</pre>
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
      <ColorPicker v-model="color" @select="editColor = false" @cancel="editColor = false; color = props.turnout?.color ?? 'purple'"></ColorPicker>
    </v-dialog>

    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
    <TagPicker class="my-4 " v-model="tags"></TagPicker>
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
</template>