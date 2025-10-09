<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { useCurrentUser } from 'vuefire'
import Logo from './Logo.vue'
import UserProfile from './UserProfile.vue'
import TrackPower from './TrackPower.vue'
import Power from './Power.vue'
import EmergencyStop from './EmergencyStop.vue'
import BackgroundDecor from './BackgroundDecor.vue'
import { useLayout } from '@repo/modules'

defineProps<{
  appName?: string
  appIcon?: string
  variant?: 'default' | 'cloud' | 'throttle' | 'monitor'
  showLayoutPower?: boolean
  showEmergencyStop?: boolean
  showUserProfile?: boolean
  showDeviceStatus?: boolean
  showDeviceStatusLabel?: boolean
  deviceStatusCompact?: boolean
  color?: string
  dark?: boolean
  layoutPowerState?: boolean
}>()

const { getLayouts, getDevices } = useLayout()
const layouts = getLayouts()
const devices = getDevices()

const emit = defineEmits<{
  trackPowerToggle: [newState: boolean]
  layoutPowerToggle: [newState: boolean]
  emergencyStop: []
  deviceSelect: [deviceId: string]
  layoutSelect: [layoutId: string]
  logoClick: []
}>()

const layoutId = useStorage('@DEJA/layoutId', '')
const user = useCurrentUser()
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

function handleLayoutSelect(layoutId: string) {
  emit('layoutSelect', layoutId)
}

function handleLogoClick() {
  emit('logoClick')
}

function openLayoutModal() {
  isLayoutModalOpen.value = true
}

function openDeviceModal() {
  isDeviceModalOpen.value = true
}

const allConnected = computed(() => devices.value.every(device => device.isConnected))
const hasDevices = computed(() => devices.value.length > 0)
const connectedDevicesCount = computed(() => devices.value.filter(d => d.isConnected).length)
const dccexConnected = computed(() => {
  const dccexDevice = devices.value.find(device => device.type === 'dcc-ex')
  return dccexDevice?.isConnected ?? false
})

const currentLayout = computed(() => {
  return layouts?.value.find(l => l.id === layoutId.value) || { id: layoutId.value, name: layoutId.value }
})

const defaultProps = {
  appName: 'DEJA',
  appIcon: 'mdi-train',
  variant: 'default' as const,
  showLayoutPower: true,
  showEmergencyStop: true,
  showUserProfile: true,
  showDeviceStatus: true,
  showDeviceStatusLabel: true,
  deviceStatusCompact: false,
  color: 'surface',
  dark: true,
  layoutPowerState: false,
}
</script>

<template>
  <v-app-bar 
    class="px-2 relative overflow-hidden header-gradient"
    :color="color || defaultProps.color" 
    :dark="dark !== undefined ? dark : defaultProps.dark">
    <BackgroundDecor variant="blurred-bubbles-1" />
    <template v-slot:title>
      <Logo 
        :app-name="appName || defaultProps.appName"
        :app-icon="appIcon || defaultProps.appIcon"
        :variant="variant || defaultProps.variant"
        @click="handleLogoClick"
      />
    </template>
    <template v-slot:append>
        <!-- User Profile - always on the far right -->
        <UserProfile v-if="showUserProfile !== false && user" />
    </template>
  </v-app-bar>
  <v-app-bar class="px-2 relative overflow-hidden">
    <template v-slot:prepend>
      <v-row>
        <v-col>
          <v-chip size="small" class="status-chip clickable-chip" prepend-icon="mdi-home" :color="layoutId ? 'success' : 'error'"
            variant="elevated" @click="openLayoutModal">
            <template #append>
              <span v-if="layoutId" class="status-dot success-dot"></span>
              <span v-else class="status-dot error-dot"></span>
            </template>
            <span class="font-medium">{{ currentLayout.name || 'No Layout' }}</span>
          </v-chip>
          </v-col> 
          <v-col>
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
        </v-col>
      </v-row>
    </template>
    <template v-slot:append>
      <v-row>
        <v-col>
          <TrackPower :power-state="layoutPowerState" :is-connected="dccexConnected" @toggle="handleTrackPowerToggle" />
        </v-col>
        <v-col>
          <Power v-if="showLayoutPower" :power-state="layoutPowerState" @toggle="handleLayoutPowerToggle" />
        </v-col>
        <v-col>
          <EmergencyStop v-if="showEmergencyStop" @stop="handleEmergencyStop" />
        </v-col>
      </v-row>

    </template>
  </v-app-bar>

    <!-- Layout Selection Modal -->
    <v-dialog v-model="isLayoutModalOpen" max-width="600px">
      <v-card>
        <v-card-title class="flex items-center gap-2">
          <v-icon>mdi-home</v-icon>
          Select Layout
        </v-card-title>
        <v-card-text>
          <div v-if="layouts && layouts.length > 0" class="space-y-3">
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
                    {{ device.type === 'dcc-ex' || device.connection === 'usb' ? 'mdi-memory' : device.connection === 'wifi' ? 'mdi-wifi' : 'mdi-bluetooth' }}
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
</template>

<style scoped>
.header-gradient {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Ensure proper contrast for all elements */
:deep(.v-btn) {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.v-chip) {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Consistent spacing and sizing */
:deep(.v-btn) {
  min-width: 40px;
  height: 40px;
}

:deep(.v-chip) {
  min-height: 32px;
}

/* Subtle hover effects */
:deep(.v-btn:hover) {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

:deep(.v-chip:hover) {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

/* Ensure consistent gap between elements */
.header-controls {
  gap: 8px;
}

/* Ensure text has proper contrast */
:deep(.v-list-item-title) {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
</style>
