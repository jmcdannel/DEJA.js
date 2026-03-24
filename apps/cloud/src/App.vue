<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { useRouter, useRoute } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { useThemeSwitcher } from '@repo/ui/src/composables/useThemeSwitcher'
import { createLogger } from '@repo/utils'
import Menu from '@repo/ui/src/Menu/Menu.vue'
import { useMenu } from '@/Core/Menu/useMenu'
import { useSubscription, PLAN_DISPLAY, usePromotions, PROMO_SLOTS } from '@repo/modules'
import { Signout } from '@repo/auth'
import { isNavigating } from '@/router'
import { useFeedbackUser } from '@repo/modules/feedback'
import * as Sentry from '@sentry/vue'

const log = createLogger('CloudApp')
const { feedbackUser } = useFeedbackUser()
watch(feedbackUser, (u) => Sentry.setUser(u), { immediate: true })

// Components
import { AppHeader, NotificationContainer, provideNotifications, PageBackground, PromoBanner } from '@repo/ui'

provideNotifications()
const drawer = ref(true)
const layoutId = useStorage<string | null>('@DEJA/layoutId', null)

// Event handlers for the unified header
async function handleTrackPowerToggle(newState: boolean) {
  const DEFAULT_ON = '1 MAIN'
  const DEFAULT_OFF = '0'
}

async function handleLayoutPowerToggle(newState: boolean) {
}

async function handleEmergencyStop() {
}

function handleDeviceSelect(deviceId: string) {
  log.debug('Device selected:', deviceId)
}


const user = useCurrentUser()
const router = useRouter()
const route = useRoute()
const { menu, handleMenu } = useMenu()

const { isDark, themePreference } = useThemeSwitcher()

// Track whether the initial route has resolved. Until it has, treat as
// fullscreen so the header/nav never flash before a redirect completes.
const routeReady = ref(false)
watch(() => route.fullPath, () => {
  if (!routeReady.value && !isNavigating.value) {
    routeReady.value = true
  }
}, { immediate: true })
// Also mark ready when navigation finishes
watch(isNavigating, (navigating) => {
  if (!navigating) routeReady.value = true
}, { immediate: true })

const isFullscreen = computed(() => {
  // Before initial route resolves, hide chrome to prevent flash
  if (!routeReady.value) return true
  return route.meta.fullscreen === true
})

function handleLayoutSelect(newLayout: string) {
  layoutId.value = newLayout
  router.push({ name: 'Devices' })
}

function handleLogoClick() {
  router.push({ path: '/' })
}

const { isTrialing, trialDaysLeft, plan } = useSubscription()
const trialPlanName = computed(() => PLAN_DISPLAY[plan.value].name)
const { promotions: activePromos } = usePromotions(PROMO_SLOTS.BANNER_TOP)
console.log('activePromos', activePromos.value)
watch(activePromos, (val) => {
  console.log('🚀 activePromos changed:', val, 'length:', val.length)
}, { immediate: true })
</script>
<template>
  <v-app :theme="themePreference">
    <div class="app-bg min-h-screen">
        <PageBackground
          app-name="cloud"
          :background-id="isFullscreen ? 'stars' : undefined"
          :defaults="{ default: 'none', pages: {} }"
        >
        <AppHeader
          v-if="!isFullscreen"
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
        />
        <Menu v-if="!isFullscreen" v-model:drawer="drawer" :menu="user ? menu : []" @handle-menu="handleMenu" />
      <v-main>
        <v-banner
          v-if="!isFullscreen && isTrialing"
          lines="one"
          color="info"
          density="compact"
          :sticky="false"
          class="text-body-2"
        >
          <template #text>
            🎉 <strong>{{ trialPlanName }} trial</strong> — {{ trialDaysLeft }} days remaining. You won't be charged until the trial ends.
          </template>
          <template #actions>
            <v-btn variant="text" size="small" :to="{ name: 'Settings' }">Manage subscription</v-btn>
          </template>
        </v-banner>
        <PromoBanner
          v-if="!isFullscreen"
          v-for="promo in activePromos"
          :key="promo.id"
          :promotion="promo"
        />
        <v-progress-linear
          :active="isNavigating"
          indeterminate
          color="primary"
          height="3"
          class="position-fixed top-0 left-0 right-0"
          style="z-index: 9999;"
        />
        <v-container v-if="!isFullscreen" class="pa-6 pa-md-12 max-w-7xl mx-auto">
          <RouterView v-slot="{ Component, route: r }">
            <div class="animate-deja-fade-in" :key="r.fullPath">
              <component :is="Component" />
            </div>
          </RouterView>
        </v-container>
        <div v-else class="min-h-screen pt-11">
          <!-- Translucent header for fullscreen pages -->
          <header class="fullscreen-header">
            <a href="https://dejajs.com" class="fullscreen-header__link">
              <v-icon size="16">mdi-arrow-left</v-icon>
              dejajs.com
            </a>
            <a href="https://dejajs.com/docs" target="_blank" rel="noopener noreferrer" class="fullscreen-header__link">
              <v-icon size="16">mdi-book-open-variant</v-icon>
              Docs
            </a>
            <div class="flex-grow" />
            <template v-if="user">
              <span class="fullscreen-header__user">{{ user.displayName || user.email }}</span>
              <Signout />
            </template>
            <template v-else>
              <router-link to="/login" class="fullscreen-header__link">Sign In</router-link>
              <router-link to="/signup" class="fullscreen-header__link fullscreen-header__link--accent">Sign Up</router-link>
            </template>
          </header>
          <RouterView v-slot="{ Component, route: r }">
            <div class="animate-deja-fade-in" :key="r.fullPath">
              <component :is="Component" />
            </div>
          </RouterView>
        </div>
      </v-main>
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
.fullscreen-header__link--accent {
  color: #38bdf8;
}
.fullscreen-header__link--accent:hover {
  color: #7dd3fc;
}
.fullscreen-header__user {
  font-size: 0.8rem;
  color: rgba(148, 163, 184, 0.5);
}
</style>
