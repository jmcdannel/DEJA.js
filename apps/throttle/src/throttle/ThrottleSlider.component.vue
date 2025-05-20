<script setup lang="ts">
  import { defineEmits, defineProps, onMounted, ref, watch, toRef } from 'vue'

  const emit = defineEmits(['update:currentSpeed', 'stop'])

  const props  = defineProps({
    speed: {
      type: Number,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showSteps: {
      type: Boolean,
      default: false
    }
  })

  const slider = ref(null)
  const sliderPosition = ref(0)
  const speed = toRef(props, 'speed')

  let down = false
  let sliderHeight = 0
  let sliderTop = 0


  onMounted(() => {
    if (slider?.value) {
      const sliderEl = slider.value as HTMLElement
      sliderHeight = sliderEl.clientHeight
      sliderTop = sliderEl.getBoundingClientRect().top
    }
    updateSlider(speed.value)
  })


  function sliderUp() {
    if (props.disabled) {
      return
    }
    down = false
  }

  function sliderDown(event: MouseEvent) {
    if (props.disabled) {
      return
    }
    down = true
    updateDragger(event.offsetY)
    return false
  }

  function sliderMove(event: MouseEvent) {
    if (props.disabled) {
      return
    }
    if (down) {
      // console.log('sliderMove', event.clientY - sliderTop, event.clientY, sliderTop)
      if (event.clientY - sliderTop > 1 && event.clientY - sliderTop < sliderHeight - 1) {
        updateDragger(event.clientY - sliderTop)
      }
    }
  }

  function updateSlider(y: number) {
    // console.log('updateSlider', y, sliderHeight, (Math.abs(y) * sliderHeight / 100))
    sliderPosition.value = sliderHeight - (Math.abs(y) * sliderHeight / 100) - 8
  }

  function updateDragger(y: number) {
    const newSpeed = 100 - (y / sliderHeight * 100)
    // console.log('updateDragger', y, parseInt(newSpeed.toString()))
    emit('update:currentSpeed', parseInt(newSpeed.toString()))
    
    sliderPosition.value = y - 8
  }

  watch(speed, (val) => {
    updateSlider(val)
  })

</script>
<template>
  <div 
    ref="slider" 
    class="
      range-slider 
      w-12
      md:w-24 
      h-full 
      mx-auto 
      my-0 
      relative
      before:content-['']
      before:block
      before:absolute
      before:top-0
      before:left-0
      before:w-full
      before:h-full
      before:bg-cyan-400"
    :class="props.disabled ? 'opacity-30' : 'opacity-100'" 
    @mousedown="sliderDown"
    @mouseup="sliderUp" 
    @mousemove="sliderMove">
    <span 
      class="
        block 
        h-4 
        w-16
        md:w-36 
        -left-2 
        md:-left-6 
        bg-pink-500 
        relative 
        z-10 
        cursor-pointer 
        rounded-lg 
        opacity-80"
      :class="props.disabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-pink-500 cursor-pointer'"
      :style="{ top: sliderPosition + 'px' }" ref="dragger">
    </span>
  </div>
</template>
<style scoped>

</style>