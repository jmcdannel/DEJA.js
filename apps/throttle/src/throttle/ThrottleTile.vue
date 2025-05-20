<script setup lang="ts">
  import { ref, watch, type PropType } from 'vue'
  import ThrottleAvatar from '@/throttle/ThrottleAvatar.vue'
  import LocoAvatar from '@/core/LocoAvatar/LocoAvatar.vue'
  import ThrottleButtonControls from './ThrottleButtonControls.component.vue'
  import CurrentSpeed from './CurrentSpeed.vue'
  import type { Loco, Throttle } from './types';
  import { useThrottle } from './useThrottle'

  const props = defineProps({
    throttle: {
      type: Object as PropType<Throttle>,
      required: true
    },
    loco: {
      type: Object as PropType<Loco>,
      required: false
    }
  })

  const emit = defineEmits(['release', 'select'])

  const { updateSpeed, releaseThrottle } = useThrottle()
  function getSignedSpeed({speed, direction}) {
    return speed && !!direction ? speed : -speed || 0
  }

  const currentSpeed = ref(getSignedSpeed(props.throttle))

  watch(currentSpeed, sendLocoSpeed)

  async function handleStop() {
    console.log('handleStop', props.throttle?.address, props.throttle)
    currentSpeed.value = 0
  }

  function adjustSpeed(val: number): void { // handle incremental speed changes
    currentSpeed.value = currentSpeed.value + val
  }


  async function sendLocoSpeed(newSpeed:number, oldSpeed:number) {
    console.log('sendLocoSpeed', { newSpeed, oldSpeed }, props.throttle?.address, props.throttle)
    updateSpeed(props.throttle?.address, props?.loco?.consist || [], newSpeed, oldSpeed)
  }

  function handleRelease() {
    props.throttle?.id && releaseThrottle(props.throttle.id)
  }

  function handleSelect() {
    emit('select', props.throttle?.address)
  }

  
</script>
<template>
  <main class="my-2 rounded-2xl shadow-xl relative bg-gradient-to-br from-violet-800 to-cyan-500 bg-gradient-border " v-if="throttle">
    <section class="p-1 flex flex-row flex-wrap items-center justify-between overflow-auto">
      <div class="order-1 basis-1/3 py-2" >
        <CurrentSpeed :speed="currentSpeed" />
      </div>
      <div class="flex-grow order-4 basis-full py-2">
        <ThrottleButtonControls :speed="currentSpeed" @update:currentSpeed="adjustSpeed" @stop="handleStop" horizontal class=""  />
      </div>
      <div class="order-2 basis-1/3 py-2 flex justify-center">
        <span v-if="loco" class="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-cyan-400 font-bold">{{loco.name}}</span>
      </div>
      <div class="order-2  basis-1/3 py-2 text-center">
        <ThrottleAvatar :throttle="throttle" :loco="loco" @release="handleRelease" @select="handleSelect" />
      </div>
    </section>
  </main>  
   <!-- <LocoAvatar
          :loco="loco as Loco"
          :throttle="throttle as Throttle"
          :showMenu="true"
          :size="48"
          variant="flat"
        /> -->
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