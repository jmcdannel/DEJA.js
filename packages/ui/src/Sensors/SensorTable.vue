<script setup lang="ts">
import type { Sensor } from '@repo/modules/sensors'
import { sensorTypes, sensorInputTypes } from '@repo/modules/sensors'

defineProps<{
  sensors: Sensor[]
}>()

const emit = defineEmits<{
  click: [sensor: Sensor]
}>()

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Type', key: 'type' },
  { title: 'Input', key: 'inputType' },
  { title: 'Device', key: 'device' },
  { title: 'Pin', key: 'pin' },
  { title: 'State', key: 'state' },
  { title: 'Enabled', key: 'enabled' },
]

function getTypeIcon(type?: string): string {
  return sensorTypes.find(t => t.value === type)?.icon ?? 'mdi-access-point'
}

function getInputLabel(inputType?: string): string {
  return sensorInputTypes.find(t => t.value === inputType)?.label ?? ''
}
</script>

<template>
  <v-data-table
    :items="sensors"
    :headers="headers"
    item-value="id"
    density="compact"
    @click:row="(_: any, { item }: any) => emit('click', item)"
  >
    <template #item.name="{ item }">
      <div class="flex items-center gap-2">
        <v-icon :icon="getTypeIcon(item.type)" size="small" />
        {{ item.name || item.id }}
      </div>
    </template>
    <template #item.inputType="{ item }">
      {{ getInputLabel(item.inputType) }}
    </template>
    <template #item.state="{ item }">
      <v-icon
        :icon="item.state ? 'mdi-circle' : 'mdi-circle-outline'"
        :color="item.state ? 'green' : 'grey'"
        size="small"
      />
    </template>
    <template #item.enabled="{ item }">
      <v-icon
        :icon="item.enabled ? 'mdi-check-circle' : 'mdi-close-circle'"
        :color="item.enabled ? 'green' : 'red'"
        size="small"
      />
    </template>
  </v-data-table>
</template>
