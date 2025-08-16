<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  speed: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    default: 126,
  },
  label: {
    type: [String, Number],
    default: '',
  },
})

const rotation = computed(() => {
  const safeSpeed = Math.min(Math.max(props.speed, 0), props.max)
  const ratio = safeSpeed / props.max
  return -90 + ratio * 180
})
</script>
<template>
  <div
    class="relative w-24 h-24 rounded-full bg-white border-4 border-gray-800 flex items-center justify-center shadow-inner"
  >
    <span class="absolute left-2 bottom-2 text-[10px]">0</span>
    <span class="absolute right-2 bottom-2 text-[10px]">{{ max }}</span>
    <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-semibold">{{ speed }}</span>
    <div
      class="needle absolute bottom-1/2 left-1/2 w-1 bg-red-600 origin-bottom"
      :style="{ height: '45%', transform: `rotate(${rotation}deg)` }"
    ></div>
    <div class="absolute w-2 h-2 bg-gray-800 rounded-full"></div>
    <div v-if="label" class="absolute -bottom-5 left-0 right-0 text-center text-xs font-bold">{{ label }}</div>
  </div>
</template>
<style scoped>
.needle {
  transition: transform 0.2s ease-in-out;
}
</style>
