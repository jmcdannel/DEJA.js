<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Loco } from '@repo/modules/locos'
import ThrottleButtonControls from '@/throttle/ThrottleButtonControls.vue'
import ThrottleSliderControls from '@/throttle/ThrottleSliderControls.vue'
import CurrentSpeed from '@/throttle/CurrentSpeed.vue'
import ThrottleHeader from '@/throttle/ThrottleHeader.vue'
import ThrottleActionMenu from '@/throttle/ThrottleActionMenu.vue'
import { Consist, LocoAvatar, MiniConsist } from '@repo/ui'
import Functions from '@/functions/Functions.component.vue'
import { useThrottle } from '@/throttle/useThrottle'

const props = defineProps({
  address: {
    type: Number,
    required: true
  }
})

const { 
  adjustSpeed: handleAdjustSpeed,
  currentSpeed, 
  direction,
  loco,
  releaseThrottle,
  stop: handleStop,
  throttle,
} = useThrottle(props.address)

const $router = useRouter()
// const consistCmp = ref<InstanceType<typeof Consist> | null>(null)
// const functionsCmp = ref<InstanceType<typeof Functions> | null>(null)

function handleSlider(val: number): void { // handle slider changes
  // currentSpeed.value = parseInt(val.toString()) // debounced speed changes
}

async function clearLoco() {
  handleStop()
  releaseThrottle()
  $router.push({ name: 'throttle-list' })
}

function openFunctions() {
  // functionsCmp.value && functionsCmp.value.openAll()
}

function openConsist() {
  // consistCmp.value && consistCmp.value.openSettings()
}

function openFunctionSettings() {
  // functionsCmp.value && functionsCmp.value.openSettings()
}

</script>
<template>
  <main v-if="throttle" class="flex flex-col gap-2 p-2 overflow-hidden w-full h-full flex-1 shadow-xl relative  ">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[100px] -top-[200px] -left-[300px]"></div>
      <div class="absolute w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[80px] -bottom-[100px] -right-[200px]"></div>
      <div class="absolute w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[90px] top-[30%] left-[40%]"></div>
    </div>
    <!-- <pre>locoDocId:{{locoDocId}}</pre>-->
    <!-- <pre>loco:{{loco.functions}}</pre>  -->
    <!-- <pre>currentSpeed {{ currentSpeed }}</pre> -->
    <!-- <pre>throttleDir {{ throttleDir }}</pre> -->
    <!-- <pre>props.throttle {{ props.throttle }}</pre> -->
    <ThrottleHeader class="bg-gradient-to-r from-purple-300/10 to-pink-600/10 text-purple-400/10">
      <template v-slot:left>
        <LocoAvatar v-if="loco" :loco="loco as Loco" :size="48" @park="clearLoco" @stop="handleStop" />
        <MiniConsist v-if="loco" :loco="loco" />
      </template>
      <template v-slot:center>
        <h1 class="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 drop-shadow-lg">{{ loco?.name }}</h1>
      </template>
      <template v-slot:right>
        <ThrottleActionMenu 
          @park="clearLoco" 
          @functions="openFunctions" 
          @consist="openConsist"
        />
      </template>
    </ThrottleHeader>
    <section class="throttle w-full h-full flex flex-row justify-around flex-grow relative z-10">
      <section class="px-1 text-center flex-1 hidden sm:block">
      <!-- <ThrottleSliderControls :direction="direction" :speed="currentSpeed" @update:currentSpeed="handleSlider" @stop="handleStop" /> -->
      </section>
      <section v-if="loco" class="w-full flex flex-col flex-grow h-full overflow-y-auto items-center justify-between flex-1/2 sm:flex-1">
      <Functions :loco="loco" ref="functionsCmp" />
      <Consist v-if="loco" :loco="loco" />
      </section>
      <section class="flex flex-col gap-2 mb-2 items-center justify-between flex-1/2 sm:flex-1">
      <CurrentSpeed :speed="currentSpeed" />
      <ThrottleButtonControls @update:currentSpeed="handleAdjustSpeed" @stop="handleStop" />
      </section>
    </section>
  </main>
</template>