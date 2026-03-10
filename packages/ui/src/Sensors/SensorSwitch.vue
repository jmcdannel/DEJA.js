<script setup lang="ts">
import type { Sensor } from '@repo/modules/sensors'

defineProps<{
  sensor: Sensor
  color?: string
}>()

const emit = defineEmits<{
  toggle: [sensor: Sensor]
}>()
</script>

<template>
  <div class="flex items-center gap-2">
    <v-switch
      :model-value="sensor.state"
      :label="sensor.name || sensor.id"
      :color="color || 'teal'"
      :disabled="!sensor.enabled"
      hide-details
      density="compact"
      @update:model-value="emit('toggle', sensor)"
    />
  </div>
</template>
