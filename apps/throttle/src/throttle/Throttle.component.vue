<script setup lang="ts">
  import { defineProps, ref, watch } from 'vue'
  import { debounce } from 'vue-debounce'
  import { 
    FaTimesCircle,
  } from "vue3-icons/fa";
  import ThrottleButtonControls from './ThrottleButtonControls.component.vue'
  import ThrottleSliderControls from './ThrottleSliderControls.component.vue'
  import CurrentSpeed from './CurrentSpeed.component.vue'
  import ThrottleHeader from './ThrottleHeader.component.vue'
  import Consist from '@/consist/Consist.component.vue'
  import Functions from '@/functions/Functions.component.vue'
  import useDcc from '../api/dccApi'
  import router from '../router'
  import type { Loco, LocoFunction, ConsistLoco } from './types';
  import { useThrottleStore } from '@/throttle/throttleStore'

  const DEBOUNCE_DELAY = 100 // debounce speed changes by 100ms to prevent too many requests
  const SWITCH_DIR_DELAY = 1000 // delay in ms to switch direction - occurs when slider goes from positive to negative value - which an occur quickly

  const props = defineProps({
    address: {
      type: Number,
      required: true
    },
    locos: {
      type: Array,
      required: true
    },
  })

  const dccApi = useDcc()
  const throttleStore = useThrottleStore()

  const currentSpeed = ref(0)
  const locos = ref<Loco[]>(props.locos as Loco[])
  const loco = ref<Loco | null>(locos.value.find(l => l.address === props.address) || null)

  const setSpeed = debounce((val: number): void => { currentSpeed.value = val; }, `${DEBOUNCE_DELAY}ms`)

  async function handleStop() {
    currentSpeed.value = 0
  }

  function adjustSpeed(val: number): void { // handle incremental speed changes
    currentSpeed.value = currentSpeed.value + val
  }

  function setSliderSpeed(val: number): void { // handle slider changes
    setSpeed(parseInt(val.toString()))
  }

  function handleSaveLoco(loco: Loco): void {
    if (loco) {
      locos.value = locos.value.map(l => l.address === loco.address ? loco : l)
      throttleStore.setLocos(locos.value)
    }
  }

  async function clearLoco() {
    await handleStop()
    router.push({ name: 'home' })
  }

  function calculateConsistSpeed(newSpeed: number, consistLoco: ConsistLoco): number | undefined {
    
    let consistSpeed = newSpeed
    if (consistLoco.trim) {
      if (consistLoco.direction) {
          consistSpeed = (newSpeed > 0)
            ? consistSpeed + consistLoco.trim
            : consistSpeed - consistLoco.trim

      } else {
        consistSpeed = (newSpeed > 0)
            ? consistSpeed - consistLoco.trim
            : consistSpeed + consistLoco.trim
      }
    }

    if (newSpeed > 0 && consistSpeed <= 0) {
      consistSpeed = 1
    } else if (newSpeed < 0 && consistSpeed >= 0) {
      consistSpeed = -1
    }

    return consistLoco.direction ? consistSpeed : -consistSpeed
  }

  async function sendLocoSpeed(newSpeed:number, oldSpeed:number) {
    if (!loco.value) {
      // TODO: handle error
      return
    }
    let delay = 0
    if (newSpeed > 0 && oldSpeed < 0) {
      //change direction to forward
      console.log('change direction to forward')
      await dccApi.setSpeed(loco.value.address, 0) // stop
      if (loco.value.consist.length > 0) {
        Promise.all(loco.value.consist.map(async (consistLoco) => {
          await dccApi.setSpeed(consistLoco.address, 0) // stop consist
        }))
      }
      delay = SWITCH_DIR_DELAY
    } else if (newSpeed < 0 && oldSpeed > 0) {
      //change direction to reverse
      console.log('change direction to reverse')
      await dccApi.setSpeed(loco.value.address, 0) // stop
      if (loco.value.consist.length > 0) {
        Promise.all(loco.value.consist.map(async (consistLoco) => {
          await dccApi.setSpeed(consistLoco.address, 0) // stop consist
        }))
      }
      delay = SWITCH_DIR_DELAY
    }
    if (newSpeed === 0) {
      // stop
      console.log('stop')
      await dccApi.setSpeed(loco.value.address, 0)
      if (loco.value.consist.length > 0) {
        Promise.all(loco.value.consist.map(async (consistLoco) => {
          await dccApi.setSpeed(consistLoco.address, 0) // stop consist
        }))
      }
    } else {
      // set speed
      console.log('set speed')     
      setTimeout(() => {
        loco.value && dccApi.setSpeed(loco.value.address, currentSpeed.value)
        if (loco.value && loco.value.consist.length > 0) {
          Promise.all(loco.value.consist.map(async (consistLoco) => {
            const consistSpeed = calculateConsistSpeed(newSpeed, consistLoco)
            await dccApi.setSpeed(consistLoco.address, consistSpeed) // set consist speed
            console.log('set consist speed', newSpeed, consistSpeed, consistLoco.direction, consistLoco.trim)
          }))
        }
      }, delay)
    }
    
  }

  watch(currentSpeed, sendLocoSpeed)
</script>
<template>
  <main class="throttle-bg card m-2 shadow-xl flex-grow overflow-auto relative" v-if="loco">
    <!-- <button class="btn btn-circle btn-outline text-white btn-xs bg-gray-200 border-gray-200" @click="clearLoco">
      <FaTimesCircle alt="clear layout" class="h-3 w-3" />
    </button> -->
    <ThrottleHeader :address="loco.address" @clearLoco="clearLoco">
      <Consist :loco="loco" :locos="locos" />
    </ThrottleHeader>
    <section class="throttle flex flex-row flex-grow overflow-auto">
      <section class="pt-4 pb-8 px-1 text-center  flex-1">
        <ThrottleSliderControls :speed="currentSpeed" @update:currentSpeed="setSliderSpeed" @stop="handleStop" />  
      </section>
      <section class="pt-4 flex flex-col items-center justify-between flex-1">
        <Functions :loco="loco" @save-loco="handleSaveLoco" />
        <CurrentSpeed :speed="currentSpeed" />
        <ThrottleButtonControls :speed="currentSpeed" @update:currentSpeed="adjustSpeed" @stop="handleStop" />
      </section>
    </section>
  </main>  
</template>
<style scroped>  
  .throttle-bg {
    background-color: #0d0c14;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='105' viewBox='0 0 80 105'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='death-star' fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M20 10a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V10zm15 35a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V45zM20 75a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V75zm30-65a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V10zm0 65a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V75zM35 10a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V10zM5 45a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V45zm0-35a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V10zm60 35a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V45zm0-35a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V10z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
</style>