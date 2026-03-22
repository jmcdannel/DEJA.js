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
          density="compact">
          <v-card-title class="flex flex-nowrap items-center gap-2">
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
