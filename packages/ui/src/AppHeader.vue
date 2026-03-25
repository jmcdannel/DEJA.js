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
import ConnectionStatus from './ConnectionStatus.vue'
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

const email = computed(() => user.value?.email ?? null)
const layouts = getLayouts(email)
const devices = getDevices()

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

function handleLogoClick() {
  router.push({ path: '/' })
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
      <ConnectionStatus
        v-if="user"
        class="ma-1"
        :layout-name="currentLayout?.name"
        :layout-id="layoutId"
        :server-status="serverStatus"
        :devices="devices"
        @navigate="router.push('/connect')"
      />
      <v-spacer v-if="mdAndUp" class="ma-2" />
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



</template>

<style scoped>
/* ═══════════════════════════════════════════════
   Dark mode (default) — translucent dark header
   ═══════════════════════════════════════════════ */
.header-gradient {
  background: rgba(11, 17, 32, 0.6);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
}

:deep(.v-btn) {
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 40px;
  height: 40px;
}

:deep(.v-chip) {
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 32px;
}

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

:deep(.v-list-item-title) {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.header-controls {
  gap: 8px;
}

/* ═══════════════════════════════════════════════
   🌞 Light mode — solid light header
   ═══════════════════════════════════════════════ */
:root:not(.dark) .header-gradient {
  background: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

:root:not(.dark) :deep(.v-btn) {
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

:root:not(.dark) :deep(.v-chip) {
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

:root:not(.dark) :deep(.v-btn:hover) {
  background: rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 0, 0, 0.15);
}

:root:not(.dark) :deep(.v-chip:hover) {
  background: rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 0, 0, 0.15);
}

:root:not(.dark) :deep(.v-list-item-title) {
  text-shadow: none;
}

/* ═══════════════════════════════════════════════
   ⬛⬜ High-contrast — pure black header, white borders
   ═══════════════════════════════════════════════ */
.high-contrast .header-gradient {
  background: #000000;
  border-bottom: 2px solid #FFFFFF;
  box-shadow: none;
  backdrop-filter: none;
}

.high-contrast :deep(.v-btn) {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: none;
}

.high-contrast :deep(.v-chip) {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: none;
}

.high-contrast :deep(.v-btn:hover) {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: none;
  border-color: #FFFFFF;
}

.high-contrast :deep(.v-chip:hover) {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: none;
  border-color: #FFFFFF;
}
</style>
