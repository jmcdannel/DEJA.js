<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { vAutoAnimate } from '@formkit/auto-animate/vue'

interface Section {
  id: string
  name: string
  shortDescription: string
  introMediaId: string
  technicalMediaId: string
  thumbnail?: string
  effects: { id: string; name: string }[]
}

const router = useRouter()

const sections = ref<Section[]>([
  {
    id: 'tamarack-station',
    name: 'Tamarack Station',
    shortDescription: 'The main passenger station with platforms, signals and station activities.',
    introMediaId: 'tamarack-overview',
    technicalMediaId: 'tamarack-technical',
    thumbnail: '/media/tamarack-overview.jpg',
    effects: [
      { id: 'station-lights', name: 'Station Platform Lights' }
    ]
  },
  {
    id: 'thunder-city',
    name: 'Thunder City',
    shortDescription: 'Urban district with city sounds, street lights and animated signs.',
    introMediaId: 'thunder-city-sounds',
    technicalMediaId: 'thunder-city-technical',
    thumbnail: '/media/thunder-city-thumb.jpg',
    effects: [
      { id: 'city-street-lights', name: 'City Street Lights' }
    ]
  },
  {
    id: 'eagle-nest',
    name: 'Eagle Nest & Payette Canyon',
    shortDescription: 'High mountain vistas and canyon operations with scenic trestles.',
    introMediaId: 'eagle-nest-summit',
    technicalMediaId: 'payette-canyon-technical',
    thumbnail: '/media/eagle-nest-thumb.jpg',
    effects: [
      { id: 'mountain-echo', name: 'Mountain Echo Horn' }
    ]
  },
  {
    id: 'payette-subdivision',
    name: 'Payette Subdivision',
    shortDescription: 'Rural mainline with crossings, bridges and long scenic runs.',
    introMediaId: 'payette-journey',
    technicalMediaId: 'payette-technical',
    thumbnail: '/media/payette-journey-thumb.jpg',
    effects: [
      { id: 'crossing-bell', name: 'Grade Crossing Bell' }
    ]
  },
  {
    id: 'roseberry-yard',
    name: 'Roseberry Yard and Industrial Auto Park',
    shortDescription: 'Busy freight yard, switching operations and adjoining industrial park.',
    introMediaId: 'roseberry-operations',
    technicalMediaId: 'roseberry-technical',
    thumbnail: '/media/roseberry-operations-thumb.jpg',
    effects: [
      { id: 'yard-tower-light', name: 'Yard Tower Light' }
    ]
  }
])

// Preview dialog state
const previewOpen = ref(false)
const previewUrl = ref('')
const previewType = ref<'video' | 'audio'>('video')
const previewTitle = ref('')

function getMediaUrl(id: string) {
  // Infer extension: if id contains 'sounds' or 'audio' -> .mp3; otherwise .mp4
  const isAudio = /sound|sounds|audio/i.test(id)
  const ext = isAudio ? 'mp3' : 'mp4'
  return `/media/${id}.${ext}`
}

function getMediaType(id: string): 'video' | 'audio' {
  return /sound|sounds|audio/i.test(id) ? 'audio' : 'video'
}

const openPreview = (section: Section) => {
  const id = section.introMediaId
  previewUrl.value = getMediaUrl(id)
  previewType.value = getMediaType(id)
  previewTitle.value = section.name
  previewOpen.value = true
}

const goToSection = (id: string) => {
  router.push({ name: 'area-detail', params: { id } })
}
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-card elevation="2" class="mb-4">
        <v-card-title class="text-h4">Explore Sections</v-card-title>
        <v-card-subtitle class="text-body-1">Browse the main layout sections — click a card to view details or play a short intro preview.</v-card-subtitle>
      </v-card>
    </v-col>

    <v-col cols="12">
      <v-row v-auto-animate>
        <v-col
          cols="12"
          sm="6"
          md="4"
          v-for="section in sections"
          :key="section.id"
        >
          <v-card elevation="3" class="section-card transition-transform duration-deja-fast ease-deja-standard hover:-translate-y-1">
            <div class="media-wrap" @click="goToSection(section.id)">
              <v-img
                v-if="section.thumbnail"
                :src="section.thumbnail"
                height="160"
                cover
              >
                <div class="overlay">
                  <v-icon icon="mdi-play-circle" size="56" color="white"></v-icon>
                </div>
              </v-img>
              <div v-else class="thumb-placeholder">
                <v-icon icon="mdi-map-marker" size="48" class="thumb-icon"></v-icon>
                <div class="overlay">
                  <v-icon icon="mdi-play-circle" size="56" color="white"></v-icon>
                </div>
              </div>
            </div>

            <v-card-title class="text-h6">{{ section.name }}</v-card-title>
            <v-card-text>
              <p class="text-body-2">{{ section.shortDescription }}</p>
              <div class="mt-3">
                <v-chip small color="info" class="mr-2">Intro</v-chip>
                <v-chip small color="secondary">Technical</v-chip>
              </div>
            </v-card-text>

            <v-card-actions>
              <v-btn text color="primary" @click.stop="goToSection(section.id)">View Details</v-btn>
              <v-spacer />
              <v-btn icon variant="tonal" @click.stop="openPreview(section)">
                <v-icon icon="mdi-play" />
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-col>

    <v-dialog v-model="previewOpen" max-width="900">
      <v-card>
        <v-card-title>
          <div class="d-flex align-center">
            <v-icon icon="mdi-play-circle" class="mr-3"></v-icon>
            <div>
              <div class="text-h6">{{ previewTitle }}</div>
              <div class="text-caption">Preview</div>
            </div>
          </div>
        </v-card-title>
        <v-card-text>
          <div v-if="previewType === 'video'">
            <video :src="previewUrl" controls autoplay style="width: 100%; height: auto; border-radius: 6px;"></video>
          </div>
          <div v-else>
            <audio :src="previewUrl" controls autoplay style="width: 100%;"></audio>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text color="primary" @click="previewOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<style scoped>
.section-card { cursor: default; }
.media-wrap { position: relative; overflow: hidden; }
.overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.25); opacity: 0; transition: opacity 250ms cubic-bezier(0.4, 0, 0.2, 1); }
.media-wrap:hover .overlay { opacity: 1; }
.thumb-placeholder { height: 160px; display:flex; align-items:center; justify-content:center; background: rgb(var(--v-theme-surface-variant)); }
.thumb-icon { opacity: 0.6; color: rgb(var(--v-theme-on-surface-variant)); }
</style>
