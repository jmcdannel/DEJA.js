<script setup lang="ts">
import ThrottleButtonControls from '@/throttle/ThrottleButtonControls.vue'
import CurrentSpeed from '@/throttle/CurrentSpeed.vue'
import ThrottleHeader from '@/throttle/ThrottleHeader.vue'
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
    <main v-if="throttle" class="p-2 overflow-hidden w-full h-full flex-1 shadow-xl relative bg-gradient-to-br from-violet-800 to-cyan-500 bg-gradient-border">
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
          <CurrentSpeed :speed="currentSpeed" />
        </template>
      </ThrottleHeader>
      <section class="throttle w-full h-full flex flex-row justify-around flex-grow pt-72 -mt-72">
        <section class="flex flex-col gap-2 mb-2 items-center justify-between flex-1/2 sm:flex-1">
          <ThrottleButtonControls @update:currentSpeed="handleAdjustSpeed" @stop="handleStop" />
        </section>
      </section>
    </main>
</template>