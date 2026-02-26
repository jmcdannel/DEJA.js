<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: 'connected' | 'disconnected' | 'warning' | 'idle'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const sizeClasses = computed(() => ({
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
}[props.size]))

const colorClass = computed(() => ({
  connected: 'bg-green-500',
  disconnected: 'bg-red-500',
  warning: 'bg-yellow-500',
  idle: 'bg-gray-500',
}[props.status]))

const shouldPulse = computed(() =>
  props.status === 'connected' || props.status === 'warning'
)
</script>

<template>
  <span class="relative inline-flex" :class="sizeClasses">
    <span
      v-if="shouldPulse"
      class="absolute inline-flex h-full w-full rounded-full opacity-75 animate-deja-ping"
      :class="colorClass"
    />
    <span
      class="relative inline-flex h-full w-full rounded-full"
      :class="colorClass"
    />
  </span>
</template>
