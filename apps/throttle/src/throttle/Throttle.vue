<script setup lang="ts">
import { toRef } from 'vue'
import { useRouter } from 'vue-router'
import type { Loco } from '@repo/modules/locos'
import ThrottleButtonControls from '@/throttle/ThrottleButtonControls.vue'
import SliderControls from '@/throttle/SliderControls.vue'
import CurrentSpeed from '@/throttle/CurrentSpeed.vue'
import ThrottleHeader from '@/throttle/ThrottleHeader.vue'
import ThrottleActionMenu from '@/throttle/ThrottleActionMenu.vue'
import RoadnameLogo from '@/throttle/RoadnameLogo.vue'
import { Consist, LocoAvatar, MiniConsist, FunctionsSpeedDial } from '@repo/ui'
import { useThrottle } from '@/throttle/useThrottle'

const props = defineProps({
  address: {
    type: Number,
    required: true
  }
})
console.log('ThrottleView address prop:', props.address)

const address = toRef(props, 'address')

console.log('Using throttle for address:', address.value)

const { 
  adjustSpeed: handleAdjustSpeed,
  currentSpeed, 
  setSpeed,
  loco,
  releaseThrottle,
  stop: handleStop,
  throttle,
} = useThrottle(address)

const $router = useRouter()
// const consistCmp = ref<InstanceType<typeof Consist> | null>(null)
// const functionsCmp = ref<InstanceType<typeof Functions> | null>(null)


async function handleAdjustSliderSpeed(val: number) {
  if (currentSpeed.value === val) {
    return
  }
  setSpeed(val)
}

async function clearLoco() {
  handleStop()
  releaseThrottle()
  $router.push({ name: 'throttle-list' })
}

</script>
<template>
  <main v-if="throttle" class="flex flex-col gap-2 p-2 overflow-hidden w-full h-full flex-1 shadow-xl relative  ">
    <ThrottleHeader class="bg-gradient-to-r from-purple-300/10 to-pink-600/10 text-purple-400/10">
      <template v-slot:left>
        <div class="flex flex-row items-center justify-center gap-1 px-4 bg-gray-900">
          <LocoAvatar v-if="loco" :loco="loco as Loco" :size="48" @park="clearLoco" @stop="handleStop" :variant="'flat'" />
          <MiniConsist v-if="loco" :loco="loco" />
          <v-spacer class="w-2 md:w-6" />
          <h1
            class="text-xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 drop-shadow-lg"
          >
            {{ loco?.name }}
          </h1>
          <v-spacer class="w-2 md:w-6" />
          <RoadnameLogo class="hidden sm:flex" v-if="loco" :roadname="loco.meta?.roadname" :size="'md'" />
        </div>
      </template>
      <template v-slot:right>
        <ThrottleActionMenu 
          @park="clearLoco" 
        />
      </template>
    </ThrottleHeader>
    <section class="throttle w-full h-full flex flex-row justify-around flex-grow relative z-10">
      <section class="hidden sm:flex flex-col gap-2 mb-2 items-center justify-center h-full flex-1/2 sm:flex-1">
        <v-spacer />
        <SliderControls @update:currentSpeed="handleAdjustSliderSpeed" @stop="handleStop" :speed="currentSpeed" />
      </section>
      <section v-if="loco" class="flex flex-col gap-2 mb-2 items-center justify-between flex-1/2 sm:flex-1">
        <Consist v-if="loco" :loco="loco" />
        <v-spacer />
        <RoadnameLogo v-if="loco" :roadname="loco.meta?.roadname" :size="'xl'" />
        <v-spacer />
        <FunctionsSpeedDial :loco="loco" />
      </section>
      <section class="flex flex-col gap-2 mb-2 items-center justify-between flex-1/2 sm:flex-1">
      <CurrentSpeed :speed="currentSpeed" />
      <ThrottleButtonControls @update:currentSpeed="handleAdjustSpeed" @stop="handleStop" />
      </section>
    </section>
  </main>
  <main v-else>
    <div class="flex flex-col items-center justify-center h-full w-full gap-4">
      <h2 class="text-2xl font-bold text-gray-700">No Throttle Assigned</h2>
      <v-btn color="pink" variant="outlined" @click="$router.push({ name: 'throttle-list' })">
        Go to Throttle List
      </v-btn>
    </div>
  </main>
</template>