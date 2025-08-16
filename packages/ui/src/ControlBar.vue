<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
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
const isHovered = ref(false)
const isPanelOpen = ref(false)
const controlBarRef = ref<HTMLElement>()
const panelPosition = ref({ top: 0, left: 0, width: 0 })

// Auto-open panel on hover with delay
let hoverTimeout: number | null = null

// Update panel position when it opens
function updatePanelPosition() {
  if (controlBarRef.value) {
    const rect = controlBarRef.value.getBoundingClientRect()
    panelPosition.value = {
      top: rect.bottom,
      left: rect.left,
      width: rect.width
    }
  }
}

function handleMouseEnter() {
  isHovered.value = true
  if (hoverTimeout) clearTimeout(hoverTimeout)
  hoverTimeout = setTimeout(async () => {
    if (isHovered.value) {
      updatePanelPosition()
      isPanelOpen.value = true
    }
  }, 400)
}

function handleMouseLeave() {
  isHovered.value = false
  if (hoverTimeout) clearTimeout(hoverTimeout)
  setTimeout(() => {
    if (!isHovered.value) {
      isPanelOpen.value = false
    }
  }, 200)
}

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
  isPanelOpen.value = false
  // Refresh the page when a new layout is selected
  window.location.reload()
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

// Handle window resize to update panel position
function handleResize() {
  if (isPanelOpen.value) {
    updatePanelPosition()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleResize)
  if (hoverTimeout) clearTimeout(hoverTimeout)
})
</script>

<template>
  <div class="control-bar-container">
    <div ref="controlBarRef" class="control-bar" :class="{ 'panel-open': isPanelOpen, 'hovered': isHovered }"
      @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
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
          <v-chip size="small" class="status-chip" prepend-icon="mdi-home" :color="layoutId ? 'success' : 'error'"
            variant="elevated">
            <template #append>
              <span v-if="layoutId" class="status-dot success-dot"></span>
              <span v-else class="status-dot error-dot"></span>
            </template>
            <span class="font-medium">{{ currentLayout.name || 'No Layout' }}</span>
          </v-chip>

          <!-- Device Status -->
          <v-chip v-if="showDeviceStatus && hasDevices" size="small" class="status-chip" prepend-icon="mdi-devices"
            :color="allConnected ? 'success' : 'warning'" variant="elevated">
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

      <!-- Hover indicator -->
      <div class="hover-indicator"></div>
    </div>

    <!-- Teleported Dropdown Panel -->
    <Teleport to="body">
      <Transition name="panel">
        <div v-if="isPanelOpen" class="dropdown-panel-overlay" :style="{
          top: `${panelPosition.top}px`,
          left: `${panelPosition.left}px`,
          width: `${Math.max(panelPosition.width, 400)}px`
        }" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
          <div class="panel-content">
            <!-- Layouts Section -->
            <div v-if="layouts.length > 0" class="panel-section">
              <h3 class="section-title">
                <v-icon class="section-icon">mdi-home</v-icon>
                Layouts
              </h3>
              <div class="items-grid">
                <div v-for="layout in layouts" :key="layout.id" class="panel-item"
                  :class="{ 'active': layout.id === layoutId }" @click="handleLayoutSelect(layout.id)">
                  <div class="item-header">
                    <v-icon class="item-icon" :color="layout.id === layoutId ? 'success' : 'grey'">
                      mdi-home
                    </v-icon>
                    <span class="item-name">{{ layout.name }}</span>
                    <v-icon v-if="layout.id === layoutId" class="active-indicator" color="success">
                      mdi-check-circle
                    </v-icon>
                  </div>
                  <p v-if="layout.description" class="item-description">
                    {{ layout.description }}
                  </p>
                </div>
              </div>
            </div>
            <div v-else class="panel-section empty-state">
              <div class="empty-content">
                <div class="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                  </svg>
                </div>
                <h3 class="empty-title">No Layouts Available</h3>
                <p class="empty-description">
                  There are currently no layouts configured.
                </p>
              </div>
            </div>

            <!-- Devices Section -->
            <div v-if="hasDevices" class="panel-section">
              <h3 class="section-title">
                <v-icon class="section-icon">mdi-devices</v-icon>
                Devices
              </h3>
              <div class="items-grid">
                <div v-for="device in devices" :key="device.id" class="panel-item"
                  :class="{ 'connected': device.isConnected, 'disconnected': !device.isConnected }"
                  @click="handleDeviceSelect(device.id)">
                  <div class="item-header">
                    <v-icon class="item-icon" :color="device.isConnected ? 'success' : 'error'">
                      {{ device.type === 'dcc-ex' ? 'mdi-memory' : device.type === 'wifi' ? 'mdi-wifi' : 'mdi-bluetooth' }}
                    </v-icon>
                    <span class="item-name">{{ device.id }}</span>
                    <div class="connection-status">
                      <span class="status-dot" :class="device.isConnected ? 'success-dot' : 'error-dot'"></span>
                    </div>
                  </div>
                  <div class="item-details">
                    <span class="detail-item">{{ device.connection }}</span>
                    <span v-if="device.port" class="detail-item">{{ device.port }}</span>
                    <span v-if="device.topic" class="detail-item">{{ device.topic }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="panel-section">
              <h3 class="section-title">
                <v-icon class="section-icon">mdi-lightning-bolt</v-icon>
                Quick Actions
              </h3>
              <div class="quick-actions">
                <v-btn variant="outlined" size="small" prepend-icon="mdi-refresh" class="quick-action-btn">
                  Refresh
                </v-btn>
                <v-btn variant="outlined" size="small" prepend-icon="mdi-cog" class="quick-action-btn">
                  Settings
                </v-btn>
                <v-btn variant="outlined" size="small" prepend-icon="mdi-information" class="quick-action-btn">
                  System Info
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.control-bar-container {
  @apply relative;
  margin: 8px;
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

.control-bar.hovered {
  transform: translateY(-2px);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.2),
    0 4px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
}

.control-bar.panel-open {
  background: rgba(15, 23, 42, 0.9);
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
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

.hover-indicator {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg,
      transparent,
      rgba(139, 92, 246, 0.6) 20%,
      rgba(59, 130, 246, 0.8) 50%,
      rgba(139, 92, 246, 0.6) 80%,
      transparent);
  border-radius: 1px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.control-bar.hovered .hover-indicator {
  transform: translateX(-50%) scaleX(1);
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

/* Teleported Dropdown Panel */
.dropdown-panel-overlay {
  position: fixed;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0 0 16px 16px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.2);
  max-height: 400px;
  overflow-y: auto;
  min-width: 400px;
}

.panel-content {
  @apply p-4;
}

.panel-section {
  @apply mb-6 last:mb-0;
}

.section-title {
  @apply flex items-center text-sm font-semibold text-gray-200 mb-3;
  gap: 8px;
}

.section-icon {
  @apply text-base;
}

.items-grid {
  @apply grid gap-2;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.panel-item {
  @apply p-3 rounded-lg cursor-pointer transition-all duration-200;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.panel-item.active {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

.panel-item.connected {
  border-left: 3px solid #22c55e;
}

.panel-item.disconnected {
  border-left: 3px solid #ef4444;
}

.item-header {
  @apply flex items-center justify-between mb-1;
}

.item-icon {
  @apply text-lg mr-2;
}

.item-name {
  @apply font-medium text-white flex-1;
}

.active-indicator {
  @apply text-sm;
}

.connection-status {
  @apply flex items-center;
}

.item-description {
  @apply text-xs text-gray-400 mt-1;
}

.item-details {
  @apply flex flex-wrap gap-2 mt-2;
}

.detail-item {
  @apply text-xs px-2 py-1 rounded bg-gray-700 text-gray-300;
}

.quick-actions {
  @apply flex gap-2 flex-wrap;
}

.quick-action-btn {
  @apply text-xs;
  min-width: auto;
}

/* Panel transitions */
.panel-enter-active,
.panel-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.panel-leave-to {
  opacity: 0;
  transform: translateY(-10px);
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
  .control-bar {
    padding: 4px 8px;
    gap: 6px;
  }

  .status-section,
  .power-section {
    gap: 4px;
  }

  .items-grid {
    grid-template-columns: 1fr;
  }

  .dropdown-panel-overlay {
    max-height: 300px;
    min-width: 300px;
  }
}

/* Focus states for accessibility */
.control-bar:focus-within {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
}

.panel-item:focus-visible {
  outline: 2px solid rgba(59, 130, 246, 0.8);
  outline-offset: 2px;
}

/* Scrollbar styling for the panel */
.dropdown-panel-overlay::-webkit-scrollbar {
  width: 6px;
}

.dropdown-panel-overlay::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.dropdown-panel-overlay::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.dropdown-panel-overlay::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
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

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
}

.empty-content {
  text-align: center;
  max-width: 300px;
}

.empty-icon {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}


</style>
