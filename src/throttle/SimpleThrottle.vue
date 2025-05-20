<script setup lang="ts">
  import { ref, watch, type PropType } from 'vue'
  import type { Loco, Throttle } from './types';
  import ThrottleButtonControls from '@/throttle/ThrottleButtonControls.component.vue'
  import CurrentSpeed from '@/throttle/CurrentSpeed.vue'
  import ThrottleHeader from '@/throttle/ThrottleHeader.component.vue'
  import LocoAvatar from '@/core/LocoAvatar/LocoAvatar.vue'
  import MiniConsist from '@/consist/MiniConsist.vue'
  import { useThrottle } from '@/throttle/useThrottle'
  import { useRouter } from 'vue-router'

  const $router = useRouter()
  function getSignedSpeed({speed, direction}: { speed: number, direction: boolean }): number {
    return speed && !!direction ? speed : -speed || 0
  }

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

  const { updateSpeed } = useThrottle()

  const currentSpeed = ref(getSignedSpeed(props.throttle)) // +/-
  const throttleSpeed = ref(currentSpeed.value)
  const throttleDir = ref(currentSpeed.value > -1)

  watch(currentSpeed, (newCurrentSpeed, oldCurrentSpeed) => {
    throttleSpeed.value = newCurrentSpeed
    throttleDir.value = newCurrentSpeed > -1
    sendLocoSpeed(newCurrentSpeed, oldCurrentSpeed)
  })
  watch(() => props.throttle, (newThrottle) => {
    const newCurrentSpeed = getSignedSpeed(newThrottle)
    currentSpeed.value = newCurrentSpeed
  })

  async function handleStop() {
    currentSpeed.value = 0
  }

  function adjustSpeed(val: number): void { // handle incremental speed changes
    currentSpeed.value = currentSpeed.value + val
  }

  async function sendLocoSpeed(newSpeed:number, oldSpeed:number) {
    updateSpeed(props.throttle?.address, props.loco?.consist, newSpeed, oldSpeed)
  }

  function handleSelect(address: number) {
    $router.push({ name: 'cloud-throttle', params: { address } })
  }

</script>
<template>
    <main v-if="throttle" class="p-2 card overflow-hidden w-full h-full flex-1 shadow-xl relative bg-gradient-to-br from-violet-800 to-cyan-500 bg-gradient-border">
      <ThrottleHeader :address="throttle.address">
        <template v-slot:left>
          <LocoAvatar :loco="loco as Loco" :size="48" @selected="handleSelect" />
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
          
          <ThrottleButtonControls :speed="currentSpeed" @update:currentSpeed="adjustSpeed" @stop="handleStop" />
        </section>
      </section>
    </main>
</template>
<style scroped>
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