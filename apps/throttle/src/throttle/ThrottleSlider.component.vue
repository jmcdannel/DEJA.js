<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { refDebounced, watchDebounced } from '@vueuse/core'

  const emit = defineEmits(['update', 'stop'])

  const props  = defineProps({
    speed: {
      type: Number,
      required: true
    },
    throttleVal: {
      type: Number,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    direction: {
      type: Boolean,
      default: false
    },
    showSteps: {
      type: Boolean,
      default: false
    }
  })

  const sliderSpeed = computed( () => Math.abs(props.speed) )
  const sliderVal = ref(Math.abs(props.speed))

  watchDebounced(sliderSpeed, () => {
    console.log('watchDebounced', sliderVal.value)
    sliderVal.value = sliderSpeed.value
    // emit('update', sliderVal.value)
  }, { debounce: 500, maxWait: 1000 })

  watch(sliderVal, () => {
    console.log('watch sliderVal', sliderVal.value)
    emit('update', sliderVal.value)
  })

  function handleSlider(val: number) {
    console.log('handleSlider', val)
    sliderVal.value = val
  }

</script>
<template>
  <!-- <VaSlider
    v-model="sliderVal"
    class=""
    :label="direction ? 'FWD' : 'REV'"
    vertical
    track-label-visible
    show-ticks
    @change="emit('update', sliderVal)"
    :step="1"
  >
    <template #trackLabel="{ value }">
      <v-chip
        :color="direction ? 'green-500' : 'red-500'"
        size="small"
      >
        {{ value }}
      </v-chip>
    </template>
  </VaSlider> -->
  <v-slider
    :model-value="sliderVal"
    class=" content-end"
    direction="vertical"
    :label="direction ? 'FWD' : 'REV'"
    @update:model-value="handleSlider"
    step="1"
    density="comfortable"
    thumb-label="always"
    show-ticks
    color="purple"
    track-color="purple"
    track-fill-color="blue"
    thumb-color="purple"
    min-width="5rem"
    thumb-size="20"
    track-size="50"
  >
  </v-slider>
</template>
<style >
:root {
  --va-slider-handler-width: 4rem;
  --va-slider-handler-border-radius: 0.5rem;
  --va-slider-handler-left: -1rem;
  --va-slider-handler-transition: .5s;

  --va-slider-vertical-label-inverse-left: 2rem;
  --va-slider-vertical-dot-value-top: 1rem;
  --va-slider-vertical-dot-value-left: 5.5rem;
  --va-slider-vertical-track-width: 2rem;
}
.va-slider--vertical .va-slider__container {
  width: 2.2rem;
}
.va-slider--vertical .va-slider__mark {
  width: 2.2rem;
}
</style>