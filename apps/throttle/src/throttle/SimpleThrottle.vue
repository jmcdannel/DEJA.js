<script setup lang="ts">
import { watch, type PropType } from 'vue'
import type { Loco } from '@repo/modules/locos'
import type { Throttle } from '@/throttle/types'
import ThrottleButtonControls from '@/throttle/ThrottleButtonControls.vue'
import CurrentSpeed from '@/throttle/CurrentSpeed.vue'
import ThrottleHeader from '@/throttle/ThrottleHeader.vue'
import LocoAvatar from '@/core/LocoAvatar/LocoAvatar.vue'
import MiniConsist from '@/consist/MiniConsist.vue'
import { getSignedSpeed } from '@/throttle/utils'
import { useThrottle } from '@/throttle/useThrottle'
import { useRouter } from 'vue-router'

const $router = useRouter()

const props = defineProps({
  address: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['release'])

const { 
  adjustSpeed: handleAdjustSpeed, 
  currentSpeed, 
  throttle,
  loco,
  stop: handleStop,
} = useThrottle(props.address)

// Setup watchers
// watch( () => props.throttle, handleThrottleChange, { deep: true })

function handleSelect(address: number) {
  $router.push({ name: 'throttle', params: { address } })
}

</script>
<template>
    <main v-if="throttle" class="p-2 overflow-hidden w-full h-full flex-1 shadow-xl relative bg-gradient-to-br from-violet-800 to-cyan-500 bg-gradient-border">
      <ThrottleHeader>
        <template v-slot:left>
          <LocoAvatar v-if="loco" :loco="loco as Loco" :size="48" @selected="handleSelect" />
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