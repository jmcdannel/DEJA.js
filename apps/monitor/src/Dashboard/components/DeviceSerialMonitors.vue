<script setup lang="ts">
import { computed } from 'vue'

interface Device {
  id: string
  name?: string
  type?: string
  isConnected?: boolean
  port?: string
  topic?: string
}

interface Props {
  devices: Device[]
}

const props = defineProps<Props>()

// Filter to only show connected devices
const connectedDevices = computed(() => 
  props.devices.filter(device => device.isConnected)
)

// Get device display name
function getDeviceName(device: Device): string {
  if (device.name) return device.name
  if (device.port) return `${device.type || 'Device'} (${device.port})`
  if (device.topic) return `${device.type || 'Device'} (${device.topic})`
  return device.id
}

// Get device type icon
function getDeviceIcon(type?: string): string {
  switch(type) {
    case 'dcc-ex':
      return 'mdi-train'
    case 'sensor':
      return 'mdi-motion-sensor'
    default:
      return 'mdi-chip'
  }
}

// Get device type color
function getDeviceColor(type?: string): string {
  switch(type) {
    case 'dcc-ex':
      return 'teal'
    case 'sensor':
      return 'orange'
    default:
      return 'blue'
  }
}
</script>

<template>
  <v-card class="flex flex-col h-full" color="indigo">
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-monitor-multiple" class="mr-2" />
      Device Serial Monitors
      <v-spacer />
      <v-chip 
        :text="`${connectedDevices.length} connected`"
        size="small"
        variant="tonal"
      />
    </v-card-title>
    
    <v-card-text class="flex-1 overflow-hidden pa-0">
      <!-- No devices connected -->
      <div v-if="connectedDevices.length === 0" class="text-center py-8 text-gray-500">
        <v-icon icon="mdi-devices" size="large" class="mb-2" />
        <p>No devices currently connected</p>
        <p class="text-sm">Connect a device to see its serial monitor</p>
      </div>

      <!-- Devices in single row with horizontal scroll -->
      <div v-else class="overflow-x-auto overflow-y-hidden h-full px-4 py-2">
        <div class="flex gap-4 h-full" style="min-width: max-content;">
          <div
            v-for="device in connectedDevices"
            :key="device.id"
            class="flex-shrink-0"
            style="width: 320px; height: 200px;"
          >
            <v-card 
              class="h-full"
              variant="outlined"
              :color="getDeviceColor(device.type)"
            >
              <v-card-title class="py-2 text-sm d-flex align-center">
                <v-icon 
                  :icon="getDeviceIcon(device.type)"
                  :color="getDeviceColor(device.type)"
                  size="small"
                  class="mr-2"
                />
                <span class="text-truncate">{{ getDeviceName(device) }}</span>
              </v-card-title>
              
              <v-card-text class="pa-2 overflow-auto" style="height: calc(100% - 48px);">
                <!-- Serial monitor content would go here -->
                <div class="text-xs font-mono text-gray-600">
                  <div v-for="i in 5" :key="i" class="mb-1">
                    > Serial data line {{ i }}...
                  </div>
                  <div class="text-green-500">Device connected</div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
/* Custom scrollbar for horizontal scroll */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>