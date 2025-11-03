<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { useDisplay } from 'vuetify'
import { useCurrentUser } from 'vuefire'
import { useRouter } from 'vue-router'
import Logo from './Logo.vue'
import UserProfile from './UserProfile.vue'
import TrackPower from './TrackPower.vue'
import Power from './Power.vue'
import EmergencyStop from './EmergencyStop.vue'
import BackgroundDecor from './BackgroundDecor.vue'
import { useLayout } from '@repo/modules'
import { useDcc } from '@repo/dccex'
import { useEfx, type Effect } from '@repo/modules'


const emit = defineEmits<{
  drawerToggle: [newState: boolean]
}>()

const props = defineProps<{
  appName?: string
  appIcon?: string
  drawer?: boolean
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

const { runEffect, getEffectsByType } = useEfx()
const { sendDccCommand } = useDcc()
const { getLayouts, getDevices } = useLayout()
const layoutId = useStorage('@DEJA/layoutId', '')
const user = useCurrentUser()
const router = useRouter()
const { mdAndUp } = useDisplay()

const layouts = getLayouts(user.value?.email)
const devices = getDevices()

const isLayoutModalOpen = ref(false)
const isDeviceModalOpen = ref(false)


// Event handlers
async function handleTrackPowerToggle(newState: boolean) {
  const DEFAULT_ON = '1 MAIN'
  const DEFAULT_OFF = '0'
  await sendDccCommand({ action: 'dcc', payload: newState ? DEFAULT_ON : DEFAULT_OFF })
}

function handleLayoutPowerToggle(newState: boolean) {
  const powerEfx = getEffectsByType('power')
  if (powerEfx && Array.isArray(powerEfx)) {
    powerEfx.forEach((efx: any) => {
      runEffect({...efx, state: newState })
    })
  }
}

async function handleEmergencyStop() {
  await sendDccCommand({ action: 'dcc', payload: '!' })
}

function handleDeviceSelect(deviceId: string) {
  emit('deviceSelect', deviceId)
}

function handleLayoutSelect(selectedLayoutId: string) {
  emit('layoutSelect', selectedLayoutId)
  layoutId.value = selectedLayoutId
  router.push({ name: 'home' })
  isLayoutModalOpen.value = false
}

function handleLogoClick() {
  router.push({ path: '/' })
}

function openLayoutModal() {
  isLayoutModalOpen.value = true
}

function openDeviceModal() {
  isDeviceModalOpen.value = true
}

function handleDrawerToggle() {
  emit('drawerToggle', !(props.drawer ?? false))
}

const allConnected = computed(() => devices.value.every(device => device.isConnected))
const hasDevices = computed(() => devices.value.length > 0)
const connectedDevicesCount = computed(() => devices.value.filter(d => d.isConnected).length)
const dccexConnected = computed(() => {
  const dccexDevice = devices.value.find(device => device.type === 'dcc-ex')
  return dccexDevice?.isConnected ?? false
})

const currentLayout = computed(() => {
  console.log('Current layoutId in AppHeader:', layoutId?.value, user?.value, layouts?.value)
  return layouts?.value ? 
    layouts.value?.find(l => l.id === layoutId.value)
    : { id: layoutId.value, name: layoutId.value }
})

const defaultProps = {
  appName: 'DEJA',
  appIcon: 'mdi-train',
  variant: 'default' as const,
  color: 'primary',
  showLayoutPower: true,
  showEmergencyStop: true,
  showUserProfile: true,
  showDeviceStatus: true,
  showDeviceStatusLabel: true,
  deviceStatusCompact: false,
  dark: true,
  layoutPowerState: false,
}
</script>

<template>
  <v-app-bar
    class="header-gradient relative overflow-hidden flex flex-col"
    :dark="dark !== undefined ? dark : defaultProps.dark">
    <BackgroundDecor variant="blurred-bubbles-1" />
    <template v-slot:prepend>
      <v-app-bar-nav-icon variant="text" @click.stop="handleDrawerToggle" class="!h-10 !w-10 ml-4"></v-app-bar-nav-icon>
    </template>
    <template v-slot:title>
      <Logo 
        :app-name="appName || defaultProps.appName"
        :app-icon="appIcon || defaultProps.appIcon"
        :app-color="color || defaultProps.color"
        :variant="variant || defaultProps.variant"
        @click="handleLogoClick"
      />
    </template>
    <template v-slot:append>
      <!-- User Profile - always on the far right --> 
      <template v-if="mdAndUp">
        <v-chip size="small" class="ma-1 status-chip clickable-chip" prepend-icon="mdi-home" :color="layoutId ? 'success' : 'error'"
          variant="elevated" @click="openLayoutModal">
          <template #append>
            <span v-if="layoutId" class="status-dot success-dot"></span>
            <span v-else class="status-dot error-dot"></span>
          </template>
          <span class="font-medium">{{ currentLayout?.name || 'No Layout' }}</span>
        </v-chip>
        <v-chip v-if="showDeviceStatus && hasDevices" size="small" class="ma-1 status-chip clickable-chip" prepend-icon="mdi-devices"
          :color="allConnected ? 'success' : 'warning'" variant="elevated" @click="openDeviceModal">
          <template #append>
            <span v-if="allConnected" class="status-dot success-dot"></span>
            <span v-else class="status-dot warning-dot"></span>
          </template>
          <span v-if="showDeviceStatusLabel" class="font-medium">
            {{ connectedDevicesCount }}/{{ devices.length }}
          </span>
        </v-chip>
        <v-spacer class="ma-2"></v-spacer>
      </template>
      <UserProfile v-if="showUserProfile !== false && user" />
      <TrackPower class="ma-1" :power-state="layoutPowerState" :is-connected="dccexConnected" @toggle="handleTrackPowerToggle" />
      <Power class="ma-1" v-if="showLayoutPower" :power-state="layoutPowerState" @toggle="handleLayoutPowerToggle" />
      <EmergencyStop class="ma-1" v-if="showEmergencyStop" @stop="handleEmergencyStop" />
    </template>
  </v-app-bar>
  <!-- <v-app-bar class="header-gradient2 elative overflow-hidden"
    :dark="dark !== undefined ? dark : defaultProps.dark">
    <BackgroundDecor variant="blurred-bubbles-1" />
    <template v-slot:prepend>
      
    </template>
    <template v-slot:append>

    </template>
  </v-app-bar> -->

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
              class="p-4 rounded-lg border cursor-pointer transition-all hover:bg-gray-800"
              :class="{ 'border-green-500 bg-green-800': layout.id === layoutId, 'border-gray-200 bg-gray-900': layout.id !== layoutId }"
              @click="handleLayoutSelect(layout.id)">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <v-icon :color="layout.id === layoutId ? 'green' : 'grey'">mdi-home</v-icon>
                  <div>
                    <h4 class="font-medium">{{ layout.name }}</h4>
                    <p v-if="layout.description" class="text-sm text-gray-600">{{ layout.description }}</p>
                  </div>
                </div>
                <v-icon v-if="layout.id === layoutId" color="green">mdi-check-circle</v-icon>
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
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(20px);
}
.header-gradient2 {
  background: rgba(15, 23, 42, 0.25);
  backdrop-filter: blur(20px);
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
