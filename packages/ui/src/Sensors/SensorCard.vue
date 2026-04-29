<script setup lang="ts">
import { computed } from 'vue'
import type { Sensor } from '@repo/modules/sensors'
import { sensorTypes, sensorInputTypes } from '@repo/modules/sensors'
import ListItemCard from '../DeviceConfig/ListItemCard.vue'

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

const accentColor = computed(() => props.color || 'teal')
const typeIcon = computed(
  () => sensorTypes.find(t => t.value === props.sensor.type)?.icon ?? 'mdi-access-point',
)
const inputLabel = computed(
  () => sensorInputTypes.find(t => t.value === props.sensor.inputType)?.label,
)
</script>

<template>
  <ListItemCard
    :item-id="sensor?.id"
    :device-id="sensor?.device"
    :color="accentColor"
    @click="emit('click', sensor)"
  >
    <template #header-leading>
      <v-avatar :color="accentColor" variant="tonal" size="32" rounded="lg">
        <v-icon :icon="typeIcon" :color="accentColor" size="18" />
      </v-avatar>
    </template>

    <template #title>
      <span class="text-sm font-semibold text-[#f8fafc] truncate">
        {{ sensor.name || sensor.id }}
      </span>
    </template>

    <template #subtitle>
      {{ sensor.type }}{{ inputLabel ? ` · ${inputLabel}` : '' }}
    </template>

    <template #status>
      <v-icon
        :icon="sensor.state ? 'mdi-circle' : 'mdi-circle-outline'"
        :color="sensor.state ? 'green' : 'grey'"
        size="14"
      />
    </template>

    <div class="flex flex-wrap gap-1.5 items-center">
      <v-chip
        v-if="sensor.pin !== undefined"
        size="x-small"
        variant="outlined"
      >
        Pin {{ sensor.pin }}
      </v-chip>
      <v-chip
        v-if="sensor.blockId"
        size="x-small"
        color="orange"
        variant="tonal"
      >
        {{ sensor.blockId }}
      </v-chip>
    </div>

    <template #footer>
      <v-btn
        icon="mdi-delete-outline"
        variant="text"
        color="error"
        size="small"
        @click.stop="emit('delete', sensor)"
      />
      <v-spacer />
      <v-btn
        icon="mdi-pencil-outline"
        variant="text"
        :color="accentColor"
        size="small"
        @click.stop="emit('edit', sensor)"
      />
    </template>
  </ListItemCard>
</template>
