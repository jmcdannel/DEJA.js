<script setup lang="ts">
import { ref, watch, type PropType } from 'vue'

import type { Loco } from '@repo/modules/locos'
import type { Throttle } from '@/throttle/types'
import { debounce } from 'vue-debounce'
import ThrottleButtonControls from '@/throttle/ThrottleButtonControls.vue'
import ThrottleSliderControls from '@/throttle/ThrottleSliderControls.vue'
import CurrentSpeed from '@/throttle/CurrentSpeed.vue'
import ThrottleHeader from '@/throttle/ThrottleHeader.vue'
import ThrottleActionMenu from '@/throttle/ThrottleActionMenu.vue'
import LocoAvatar from '@/core/LocoAvatar/LocoAvatar.vue'
import Consist from '@/consist/Consist.component.vue'
import MiniConsist from '@/consist/MiniConsist.vue'
import Functions from '@/functions/Functions.component.vue'
import { useThrottle } from '@/throttle/useThrottle'

const DEBOUNCE_DELAY = 100 // debounce speed changes by 100ms to prevent too many requests

const props = defineProps({
  throttle: {
    type: Object as PropType<Throttle>,
    required: true
  },
  loco: {
    type: Object as PropType<Loco>,
    required: true
  },
  viewAs: {
    type: String,
    required: false
  }
})

const emit = defineEmits(['release'])

const { 
  currentSpeed, 
  adjustSpeed: handleAdjustSpeed, 
  handleThrottleChange,
  stop: handleStop,
} = useThrottle(props.throttle)

// Setup watchers
watch( () => props.throttle, handleThrottleChange, { deep: true })

const consistCmp = ref<InstanceType<typeof Consist> | null>(null)
const functionsCmp = ref<InstanceType<typeof Functions> | null>(null)

const setSpeed = debounce((val: number): void => { currentSpeed.value = val; }, `${DEBOUNCE_DELAY}ms`)

function setSliderSpeed(val: number): void { // handle slider changes
  setSpeed(parseInt(val.toString())) // debounced speed changes
}

async function clearLoco() {
  await handleStop()
  emit('release', props.throttle?.address)
}

function openFunctions() {
  functionsCmp.value && functionsCmp.value.openAll()
}

function openConsist() {
  consistCmp.value && consistCmp.value.openSettings()
}

function openFunctionSettings() {
  functionsCmp.value && functionsCmp.value.openSettings()
}

</script>
<template>
  <main v-if="throttle" class="p-2 card overflow-hidden w-full h-full flex-1 shadow-xl relative bg-gradient-to-br from-violet-800 to-cyan-500 bg-gradient-border">
    <!-- <pre>locoDocId:{{locoDocId}}</pre>-->
    <!-- <pre>loco:{{loco.functions}}</pre>  -->
    <!-- <pre>throttleSpeed {{ throttleSpeed }}</pre>
    <pre>throttleDir {{ throttleDir }}</pre>
    <pre>currentSpeed {{ currentSpeed }}</pre>
    <pre>props.throttle {{ props.throttle }}</pre> -->
    <ThrottleHeader :address="throttle.address">
      <template v-slot:left>
        <LocoAvatar v-if="loco" :loco="loco as Loco" :size="48" />
        <MiniConsist v-if="loco" :loco="loco" />
      </template>
      <template v-slot:center>
        {{ loco?.name }}
      </template>
      <template v-slot:right>
        <ThrottleActionMenu 
          @park="clearLoco" 
          @functions="openFunctions" 
          @consist="openConsist"
        />
      </template>
    </ThrottleHeader>
    <section class="throttle w-full h-full flex flex-row justify-around flex-grow pt-72 -mt-72">
      <section class="px-1 text-center flex-1 hidden sm:block">
        <ThrottleSliderControls :speed="currentSpeed" @update:currentSpeed="setSliderSpeed" @stop="handleStop" />
      </section>
      <section v-if="loco" class="w-full flex flex-col flex-grow h-full overflow-y-auto items-center justify-between flex-1/2 sm:flex-1">
        <Functions :loco="loco" ref="functionsCmp" />
      </section>
      <section class="flex flex-col gap-2 mb-2 items-center justify-between flex-1/2 sm:flex-1">
        <CurrentSpeed :speed="currentSpeed" />
        <ThrottleButtonControls :speed="currentSpeed" @update:currentSpeed="handleAdjustSpeed" @stop="handleStop" />
      </section>
    </section>
  </main>
  <Consist v-if="loco" :loco="loco" ref="consistCmp" />
</template>