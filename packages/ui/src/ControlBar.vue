<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import TrackPower from './TrackPower.vue'
import Power from './Power.vue'
import EmergencyStop from './EmergencyStop.vue'

interface Device {
  id: string
  type: string
  isConnected: boolean
  connection?: string
  port?: string
  topic?: string
}

interface Layout {
  id: string
  name: string
  description?: string
  isActive?: boolean
}

interface Props {
  showLayoutPower?: boolean
  showEmergencyStop?: boolean
  showDeviceStatus?: boolean
  showDeviceStatusLabel?: boolean
  deviceStatusCompact?: boolean
  layoutPowerState?: boolean
  devices?: Device[]
  layouts?: Layout[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLayoutPower: true,
  showEmergencyStop: true,
  showDeviceStatus: true,
  showDeviceStatusLabel: true,
  deviceStatusCompact: false,
  layoutPowerState: false,
  devices: () => [],
  layouts: () => [],
  loading: false
})

const emit = defineEmits<{
  trackPowerToggle: [newState: boolean]
  layoutPowerToggle: [newState: boolean]
  emergencyStop: []
  deviceSelect: [deviceId: string]
  layoutSelect: [layoutId: string]
}>()

const layoutId = useStorage('@DEJA/layoutId', '')
const isLayoutModalOpen = ref(false)
const isDeviceModalOpen = ref(false)

// Event handlers
function handleTrackPowerToggle(newState: boolean) {
  emit('trackPowerToggle', newState)
}

function handleLayoutPowerToggle(newState: boolean) {
  emit('layoutPowerToggle', newState)
}

function handleEmergencyStop() {
  emit('emergencyStop')
}

function handleDeviceSelect(deviceId: string) {
  emit('deviceSelect', deviceId)
}

function handleLayoutSelect(newLayoutId: string) {
  layoutId.value = newLayoutId
  emit('layoutSelect', newLayoutId)
  isLayoutModalOpen.value = false
  // Refresh the page when a new layout is selected
  window.location.reload()
}

function openLayoutModal() {
  isLayoutModalOpen.value = true
}

function openDeviceModal() {
  isDeviceModalOpen.value = true
}

const allConnected = computed(() => props.devices.every(device => device.isConnected))
const hasDevices = computed(() => props.devices.length > 0)
const connectedDevicesCount = computed(() => props.devices.filter(d => d.isConnected).length)
const dccexConnected = computed(() => {
  const dccexDevice = props.devices.find(device => device.type === 'dcc-ex')
  return dccexDevice?.isConnected ?? false
})

const currentLayout = computed(() => {
  return props.layouts.find(l => l.id === layoutId.value) || { id: layoutId.value, name: layoutId.value }
})

</script>

<template>
  <div class="control-bar-container">
    <div class="control-bar">
      <!-- Status Indicators Section -->
      <div class="status-section">
        <template v-if="loading">
          <!-- Layout Status Skeleton -->
          <div class="skeleton-chip">
            <div class="skeleton-icon"></div>
            <div class="skeleton-text skeleton-text-medium"></div>
            <div class="skeleton-dot"></div>
          </div>

          <!-- Device Status Skeleton -->
          <div v-if="showDeviceStatus" class="skeleton-chip">
            <div class="skeleton-icon"></div>
            <div v-if="showDeviceStatusLabel" class="skeleton-text skeleton-text-small"></div>
            <div class="skeleton-dot"></div>
          </div>
        </template>

        <template v-else>
          <!-- Layout Status -->
          <v-chip size="small" class="status-chip clickable-chip" prepend-icon="mdi-home" :color="layoutId ? 'success' : 'error'"
            variant="elevated" @click="openLayoutModal">
            <template #append>
              <span v-if="layoutId" class="status-dot success-dot"></span>
              <span v-else class="status-dot error-dot"></span>
            </template>
            <span class="font-medium">{{ currentLayout.name || 'No Layout' }}</span>
          </v-chip>

          <!-- Device Status -->
          <v-chip v-if="showDeviceStatus && hasDevices" size="small" class="status-chip clickable-chip" prepend-icon="mdi-devices"
            :color="allConnected ? 'success' : 'warning'" variant="elevated" @click="openDeviceModal">
            <template #append>
              <span v-if="allConnected" class="status-dot success-dot"></span>
              <span v-else class="status-dot warning-dot"></span>
            </template>
            <span v-if="showDeviceStatusLabel" class="font-medium">
              {{ connectedDevicesCount }}/{{ devices.length }}
            </span>
          </v-chip>
        </template>
      </div>

      <!-- Divider -->
      <div class="divider"></div>

      <!-- Power Controls Section -->
      <div class="power-section">
        <template v-if="loading">
          <!-- Track Power Skeleton -->
          <div class="skeleton-button">
            <div class="skeleton-icon"></div>
            <div class="skeleton-badge"></div>
          </div>

          <!-- Layout Power Skeleton -->
          <div v-if="showLayoutPower" class="skeleton-button">
            <div class="skeleton-icon"></div>
          </div>

          <!-- Emergency Stop Skeleton -->
          <div v-if="showEmergencyStop" class="skeleton-button skeleton-button-emergency">
            <div class="skeleton-icon"></div>
          </div>
        </template>

        <template v-else>
          <TrackPower :power-state="layoutPowerState" :is-connected="dccexConnected" @toggle="handleTrackPowerToggle" />

          <Power v-if="showLayoutPower" :power-state="layoutPowerState" @toggle="handleLayoutPowerToggle" />

          <EmergencyStop v-if="showEmergencyStop" @stop="handleEmergencyStop" />
        </template>
      </div>

    </div>

    <!-- Layout Selection Modal -->
    <v-dialog v-model="isLayoutModalOpen" max-width="600px">
      <v-card>
        <v-card-title class="flex items-center gap-2">
          <v-icon>mdi-home</v-icon>
          Select Layout
        </v-card-title>
        <v-card-text>
          <div v-if="layouts.length > 0" class="space-y-3">
            <div v-for="layout in layouts" :key="layout.id" 
              class="p-4 rounded-lg border cursor-pointer transition-all hover:bg-gray-50"
              :class="{ 'border-green-500 bg-green-50': layout.id === layoutId, 'border-gray-200': layout.id !== layoutId }"
              @click="handleLayoutSelect(layout.id)">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <v-icon :color="layout.id === layoutId ? 'success' : 'grey'">mdi-home</v-icon>
                  <div>
                    <h4 class="font-medium">{{ layout.name }}</h4>
                    <p v-if="layout.description" class="text-sm text-gray-600">{{ layout.description }}</p>
                  </div>
                </div>
                <v-icon v-if="layout.id === layoutId" color="success">mdi-check-circle</v-icon>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <v-icon size="48" color="grey">mdi-home-outline</v-icon>
            <h3 class="text-lg font-medium text-gray-900 mt-2">No Layouts Available</h3>
            <p class="text-gray-600">There are currently no layouts configured.</p>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="isLayoutModalOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Device Selection Modal -->
    <v-dialog v-model="isDeviceModalOpen" max-width="600px">
      <v-card>
        <v-card-title class="flex items-center gap-2">
          <v-icon>mdi-devices</v-icon>
          Device Status
        </v-card-title>
        <v-card-text>
          <div v-if="hasDevices" class="space-y-3">
            <div v-for="device in devices" :key="device.id" 
              class="p-4 rounded-lg border cursor-pointer transition-all hover:bg-gray-50"
              :class="{ 'border-green-500 bg-green-50': device.isConnected, 'border-red-500 bg-red-50': !device.isConnected }"
              @click="handleDeviceSelect(device.id)">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <v-icon :color="device.isConnected ? 'success' : 'error'">
                    {{ device.type === 'dcc-ex' ? 'mdi-memory' : device.type === 'wifi' ? 'mdi-wifi' : 'mdi-bluetooth' }}
                  </v-icon>
                  <div>
                    <h4 class="font-medium">{{ device.id }}</h4>
                    <div class="flex gap-2 text-sm text-gray-600">
                      <span>{{ device.connection }}</span>
                      <span v-if="device.port">{{ device.port }}</span>
                      <span v-if="device.topic">{{ device.topic }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="status-dot" :class="device.isConnected ? 'success-dot' : 'error-dot'"></span>
                  <span class="text-sm font-medium" :class="device.isConnected ? 'text-green-600' : 'text-red-600'">
                    {{ device.isConnected ? 'Connected' : 'Disconnected' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <v-icon size="48" color="grey">mdi-devices-outline</v-icon>
            <h3 class="text-lg font-medium text-gray-900 mt-2">No Devices Available</h3>
            <p class="text-gray-600">There are currently no devices configured.</p>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="isDeviceModalOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.control-bar-container {
  @apply relative;
  margin: 0 8px;
}

.control-bar {
  @apply flex items-center relative;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 6px 12px;
  gap: 8px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}


.status-section,
.power-section {
  @apply flex items-center;
  gap: 6px;
}

.divider {
  width: 1px;
  height: 24px;
  background: linear-gradient(to bottom,
      transparent,
      rgba(255, 255, 255, 0.2) 20%,
      rgba(255, 255, 255, 0.2) 80%,
      transparent);
  margin: 0 4px;
}


/* Status chips styling */
.status-chip {
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
}

.status-chip:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.12) !important;
  border-color: rgba(255, 255, 255, 0.25);
}

.clickable-chip {
  cursor: pointer;
}

.clickable-chip:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.12) !important;
  border-color: rgba(255, 255, 255, 0.25);
}

.status-dot {
  @apply relative flex h-3 w-3 ml-2;
}

.success-dot {
  @apply bg-green-400 rounded-full;
  animation: pulse-success 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.error-dot {
  @apply bg-red-400 rounded-full;
  animation: pulse-error 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.warning-dot {
  @apply bg-yellow-400 rounded-full;
  animation: pulse-warning 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-success {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }

  70% {
    box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
  }
}

@keyframes pulse-error {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }

  70% {
    box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
  }
}

@keyframes pulse-warning {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7);
  }

  70% {
    box-shadow: 0 0 0 6px rgba(251, 191, 36, 0);
  }
}


/* Enhanced button styling within the control bar */
:deep(.v-btn) {
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

:deep(.v-btn:hover) {
  transform: translateY(-1px) scale(1.05);
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

:deep(.v-btn:active) {
  transform: translateY(0) scale(0.98);
  transition-duration: 0.1s;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  :root {
    --layout-top: 60px;
  }
  
  .control-bar {
    padding: 4px 8px;
    gap: 6px;
  }

  .status-section,
  .power-section {
    gap: 4px;
  }
}

/* Focus states for accessibility */
.control-bar:focus-within {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
}

/* Skeleton Loading Styles */
@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.4;
  }

  50% {
    opacity: 0.8;
  }
}

.skeleton-chip {
  @apply flex items-center relative;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 4px 12px;
  gap: 8px;
  height: 32px;
  animation: skeleton-pulse 2s ease-in-out infinite;
}

.skeleton-button {
  @apply relative flex items-center justify-center;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: skeleton-pulse 2s ease-in-out infinite;
}

.skeleton-button-emergency {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
}

.skeleton-icon {
  @apply rounded-full;
  background: rgba(255, 255, 255, 0.2);
  width: 16px;
  height: 16px;
  animation: skeleton-pulse 2s ease-in-out infinite;
}

.skeleton-text {
  @apply rounded;
  background: rgba(255, 255, 255, 0.2);
  height: 14px;
  animation: skeleton-pulse 2s ease-in-out infinite;
}

.skeleton-text-small {
  width: 24px;
}

.skeleton-text-medium {
  width: 60px;
}

.skeleton-dot {
  @apply rounded-full;
  background: rgba(255, 255, 255, 0.2);
  width: 12px;
  height: 12px;
  animation: skeleton-pulse 2s ease-in-out infinite;
}

.skeleton-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  animation: skeleton-pulse 2s ease-in-out infinite;
}



</style>
