<script setup lang="ts">
import ThrottleButtonControls from '@/throttle/ThrottleButtonControls.vue'
import CurrentSpeed from '@/throttle/CurrentSpeed.vue'
import ThrottleHeader from '@/throttle/ThrottleHeader.vue'
import { FunctionsSpeedDial } from '@repo/ui'
import { LocoAvatar, MiniConsist } from '@repo/ui'
import { useThrottle } from '@/throttle/useThrottle'
import { useRouter } from 'vue-router'

const emit = defineEmits(['release'])
const props = defineProps({
  address: {
    type: Number,
    required: true
  }
})

const $router = useRouter()

const { 
  adjustSpeed: handleAdjustSpeed, 
  currentSpeed, 
  throttle,
  loco,
  stop: handleStop,
} = useThrottle(props.address)

</script>
<template>
    <main v-if="throttle" class="flex flex-col gap-2 p-3 overflow-hidden w-full h-full flex-1 shadow-xl relative bg-gradient-to-br from-violet-800 to-cyan-500 bg-gradient-border">
      <ThrottleHeader>
        <template v-slot:left>
          <LocoAvatar 
            v-if="loco" 
            :loco="loco" 
            :size="48" 
            @selected="$router.push({ name: 'throttle', params: { address } })" />
          <MiniConsist v-if="loco" :loco="loco" />
        </template>
        <template v-slot:center>
           <span v-if="loco" class="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 font-bold">{{loco.name}}</span>
        </template>
        <template v-slot:right>
        </template>
      </ThrottleHeader>
      <section class="throttle w-full min-h-0 flex flex-col justify-around flex-grow relative z-10">
        <section v-if="loco" class="flex flex-col flex-grow items-center justify-between flex-1 my-4">
          <FunctionsSpeedDial :loco="loco" />
        </section>
        <section class="flex flex-col gap-2 mb-2 items-center justify-between flex-grow h-full">
          <CurrentSpeed :speed="currentSpeed" />
          <ThrottleButtonControls @update:currentSpeed="handleAdjustSpeed" @stop="handleStop" />
        </section>
      </section>
    </main>
</template>