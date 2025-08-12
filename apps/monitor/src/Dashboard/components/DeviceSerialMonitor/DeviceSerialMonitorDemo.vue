<script setup lang="ts">
import { ref } from 'vue'
import DeviceSerialMonitor from './DeviceSerialMonitor.vue'

// Mock devices for testing
const mockDevices = ref([
  {
    id: 'dcc-ex-1',
    name: 'DCC-EX Controller 1',
    type: 'dcc-ex',
    isConnected: true,
    port: '/dev/ttyUSB0'
  },
  {
    id: 'dcc-ex-2',
    name: 'DCC-EX Controller 2',
    type: 'dcc-ex',
    isConnected: true,
    port: '/dev/ttyUSB1'
  },
  {
    id: 'arduino-1',
    name: 'Arduino Device 1',
    type: 'arduino',
    isConnected: true,
    port: '/dev/ttyACM0'
  },
  {
    id: 'pico-w-1',
    name: 'Pico W Device 1',
    type: 'pico-w',
    isConnected: false,
    port: '/dev/ttyACM1'
  }
])

// Toggle device connection for testing
function toggleConnection(deviceId: string) {
  const device = mockDevices.value.find(d => d.id === deviceId)
  if (device) {
    device.isConnected = !device.isConnected
  }
}

// Add a mock device
function addMockDevice() {
  const newId = `mock-device-${Date.now()}`
  mockDevices.value.push({
    id: newId,
    name: `Mock Device ${mockDevices.value.length + 1}`,
    type: 'mock',
    isConnected: true,
    port: `/dev/mock${mockDevices.value.length + 1}`
  })
}

// Remove a mock device
function removeMockDevice(deviceId: string) {
  const index = mockDevices.value.findIndex(d => d.id === deviceId)
  if (index > -1) {
    mockDevices.value.splice(index, 1)
  }
}
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Device Serial Monitor Demo</h1>
      <p class="text-gray-600">Test the device-specific serial monitoring functionality</p>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-center gap-4">
      <v-btn @click="addMockDevice" color="blue">
        Add Mock Device
      </v-btn>
      <v-btn @click="mockDevices = []" color="red" variant="outlined">
        Clear All
      </v-btn>
    </div>

    <!-- Device Controls -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <v-card 
        v-for="device in mockDevices" 
        :key="device.id"
        :color="device.isConnected ? 'green' : 'red'"
        variant="tonal"
      >
        <v-card-text class="text-center">
          <h3 class="font-semibold mb-2">{{ device.name }}</h3>
          <p class="text-sm text-gray-600 mb-2">{{ device.type.toUpperCase() }}</p>
          <p class="text-xs text-gray-500 mb-3">{{ device.port }}</p>
          
          <div class="flex gap-2 justify-center">
            <v-btn
              size="small"
              @click="toggleConnection(device.id)"
              :color="device.isConnected ? 'red' : 'green'"
            >
              {{ device.isConnected ? 'Disconnect' : 'Connect' }}
            </v-btn>
            
            <v-btn
              size="small"
              variant="outlined"
              @click="removeMockDevice(device.id)"
              color="red"
            >
              Remove
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Device Serial Monitors -->
    <div class="space-y-6">
      <h2 class="text-2xl font-semibold text-gray-800">Serial Monitors</h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeviceSerialMonitor
          v-for="device in mockDevices.filter(d => d.isConnected)"
          :key="device.id"
          :device-id="device.id"
          :device-name="device.name"
          :device-type="device.type"
          :is-connected="device.isConnected"
        />
      </div>
    </div>

    <!-- Instructions -->
    <v-card color="blue-lighten-5" variant="tonal">
      <v-card-text>
        <h3 class="font-semibold mb-2">How to Test:</h3>
        <ol class="list-decimal list-inside space-y-1 text-sm">
          <li>Connect to a WebSocket server (update the host in the monitor)</li>
          <li>Enable monitoring for a device using the toggle switch</li>
          <li>Send serial commands from the server to see them appear</li>
          <li>Toggle device connections to see status changes</li>
          <li>Add/remove mock devices to test the interface</li>
        </ol>
      </v-card-text>
    </v-card>
  </div>
</template> 