<script setup lang="ts">
import { computed } from 'vue'
import DeviceSerialMonitor from './DeviceSerialMonitor.vue'

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

// Group devices by type for better organization
const devicesByType = computed(() => {
  const groups: Record<string, Device[]> = {}
  
  connectedDevices.value.forEach(device => {
    const type = device.type || 'unknown'
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(device)
  })
  
  return groups
})

// Get device display name
function getDeviceName(device: Device): string {
  if (device.name) return device.name
  if (device.port) return `${device.type || 'Device'} (${device.port})`
  if (device.topic) return `${device.type || 'Device'} (${device.topic})`
  return device.id
}

// Get device type for display
function getDeviceType(device: Device): string {
  return device.type || 'unknown'
}
</script>

<template>
  <v-card title="Device Serial Monitors" class="flex flex-col " color="indigo">
    <v-card-text class="flex flex-1 flex-col gap-4">
      <!-- No devices connected -->
      <div v-if="connectedDevices.length === 0" class="text-center py-8 text-gray-500">
        <v-icon icon="mdi-devices" size="large" class="mb-2" />
        <p>No devices currently connected</p>
        <p class="text-sm">Connect a device to see its serial monitor</p>
      </div>

      <!-- Devices grouped by type -->
      <div v-else class="space-y-6">
        <div v-for="(devices, type) in devicesByType" :key="type" class="space-y-3">
          <!-- Type Header -->
          <div class="flex items-center gap-2">
            <v-icon 
              :icon="type === 'dcc-ex' ? 'mdi-train' : 'mdi-chip'"
              :color="type === 'dcc-ex' ? 'teal' : 'blue'"
            />
            <h3 class="text-lg font-semibold capitalize">{{ type }} Devices</h3>
            <v-chip 
              :text="devices.length.toString()"
              size="small"
              variant="tonal"
            />
          </div>

          <!-- Device Monitors Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DeviceSerialMonitor
              v-for="device in devices"
              :key="device.id"
              :device-id="device.id"
              :device-name="getDeviceName(device)"
              :device-type="getDeviceType(device)"
              :is-connected="device.isConnected"
            />
          </div>
        </div>
      </div>
    </v-card-text>

    <!-- Footer Info -->
    <v-card-actions class="flex items-center justify-between text-sm text-gray-500">
      <span>
        {{ connectedDevices.length }} device{{ connectedDevices.length !== 1 ? 's' : '' }} connected
      </span>
      <span>
        {{ Object.keys(devicesByType).length }} device type{{ Object.keys(devicesByType).length !== 1 ? 's' : '' }}
      </span>
    </v-card-actions>
  </v-card>
</template> 