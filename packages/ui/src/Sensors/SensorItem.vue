<script setup lang="ts">
import type { Sensor } from '@repo/modules/sensors'
import { sensorTypes, sensorInputTypes } from '@repo/modules/sensors'

const props = defineProps<{
  sensor: Sensor
  color?: string
}>()

const emit = defineEmits<{
  click: [sensor: Sensor]
  toggle: [sensor: Sensor]
}>()

const typeLabel = sensorTypes.find(t => t.value === props.sensor.type)?.label ?? props.sensor.type
const typeIcon = sensorTypes.find(t => t.value === props.sensor.type)?.icon ?? 'mdi-access-point'
const inputLabel = sensorInputTypes.find(t => t.value === props.sensor.inputType)?.label
</script>

<template>
  <v-list-item
    :title="sensor.name || sensor.id"
    :subtitle="`${typeLabel}${inputLabel ? ' / ' + inputLabel : ''}`"
    @click="emit('click', sensor)"
  >
    <template #prepend>
      <v-icon :icon="typeIcon" :color="sensor.state ? 'green' : (color || 'teal')" />
    </template>
    <template #append>
      <v-chip :color="sensor.state ? 'green' : 'grey'" size="small" variant="tonal">
        {{ sensor.state ? 'Active' : 'Inactive' }}
      </v-chip>
      <v-chip v-if="!sensor.enabled" size="x-small" color="warning" class="ml-1">
        Disabled
      </v-chip>
    </template>
  </v-list-item>
</template>
