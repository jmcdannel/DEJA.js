<script setup lang="ts">
import { computed, ref, type PropType } from 'vue'
import draggable from 'vuedraggable'
import { useSensors, type Sensor, sensorTypes, sensorInputTypes } from '@repo/modules/sensors'
import { useSortableList } from '@/Core/composables/useSortableList'

defineEmits(['edit'])
const props = defineProps({
  filteredList: { type: Array as PropType<Sensor[]>, default: undefined },
})

const { getSensors, setSensor, deleteSensor } = useSensors()
const sensors = getSensors()

const color = ref('teal')
const confirmDelete = ref('')

const { list: sortableList, onDragStart, onDragEnd } = useSortableList<Sensor>(sensors as any, (id, data) => setSensor(id, data as any))

const list = computed(() => props.filteredList ?? sortableList.value)

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
      <template v-if="$slots.prepend" #header>
        <div>
          <slot name="prepend"></slot>
        </div>
      </template>
      <template #item="{ element: item }">
        <div>
          <v-card
            class="mx-auto w-full h-full justify-between flex flex-col"
            density="compact">
            <v-card-title class="flex flex-nowrap items-center gap-2">
              <v-icon class="drag-handle cursor-grab active:cursor-grabbing opacity-40 hover:opacity-100 flex-shrink-0" size="small">mdi-drag</v-icon>
              <router-link :to="{ name: 'Edit Sensor', params: { sensorId: item.id } }" class="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-80 transition-opacity">
                <v-icon :icon="getTypeIcon(item.type)" :color="color" class="flex-shrink-0" />
                <span class="truncate">{{ item.name || item.id }}</span>
              </router-link>
              <v-spacer />
              <v-icon
                :icon="item.state ? 'mdi-circle' : 'mdi-circle-outline'"
                :color="item.state ? 'green' : 'grey'"
                size="small"
                class="flex-shrink-0"
              />
            </v-card-title>
            <v-card-text>
              <div class="flex justify-between w-full items-start">
                <v-chip-group column>
                  <v-chip variant="outlined" :prepend-icon="getTypeIcon(item.type)">
                    {{ getTypeLabel(item.type) }}
                  </v-chip>
                  <v-chip variant="outlined">
                    {{ getInputTypeLabel(item.inputType ?? '') }}
                  </v-chip>
                  <v-chip v-if="item.pin !== undefined" size="small" variant="outlined">
                    Pin {{ item.pin }}
                  </v-chip>
                  <v-chip v-if="item.index !== undefined" size="small" variant="outlined">
                    Index {{ item.index }}
                  </v-chip>
                </v-chip-group>
                <v-btn
                  v-if="item.device"
                  size="small"
                  variant="outlined"
                  :color="color"
                  prepend-icon="mdi-memory"
                >
                  {{ item.device }}
                </v-btn>
              </div>
            </v-card-text>
            <v-divider />
            <div class="flex items-center pa-1" style="background: rgba(var(--v-theme-on-surface), 0.04)">
              <template v-if="confirmDelete === item?.id">
                <v-btn
                  text="Cancel"
                  variant="outlined"
                  size="small"
                  @click="confirmDelete = ''"
                />
                <v-btn
                  text="Confirm"
                  variant="tonal"
                  color="error"
                  size="small"
                  prepend-icon="mdi-delete"
                  @click="deleteSensor(item?.id)"
                />
              </template>
              <v-btn
                v-else
                icon="mdi-delete-outline"
                variant="text"
                color="error"
                size="small"
                @click="confirmDelete = item?.id"
              />
              <v-spacer />
              <v-btn
                icon="mdi-pencil-outline"
                variant="text"
                :color="color"
                size="small"
                @click="$emit('edit', item)"
              />
            </div>
          </v-card>
        </div>
      </template>
    </draggable>
  </v-container>
  <div v-if="!list?.length" class="flex flex-col items-center justify-center py-12 px-4">
    <v-icon size="48" class="opacity-30 mb-3">mdi-magnify-close</v-icon>
    <p class="text-sm opacity-60">No sensors match your filters.</p>
  </div>
</template>
<style scoped>
.ghost {
  opacity: 0.5;
}
</style>
