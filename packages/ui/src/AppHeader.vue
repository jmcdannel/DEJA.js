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

const props = withDefaults(defineProps<{
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
}>(), {
  showNavDrawer: true,
})

// const { runEffect, getEffectsByType } = useEfx()
const { sendDccCommand } = useDcc()
const { getLayout, getLayouts, getDevices } = useLayout()
const layoutId = useStorage('@DEJA/layoutId', '')
const layout = getLayout()
const user = useCurrentUser()
const router = useRouter()
const { mdAndUp } = useDisplay()

const { serverStatus } = useServerStatus()

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
  return layout?.value?.dccEx?.power ?? false
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
    class="header-gradient relative overflow-hidden"
    :dark="dark !== undefined ? dark : defaultProps.dark">
    <BackgroundDecor variant="blurred-bubbles-1" />
    <template v-if="showNavDrawer !== false" v-slot:prepend>
      <button
        type="button"
        class="nav-toggle-btn"
        aria-label="Toggle navigation"
        @click.stop="handleDrawerToggle"
      >
        <v-icon size="28" color="white">mdi-menu</v-icon>
      </button>
    </template>
    <template v-slot:title>
      <div class="header-brand">
        <Logo
          :size="mdAndUp ? 'lg' : 'sm'"
          layout="inline"
          :app-title="mdAndUp ? (appName || defaultProps.appName) : undefined"
          :show-text="mdAndUp"
          mark-style="logo"
          :variant="variant || defaultProps.variant"
          @click="handleLogoClick"
          class="cursor-pointer"
        />
      </div>
    </template>
    <slot></slot>
    <template v-slot:append>
      <!-- Single row for both expanded and standard layouts -->
      <template v-if="user">
        <ConnectionStatus
          class="ma-1"
          :layout-name="currentLayout?.name"
          :layout-id="layoutId"
          :server-status="serverStatus"
          :devices="devices"
          @navigate="router.push('/connect')"
        />
        <UserProfile v-if="showUserProfile !== false" class="mx-1" />
        <template v-if="layoutId && showExtension">
          <TrackPower class="ma-1" :power-state="effectiveTrackPower" :is-connected="dccexConnected" @toggle="handleTrackPowerToggle" />
          <Power class="ma-1" v-if="showLayoutPower && mdAndUp" :power-state="layoutPowerState" @toggle="handleLayoutPowerToggle" />
          <EmergencyStop class="ma-1" v-if="showEmergencyStop !== false" @stop="handleEmergencyStop" />
        </template>
        <template v-else-if="!showExtension && layoutId">
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

/* Nav toggle — native button, zero Vuetify interference */
.nav-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-left: 4px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  opacity: 0.9;
  transition: background 150ms ease, opacity 150ms ease;
}
.nav-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  opacity: 1;
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

.header-brand {
  display: flex;
  align-items: center;
}

/* Padded header edges */
.header-gradient :deep(.v-toolbar__content) {
  padding-inline: 4px 12px;
}

/* 📱 Mobile: hamburger flush left, tight gap */
@media (max-width: 959px) {
  .header-gradient :deep(.v-toolbar__content) {
    padding-inline: 0 6px;
  }
  .header-gradient :deep(.v-toolbar__prepend) {
    margin-inline-end: 0;
  }
  .header-gradient :deep(.v-toolbar-title) {
    margin-inline-start: 4px;
  }
  .nav-toggle-btn {
    margin-left: 0;
    width: 40px;
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
/* Light mode: icon is explicitly white via Vuetify color prop — no override needed */

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
