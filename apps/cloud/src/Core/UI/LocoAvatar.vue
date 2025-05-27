<script setup lang="ts">
import { useColors } from '@/Core/UI/useColors'

const { colors } = useColors()

defineProps({
  address: {
    type: Number,
    required: true
  },
  color: Object
})

</script>
<template>
  <div 
    class="relative inline-flex items-center justify-center w-16 h-16 overflow-hidden rounded-full text-2xl"
    :class="`${colors[color?.value]?.bg}`"
    >
    <span class="font-medium text-gray-900 dark:text-gray-800 ">{{ address }}</span>
  </div>
</template>