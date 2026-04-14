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
import { useDcc, DCC_POWER_ON, DCC_POWER_OFF, DCC_EMERGENCY_STOP } from '@repo/dccex'
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
  showNavDrawer?: boolean
  mobileLayout?: 'compact' | 'expanded'
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
const stackedLogo = computed(() => !mdAndUp.value)

const showExtension = computed(() =>
  props.mobileLayout === 'expanded'
)

const email = computed(() => user.value?.email ?? null)
const layouts = getLayouts(email)
const devices = getDevices()

const wiThrottlePower = ref<0 | 1 | 2>(2) // 0=off, 1=on, 2=unknown
const wiThrottleConnected = ref(false)


async function handleTrackPowerToggle(newState: boolean) {
  if (wiThrottleConnected.value) {
    window.dispatchEvent(new CustomEvent(WI_THROTTLE_EVENTS.SEND, { detail: `PPA${newState ? '1' : '0'}` }))
    return
  }
  await sendDccCommand({ action: 'dcc', payload: newState ? DCC_POWER_ON : DCC_POWER_OFF })
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
  await sendDccCommand({ action: 'dcc', payload: DCC_EMERGENCY_STOP })
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

// 📱 Mini status indicators for mobile
const serverDotColor = computed(() =>
  serverStatus.value?.online ? '#22c55e' : '#ef4444'
)
const trackPowerDotColor = computed(() =>
  effectiveTrackPower.value ? '#22c55e' : '#6b7280'
)

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
    class="header-gradient relative overflow-hidden"
    :height="showExtension ? (mdAndUp ? 88 : 64) : undefined"
    :dark="dark !== undefined ? dark : defaultProps.dark">
    <BackgroundDecor variant="blurred-bubbles-1" />
    <template v-if="showNavDrawer !== false" v-slot:prepend>
      <v-app-bar-nav-icon variant="text" @click.stop="handleDrawerToggle" class="!h-10 !w-10 ml-4"></v-app-bar-nav-icon>
    </template>
    <template v-slot:title>
      <div class="header-brand">
        <Logo
          :size="mdAndUp ? 'md' : 'sm'"
          :stacked="stackedLogo"
          :app-title="appName || defaultProps.appName"
          :variant="variant || defaultProps.variant"
          @click="handleLogoClick"
          class="cursor-pointer"
        />
        <ConnectionStatus
          v-if="showExtension && user && mdAndUp"
          class="header-brand__status"
          :layout-name="currentLayout?.name"
          :layout-id="layoutId"
          :server-status="serverStatus"
          :devices="devices"
          @navigate="router.push('/connect')"
        />
      </div>
    </template>
    <!-- 📱 Mobile mini-status: server + track power dots, left of Menu -->
    <button
      v-if="showExtension && user && !mdAndUp"
      type="button"
      class="mini-status"
      aria-label="Connection status"
      @click="router.push('/connect')"
    >
      <span class="mini-status__item">
        <v-icon size="12">mdi-console</v-icon>
        <span class="mini-status__dot" :style="{ background: serverDotColor }" />
      </span>
      <span class="mini-status__divider" />
      <span class="mini-status__item">
        <v-icon size="12">mdi-fence-electric</v-icon>
        <span class="mini-status__dot" :style="{ background: trackPowerDotColor }" />
      </span>
    </button>
    <slot></slot>
    <template v-slot:append>
      <!-- Expanded: 2×2 grid on desktop, e-stop only on mobile -->
      <template v-if="showExtension && layoutId && user">
        <!-- Desktop: full 2×2 grid -->
        <div v-if="mdAndUp" class="header-button-grid">
          <UserProfile v-if="showUserProfile !== false" />
          <EmergencyStop v-if="showEmergencyStop !== false" @stop="handleEmergencyStop" />
          <TrackPower :power-state="effectiveTrackPower" :is-connected="dccexConnected" @toggle="handleTrackPowerToggle" />
          <Power v-if="showLayoutPower" :power-state="layoutPowerState" @toggle="handleLayoutPowerToggle" />
        </div>
        <!-- Mobile: just emergency stop -->
        <EmergencyStop v-else-if="showEmergencyStop !== false" class="ml-2" @stop="handleEmergencyStop" />
      </template>
      <!-- Standard layout: all controls in one row -->
      <template v-else-if="!showExtension">
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
    </template>
  </v-app-bar>
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

/* 2×2 button grid for expanded header layout */
.header-button-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-left: 16px;
}

/* Brand block: logo stacked above connection chip */
.header-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
}
.header-brand__status {
  align-self: flex-start;
}

/* Mini status — compact mobile-only indicator for server + track power */
.mini-status {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 4px 6px;
  margin: 0 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.75;
  transition: opacity 150ms ease;
}
.mini-status:hover {
  opacity: 1;
}
.mini-status__item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: rgba(226, 232, 240, 0.75);
}
.mini-status__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  box-shadow: 0 0 4px currentColor;
}
.mini-status__divider {
  width: 1px;
  height: 10px;
  background: rgba(148, 163, 184, 0.3);
}

/* Padded header edges */
:deep(.v-app-bar .v-toolbar__content) {
  padding-left: 20px;
  padding-right: 20px;
  gap: 16px;
}

/* Nudge the Menu button away from the grid */
:deep(.v-toolbar__content) > button.cp-trigger {
  margin-right: 4px;
}

/* 📱 Mobile: tighten everything */
@media (max-width: 959px) {
  :deep(.v-app-bar .v-toolbar__content) {
    padding-left: 8px;
    padding-right: 8px;
    gap: 6px;
  }
  .header-button-grid {
    margin-left: 4px;
    padding: 4px;
    gap: 4px;
  }
  .header-brand {
    gap: 4px;
    padding: 4px 0;
  }
  :deep(.v-toolbar__content) > button.cp-trigger {
    margin-right: 0;
  }
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
