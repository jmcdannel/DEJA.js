<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-card elevation="4" class="mb-6">
          <v-card-title class="text-h4 text-center pa-6">
            <TourLogo class="mr-4" />
            Welcome to Our Model Train Layout
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="8">
        <v-card elevation="2" class="mb-4">
          <v-card-title class="text-h5">
            <v-icon icon="mdi-play-circle" class="mr-2"></v-icon>
            Introduction Video
          </v-card-title>
          <v-card-text>
            <div class="video-placeholder">
              <v-icon icon="mdi-play" size="64" class="play-icon"></v-icon>
              <p class="text-h6 mt-4">Layout Overview & Welcome</p>
              <p class="text-body-2">Duration: 3:45</p>
            </div>
            <v-btn 
              color="primary" 
              size="large" 
              class="mt-4"
              @click="playIntroVideo"
              :loading="videoLoading"
            >
              <v-icon icon="mdi-play" class="mr-2"></v-icon>
              Play Introduction
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card elevation="2">
          <v-card-title class="text-h5">What You Can Do</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item 
                v-for="feature in features" 
                :key="feature.title"
                :prepend-icon="feature.icon"
              >
                <v-list-item-title>{{ feature.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ feature.description }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card elevation="2" class="mb-4">
          <v-card-title class="text-h6">Quick Navigation</v-card-title>
          <v-card-text>
            <v-btn 
              v-for="nav in quickNav" 
              :key="nav.title"
              :color="nav.color"
              :to="nav.to"
              block
              class="mb-2"
              :prepend-icon="nav.icon"
            >
              {{ nav.title }}
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card elevation="2">
          <v-card-title class="text-h6">Layout Stats</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>Scale</v-list-item-title>
                <v-list-item-subtitle>HO (1:87)</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Track Length</v-list-item-title>
                <v-list-item-subtitle>~200 feet</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Interactive Effects</v-list-item-title>
                <v-list-item-subtitle>{{ guestEffectsCount }} available</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Layout Areas</v-list-item-title>
                <v-list-item-subtitle>{{ layoutAreas.length }} sections</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TourLogo from '../components/TourLogo.vue'

const videoLoading = ref(false)
const guestEffectsCount = ref(12) // This would come from your effects data
const layoutAreas = ref([
  'Tamarack Station',
  'Roseberry Yard',
  'Payette Subdivision',
  'Deadman\'s Curve',
  'Round Valley',
  'Thunder City',
  'Eagle Nest',
  'Tripod Peak'
]) // Layout areas from the actual model train layout

const features = [
  {
    title: 'Control Interactive Effects',
    description: 'Activate lights, sounds, and animations throughout the layout',
    icon: 'mdi-lightning-bolt'
  },
  {
    title: 'Explore Layout Areas',
    description: 'Learn about each section with detailed videos and explanations',
    icon: 'mdi-map'
  },
  {
    title: 'Technical Deep Dives',
    description: 'Discover how the electronics and automation work',
    icon: 'mdi-cog'
  },
  {
    title: 'Audio Commentary',
    description: 'Listen to detailed explanations of construction techniques',
    icon: 'mdi-volume-high'
  }
]

const quickNav = [
  { title: 'Start Tour', to: '/media', color: 'primary', icon: 'mdi-play' },
  { title: 'Try Effects', to: '/effects', color: 'secondary', icon: 'mdi-lightning-bolt' },
  { title: 'Browse Media', to: '/media', color: 'accent', icon: 'mdi-video-library' }
]

const playIntroVideo = () => {
  videoLoading.value = true
  // Simulate video loading
  setTimeout(() => {
    videoLoading.value = false
    // Here you would integrate with your actual video player
    console.log('Playing intro video...')
  }, 1000)
}
</script>

<style scoped>
.video-placeholder {
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 8px;
  padding: 48px;
  text-align: center;
  border: 2px dashed rgb(var(--v-theme-outline));
}

.play-icon {
  opacity: 0.6;
  color: rgb(var(--v-theme-on-surface-variant));
}
</style>