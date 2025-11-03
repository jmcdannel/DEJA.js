<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { useRouter } from 'vue-router'
// import { RouterView, useRouter } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { useTheme } from 'vuetify'
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

function handleThemeChange(newTheme: string) {
  theme.change(newTheme)
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
      <v-navigation-drawer v-model="drawer" mobile-breakpoint="md">
        <v-spacer class="h-8"></v-spacer>
        <v-list>
          <v-list-item v-for="item in menu" 
            :key="item.label" 
            :title="item.label"
            :color="item.color || 'primary'"
            :active="router.currentRoute.value.name === item.label"
            @click="handleMenu(item)"
            link
          >
            <template #prepend>
              <v-icon size="24" :class="`text-${item.color}-500 dark:text-${item.color}-400`"
                class="stroke-none" >{{item.icon}}</v-icon>
            </template>
          </v-list-item>
        </v-list>
        <v-divider class="my-2"></v-divider>
        <!-- Theme Toggle Section -->
        <v-list>
          <v-list-item>
            <v-list-item-title>
              <v-btn-toggle
                v-model="currentTheme"
                mandatory
                size="small"
                @update:model-value="handleThemeChange"
                color="amber"
              >
                <v-btn value="light" size="small" :variant="currentTheme === 'light' ? 'flat' : 'outlined'">
                  <v-icon icon="mdi-white-balance-sunny" size="16"></v-icon>
                </v-btn>
                <v-btn value="dark" size="small" :variant="currentTheme === 'dark' ? 'flat' : 'outlined'">
                  <v-icon icon="mdi-weather-night" size="16"></v-icon>
                </v-btn>
              </v-btn-toggle>
            </v-list-item-title>
            <template #append>
            </template>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
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
