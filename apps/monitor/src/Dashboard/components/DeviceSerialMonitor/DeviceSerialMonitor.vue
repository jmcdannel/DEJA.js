<script setup lang="ts">
import { computed } from 'vue'
import { useDeviceSerialMonitor, type SerialMessage } from './useDeviceSerialMonitor'

interface Props {
  deviceId: string
  deviceName?: string
  deviceType?: string
  isConnected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  deviceName: '',
  deviceType: 'Unknown',
  isConnected: false
})

const {
  enabled,
  messages,
  status,
  isSubscribed,
  maxMessages,
  clearMessages
} = useDeviceSerialMonitor(props.deviceId)

// Computed properties
const displayName = computed(() => props.deviceName || props.deviceId)
const statusColor = computed(() => {
  if (!enabled.value) return 'grey'
  if (status.value === 'OPEN' && isSubscribed.value) return 'teal'
  if (status.value === 'OPEN') return 'cyan'
  return 'red'
})

const statusText = computed(() => {
  if (!enabled.value) return 'Disabled'
  if (status.value === 'OPEN' && isSubscribed.value) return 'Monitoring'
  if (status.value === 'OPEN') return 'Connected'
  if (status.value === 'CONNECTING') return 'Connecting...'
  return 'Disconnected'
})

const accentClass = computed(() =>
  props.deviceType === 'dcc-ex' ? 'monitor-card--accent-teal' : 'monitor-card--accent-blue'
)

// Format timestamp for display
function formatTime(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  } catch {
    return timestamp
  }
}

// Get direction icon and color
function getDirectionInfo(direction: 'incoming' | 'outgoing') {
  if (direction === 'incoming') {
    return { icon: 'mdi-arrow-down', color: 'text-blue-500' }
  } else {
    return { icon: 'mdi-arrow-up', color: 'text-green-500' }
  }
}
</script>

<template>
  <v-card :class="['flex flex-col overflow-hidden h-full', accentClass]">
    <template #title>
      <div class="monitor-card__header w-full">
        <div class="flex flex-col gap-1">
          <span class="monitor-card__title">{{ displayName }}</span>
          <span class="monitor-card__subtitle">Serial channel</span>
        </div>
        <v-spacer />
        <div class="monitor-card__toolbar">
          <v-chip class="monitor-chip" size="x-small">
            {{ deviceType.toUpperCase() }}
          </v-chip>
          <v-chip
            class="monitor-chip monitor-card__status-chip"
            size="x-small"
            :color="isConnected ? 'teal' : 'red'"
            variant="tonal"
          >
            {{ isConnected ? 'Connected' : 'Disconnected' }}
          </v-chip>
          <v-chip
            class="monitor-chip monitor-card__status-chip"
            size="x-small"
            :color="statusColor"
            variant="tonal"
          >
            {{ statusText }}
          </v-chip>
          <span class="monitor-card__meta hidden sm:inline-flex">
            {{ messages.length }}/{{ maxMessages }} msgs
          </span>
        </div>
      </div>
    </template>

    <v-card-text class="monitor-card__body flex flex-1 flex-col gap-3 overflow-hidden">
      <!-- Serial Messages -->
      <div class="monitor-card__terminal monitor-card__scroll flex-1 overflow-y-auto">
        <div v-if="messages.length === 0" class="monitor-card__meta text-center py-6">
          No serial messages yet
        </div>

        <div v-else class="monitor-card__terminal-lines space-y-2">
          <div
            v-for="message in messages"
            :key="message.id"
            class="monitor-card__terminal-line"
          >
            <!-- Direction Icon -->
            <div :class="getDirectionInfo(message.direction).color">
              <v-icon
                :icon="getDirectionInfo(message.direction).icon"
                size="small"
              />
            </div>

            <!-- Timestamp -->
            <span class="monitor-card__timestamp">
              {{ formatTime(message.timestamp) }}
            </span>

            <!-- Data -->
            <span class="monitor-card__payload">
              {{ message.data }}
            </span>
          </div>
        </div>
      </div>
    </v-card-text>

    <!-- Actions -->
    <v-card-actions class="monitor-card__actions flex items-center justify-between">
      <div class="flex items-center gap-2">
        <v-switch
          v-model="enabled"
          label="Monitor"
          :color="deviceType === 'dcc-ex' ? 'teal' : 'cyan'"
          density="compact"
          hide-details
        />
      </div>

      <div class="flex items-center gap-2">
        <v-btn
          size="small"
          class="monitor-card__ghost-btn"
          variant="text"
          @click="clearMessages"
          :disabled="messages.length === 0"
        >
          Clear
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>