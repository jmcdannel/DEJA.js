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
  if (status.value === 'OPEN' && isSubscribed.value) return 'green'
  if (status.value === 'OPEN') return 'blue'
  return 'red'
})

const statusText = computed(() => {
  if (!enabled.value) return 'Disabled'
  if (status.value === 'OPEN' && isSubscribed.value) return 'Monitoring'
  if (status.value === 'OPEN') return 'Connected'
  if (status.value === 'CONNECTING') return 'Connecting...'
  return 'Disconnected'
})

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
  <v-card 
    :title="displayName" 
    class="flex flex-col overflow-hidden h-full"
    :color="deviceType === 'dcc-ex' ? 'teal' : 'blue'"
  >
    <v-card-text class="flex flex-1 flex-col gap-2 overflow-hidden">
      <!-- Device Info Header -->
      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center gap-2">
          <v-chip 
            :text="deviceType.toUpperCase()"
            size="small"
            variant="tonal"
          />
          <v-chip 
            :text="isConnected ? 'Connected' : 'Disconnected'"
            :color="isConnected ? 'green' : 'red'"
            size="small"
          />
        </div>
        
        <div class="flex items-center gap-2">
          <v-chip 
            :text="statusText"
            :color="statusColor"
            size="small"
          />
          <span class="text-xs text-gray-500">
            {{ messages.length }}/{{ maxMessages }}
          </span>
        </div>
      </div>

      <!-- Serial Messages -->
      <div class="flex-1 overflow-y-auto bg-gray-900 rounded p-2 font-mono text-xs">
        <div v-if="messages.length === 0" class="text-gray-500 text-center py-4">
          No serial messages yet
        </div>
        
        <div v-else class="space-y-1">
          <div 
            v-for="message in messages" 
            :key="message.id"
            class="flex items-start gap-2 p-1 rounded hover:bg-gray-800"
          >
            <!-- Direction Icon -->
            <div :class="getDirectionInfo(message.direction).color">
              <v-icon 
                :icon="getDirectionInfo(message.direction).icon" 
                size="small"
              />
            </div>
            
            <!-- Timestamp -->
            <span class="text-gray-400 text-xs min-w-[60px]">
              {{ formatTime(message.timestamp) }}
            </span>
            
            <!-- Data -->
            <span class="text-white break-all">
              {{ message.data }}
            </span>
          </div>
        </div>
      </div>
    </v-card-text>

    <!-- Actions -->
    <v-card-actions class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <v-switch 
          v-model="enabled" 
          label="Monitor" 
          :color="deviceType === 'dcc-ex' ? 'teal' : 'blue'"
          density="compact"
          hide-details
        />
      </div>
      
      <div class="flex items-center gap-2">
        <v-btn
          size="small"
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