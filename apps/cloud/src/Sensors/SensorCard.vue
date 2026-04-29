<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Sensor } from '@repo/modules/sensors'
import { sensorTypes, sensorInputTypes } from '@repo/modules/sensors'
import { ListItemCard } from '@repo/ui'

const props = defineProps<{
  sensor: Sensor
  color?: string
  confirming: boolean
}>()

const emit = defineEmits<{
  edit: [sensor: Sensor]
  'request-delete': [id: string]
  'cancel-delete': []
  'confirm-delete': [id: string]
}>()

const router = useRouter()
const accentColor = computed(() => props.color || 'teal')

function getTypeLabel(type: string): string {
  return sensorTypes.find((t) => t.value === type)?.label ?? type
}

const iconMap: Record<string, string> = {
  digital: 'mdi-toggle-switch',
  analog: 'mdi-sine-wave',
  infrared: 'mdi-remote',
  ultrasonic: 'mdi-signal-distance-variant',
  current: 'mdi-flash',
  magnetic: 'mdi-magnet',
  optical: 'mdi-eye',
}
const icon = computed(() => iconMap[props.sensor.type] ?? 'mdi-access-point')

function getInputTypeLabel(inputType: string): string {
  return sensorInputTypes.find((t) => t.value === inputType)?.label ?? inputType
}

function goToEdit() {
  router.push({ name: 'Edit Sensor', params: { sensorId: props.sensor.id } })
}
</script>

<template>
  <ListItemCard
    :item-id="sensor?.id"
    :device-id="sensor?.device"
    :color="accentColor"
  >
    <template #header-leading>
      <v-avatar :color="accentColor" variant="tonal" size="32" rounded="lg">
        <v-icon :icon="icon" :color="accentColor" size="18" />
      </v-avatar>
    </template>

    <template #title>
      <button
        type="button"
        class="text-sm font-semibold text-[#f8fafc] truncate text-left hover:opacity-80 transition-opacity"
        @click="goToEdit"
      >
        {{ sensor.name || sensor.id }}
      </button>
    </template>

    <template #subtitle>
      {{ getTypeLabel(sensor.type) }}{{ sensor.inputType ? ` · ${getInputTypeLabel(sensor.inputType)}` : '' }}
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
        v-if="sensor.index !== undefined"
        size="x-small"
        variant="outlined"
      >
        Index {{ sensor.index }}
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
      <template v-if="confirming">
        <v-btn
          text="Cancel"
          variant="outlined"
          size="small"
          @click="emit('cancel-delete')"
        />
        <v-btn
          text="Confirm"
          variant="tonal"
          color="error"
          size="small"
          prepend-icon="mdi-delete"
          @click="emit('confirm-delete', sensor.id)"
        />
      </template>
      <v-btn
        v-else
        icon="mdi-delete-outline"
        variant="text"
        color="error"
        size="small"
        @click="emit('request-delete', sensor.id)"
      />
      <v-spacer />
      <v-btn
        icon="mdi-pencil-outline"
        variant="text"
        :color="accentColor"
        size="small"
        @click="emit('edit', sensor)"
      />
    </template>
  </ListItemCard>
</template>
