<script setup lang="ts">
  import { defineEmits } from 'vue'
  import chevronUpIconSvg from '@/assets/icons/chevron-up.svg'
  import chevronDownIconSvg from '@/assets/icons/chevron-down.svg'
  import chevronDoubleUpIconSvg from '@/assets/icons/chevron-double-up.svg'
  import chevronDoubleDownIconSvg from '@/assets/icons/chevron-double-down.svg'
  import plusIconSvg from '@/assets/icons/plus.svg'
  import minusIconSvg from '@/assets/icons/minus.svg'
  import plusThickIconSvg from '@/assets/icons/plus-thick.svg'
  import minusThickIconSvg from '@/assets/icons/minus-thick.svg'
  import stopIconSvg from '@/assets/icons/stop.svg'

  const props  = defineProps({
    speed: {
      type: Number,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    horizontal: {
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

  const btnClasses = 'btn btn-accent relative h-auto mx-auto md:w-24 p-1 sm:p-2 lg:p-4'
  const iconClasses = `h-4 w-8 sm:h-5 sm:w-10 md:h-6 md:w-12 lg:h-12 lg:w-12 relative}`

</script>
<template>
  <div class="py-0 sm:py-2 sm:px-12 flex justify-stretch items-center flex-grow relatve z-20"
    :class="`${horizontal ? 'flex-row px-1' : 'flex-col px-8'}`">
    <button 
      class=" flex-grow" 
      :class="`${btnClasses} ${horizontal ? 'rounded-r-none rounded-l-3xl' : 'rounded-b-none rounded-t-3xl'}`"
      @click="handleUp5">
      <v-icon 
        :icon="horizontal ? 'mdi-plus-thick' : 'mdi-chevron-double-up'" 
        :class="iconClasses" />
    </button>
    <hr class="border-black" />
    <button 
      class="rounded-none flex-grow" 
      :class="btnClasses"
      @click="handleUp">
      <v-icon 
        :icon="horizontal ? 'mdi-plus' : 'mdi-chevron-up'" 
        :class="iconClasses"
      />
    </button>
    <button 
      class="btn bg-red-500 rounded-3xl py-2 lg:py-4 min-w-16 h-auto mx-auto relative z-10"
      :class="horizontal ? 'md:h-36 rounded-none' : 'w-28 md:w-36 rounded-3xl'"
       @click="handleStop">
      <v-icon icon="mdi-stop" class="h-8 w-8 lg:h-12 lg:w-12 relative" />
    </button>
    <button 
      class="rounded-none  flex-grow"
      :class="btnClasses" 
      @click="handleDown">
      <v-icon 
        :icon="horizontal ? 'mdi-minus' : 'mdi-chevron-down'" 
        :class="iconClasses"
      />
    </button>
    <hr class="border-black" />
    <button 
      class="flex-grow" 
      :class="`${btnClasses} ${horizontal ? 'rounded-l-none rounded-r-3xl' : 'rounded-t-none rounded-b-3xl'}`"
      @click="handleDown5">
      <v-icon 
        :icon="horizontal ? 'mdi-minus-thick' : 'mdi-chevron-double-down'"
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