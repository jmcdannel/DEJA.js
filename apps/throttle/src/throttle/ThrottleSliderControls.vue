<script setup lang="ts">
  import { defineEmits, ref, toRef, watch } from 'vue'
  import ThrottleSlider from './ThrottleSlider.vue'
  import { 
    FaChevronLeft,
    FaChevronRight,
  } from "vue3-icons/fa";


  const emit = defineEmits(['update:currentSpeed', 'stop'])

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

  const direction = ref(props.speed > -1 ? true : false)
  const speed = toRef(props, 'speed')

  function handleForward() {
    console.log('forward')
    emit('stop')
    direction.value = true
  }

  function handleReverse() {
    console.log('reverse')
    emit('stop')
    direction.value = false
  }

  function handleSliderUpdate(val: number) {
    console.log('handleSliderUpdate', val)
    if (direction.value === null) {
      return
    } else if (direction.value === true) {
      emit('update:currentSpeed', val)
    } else if (direction.value === false) {
      emit('update:currentSpeed', -val)
    }
  }

  function isDisabled() {
    return direction.value === null
  }

  watch(speed, (val: number) => {
    if (val === 0) {
      // direction.value = true
    } else if (val > 0) {
      direction.value = true
    } else if (val < 0) {
      direction.value = false
    }
  })

</script>
<template>
  <div class="flex flex-col h-full justify-end">
    <ThrottleSlider 
      :speed="speed" 
      :throttleVal.sync="Math.abs(speed)" 
      :direction.sync="direction" 
      :disabled="isDisabled()"
      @update="handleSliderUpdate" 
      @stop="$emit('stop')"  />
    <div class="flex mt-4 align-middle justify-center">
      <button 
        @click="handleReverse" 
        class="
          btn 
          btn-outline 
          btn-sm
          text-xs"
      ><FaChevronLeft />Rev</button>
      <button 
        @click="handleForward"
        class="
        btn 
        btn-outline 
        btn-sm
          text-xs"
      >Fwd<FaChevronRight /></button>
    </div>
  </div>
</template>
<style scoped>
  
</style>