<script setup lang="ts">
import { computed } from 'vue'
import type { Sensor } from '@repo/modules/sensors'
import { sensorTypes, sensorInputTypes } from '@repo/modules/sensors'

const props = defineProps<{
  sensor: Sensor
  color?: string
}>()

const emit = defineEmits<{
  click: [sensor: Sensor]
  toggle: [sensor: Sensor]
  edit: [sensor: Sensor]
  delete: [sensor: Sensor]
}>()

const deviceColor = computed(() => props.color || 'teal')
const typeIcon = sensorTypes.find(t => t.value === props.sensor.type)?.icon ?? 'mdi-access-point'
const inputLabel = sensorInputTypes.find(t => t.value === props.sensor.inputType)?.label
</script>

<template>
  <v-card
    density="compact"
    class="h-full"
    @click="emit('click', sensor)"
  >
    <v-card-title class="flex items-center gap-2">
      <v-icon :icon="typeIcon" :color="deviceColor" />
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
        <v-btn
          v-if="sensor.device"
          size="x-small"
          variant="outlined"
          :color="deviceColor"
          prepend-icon="mdi-memory"
        >
          {{ sensor.device }}
        </v-btn>
        <v-chip v-if="sensor.pin !== undefined" size="x-small">Pin {{ sensor.pin }}</v-chip>
        <v-chip v-if="sensor.blockId" size="x-small" color="orange">{{ sensor.blockId }}</v-chip>
      </div>
    </v-card-text>
    <v-divider />
    <div class="flex justify-between pa-1" style="background: rgba(var(--v-theme-on-surface), 0.04)">
      <v-btn
        icon="mdi-delete-outline"
        variant="text"
        color="error"
        size="small"
        @click.stop="emit('delete', sensor)"
      />
      <v-btn
        icon="mdi-pencil-outline"
        variant="text"
        :color="deviceColor"
        size="small"
        @click.stop="emit('edit', sensor)"
      />
    </div>
  </v-card>
</template>
