<script setup lang="ts">
import { LocoAvatar } from '@repo/ui'
import ThrottleButtonControls from './ThrottleButtonControls.vue'
import CurrentSpeed from './CurrentSpeed.vue'
import RoadnameLogo from '@/throttle/RoadnameLogo.vue'
import { useThrottle } from './useThrottle'

const props = defineProps({
  address: {
    type: Number,
    required: true
  }
})

import { toRef } from 'vue'

const addressRef = toRef(props, 'address')
const { 
  adjustSpeed: handleAdjustSpeed,
  currentSpeed,
  loco,
  releaseThrottle,
  stop: handleStop,
  throttle,
} = useThrottle(addressRef)

</script>
<template>
  <main v-if="throttle" class="rounded-2xl shadow-xl relative bg-gradient-to-br from-violet-800 to-cyan-500 bg-gradient-border ">
    <section class="p-1 flex flex-row flex-wrap items-center justify-between overflow-auto">
      <div class="order-1 basis-1/3 pl-2" >
        <CurrentSpeed class="!justify-start =" :speed="currentSpeed" />
      </div>
      <div class="flex-grow order-4 basis-full my-1">
        <ThrottleButtonControls
          horizontal
          @stop="handleStop" 
          @update:currentSpeed="handleAdjustSpeed" 
        />
      </div>
      <div class="order-2 basis-1/3 py-2 flex justify-center text-base @[960px]:text-xl gap-2 items-center">
        <RoadnameLogo :roadname="loco?.meta.roadname" size="sm" />
        <span class="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-cyan-400 font-bold">{{loco?.name || throttle.address}}</span>
      </div>
      <div class="order-2  basis-1/3 pr-2">
        <LocoAvatar 
          v-if="loco" 
          :loco="loco" 
          class="justify-end"
          @park="releaseThrottle" 
          :size="48" 
          @stop="handleStop"
          showConsist
          showMenu
        />
        <!-- <pre>loco:{{loco}}</pre> -->
      </div>
    </section>
  </main>
  <main v-else>
    <div class="flex items-center justify-center h-full">
      <p class="text-gray-500">Loading throttle...</p>
      {{address}}
      {{throttle}}
    </div>
  </main>
</template>