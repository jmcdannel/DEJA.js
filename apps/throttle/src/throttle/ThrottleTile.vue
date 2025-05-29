<script setup lang="ts">
import { watch, type PropType } from 'vue'
import type { Loco } from '@repo/modules/locos'
import type { Throttle } from './types';
import ThrottleAvatar from '@/throttle/ThrottleAvatar.vue'
import ThrottleButtonControls from './ThrottleButtonControls.vue'
import CurrentSpeed from './CurrentSpeed.vue'
import { useThrottle } from './useThrottle'

const props = defineProps({
  throttle: {
    type: Object as PropType<Throttle>,
    required: true
  },
  loco: {
    type: Object as PropType<Loco>,
    required: true
  }
})

const { 
  currentSpeed, 
  adjustSpeed: handleAdjustSpeed, 
  handleThrottleChange,
  stop: handleStop,
  releaseThrottle,
} = useThrottle(props.throttle)

// Setup watchers
watch( () => props.throttle, handleThrottleChange, { deep: true })

  
</script>
<template>
  <main class="rounded-2xl shadow-xl relative bg-gradient-to-br from-violet-800 to-cyan-500 bg-gradient-border ">
    <section class="p-1 flex flex-row flex-wrap items-center justify-between overflow-auto">
      <div class="order-1 basis-1/3" >
        <CurrentSpeed :speed="currentSpeed" />
      </div>
      <div class="flex-grow order-4 basis-full my-1">
        <ThrottleButtonControls 
          horizontal 
          :speed="currentSpeed" 
          @stop="handleStop" 
          @update:currentSpeed="handleAdjustSpeed" 
        />
      </div>
      <div class="order-2 basis-1/3 py-2 flex justify-center text-base @[960px]:text-xl">
        <span class="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-cyan-400 font-bold">{{loco.name}}</span>
      </div>
      <div class="order-2  basis-1/3 text-center">
        <ThrottleAvatar :throttle="throttle" :size="48" :loco="loco" 
          @release="releaseThrottle" 
          @select="$router.push({ name: 'throttle', params: { address: throttle.address }})" 
        />
      </div>
    </section>
  </main>
</template>