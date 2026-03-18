<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStorage } from '@vueuse/core'
import { useDisplay } from 'vuetify'
import { useCurrentUser } from 'vuefire'
import { useRouter } from 'vue-router'
import Logo from './Logo.vue'
import UserProfile from './UserProfile.vue'
import TrackPower from './TrackPower.vue'
import Power from './Power.vue'
import EmergencyStop from './EmergencyStop.vue'
import SelectLayout from './SelectLayout.vue'
import { useLayout, useServerStatus } from '@repo/modules'
import { useDcc } from '@repo/dccex'
import { createLogger } from '@repo/utils'
import { WI_THROTTLE_EVENTS } from './constants/wiThrottleEvents'

const log = createLogger('AppHeader')
// import { useEfx, type Effect } from '@repo/modules'


const emit = defineEmits<{
  drawerToggle: [newState: boolean]
}>()

const props = defineProps<{
  appName?: string
  appIcon?: string
  drawer?: boolean
  variant?: 'default' | 'cloud' | 'throttle' | 'monitor' | 'tour'
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

// const { runEffect, getEffectsByType } = useEfx()
const { sendDccCommand } = useDcc()
const { getLayouts, getDevices } = useLayout()
const layoutId = useStorage('@DEJA/layoutId', '')
const user = useCurrentUser()
const router = useRouter()
const { mdAndUp } = useDisplay()

const { serverStatus } = useServerStatus()

const layouts = getLayouts(user.value?.email)
const devices = getDevices()

const isLayoutModalOpen = ref(false)
const isDeviceModalOpen = ref(false)
const wiThrottlePower = ref<0 | 1 | 2>(2) // 0=off, 1=on, 2=unknown
const wiThrottleConnected = ref(false)


// Event handlers
async function handleTrackPowerToggle(newState: boolean) {
  if (wiThrottleConnected.value) {
    // WiThrottle power command: PPA1 for on, PPA0 for off
    window.dispatchEvent(new CustomEvent(WI_THROTTLE_EVENTS.SEND, { detail: `PPA${newState ? '1' : '0'}` }))
    return
  }
  const DEFAULT_ON = '1 MAIN'
  const DEFAULT_OFF = '0'
  await sendDccCommand({ action: 'dcc', payload: newState ? DEFAULT_ON : DEFAULT_OFF })
}

function handleLayoutPowerToggle(newState: boolean) {
  // const powerEfx = getEffectsByType('power')
  // if (powerEfx && Array.isArray(powerEfx)) {
  //   powerEfx.forEach((efx: any) => {
  //     runEffect({...efx, state: newState })
  //   })
  // }
}

async function handleEmergencyStop() {
  if (wiThrottleConnected.value) {
    window.dispatchEvent(new CustomEvent(WI_THROTTLE_EVENTS.ESTOP))
    return
  }
  await sendDccCommand({ action: 'dcc', payload: '!' })
}

function handleDeviceSelect(deviceId: string) {
  log.debug('Device selected:', deviceId)
  // Handle device selection if needed
}

function handleLayoutSelect(selectedLayoutId: string) {
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

function handleWiThrottlePowerState(event: Event) {
  const { state } = (event as CustomEvent<{ state: 0 | 1 | 2 }>).detail
  wiThrottlePower.value = state
}

function handleWiThrottleConnectionState(event: Event) {
  wiThrottleConnected.value = (event as CustomEvent<{ connected: boolean }>).detail.connected
}

onMounted(() => {
  window.addEventListener(WI_THROTTLE_EVENTS.POWER_STATE, handleWiThrottlePowerState)
  window.addEventListener(WI_THROTTLE_EVENTS.CONNECTION_STATE, handleWiThrottleConnectionState)
})

onUnmounted(() => {
  window.removeEventListener(WI_THROTTLE_EVENTS.POWER_STATE, handleWiThrottlePowerState)
  window.removeEventListener(WI_THROTTLE_EVENTS.CONNECTION_STATE, handleWiThrottleConnectionState)
})

function handleDrawerToggle() {
  emit('drawerToggle', !(props.drawer ?? false))
}

const allConnected = computed(() => devices.value.every(device => device.isConnected))
const hasDevices = computed(() => devices.value.length > 0)
const connectedDevicesCount = computed(() => devices.value.filter(d => d.isConnected).length)
const dccexConnected = computed(() => {
  if (wiThrottleConnected.value) return true
  const dccexDevice = devices.value.find(device => device.type === 'dcc-ex')
  return dccexDevice?.isConnected ?? false
})

const currentLayout = computed(() => {
  log.debug('Current layoutId in AppHeader:', layoutId?.value, user?.value, layouts?.value)
  return layouts?.value ?
    layouts.value?.find(l => l.id === layoutId.value)
    : { id: layoutId.value, name: layoutId.value }
})

const effectiveTrackPower = computed<boolean>(() => {
  if (wiThrottleConnected.value) {
    return wiThrottlePower.value === 1
  }
  return props.layoutPowerState ?? false
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
        :size="mdAndUp ? 'md' : 'sm'"
        :app-title="appName || defaultProps.appName"
        :variant="variant || defaultProps.variant"
        @click="handleLogoClick"
        class="cursor-pointer"
      />
    </template>
    <slot></slot>
    <template v-slot:append>
      <!-- User Profile - always on the far right --> 
      <template v-if="mdAndUp">
        <v-chip v-if="user" size="small" class="ma-1 status-chip clickable-chip" prepend-icon="mdi-home" :color="layoutId ? 'success' : 'error'"
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
        
        <v-chip v-if="user" size="small" class="ma-1 status-chip clickable-chip" prepend-icon="mdi-server-network"
          :color="serverStatus?.online ? 'success' : 'error'" variant="elevated"
          @click="router.push({ name: 'Devices' })">
          <template #append>
            <span v-if="serverStatus?.online" class="status-dot success-dot"></span>
            <span v-else class="status-dot error-dot"></span>
          </template>
          <span class="font-medium hidden sm:inline-block">Server</span>
        </v-chip>

        <v-spacer class="ma-2"></v-spacer>
      </template>
      <UserProfile v-if="showUserProfile !== false && user" class="mx-2" />
      <template v-if="layoutId && user">
        <TrackPower class="ma-1" :power-state="effectiveTrackPower" :is-connected="dccexConnected" @toggle="handleTrackPowerToggle" />
        <Power class="ma-1" v-if="showLayoutPower" :power-state="layoutPowerState" @toggle="handleLayoutPowerToggle" />
        <EmergencyStop class="ma-1" v-if="showEmergencyStop" @stop="handleEmergencyStop" />
      </template>
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
          <SelectLayout @select="isLayoutModalOpen = false" />
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
                    <h4 class="font-medium text-white">{{ device.id }}</h4>
                    <div class="flex gap-2 text-sm text-gray-400">
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
            <h3 class="text-lg font-medium text-white mt-2">No Devices Available</h3>
            <p class="text-gray-400">There are currently no devices configured.</p>
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
  background: rgba(11, 17, 32, 0.6);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
}
.header-gradient2 {
  background: rgba(11, 17, 32, 0.3);
  backdrop-filter: blur(24px);
}

/* Premium translucent elements */
:deep(.v-btn) {
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-chip) {
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Consistent spacing and sizing */
:deep(.v-btn) {
  min-width: 40px;
  height: 40px;
}

:deep(.v-chip) {
  min-height: 32px;
}

/* Glowing hover effects */
:deep(.v-btn:hover) {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 229, 255, 0.2);
  border-color: rgba(0, 229, 255, 0.3);
}

:deep(.v-chip:hover) {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(213, 0, 249, 0.2);
  border-color: rgba(213, 0, 249, 0.3);
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
