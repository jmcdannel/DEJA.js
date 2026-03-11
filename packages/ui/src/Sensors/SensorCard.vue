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

const typeIcon = sensorTypes.find(t => t.value === props.sensor.type)?.icon ?? 'mdi-access-point'
const inputLabel = sensorInputTypes.find(t => t.value === props.sensor.inputType)?.label
</script>

<template>
  <v-card
    :color="color || 'teal'"
    variant="tonal"
    density="compact"
    class="h-full"
    @click="emit('click', sensor)"
  >
    <v-card-title class="flex items-center gap-2">
      <v-icon :icon="typeIcon" size="small" />
      <span>{{ sensor.name || sensor.id }}</span>
      <v-spacer />
      <v-icon
        :icon="sensor.state ? 'mdi-circle' : 'mdi-circle-outline'"
        :color="sensor.state ? 'green' : 'grey'"
        size="small"
      />
    </v-card-title>
    <v-card-text>
      <div class="flex flex-wrap gap-2">
        <v-chip size="x-small" variant="outlined">{{ sensor.type }}</v-chip>
        <v-chip v-if="inputLabel" size="x-small" variant="outlined">{{ inputLabel }}</v-chip>
        <v-chip v-if="sensor.device" size="x-small">{{ sensor.device }}</v-chip>
        <v-chip v-if="sensor.pin !== undefined" size="x-small">Pin {{ sensor.pin }}</v-chip>
        <v-chip v-if="sensor.blockId" size="x-small" color="orange">{{ sensor.blockId }}</v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>
