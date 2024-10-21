<script setup lang="ts">
import { ref, watch } from 'vue'
import { useEfx } from '@/Effects/useEfx'
import { useLayout } from '@/Layout/useLayout'
import { useSound } from '@vueuse/sound'
import { useWebSocket } from '@vueuse/core'
import { BsCpu } from 'vue3-icons/bs'
import MacroForm from '@/Effects/MacroForm.vue'
//http://192.168.86.249:5173/
// const { status, data, send, open, close } = useWebSocket('ws://192.168.86.249:8082')

const props = defineProps<{
  efx: Object
}>()

const emit = defineEmits(['close'])
const DEFAULT_INTERFACE = 'dccex'

const { getDevices } = useLayout()
const { setEfx, efxTypes, getEfxType, DEFAULT_TYPE } = useEfx()

const efxInterface = ref(props.efx?.interface || DEFAULT_INTERFACE)
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
    ['interface']: efxInterface.value,
    name: name.value,
    ['type']: efxType.value
  }
  if (pinTypes.includes(efxType.value)){
    newEfx.pin = parseInt(pin.value)
  } else if (efxType.value === 'sound') {
    newEfx.sound = sound.value
  } else if (efxType.value === 'macro') {
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
  // const mysound = new Audio('/sounds/departing-train.wav');

  // // Function to play the sound
  // function playSound() {
  //   mysound.play();
  // }

  // // Function to stop the sound
  // function stopSound() {
  //   mysound.pause();
  //   mysound.currentTime = 0; // Reset the sound to the beginning
  // }

  // // Example usage
  // playSound(); // Call this function to play the sound
  // // stopSound();
}
function stopSound() {
  console.log('playSound', sound.value)
  soundObj.value?.pause()
}
// /Users/jmcdannel/trains/trestle-tt-suite/packages/ttt-action-api/sounds/departing-train.wav

</script>
<template>
  <v-form validate-on="submit lazy" @submit.prevent="submit">
    {{ efx }}
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
    <v-label class="m-2">Interface</v-label>
    <v-divider class="my-4 border-fuchsia-500"></v-divider>
    <v-btn-toggle v-model="efxInterface" divided class="flex-wrap h-auto" size="x-large">
        <v-btn v-for="device in devices" :value="device.id" :key="device.id" 
          class="min-h-48 min-w-48 border"
          color="purple" >
          <!-- <v-icon :icon="efxOpt.icon" :color="efxOpt.color"></v-icon> -->
          <div class="flex flex-col justify-center items-center">
            <BsCpu class="w-16 h-16 stroke-none "></BsCpu>
            <div class="mt-4">{{ device.id }}</div>
          </div>        
        </v-btn>
    </v-btn-toggle>
    <v-divider class="my-4 border-fuchsia-500"></v-divider>

    <template v-if="pinTypes.includes(efxType)">
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
    <template v-else-if="efxType === 'sound'">
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
    <template v-else-if="efxType === 'macro'">
      <MacroForm @change="handleMacro" :on="macroOn" :off="macroOff"></MacroForm>
    </template>
    <v-divider class="my-4 border-fuchsia-500"></v-divider>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <v-text-field
        v-model="name"
        label="Name"
        variant="outlined"
        :rules="rules.required"
      ></v-text-field>
    </div>
    
    <v-divider class="my-4"></v-divider>
    <!-- <v-icon :icon="efxType?.icon"></v-icon> -->
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
</template>
<style>
  input[type="text"] {
    background-color: var(--bg-color);
  }
  input[type="text"]:focus {
    box-shadow: none;
  }

</style>