<script setup lang="ts">
import type { Sensor } from '@repo/modules/sensors'
import SensorItem from './SensorItem.vue'

defineProps<{
  sensors: Sensor[]
  color?: string
}>()

const emit = defineEmits<{
  click: [sensor: Sensor]
  toggle: [sensor: Sensor]
}>()
</script>

<template>
  <v-list v-if="sensors.length" lines="two">
    <SensorItem
      v-for="sensor in sensors"
      :key="sensor.id"
      :sensor="sensor"
      :color="color"
      @click="emit('click', sensor)"
      @toggle="emit('toggle', sensor)"
    />
  </v-list>
</template>
