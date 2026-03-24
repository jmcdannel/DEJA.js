<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { AppHeader, TransitionFade, NotificationContainer, provideNotifications, PageBackground, PromoBanner } from '@repo/ui'
import { Signout } from '@repo/auth'
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
console.log('activePromos', activePromos.value)
watch(activePromos, (val) => {
  console.log('🚀 activePromos changed:', val, 'length:', val.length)
}, { immediate: true })

const { feedbackUser } = useFeedbackUser()
watch(feedbackUser, (u) => Sentry.setUser(u), { immediate: true })
const drawer = ref(false)
const { handleMenu, menuConfig } = useMenu()

const user = useCurrentUser()
const route = useRoute()

// Prevent flash of nav chrome before initial route resolves (mirrors cloud pattern)
const routeReady = ref(false)
const router = useRouter()
router.isReady().then(() => { routeReady.value = true })

const isFullscreen = computed(() => {
  if (!routeReady.value) return true  // hide chrome until route resolves
  return route.meta.fullscreen === true
})

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
  <v-app :theme="themePreference">
    <div class="app-bg min-h-screen">
      <PageBackground
        app-name="throttle"
        :background-id="isFullscreen ? 'stars' : undefined"
        :defaults="throttleDefaults"
      >
        <AppHeader
          v-if="!isFullscreen"
          app-name="Throttle"
          app-icon="mdi-gamepad-variant"
          variant="throttle"
          color="blue"
          :drawer="drawer"
          :show-layout-power="true"
          :show-emergency-stop="true"
          :show-user-profile="true"
          @drawer-toggle="drawer = !drawer"
        />
        <Menu v-if="!isFullscreen" v-model:drawer="drawer" :menu="menuConfig" @handle-menu="handleMenu" />
        <v-main>
          <!-- Normal (non-fullscreen) layout -->
          <v-container v-if="!isFullscreen" ref="mainContentRef" class="p-0 flex flex-col flex-1" style="min-height: calc(100vh - var(--v-layout-top, 64px) - var(--v-layout-bottom, 56px))" fluid>
            <RouterView v-slot="{ Component }">
              <TransitionFade>
                <component :is="Component" />
              </TransitionFade>
            </RouterView>
          </v-container>

          <!-- Fullscreen layout (login, select-layout) -->
          <div v-else class="min-h-screen pt-11">
            <header class="fullscreen-header">
              <a href="https://dejajs.com" class="fullscreen-header__link">
                <v-icon size="16">mdi-arrow-left</v-icon>
                dejajs.com
              </a>
              <div class="flex-grow" />
              <template v-if="user">
                <span class="fullscreen-header__user">{{ user.displayName || user.email }}</span>
                <Signout />
              </template>
              <template v-else>
                <router-link to="/login" class="fullscreen-header__link">Sign In</router-link>
              </template>
            </header>
            <RouterView v-slot="{ Component, route: r }">
              <div class="animate-deja-fade-in" :key="r.fullPath">
              <PromoBanner
                v-for="promo in activePromos"
                :key="promo.id"
                :promotion="promo"
              />
                <component :is="Component" />
              </div>
            </RouterView>
          </div>
        </v-main>
        <Footer v-if="!isFullscreen" />
        <ConnectionStatusBanner v-if="!isFullscreen" />
        <NotificationContainer />
      </PageBackground>
    </div>
  </v-app>
</template>

<style scoped>
.app-bg {
  background: rgb(var(--v-theme-background));
}
.fullscreen-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 24px;
  background: rgba(2, 6, 23, 0.4);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}
.fullscreen-header__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(148, 163, 184, 0.6);
  font-size: 0.8rem;
  text-decoration: none;
  transition: color 150ms ease;
}
.fullscreen-header__link:hover {
  color: #38bdf8;
}
.fullscreen-header__user {
  font-size: 0.8rem;
  color: rgba(148, 163, 184, 0.5);
}
</style>
