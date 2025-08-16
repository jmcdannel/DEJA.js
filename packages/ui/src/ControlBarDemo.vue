<script setup lang="ts">
import { ref } from 'vue'
import ControlBar from './ControlBar.vue'

const demoDevices = ref([
  {
    id: 'dcc-ex-1',
    type: 'dcc-ex',
    isConnected: true,
    connection: 'WiFi',
    port: '8080',
    topic: 'dcc-ex/command'
  },
  {
    id: 'wifi-device-1',
    type: 'wifi',
    isConnected: false,
    connection: 'WiFi',
    port: '8081'
  }
])

const demoLayouts = ref([
  {
    id: 'demo-layout-1',
    name: 'Demo Layout 1',
    description: 'A demonstration layout for testing'
  },
  {
    id: 'demo-layout-2',
    name: 'Demo Layout 2',
    description: 'Another demonstration layout'
  }
])

function handleTrackPowerToggle(newState: boolean) {
  console.log('Track power toggled:', newState)
}

function handleLayoutPowerToggle(newState: boolean) {
  console.log('Layout power toggled:', newState)
}

function handleEmergencyStop() {
  console.log('Emergency stop triggered')
}

function handleDeviceSelect(deviceId: string) {
  console.log('Device selected:', deviceId)
}

function handleLayoutSelect(layoutId: string) {
  console.log('Layout selected:', layoutId)
}
</script>

<template>
  <div class="control-bar-demo">
    <h2>ControlBar Demo</h2>
    <ControlBar 
      :show-layout-power="true"
      :show-emergency-stop="true"
      :show-device-status="true"
      :show-device-status-label="true"
      :device-status-compact="false"
      :layout-power-state="false"
      :devices="demoDevices"
      :layouts="demoLayouts"
      :loading="false"
      @track-power-toggle="handleTrackPowerToggle"
      @layout-power-toggle="handleLayoutPowerToggle"
      @emergency-stop="handleEmergencyStop"
      @device-select="handleDeviceSelect"
      @layout-select="handleLayoutSelect"
    />
  </div>
</template>

<style scoped>
.control-bar-demo {
  padding: 2rem;
  background: #1e293b;
  min-height: 100vh;
}
</style>
