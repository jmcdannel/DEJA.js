<script setup lang="ts">
import { ref } from 'vue'
import ControlBar from './ControlBar.vue'

// Demo state
const layoutPowerState = ref(false)
const devices = ref([
  { id: 'DCC-EX-001', type: 'dcc-ex', isConnected: true, connection: 'USB', port: '/dev/ttyUSB0' },
  { id: 'WiFi-Throttle', type: 'wifi', isConnected: true, connection: 'WiFi', topic: 'dccex/throttle' },
  { id: 'Bluetooth-001', type: 'bluetooth', isConnected: false, connection: 'Bluetooth' }
])

const layouts = ref([
  { id: 'main-layout', name: 'Main Layout', description: 'Primary model railroad layout with full DCC control' },
  { id: 'test-track', name: 'Test Track', description: 'Small testing loop for locomotive maintenance' },
  { id: 'yard-layout', name: 'Switching Yard', description: 'Complex yard operations with multiple sidings' },
  { id: 'mountain-division', name: 'Mountain Division', description: 'Scenic mountain route with steep grades' }
])

// Event handlers
function handleTrackPowerToggle(newState: boolean) {
  console.log('Track power toggled:', newState)
  layoutPowerState.value = newState
}

function handleLayoutPowerToggle(newState: boolean) {
  console.log('Layout power toggled:', newState)
  layoutPowerState.value = newState
}

function handleEmergencyStop() {
  console.log('Emergency stop activated!')
  layoutPowerState.value = false
}

function handleDeviceSelect(deviceId: string) {
  console.log('Device selected:', deviceId)
}

function handleLayoutSelect(layoutId: string) {
  console.log('Layout selected:', layoutId)
}

// Demo controls
function toggleDeviceConnection() {
  devices.value[2].isConnected = !devices.value[2].isConnected
}

function addDevice() {
  const newDevice = {
    id: `Device-${Date.now()}`,
    type: 'dcc-ex',
    isConnected: Math.random() > 0.5,
    connection: 'USB',
    port: `/dev/ttyUSB${devices.value.length}`
  }
  devices.value.push(newDevice)
}

function removeDevice() {
  if (devices.value.length > 1) {
    devices.value.pop()
  }
}
</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h1 class="demo-title">ControlBar Component Demo</h1>
      <p class="demo-description">
        Hover over the control bar to see the expanded view with additional controls.
        The design features smooth animations, cohesive styling, and intuitive grouping.
      </p>
    </div>

    <!-- Demo Control Bar -->
    <div class="demo-section">
      <h2 class="section-title">Interactive Control Bar</h2>
      <div class="control-demo">
        <ControlBar
          :layout-power-state="layoutPowerState"
          :devices="devices"
          :layouts="layouts"
          @track-power-toggle="handleTrackPowerToggle"
          @layout-power-toggle="handleLayoutPowerToggle"
          @emergency-stop="handleEmergencyStop"
          @device-select="handleDeviceSelect"
          @layout-select="handleLayoutSelect"
        />
      </div>
    </div>

    <!-- Demo Controls -->
    <div class="demo-section">
      <h2 class="section-title">Demo Controls</h2>
      <div class="demo-controls">
        <v-btn
          @click="toggleDeviceConnection"
          color="primary"
          variant="outlined"
        >
          Toggle Bluetooth Device
        </v-btn>
        
        <v-btn
          @click="addDevice"
          color="success"
          variant="outlined"
        >
          Add Device
        </v-btn>
        
        <v-btn
          @click="removeDevice"
          color="error"
          variant="outlined"
          :disabled="devices.length <= 1"
        >
          Remove Device
        </v-btn>
      </div>
    </div>

    <!-- Feature Highlights -->
    <div class="demo-section">
      <h2 class="section-title">Key Features</h2>
      <div class="features-grid">
        <div class="feature-card">
          <v-icon class="feature-icon" color="primary">mdi-gesture-tap-hold</v-icon>
          <h3 class="feature-title">Hover to Expand</h3>
          <p class="feature-description">
            Dropdown panel appears below showing devices and layouts when hovering
          </p>
        </div>
        
        <div class="feature-card">
          <v-icon class="feature-icon" color="success">mdi-animation</v-icon>
          <h3 class="feature-title">Smooth Animations</h3>
          <p class="feature-description">
            Subtle transitions and hover effects enhance the user experience
          </p>
        </div>
        
        <div class="feature-card">
          <v-icon class="feature-icon" color="info">mdi-view-dashboard</v-icon>
          <h3 class="feature-title">Cohesive Design</h3>
          <p class="feature-description">
            Status indicators and controls are visually grouped and consistent
          </p>
        </div>
        
        <div class="feature-card">
          <v-icon class="feature-icon" color="warning">mdi-responsive</v-icon>
          <h3 class="feature-title">Responsive</h3>
          <p class="feature-description">
            Adapts to different screen sizes while maintaining functionality
          </p>
        </div>
      </div>
    </div>

    <!-- State Display -->
    <div class="demo-section">
      <h2 class="section-title">Current State</h2>
      <div class="state-display">
        <div class="state-item">
          <strong>Layout Power:</strong> 
          <v-chip 
            :color="layoutPowerState ? 'success' : 'error'" 
            size="small"
          >
            {{ layoutPowerState ? 'ON' : 'OFF' }}
          </v-chip>
        </div>
        
        <div class="state-item">
          <strong>Connected Devices:</strong> 
          <v-chip 
            :color="devices.filter(d => d.isConnected).length === devices.length ? 'success' : 'warning'" 
            size="small"
          >
            {{ devices.filter(d => d.isConnected).length }} / {{ devices.length }}
          </v-chip>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  @apply max-w-6xl mx-auto p-8;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  min-height: 100vh;
  color: white;
}

.demo-header {
  @apply text-center mb-12;
}

.demo-title {
  @apply text-4xl font-bold mb-4;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.demo-description {
  @apply text-lg text-gray-300 max-w-2xl mx-auto;
}

.demo-section {
  @apply mb-12;
}

.section-title {
  @apply text-2xl font-semibold mb-6 text-gray-100;
}

.control-demo {
  @apply flex justify-center p-8;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.demo-controls {
  @apply flex gap-4 justify-center flex-wrap;
}

.features-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}

.feature-card {
  @apply p-6 rounded-lg text-center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.feature-icon {
  @apply text-4xl mb-4;
}

.feature-title {
  @apply text-lg font-semibold mb-2 text-gray-100;
}

.feature-description {
  @apply text-sm text-gray-300;
}

.state-display {
  @apply flex gap-6 justify-center flex-wrap;
}

.state-item {
  @apply flex items-center gap-2 p-4 rounded-lg;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Dark theme adjustments */
:deep(.v-btn) {
  color: white;
}

:deep(.v-chip) {
  color: white;
}
</style>