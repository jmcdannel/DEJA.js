<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useTourStore } from './stores/tour'
import LayoutSelector from './components/LayoutSelector.vue'
import TourUserProfile from './components/TourUserProfile.vue'
import { Logo, PageBackground, TransitionFade, NotificationContainer, provideNotifications } from '@repo/ui'

provideNotifications()
const drawer = ref(false)
const theme = useTheme()
const tourStore = useTourStore()

const navigationItems = [
  { title: 'Home', icon: 'mdi-home', to: '/' },
  { title: 'Welcome Tour', icon: 'mdi-play-circle', to: '/welcome' },
  { title: 'Explore Sections', icon: 'mdi-map', to: '/sections' },
  { title: 'Control Effects', icon: 'mdi-lightning-bolt', to: '/effects' },
  { title: 'Media Library', icon: 'mdi-video-library', to: '/media' },
]

// Watch for theme changes and update Vuetify theme
watch(() => tourStore.isDarkMode, (isDark) => {
  theme.global.name.value = isDark ? 'tourDark' : 'tourLight'
}, { immediate: true })

onMounted(() => {
  tourStore.initializeTheme()
})
</script>

<template>
  <v-app>
    <PageBackground app-name="tour">
    <v-app-bar color="black" elevation="2">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>
        <router-link to="/" class="flex items-center" aria-label="Home">
          <Logo size="md" variant="tour" app-title="Tour" />
        </router-link>
      </v-app-bar-title>
      
      <v-spacer></v-spacer>
      
      <!-- User Profile -->
      <TourUserProfile />
      
      <!-- Theme Toggle Button -->
      <!-- <v-btn
        :icon="tourStore.isDarkMode ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        @click="tourStore.toggleTheme"
        class="mr-2"
      >
        <v-icon></v-icon>
        <v-tooltip activator="parent" location="bottom">
          Switch to {{ tourStore.isDarkMode ? 'light' : 'dark' }} mode
        </v-tooltip>
      </v-btn> -->
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item
          v-for="item in navigationItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          @click="drawer = false"
        ></v-list-item>
        
        <v-divider class="my-2"></v-divider>
        
        <!-- Theme Toggle in Drawer -->
        <v-list-item
          :prepend-icon="tourStore.isDarkMode ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          :title="`Switch to ${tourStore.isDarkMode ? 'light' : 'dark'} mode`"
          @click="tourStore.toggleTheme"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main class="relative bg-gradient">
      <v-container fluid>
        <router-view v-slot="{ Component }">
          <TransitionFade>
            <component :is="Component" />
          </TransitionFade>
        </router-view>
      </v-container>
    </v-main>
    
    <!-- Layout Selector Dialog -->
    <LayoutSelector />
    <NotificationContainer />
    </PageBackground>
  </v-app>
</template>

<style scoped>
.bg-gradient {
  background: rgba(3, 8, 19, 0.75);
  backdrop-filter: blur(20px);
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
