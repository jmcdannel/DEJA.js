<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSensors, type Sensor, sensorTypes, sensorInputTypes } from '@repo/modules/sensors'
import EmptyState from '@/Core/UI/EmptyState.vue'

defineEmits(['edit'])

const { getSensors, deleteSensor } = useSensors()
const sensors = getSensors()

const color = ref('teal')
const confirmDelete = ref('')

const list = computed(() => sensors.value || [])

function getTypeLabel(type: string): string {
  const found = sensorTypes.find((t) => t.value === type)
  return found?.title ?? type
}

function getTypeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    digital: 'mdi-toggle-switch',
    analog: 'mdi-sine-wave',
    infrared: 'mdi-remote',
    ultrasonic: 'mdi-signal-distance-variant',
    current: 'mdi-flash',
    magnetic: 'mdi-magnet',
    optical: 'mdi-eye',
  }
  return iconMap[type] ?? 'mdi-access-point'
}

function getInputTypeLabel(inputType: string): string {
  const found = sensorInputTypes.find((t) => t.value === inputType)
  return found?.title ?? inputType
}
</script>
<template>
  <v-container v-if="list?.length">
    <v-row>
      <v-col
        cols="12"
        xs="12"
        sm="6"
        lg="4">
        <slot name="prepend"></slot>
      </v-col>
      <v-col v-for="item in list" :key="item.id"
        cols="12"
        xs="12"
        sm="6"
        lg="4">
        <v-card
          class="mx-auto w-full h-full justify-between flex flex-col"
          :color="color"
          variant="tonal"
          density="compact">
          <v-card-title class="flex items-center justify-between">
            <span>{{ item.name || item.id }}</span>
            <v-icon
              :color="item.state ? 'green' : 'red'"
              size="small"
            >mdi-circle</v-icon>
          </v-card-title>
          <v-card-text>
            <div class="flex flex-wrap gap-2 items-center mb-3">
              <v-chip variant="tonal" :color="color" :prepend-icon="getTypeIcon(item.type)">
                {{ getTypeLabel(item.type) }}
              </v-chip>
              <v-chip variant="tonal" color="blue-grey">
                {{ getInputTypeLabel(item.inputType) }}
              </v-chip>
            </div>
            <div class="flex flex-wrap gap-4 text-sm">
              <div v-if="item.device">
                <span class="opacity-70">Device:</span> {{ item.device }}
              </div>
              <div v-if="item.pin !== undefined">
                <span class="opacity-70">Pin:</span> {{ item.pin }}
              </div>
              <div v-if="item.index !== undefined">
                <span class="opacity-70">Index:</span> {{ item.index }}
              </div>
            </div>
          </v-card-text>
          <v-card-actions>
            <template v-if="confirmDelete === item?.id">
              <v-btn
                class="ma-2"
                text="Cancel"
                variant="outlined"
                size="small"
                @click="confirmDelete = ''" />
              <v-btn
                class="ma-2"
                text="Confirm"
                variant="tonal"
                size="small"
                prepend-icon="mdi-delete"
                @click="deleteSensor(item?.id)" />
            </template>
            <v-btn
              v-else
              class="ma-2"
              icon="mdi-delete"
              variant="tonal"
              size="small"
              @click="confirmDelete = item?.id"
            ></v-btn>
            <v-spacer></v-spacer>

            <v-btn
              text="Edit"
              variant="tonal"
              prepend-icon="mdi-pencil"
              size="small"
              @click="$emit('edit', item)"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <EmptyState
    v-if="!list?.length"
    icon="mdi-access-point"
    color="teal"
    title="No Sensors Yet"
    description="Configure sensors to detect train positions, occupancy, and environmental conditions on your layout."
    :use-cases="[{ icon: 'mdi-map-marker', text: 'Block occupancy detection' }, { icon: 'mdi-motion-sensor', text: 'Position tracking' }, { icon: 'mdi-robot', text: 'Automation triggers' }]"
    action-label="Add Your First Sensor"
    action-to="/sensors/new"
  />
</template>
