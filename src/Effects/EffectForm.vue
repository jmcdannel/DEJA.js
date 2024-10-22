<script setup lang="ts">
import { ref, watch } from 'vue'
import { useEfx } from '@/Effects/useEfx'
import { useLayout } from '@/Layout/useLayout'
import { useSound } from '@vueuse/sound'
import { useWebSocket } from '@vueuse/core'
import { BsCpu } from 'vue3-icons/bs'
import ViewJson from '@/Core/UI/ViewJson.vue'
import MacroForm from '@/Effects/MacroForm.vue'

const props = defineProps<{
  efx: Object
}>()

const emit = defineEmits(['close'])
const DEFAULT_DEVICE = 'dccex'

const { getDevices } = useLayout()
const { setEfx, efxTypes, getEfxType, DEFAULT_TYPE } = useEfx()

const device = ref(props.efx?.device || DEFAULT_DEVICE)
const name = ref(props.efx?.name || '')
const pin = ref(props.efx?.pin || '')
const macroOn = ref(props.efx?.on || [])
const macroOff = ref(props.efx?.off || [])
const sound = ref('')
const soundObj = ref(null as null | HTMLAudioElement)
const efxType = ref(props.efx?.type || DEFAULT_TYPE?.value as string | undefined)
const efxObj = ref(props.efx?.type ?  getEfxType(props.efx?.type) : DEFAULT_TYPE)
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
  efxObj.value = getEfxType(newType)
})

async function submit () {
  loading.value = true

  const newEfx = {
    name: name.value,
    type: efxType.value
  }
  // set device
  if (efxObj.value?.require.includes('device')) {
    newEfx.device = device.value
  }
  //  set pin
  if (efxObj.value?.require.includes('pin')) {
    newEfx.pin = parseInt(pin.value)
  }
  //  set sound
  if (efxObj.value?.require.includes('sound')) {
    newEfx.sound = sound.value
  }
  //  set macro
  if (efxType.value === 'macro') {
    newEfx.on = macroOn.value
    newEfx.off = macroOff.value
  }
  await setEfx(props.efx?.id, newEfx)

  console.log(props.efx, newEfx)
  loading.value = false
  emit('close')
}

function handleMacro({on, off}) {
  console.log('handleMacro', on, off)
  macroOn.value = on
  macroOff.value = off
}

const pinTypes = ['light', 'led', 'streetlight', 'relay', 'frog', 'power', 'pin']

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
    <v-divider class="my-4 border-fuchsia-500"></v-divider>
    <v-label class="m-2 text-fuchsia-400 text-2xl">{{ efx ? 'Edit' : 'Add'}} Effect</v-label>
    <v-divider class="my-4 border-fuchsia-500"></v-divider>
    <v-btn-toggle v-model="efxType" divided class="flex-wrap h-auto" size="x-large">
      <v-btn v-for="efxOpt in efxTypes" :value="efxOpt.value" :key="efxOpt.value"
        class="min-h-48 min-w-48 border"
        color="purple">
        <div class="flex flex-col">
          <component :is="efxOpt.icon" :color="efxOpt.color" class="w-16 h-16 stroke-none"></component>
          <div class="mt-4">{{ efxOpt.label }}</div>
        </div>
        
      </v-btn>
    </v-btn-toggle>
    <v-divider class="my-4 border-fuchsia-500"></v-divider>

    <!-- device -->
    <template v-if="efxObj?.require?.includes('device')">
      <v-label class="m-2">Device</v-label>
      <v-divider class="my-4 border-fuchsia-500"></v-divider>
      <v-btn-toggle v-model="device" divided class="flex-wrap h-auto" size="x-large">
          <v-btn v-for="deviceOpt in devices" :value="deviceOpt.id" :key="deviceOpt.id" 
            class="min-h-48 min-w-48 border"
            color="purple" >
            <!-- <v-icon :icon="efxOpt.icon" :color="efxOpt.color"></v-icon> -->
            <div class="flex flex-col justify-center items-center">
              <component :is="deviceOpt.icon" class="w-16 h-16 stroke-none "></component>
              <div class="mt-4">{{ deviceOpt.id }}</div>
            </div>        
          </v-btn>
      </v-btn-toggle>
    </template>
    <v-divider class="my-4 border-fuchsia-500"></v-divider>

    <!-- pin -->
    <template v-if="efxObj?.require?.includes('pin')">
      <v-text-field
        v-model="pin"
        label="Pin"
        variant="outlined"
        min-width="100"
        max-width="200"
      >
      <template #append>
        <component v-if="efxObj?.icon" :is="efxObj?.icon" :color="efxObj?.color" class="w-16 h-16 stoke-none"></component>
      </template>
    </v-text-field>    
    </template>

    <!-- sound -->
    <template v-else-if="efxObj?.require?.includes('sound')">
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
    <v-divider class="my-4 border-fuchsia-500"></v-divider>

    <!-- name -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <v-text-field
        v-model="name"
        label="Name"
        variant="outlined"
        :rules="rules.required"
      ></v-text-field>
    </div>
    
    <v-divider class="my-4"></v-divider>
    <div class="grid grid-cols-2 gap-8 my-4">   
      <v-btn
        class="mt-2"
        text="Close"
        type="button"
        variant="tonal"
        @click="$emit('close')"
        block
      ></v-btn>
      <v-btn
        :loading="loading"
        class="mt-2"
        text="Submit"
        type="submit"
        color="purple"
        block
      ></v-btn>  
    </div>
  </v-form>
  <ViewJson :json="efx" label="Efx" />
  <ViewJson :json="efxObj" label="efxObj" />
  <ViewJson :json="efxTypes" label="efxTypes" />
</template>