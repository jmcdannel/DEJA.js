<script setup lang="ts">
import { ref, computed, useTemplateRef, watch } from 'vue'
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
import QuickMenu from '@/quick-menu/QuickMenu.vue'
import CommandPalette from '@/command-palette/CommandPalette.vue'
import CommandPaletteTrigger from '@/command-palette/CommandPaletteTrigger.vue'
import CommandPaletteChordChip from '@/command-palette/CommandPaletteChordChip.vue'
import { useGlobalKeybindings } from '@/command-palette/useGlobalKeybindings'
import { useThemeSwitcher } from '@repo/ui/src/composables/useThemeSwitcher'
import { useFeedbackUser } from '@repo/modules/feedback'
import { usePromotions, PROMO_SLOTS } from '@repo/modules'
import * as Sentry from '@sentry/vue'

provideNotifications()
useGlobalKeybindings()
const { promotions: activePromos } = usePromotions(PROMO_SLOTS.BANNER_TOP)

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
        >
          <CommandPaletteTrigger />
        </AppHeader>
        <Menu v-if="!isFullscreen" v-model:drawer="drawer" :menu="menuConfig" @handle-menu="handleMenu" />
        <v-main>
          <!-- Normal (non-fullscreen) layout -->
          <v-container v-if="!isFullscreen" ref="mainContentRef" class="p-0 flex flex-col flex-1 h-full relative" style="min-height: calc(100vh - var(--v-layout-top, 64px) - var(--v-layout-bottom, 56px))" fluid>
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
        <QuickMenu v-if="!isFullscreen" />
        <CommandPalette v-if="!isFullscreen" />
        <CommandPaletteChordChip v-if="!isFullscreen" />
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
