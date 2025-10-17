<script setup lang="ts">
import ThrottleButtonControls from '@/throttle/ThrottleButtonControls.vue'
import CurrentSpeed from '@/throttle/CurrentSpeed.vue'
import ThrottleHeader from '@/throttle/ThrottleHeader.vue'
import { FunctionsSpeedDial } from '@repo/ui'
import { LocoAvatar, MiniConsist } from '@repo/ui'
import RoadnameLogo from '@/throttle/RoadnameLogo.vue'
import { useThrottle } from '@/throttle/useThrottle'
import { useRouter } from 'vue-router'
import { toRef } from 'vue'

const emit = defineEmits(['release'])
const props = defineProps({
  address: {
    type: Number,
    required: true
  }
})

const $router = useRouter()

const addressRef = toRef(props, 'address')
const { 
  adjustSpeed: handleAdjustSpeed, 
  currentSpeed, 
  throttle,
  loco,
  stop: handleStop,
} = useThrottle(addressRef)

</script>
<template>
  <main v-if="throttle" class="flex flex-col gap-2 p-3 overflow-auto w-full h-full flex-1 shadow-xl relative bg-gradient-to-br from-violet-800 to-cyan-500 bg-gradient-border min-h-[70vh] md:min-h-auto">
    <ThrottleHeader>
      <template v-slot:left>
        <LocoAvatar 
          v-if="loco" 
          :loco="loco" 
          :size="48" 
          @select="$router.push({ name: 'throttle', params: { address } })" />
        <MiniConsist v-if="loco" :loco="loco" />
      </template>
      <template v-slot:center>
        <div v-if="loco" class="flex flex-col items-center gap-1">
          <RoadnameLogo :roadname="loco.meta?.roadname" />
          <span class="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 font-bold">
            {{ loco.name }}
          </span>
        </div>
      </template>
      <template v-slot:right>
      </template>
    </ThrottleHeader>
    <section class="throttle w-full min-h-0 flex flex-col justify-around flex-grow relative z-10">
      <section class="flex flex-col gap-2 mb-2 items-center justify-between flex-grow h-full">
        <CurrentSpeed :speed="currentSpeed" />
        <ThrottleButtonControls @update:currentSpeed="handleAdjustSpeed" @stop="handleStop" />
      </section>
      <section v-if="loco" class="flex flex-col flex-grow items-center justify-between flex-1 my-2">
        <FunctionsSpeedDial :loco="loco" />
      </section>
    </section>
  </main>
</template>