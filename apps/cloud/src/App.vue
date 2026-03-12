<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { useThemeSwitcher } from '@repo/ui/src/composables/useThemeSwitcher'
import { createLogger } from '@repo/utils'
import Menu from '@repo/ui/src/Menu/Menu.vue'
import { useMenu } from '@/Core/Menu/useMenu'
import { useSubscription, PLAN_DISPLAY } from '@repo/modules'
import { isNavigating } from '@/router'

const log = createLogger('CloudApp')

// Components
import { AppHeader, NotificationContainer, provideNotifications, PageBackground } from '@repo/ui'
// import { useDcc } from '@repo/dccex'
// import { useEfx } from '@repo/modules'

// const { sendDccCommand } = useDcc()
// const { runEffect, getEffectsByType } = useEfx()
provideNotifications()
const drawer = ref(true)
const layoutId = useStorage<string | null>('@DEJA/layoutId', null)

// Event handlers for the unified header
async function handleTrackPowerToggle(newState: boolean) {
  const DEFAULT_ON = '1 MAIN'
  const DEFAULT_OFF = '0'
  // await sendDccCommand({ action: 'dcc', payload: newState ? DEFAULT_ON : DEFAULT_OFF })
}

async function handleLayoutPowerToggle(newState: boolean) {
  // const powerEfx = await getEffectsByType('power')
  // if (powerEfx && Array.isArray(powerEfx)) {
  //   powerEfx.forEach((efx: any) => {
  //     runEffect({...efx, state: newState })
  //   })
  // }
}

async function handleEmergencyStop() {
  // await sendDccCommand({ action: 'dcc', payload: '!' })
}

function handleDeviceSelect(deviceId: string) {
  log.debug('Device selected:', deviceId)
  // Handle device selection if needed
}


const user = useCurrentUser()
const router = useRouter()
const { menu, handleMenu } = useMenu()

const { isDark, themePreference } = useThemeSwitcher()

function handleLayoutSelect(newLayout: string) {
  layoutId.value = newLayout
  router.push({ name: 'Devices' })
}

function handleLogoClick() {
  router.push({ path: '/' })
}

const { isTrialing, trialDaysLeft, plan } = useSubscription()
const trialPlanName = computed(() => PLAN_DISPLAY[plan.value].name)
</script>
<template>
  <v-responsive class="border rounded min-h-screen bg-gradient-to-br from-[var(--v-theme-surface)] to-[var(--v-theme-background)]">
      <v-app :theme="themePreference" class="!bg-transparent">
        <PageBackground app-name="cloud">
        <AppHeader
          app-name="Cloud"
          app-icon="mdi-cloud"
          variant="cloud"
          color="blue"
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
        <v-banner
          v-if="isTrialing"
          lines="one"
          color="info"
          density="compact"
          class="text-body-2"
        >
          <template #text>
            🎉 <strong>{{ trialPlanName }} trial</strong> — {{ trialDaysLeft }} days remaining. You won't be charged until the trial ends.
          </template>
          <template #actions>
            <v-btn variant="text" size="small" :to="{ name: 'settings' }">Manage subscription</v-btn>
          </template>
        </v-banner>
        <Menu v-model:drawer="drawer" :menu="user ? menu : []" @handle-menu="handleMenu" />
      <v-main>
        <v-progress-linear
          :active="isNavigating"
          indeterminate
          color="primary"
          height="3"
          class="position-fixed top-0 left-0 right-0"
          style="z-index: 9999;"
        />
        <v-container class="pa-6 pa-md-12 max-w-7xl mx-auto transition-all duration-300">
          <RouterView v-slot="{ Component, route }">
            <component :is="Component" :key="route.fullPath" />
          </RouterView>
        </v-container>
      </v-main>
      <NotificationContainer />
      </PageBackground>
    </v-app>
  </v-responsive>
</template>
