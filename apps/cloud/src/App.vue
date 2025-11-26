<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { useTheme } from 'vuetify'
import Menu from '@repo/ui/src/Menu/Menu.vue'
import { useMenu } from '@/Core/Menu/useMenu'

// Components
import SelectLayout from './Layout/SelectLayout.vue'
import { Login } from '@repo/auth'
import { AppHeader } from '@repo/ui'
import { useDcc } from '@repo/dccex'
import { useEfx } from '@repo/modules'

const { sendDccCommand } = useDcc()
const { runEffect, getEffectsByType } = useEfx()
const drawer = ref(true)
const layoutId = useStorage('@DEJA/layoutId', 'betatrack')

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


const user = useCurrentUser()
const router = useRouter()
const theme = useTheme()
const { menu, handleMenu } = useMenu()

const currentTheme = ref(theme.name.value || 'dark')

// Watch for theme changes and update the local state
watch(() => theme.name.value, (newTheme) => {
  currentTheme.value = newTheme
})

function handleLayoutSelect(newLayout: string) {
  layoutId.value = newLayout
  router.push({ name: 'Layout' })
}

function handleLogoClick() {
  router.push({ path: '/' })
}

</script>
<template>
  <v-responsive class="border rounded">
      <v-app v-if="user" :theme="theme.name.value">
        <AppHeader 
          app-name="Cloud"
          app-icon="mdi-cloud"
          variant="cloud"
          color="blue"
          :dark="true"
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
        </AppHeader>
        <Menu v-model:drawer="drawer" :menu="menu" @handle-menu="handleMenu" />
      <v-main>
        <v-container v-if="layoutId">
          <RouterView />
        </v-container>
        <v-container v-else>
          <v-alert type="error" class="text-center mb-4">
            No Layout Selected. Please select a layout to continue.
          </v-alert>
          <SelectLayout @selected="handleLayoutSelect" />
        </v-container>
      </v-main>
    </v-app>
    <v-app v-else :theme="theme.name.value">
      <Login />
    </v-app>
  </v-responsive>
</template>
