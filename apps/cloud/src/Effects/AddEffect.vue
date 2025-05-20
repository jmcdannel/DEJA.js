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

console.log(status.value)
const emit = defineEmits(['close'])
const DEFAULT_DEVICE = 'dccex'

const { getDevices } = useLayout()
const { createEfx, efxTypes, getEfxType, DEFAULT_TYPE } = useEfx()

const device = ref(DEFAULT_DEVICE)
const name = ref('')
const pin = ref('')
const sound = ref('')
const soundObj = ref(null as null | HTMLAudioElement)
const efxType = ref(DEFAULT_TYPE?.value as string | undefined)
const efxObj = ref(DEFAULT_TYPE)
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

  const efx = {
    device: device.value,
    name: name.value,
    pin: pin.value,
    ['type']: efxType.value
  }
  await createEfx(efx)

  console.log(efx)
  loading.value = false
  emit('close')
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
    <v-divider class="my-4 border-fuchsia-500"></v-divider>
    <v-label class="m-2 text-fuchsia-400 text-2xl">Add Effect</v-label>
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
    <v-label class="m-2">Device</v-label>
    <v-divider class="my-4 border-fuchsia-500"></v-divider>
    <v-btn-toggle v-model="device" divided class="flex-wrap h-auto" size="x-large">
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
      <MacroForm></MacroForm>
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