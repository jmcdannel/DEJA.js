<template>
  <div>
    <v-row justify="center" class="mb-8">
      <v-col cols="12" md="8" class="text-center">
        <TourLogo class="mb-4" style="width: 120px; height: 120px;" />
        <h1 class="text-h3 mb-4">Welcome to the Model Train Layout Tour</h1>
        <h2 v-if="layoutId" class="text-h5 mb-2 text-primary">{{ layoutId }}</h2>
        <p class="text-h6 text-medium-emphasis mb-6">
          Explore our interactive model train layout, control guest-accessible effects, 
          and learn about the technical implementation behind each area.
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6" lg="3" v-for="card in tourCards" :key="card.title">
        <v-card 
          :color="card.color" 
          class="tour-card" 
          elevation="4"
          :to="card.to"
          hover
        >
          <v-card-text class="text-center pa-6">
            <v-icon :icon="card.icon" size="64" class="mb-4"></v-icon>
            <h3 class="text-h5 mb-2">{{ card.title }}</h3>
            <p class="text-body-1">{{ card.description }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-8">
      <v-col cols="12" md="8">
        <v-card elevation="2">
          <v-card-title class="text-h5">Quick Start</v-card-title>
          <v-card-text>
            <v-stepper alt-labels>
              <v-stepper-header>
                <v-stepper-item 
                  v-for="(step, index) in quickStartSteps" 
                  :key="index"
                  :value="index + 1"
                  :title="step.title"
                  :subtitle="step.subtitle"
                ></v-stepper-item>
              </v-stepper-header>
            </v-stepper>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card elevation="2">
          <v-card-title class="text-h5">Layout Status</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <template #prepend>
                  <v-icon 
                    :icon="layoutId ? 'mdi-check-circle' : 'mdi-alert-circle'" 
                    :color="layoutId ? 'success' : 'warning'"
                  ></v-icon>
                </template>
                <v-list-item-title>Layout Connection</v-list-item-title>
                <v-list-item-subtitle>
                  {{ layoutId ? 'Connected' : 'Not Connected' }}
                </v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-lightning-bolt" color="primary"></v-icon>
                </template>
                <v-list-item-title>Guest Effects</v-list-item-title>
                <v-list-item-subtitle>
                  {{ tourStore.guestEffects.length }} available
                </v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-play-circle" color="accent"></v-icon>
                </template>
                <v-list-item-title>Active Effects</v-list-item-title>
                <v-list-item-subtitle>
                  {{ tourStore.activeEffects.length }} running
                </v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template #prepend>
                  <v-icon icon="mdi-video-library" color="info"></v-icon>
                </template>
                <v-list-item-title>Media Items</v-list-item-title>
                <v-list-item-subtitle>
                  {{ tourStore.media.length }} available
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useTourStore } from '../stores/tour'
import TourLogo from '../components/TourLogo.vue'

const layoutId = useStorage('@DEJA/layoutId', '')
const tourStore = useTourStore()

const tourCards = [
  {
    title: 'Welcome Tour',
    description: 'Start with an introduction and overview of the layout',
    icon: 'mdi-play-circle',
    color: 'primary',
    to: '/welcome'
  },
  {
    title: 'Control Effects',
    description: 'Interact with guest-accessible layout effects',
    icon: 'mdi-lightning-bolt',
    color: 'secondary',
    to: '/effects'
  },
  {
    title: 'Media Library',
    description: 'Browse videos and audio about each layout area',
    icon: 'mdi-video-library',
    color: 'accent',
    to: '/media'
  },
  {
    title: 'Technical Details',
    description: 'Learn about the implementation behind the scenes',
    icon: 'mdi-cog',
    color: 'info',
    to: '/media?filter=technical'
  }
]

const quickStartSteps = [
  { title: 'Watch Welcome', subtitle: 'Start here' },
  { title: 'Explore Areas', subtitle: 'Browse content' },
  { title: 'Try Effects', subtitle: 'Interactive fun' },
  { title: 'Learn More', subtitle: 'Technical deep dive' }
]
</script>

<style scoped>
.tour-card {
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
}

.tour-card:hover {
  transform: translateY(-4px);
}
</style>