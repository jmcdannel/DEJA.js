<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { Login } from '@repo/auth'
import { TransitionFade, NotificationContainer, provideNotifications, PageBackground } from '@repo/ui'
import { useThemeSwitcher } from '@repo/ui/src/composables/useThemeSwitcher'
import Menu from '@repo/ui/src/Menu/Menu.vue'
import type { MenuItem } from '@repo/ui/src/Menu/types'
import { useDcc } from '@repo/dccex'
import MonitorStatusBar from '@/Dashboard/components/MonitorStatusBar.vue'

const { sendDccCommand } = useDcc()
provideNotifications()
const layoutId = useStorage('@DEJA/layoutId', '')
const drawer = ref(false)
const route = useRoute()

const isDashboardRoute = computed(() => route.name === 'home')

async function handleTrackPowerToggle(newState: boolean) {
  const DEFAULT_ON = '1 MAIN'
  const DEFAULT_OFF = '0'
  await sendDccCommand({ action: 'dcc', payload: newState ? DEFAULT_ON : DEFAULT_OFF })
}

async function handleEmergencyStop() {
  await sendDccCommand({ action: 'dcc', payload: '!' })
}

const user = useCurrentUser()
const isDevAutoLogin = import.meta.env.DEV && import.meta.env.VITE_DEV_AUTO_LOGIN === 'true'
const router = useRouter()

const { themePreference } = useThemeSwitcher()

function handleMenu(item: MenuItem) {
  router.push({ name: item.name })
}

const menu: MenuItem[] = []
</script>

<template>
  <v-responsive>
    <v-app v-if="user || isDevAutoLogin" :theme="themePreference">
      <PageBackground app-name="monitor">
      <MonitorStatusBar
        @toggle-drawer="drawer = !drawer"
        @track-power-toggle="handleTrackPowerToggle"
        @emergency-stop="handleEmergencyStop"
      />

      <Menu v-model:drawer="drawer" :menu="menu" :temporary="true" @handle-menu="handleMenu" />

      <v-main v-if="layoutId" class="pa-0">
        <RouterView v-slot="{ Component }">
          <component
            v-if="isDashboardRoute"
            :is="Component"
          />
          <TransitionFade v-else>
            <component :is="Component" />
          </TransitionFade>
        </RouterView>
      </v-main>
      <v-main v-else>
        <v-alert type="error" class="text-center mb-4">
          No Layout Selected. Please select a layout to continue.
        </v-alert>
      </v-main>
      <NotificationContainer />
      </PageBackground>
    </v-app>
    <v-app v-else :theme="themePreference">
      <Login />
    </v-app>
  </v-responsive>
</template>
