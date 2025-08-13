<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useTourStore } from './stores/tour'
import TourLogo from './components/TourLogo.vue'
import LayoutSelector from './components/LayoutSelector.vue'
import TourUserProfile from './components/TourUserProfile.vue'

const drawer = ref(false)
const theme = useTheme()
const tourStore = useTourStore()
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

const navigationItems = [
  { title: 'Home', icon: 'mdi-home', to: '/' },
  { title: 'Welcome Tour', icon: 'mdi-play-circle', to: '/welcome' },
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
    <v-app-bar color="primary" elevation="2">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <TourLogo class="mr-4" />
      <v-app-bar-title>Model Train Layout Tour</v-app-bar-title>
      
      <!-- Demo Mode Indicator -->
      <v-chip 
        v-if="isDemoMode" 
        color="warning" 
        size="small" 
        class="mr-4"
      >
        <v-icon icon="mdi-test-tube" class="mr-1"></v-icon>
        Demo Mode
      </v-chip>
      
      <v-spacer></v-spacer>
      
      <!-- User Profile -->
      <TourUserProfile />
      
      <!-- Theme Toggle Button -->
      <v-btn
        :icon="tourStore.isDarkMode ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        @click="tourStore.toggleTheme"
        class="mr-2"
      >
        <v-icon></v-icon>
        <v-tooltip activator="parent" location="bottom">
          Switch to {{ tourStore.isDarkMode ? 'light' : 'dark' }} mode
        </v-tooltip>
      </v-btn>
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

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
    
    <!-- Layout Selector Dialog -->
    <LayoutSelector />
  </v-app>
</template>

<style scoped>
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
