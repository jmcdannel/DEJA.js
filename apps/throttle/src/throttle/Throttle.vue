<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useRouter } from 'vue-router'
import type { Loco } from '@repo/modules/locos'
import ThrottleButtonControls from '@/throttle/ThrottleButtonControls.vue'
import ThrottleSliderControls from '@/throttle/ThrottleSliderControls.vue'
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

const address = toRef(props, 'address')

const { 
  adjustSpeed: handleAdjustSpeed,
  currentSpeed, 
  direction,
  loco,
  releaseThrottle,
  stop: handleStop,
  throttle,
} = useThrottle(address)

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
    <!-- <pre>locoDocId:{{locoDocId}}</pre>-->
    <!-- <pre>loco:{{loco.functions}}</pre>  -->
    <!-- <pre>currentSpeed {{ currentSpeed }}</pre> -->
    <!-- <pre>throttleDir {{ throttleDir }}</pre> -->
    <!-- <pre>props.throttle {{ props.throttle }}</pre> -->
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
        <RoadnameLogo v-if="loco" :roadname="loco.meta?.roadname" :size="'3xl'" />
        <!-- <ThrottleSliderControls :direction="direction" :speed="currentSpeed" @update:currentSpeed="handleSlider" @stop="handleStop" /> -->
      </section>
      <section v-if="loco" class="flex flex-col gap-2 mb-2 items-center justify-between flex-1/2 sm:flex-1">
        <Consist v-if="loco" :loco="loco" />
        <v-spacer />
        <FunctionsSpeedDial :loco="loco" />
      </section>
      <section class="flex flex-col gap-2 mb-2 items-center justify-between flex-1/2 sm:flex-1">
      <CurrentSpeed :speed="currentSpeed" />
      <ThrottleButtonControls @update:currentSpeed="handleAdjustSpeed" @stop="handleStop" />
      </section>
    </section>
  </main>
</template>