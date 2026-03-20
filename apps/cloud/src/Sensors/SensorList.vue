<script setup lang="ts">
import { ref } from 'vue'
import draggable from 'vuedraggable'
import { useSensors, type Sensor, sensorTypes, sensorInputTypes } from '@repo/modules/sensors'
import { useSortableList } from '@/Core/composables/useSortableList'
import EmptyState from '@/Core/UI/EmptyState.vue'

defineEmits(['edit'])

const { getSensors, setSensor, deleteSensor } = useSensors()
const sensors = getSensors()

const color = ref('teal')
const confirmDelete = ref('')

const { list, onDragStart, onDragEnd } = useSortableList<Sensor>(sensors as any, (id, data) => setSensor(id, data as any))

function getTypeLabel(type: string): string {
  const found = sensorTypes.find((t) => t.value === type)
  return found?.label ?? type
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
  return found?.label ?? inputType
}
</script>
<template>
  <v-container v-if="list?.length">
    <draggable
      :list="list"
      item-key="id"
      handle=".drag-handle"
      ghost-class="ghost"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      @start="onDragStart"
      @end="onDragEnd"
    >
      <template #header>
        <div>
          <slot name="prepend"></slot>
        </div>
      </template>
      <template #item="{ element: item }">
        <div>
          <v-card
            class="mx-auto w-full h-full justify-between flex flex-col"
            :color="color"
            variant="tonal"
            density="compact">
            <v-card-title class="flex items-center justify-between text-sm py-1">
              <div class="flex items-center gap-1">
                <v-icon class="drag-handle cursor-grab active:cursor-grabbing opacity-40 hover:opacity-100" size="small">mdi-drag</v-icon>
                <span>{{ item.name || item.id }}</span>
              </div>
              <v-icon
                :color="item.state ? 'green' : 'red'"
                size="x-small"
              >mdi-circle</v-icon>
            </v-card-title>
            <v-card-text class="py-1">
              <div class="flex flex-wrap gap-1 items-center mb-2">
                <v-chip variant="tonal" :color="color" size="x-small" :prepend-icon="getTypeIcon(item.type)">
                  {{ getTypeLabel(item.type) }}
                </v-chip>
                <v-chip variant="tonal" color="blue-grey" size="x-small">
                  {{ getInputTypeLabel(item.inputType) }}
                </v-chip>
              </div>
              <div class="flex flex-wrap gap-3 text-xs">
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
            <v-card-actions class="py-1">
              <template v-if="confirmDelete === item?.id">
                <v-btn
                  class="ma-1"
                  text="Cancel"
                  variant="outlined"
                  size="x-small"
                  @click="confirmDelete = ''" />
                <v-btn
                  class="ma-1"
                  text="Confirm"
                  variant="tonal"
                  size="x-small"
                  prepend-icon="mdi-delete"
                  @click="deleteSensor(item?.id)" />
              </template>
              <v-btn
                v-else
                class="ma-1"
                icon="mdi-delete"
                variant="tonal"
                size="x-small"
                @click="confirmDelete = item?.id"
              ></v-btn>
              <v-spacer></v-spacer>

              <v-btn
                text="Edit"
                variant="tonal"
                prepend-icon="mdi-pencil"
                size="x-small"
                @click="$emit('edit', item)"
              ></v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </template>
    </draggable>
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
<style scoped>
.ghost {
  opacity: 0.5;
}
</style>
