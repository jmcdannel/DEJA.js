<script setup lang="ts">
import { ref, watch, type PropType } from 'vue'
import type { Loco, Throttle } from './types';
import { debounce } from 'vue-debounce'
import ThrottleButtonControls from '@/throttle/ThrottleButtonControls.component.vue'
import ThrottleSliderControls from '@/throttle/ThrottleSliderControls.component.vue'
import CurrentSpeed from '@/throttle/CurrentSpeed.vue'
import ThrottleHeader from '@/throttle/ThrottleHeader.component.vue'
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

const consistCmp = ref(null)
const functionsCmp = ref(null)

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
        <LocoAvatar :loco="loco as Loco" :size="48" />
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
<style>
  .bg-gradient-border {
    position: relative;
    z-index: 2;
  }
  .bg-gradient-border:before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    background-color: #0d0c14;  
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='105' viewBox='0 0 80 105'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='death-star' fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M20 10a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V10zm15 35a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V45zM20 75a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V75zm30-65a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V10zm0 65a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V75zM35 10a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V10zM5 45a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V45zm0-35a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V10zm60 35a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V45zm0-35a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V10z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E");  
    z-index: -1;
    border-radius: var(--rounded-box, 1rem);
  }
</style>