<script setup lang="ts">
  import { defineEmits } from 'vue'
  import chevronUpIconSvg from '@/assets/icons/chevron-up.svg'
  import chevronDownIconSvg from '@/assets/icons/chevron-down.svg'
  import chevronDoubleUpIconSvg from '@/assets/icons/chevron-double-up.svg'
  import chevronDoubleDownIconSvg from '@/assets/icons/chevron-double-down.svg'
  import stopIconSvg from '@/assets/icons/stop.svg'

  const props  = defineProps({
    speed: {
      type: Number,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['update:currentSpeed', 'stop'])

  async function handleUp() {
    emit('update:currentSpeed', 1)
  }

  async function handleUp5() {
    emit('update:currentSpeed', 5)
  }

  async function handleDown() {
    emit('update:currentSpeed', -1)
  }

  async function handleDown5() {
    emit('update:currentSpeed', -5)
  }

  async function handleStop() {
    emit('stop')
  }

  const btnClasses = 'btn btn-accent relative h-auto mx-auto md:w-24 '
  const iconClasses = 'h-8 w-8 md:h-16 md:w-16 relative'

</script>
<template>
  <div class="px-2 py-4 flex flex-col justify-center align-middle">
    <button 
      class="rounded-b-none rounded-t-3xl" 
      :class="btnClasses"
      @click="handleUp5">
      <img 
        :src="chevronDoubleUpIconSvg" 
        :class="iconClasses"
      />
    </button>
    <hr class="border-black" />
    <button 
      class="rounded-none" 
      :class="btnClasses"
      @click="handleUp">
      <img 
        :src="chevronUpIconSvg" 
        :class="iconClasses"
      />
    </button>
    <button 
      class="btn btn-primary rounded-3xl h-auto mx-auto w-28 md:w-36 relative z-10" @click="handleStop">
      <img :src="stopIconSvg" :class="iconClasses" />
    </button>
    <button 
      class="rounded-none"
      :class="btnClasses" 
      @click="handleDown">
      <img 
        :src="chevronDownIconSvg" 
        :class="iconClasses"
      />
    </button>
    <hr class="border-black" />
    <button 
      class="rounded-t-none rounded-b-3xl" 
      :class="btnClasses"
      @click="handleDown5">
      <img 
        :src="chevronDoubleDownIconSvg" 
        :class="iconClasses"
      />
    </button>
  </div>
</template>
<style scroped>
  
  .speed-btn {
    height: auto;
  }
  .stop-btn {
    height: auto;
    width: 140%;
    position: relative;
    left: -20%;
    z-index: 1;
  }

  .speed-val {
    line-height: .75rem;
  }

  .speed-icon {
    /* left: 4rem; */
    left: -0.5rem;
  }

</style>