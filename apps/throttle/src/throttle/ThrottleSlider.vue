<script setup lang="ts">
import { ref, watch } from 'vue'

const emit = defineEmits(['update', 'stop'])

const props  = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: 'FWD'
  },
  speed: {
    type: Number,
    required: true
  },
})

const sliderVal = ref(Math.abs(props.speed))

watch(() => props.speed, (newSpeed) => {
  sliderVal.value = Math.abs(newSpeed)
})

watch(sliderVal, () => {
  emit('update', sliderVal.value)
})

function handleSlider(val: number) {
  sliderVal.value = val
}

</script>
<template>
  <div class="text-xs text-gray-500 mb-2">
    <div>Slider: {{ sliderVal }}</div>
    <div>Speed: {{ speed }}</div>
  </div>
  <v-slider
    :model-value="sliderVal"
    class=" content-end"
    :disabled="disabled"
    direction="vertical"
    :label="label"
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