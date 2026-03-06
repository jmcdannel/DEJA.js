<script setup lang="ts">
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { RouterView, useRouter } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { Login } from '@repo/auth'
import { AppHeader } from '@repo/ui'
import Menu from '@repo/ui/src/Menu/Menu.vue'
import type { MenuItem } from '@repo/ui/src/Menu/types'
import { useDcc } from '@repo/dccex'
import { useEfx, useLayout } from '@repo/modules'

const { sendDccCommand } = useDcc()
const { runEffect, getEffectsByType } = useEfx()
const { getDevices, getLayouts } = useLayout()
const layoutId = useStorage('@DEJA/layoutId', '')
const enabled = useStorage('@DEJA/pref/ws-logging', false)
const wshost = useStorage('@DEJA/pref/ws-host', 'localhost:8082')
const devices = getDevices()
const layouts = getLayouts()
const drawer = ref(false)

// Event handlers for the unified header
async function handleTrackPowerToggle(newState: boolean) {
  const DEFAULT_ON = '1 MAIN'
  const DEFAULT_OFF = '0'
  await sendDccCommand({ action: 'dcc', payload: newState ? DEFAULT_ON : DEFAULT_OFF })
}

async function handleLayoutPowerToggle(newState: boolean) {
  const powerEfx = await getEffectsByType('power')
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
  console.log('Device selected:', deviceId)
  // Handle device selection if needed
}

const enableLogging = useStorage('@DEJA/pref/ws-logging', false)

const user = useCurrentUser()
const router = useRouter()

const theme = ref('monitorDark')

function handleMenu(item:MenuItem) {
  router.push({ name: item.name })
}

function handleLayoutSelect(newLayout: string) {
  layoutId.value = newLayout
  
  window.location.reload()
}

function handleLogoClick() {
  router.push({ path: '/' })
}

const menu = [
  {
    label: 'Dashboard',
    icon: 'mdi-view-dashboard',
    name: 'dashboard',
    color: 'blue',
  },
  {
    label: 'Settings',
    icon: 'mdi-cog',
    name: 'settings',
    color: 'green',
  },
  {
    label: 'Logs',
    icon: 'mdi-file-document',
    name: 'logs',
    color: 'red',
  }
]


</script>
<template>
  <v-responsive>
    <v-app v-if="user" :theme="theme">
      <AppHeader
        app-name="Monitor"
        app-icon="mdi-monitor-dashboard"
        variant="monitor"
        color="primary"
        :dark="true"
        :devices="devices"
        :layouts="layouts"
        :show-layout-power="true"
        :show-emergency-stop="true"
        :show-device-status="true"
        :show-device-status-label="true"
        :show-user-profile="true"
        @track-power-toggle="handleTrackPowerToggle"
        @layout-power-toggle="handleLayoutPowerToggle"
        @emergency-stop="handleEmergencyStop"
        @device-select="handleDeviceSelect"
        @logo-click="handleLogoClick"
          @drawer-toggle="drawer = !drawer"
      >
      <template #default>
        <v-switch v-model="enabled" label="Enabled" />
        <v-text-field v-model="wshost" label="Host" hide-details density="compact" />
      </template>
    </AppHeader>
    <Menu v-model:drawer="drawer" :menu="menu" @handle-menu="handleMenu" />


      <v-main v-if="layoutId">
        <RouterView />
      </v-main>
      <v-main v-else>
        <v-alert type="error" class="text-center mb-4">
          No Layout Selected. Please select a layout to continue.
        </v-alert>
        <!-- <SelectLayout @selected="handleLayoutSelect" /> -->
      </v-main>
    </v-app>
    <v-app v-else :theme="theme">
      <Login />
    </v-app>
  </v-responsive>
</template>
