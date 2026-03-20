<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { RouterView } from 'vue-router'
import { AppHeader, TransitionFade, NotificationContainer, provideNotifications, PageBackground } from '@repo/ui'
import type { AppBackgroundPrefs } from '@repo/modules'
import Footer from '@/core/Footer.vue'
import ConnectionStatusBanner from '@/core/ConnectionStatusBanner.vue'
import useMenu from '@/core/Menu/useMenu'
import Menu from '@repo/ui/src/Menu/Menu.vue'
import { usePageSwipe } from '@/composables/usePageSwipe'
import { useThemeSwitcher } from '@repo/ui/src/composables/useThemeSwitcher'
import { wiThrottleService } from '@/services/WiThrottleService'
import { watch, onMounted, onUnmounted } from 'vue'

provideNotifications()
const drawer = ref(false)
const { handleMenu, menuConfig } = useMenu()

// Bridge custom events from the monorepo packages to the native Capacitor TCP socket
function handleWiThrottleSend(event: Event) {
  const customEvent = event as CustomEvent
  if (customEvent.detail) {
    wiThrottleService.send(customEvent.detail)
  }
}

watch(() => wiThrottleService.state.value, (newState) => {
  // Expose connection state to the window object so @repo/modules can read it without circular imports
  ;(window as any).__WI_THROTTLE_CONNECTED__ = newState === 'CONNECTED'
})

onMounted(() => {
  window.addEventListener('withrottle-send', handleWiThrottleSend)
})

onUnmounted(() => {
  window.removeEventListener('withrottle-send', handleWiThrottleSend)
})

const mainContentRef = useTemplateRef('mainContentRef')
usePageSwipe(mainContentRef as any, { disabledRoutes: ['throttle'] })

const { isDark, themePreference } = useThemeSwitcher()

const throttleDefaults: AppBackgroundPrefs = {
  default: 'none',
  pages: {
    '/': 'viaduct',
    '/turnouts': 'forest',
    '/roster': 'forest',
    '/routes': 'forest',
    '/signals': 'forest',
    '/effects': 'viaduct',
    '/conductor': 'viaduct',
    '/connect': 'viaduct',
  },
}
</script>

<template>
  <v-app :theme="themePreference">
    <div class="app-bg min-h-screen">
      <PageBackground app-name="throttle" :defaults="throttleDefaults">
        <AppHeader
          app-name="Throttle"
          app-icon="mdi-gamepad-variant"
          variant="throttle"
          color="blue"
          :drawer="drawer"
          :show-layout-power="true"
          :show-emergency-stop="true"
          :show-device-status="true"
          :show-device-status-label="true"
          :show-user-profile="true"
          @drawer-toggle="drawer = !drawer"
        />
        <Menu v-model:drawer="drawer" :menu="menuConfig" @handle-menu="handleMenu" />
        <v-main>
          <v-container ref="mainContentRef" class="p-0 min-h-full flex flex-col" fluid>
            <RouterView v-slot="{ Component }">
              <TransitionFade>
                <component :is="Component" />
              </TransitionFade>
            </RouterView>
          </v-container>
        </v-main>
        <Footer />
        <ConnectionStatusBanner />
        <NotificationContainer />
      </PageBackground>
    </div>
  </v-app>
</template>

<style scoped>
.app-bg {
  background: rgb(var(--v-theme-background));
}
</style>