<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { RouterView } from 'vue-router'
import { AppHeader, TransitionFade, NotificationContainer, provideNotifications, PageBackground, PromoBanner } from '@repo/ui'
import type { AppBackgroundPrefs } from '@repo/modules'
import Footer from '@/core/Footer.vue'
import ConnectionStatusBanner from '@/core/ConnectionStatusBanner.vue'
import useMenu from '@/core/Menu/useMenu'
import Menu from '@repo/ui/src/Menu/Menu.vue'
import { usePageSwipe } from '@/composables/usePageSwipe'
import { useThemeSwitcher } from '@repo/ui/src/composables/useThemeSwitcher'
import { wiThrottleService } from '@/services/WiThrottleService'
import { watch, onMounted, onUnmounted } from 'vue'
import { useStorage } from '@vueuse/core'
import { WI_THROTTLE_EVENTS } from '@repo/ui/src/constants/wiThrottleEvents'
import { useFeedbackUser } from '@repo/modules/feedback'
import { usePromotions, PROMO_SLOTS } from '@repo/modules'
import * as Sentry from '@sentry/vue'

provideNotifications()
const { promotions: activePromos } = usePromotions(PROMO_SLOTS.BANNER_TOP)
const { feedbackUser } = useFeedbackUser()
watch(feedbackUser, (u) => Sentry.setUser(u), { immediate: true })
const drawer = ref(false)
const { handleMenu, menuConfig } = useMenu()

// Bridge custom events from the monorepo packages to the native Capacitor TCP socket
function handleWiThrottleSend(event: Event) {
  const customEvent = event as CustomEvent
  if (customEvent.detail) {
    wiThrottleService.send(customEvent.detail)
  }
}

function handleWiThrottleFunction(event: Event) {
  const { address, func, state } = (event as CustomEvent<{ address: number; func: number; state: boolean }>).detail
  wiThrottleService.setThrottleFunction(address, func, state)
}

function handleWiThrottleEstop() {
  wiThrottleService.emergencyStopAll()
}

watch(() => wiThrottleService.state.value, (newState) => {
  const connected = newState === 'CONNECTED'
  // Expose connection state to the window object so @repo/modules can read it without circular imports
  ;(window as any).__WI_THROTTLE_CONNECTED__ = connected
  // Dispatch reactive event so UI packages can update without polling the window flag
  window.dispatchEvent(new CustomEvent(WI_THROTTLE_EVENTS.CONNECTION_STATE, { detail: { connected } }))
})

onMounted(() => {
  window.addEventListener(WI_THROTTLE_EVENTS.SEND, handleWiThrottleSend)
  window.addEventListener(WI_THROTTLE_EVENTS.FUNCTION, handleWiThrottleFunction)
  window.addEventListener(WI_THROTTLE_EVENTS.ESTOP, handleWiThrottleEstop)
})

onUnmounted(async () => {
  window.removeEventListener(WI_THROTTLE_EVENTS.SEND, handleWiThrottleSend)
  window.removeEventListener(WI_THROTTLE_EVENTS.FUNCTION, handleWiThrottleFunction)
  window.removeEventListener(WI_THROTTLE_EVENTS.ESTOP, handleWiThrottleEstop)
  await wiThrottleService.disconnect()
})

const layoutId = useStorage('@DEJA/layoutId', '')

watch(layoutId, async (newId) => {
  if (newId) {
    if (wiThrottleService.state.value === 'DISCONNECTED') {
      await wiThrottleService.connect()
    }
  } else {
    if (wiThrottleService.state.value !== 'DISCONNECTED') {
      await wiThrottleService.disconnect()
    }
  }
}, { immediate: true })

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
  <v-responsive class="min-h-screen bg-gradient-to-br from-[var(--v-theme-surface)] to-[var(--v-theme-background)]">
    <v-app :theme="themePreference" class="!bg-transparent">
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
        <PromoBanner
          v-for="promo in activePromos"
          :key="promo.id"
          :promotion="promo"
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
    </v-app>
  </v-responsive>
</template>