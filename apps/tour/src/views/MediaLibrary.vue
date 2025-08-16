<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MediaCard from '../components/MediaCard.vue'

interface MediaItem {
  id: string
  title: string
  description: string
  type: 'video' | 'audio'
  category: 'introduction' | 'technical' | 'overview' | 'area-detail'
  area: string
  duration: string
  thumbnail?: string
  url: string
  featured: boolean
}

const route = useRoute()

const selectedArea = ref<string | null>(null)
const selectedType = ref<string | null>(null)
const selectedCategory = ref<string | null>(null)
const playerDialog = ref(false)
const selectedMedia = ref<MediaItem | null>(null)

// Media library with actual layout areas
const allMedia = ref<MediaItem[]>([
  {
    id: 'intro-welcome',
    title: 'Welcome to the Layout',
    description: 'A comprehensive introduction to our model train layout and what makes it special.',
    type: 'video',
    category: 'introduction',
    area: 'Overview',
    duration: '3:45',
    url: '/media/intro-welcome.mp4',
    featured: true
  },
  {
    id: 'tamarack-station-tour',
    title: 'Tamarack Station Tour',
    description: 'Explore the main passenger station with its detailed platform scenes.',
    type: 'video',
    category: 'area-detail',
    area: 'Tamarack Station',
    duration: '6:45',
    url: '/media/tamarack-station-tour.mp4',
    featured: false
  },
  {
    id: 'roseberry-yard-operations',
    title: 'Roseberry Yard Operations',
    description: 'Watch the busy freight yard with switching operations and multiple tracks.',
    type: 'video',
    category: 'area-detail',
    area: 'Roseberry Yard',
    duration: '8:20',
    url: '/media/roseberry-yard-operations.mp4',
    featured: false
  },
  {
    id: 'payette-subdivision-journey',
    title: 'Payette Subdivision Journey',
    description: 'Scenic ride through the rural mainline with countryside views.',
    type: 'video',
    category: 'area-detail',
    area: 'Payette Subdivision',
    duration: '7:15',
    url: '/media/payette-subdivision-journey.mp4',
    featured: false
  },
  {
    id: 'deadmans-curve-challenge',
    title: 'Deadman\'s Curve Challenge',
    description: 'Heavy freight tackles the dramatic mountain curve with steep grades.',
    type: 'video',
    category: 'area-detail',
    area: 'Deadman\'s Curve',
    duration: '5:30',
    url: '/media/deadmans-curve-challenge.mp4',
    featured: false
  },
  {
    id: 'round-valley-scenery',
    title: 'Round Valley Scenery',
    description: 'Beautiful valley scenes with detailed landscape and structures.',
    type: 'video',
    category: 'area-detail',
    area: 'Round Valley',
    duration: '4:50',
    url: '/media/round-valley-scenery.mp4',
    featured: false
  },
  {
    id: 'thunder-city-sounds',
    title: 'Thunder City Ambience',
    description: 'Audio tour of the urban area with city sounds and railroad activity.',
    type: 'audio',
    category: 'area-detail',
    area: 'Thunder City',
    duration: '4:45',
    url: '/media/thunder-city-sounds.mp3',
    featured: false
  },
  {
    id: 'eagle-nest-overview',
    title: 'Eagle Nest Overview',
    description: 'High mountain area with spectacular views and challenging operations.',
    type: 'video',
    category: 'area-detail',
    area: 'Eagle Nest',
    duration: '6:10',
    url: '/media/eagle-nest-overview.mp4',
    featured: false
  },
  {
    id: 'tripod-peak-construction',
    title: 'Tripod Peak Construction',
    description: 'Behind-the-scenes look at how the highest point was built.',
    type: 'video',
    category: 'technical',
    area: 'Tripod Peak',
    duration: '9:30',
    url: '/media/tripod-peak-construction.mp4',
    featured: false
  },
  {
    id: 'dcc-system-explained',
    title: 'DCC Control System',
    description: 'Learn how Digital Command Control enables individual locomotive control.',
    type: 'video',
    category: 'technical',
    area: 'Technical',
    duration: '8:15',
    url: '/media/dcc-system.mp4',
    featured: false
  },
  {
    id: 'layout-overview',
    title: 'Complete Layout Overview',
    description: 'Aerial view and complete tour of the entire model train layout.',
    type: 'video',
    category: 'overview',
    area: 'Overview',
    duration: '12:30',
    url: '/media/layout-overview.mp4',
    featured: true
  }
])

const areas = computed(() => 
  [...new Set(allMedia.value.map(m => m.area))].sort()
)

const mediaTypes = [
  { title: 'Video', value: 'video' },
  { title: 'Audio', value: 'audio' }
]

const categories = [
  { title: 'Introduction', value: 'introduction' },
  { title: 'Area Details', value: 'area-detail' },
  { title: 'Technical', value: 'technical' },
  { title: 'Overview', value: 'overview' }
]

const filteredMedia = computed(() => {
  return allMedia.value.filter(media => {
    if (selectedArea.value && media.area !== selectedArea.value) return false
    if (selectedType.value && media.type !== selectedType.value) return false
    if (selectedCategory.value && media.category !== selectedCategory.value) return false
    return true
  })
})

const filterMedia = () => {
  // Filtering is handled by the computed property
}

const playMedia = (mediaId: string) => {
  selectedMedia.value = allMedia.value.find(m => m.id === mediaId) || null
  playerDialog.value = true
}

const viewMediaDetails = (mediaId: string) => {
  // Navigate to detailed view or show more info
  console.log('View details for:', mediaId)
}

const startPlayback = () => {
  if (selectedMedia.value) {
    console.log('Starting playback:', selectedMedia.value.url)
    // Here you would integrate with your actual media player
  }
}

const showIntroContent = () => {
  selectedCategory.value = 'introduction'
  selectedArea.value = null
  selectedType.value = null
}

const showTechnicalContent = () => {
  selectedCategory.value = 'technical'
  selectedArea.value = null
  selectedType.value = null
}

const showOverviewContent = () => {
  selectedCategory.value = 'overview'
  selectedArea.value = null
  selectedType.value = null
}

onMounted(() => {
  // Check for URL parameters to pre-filter content
  const filter = route.query.filter as string
  if (filter === 'technical') {
    showTechnicalContent()
  } else if (filter === 'introduction') {
    showIntroContent()
  }
})
</script>

<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-card elevation="4" class="mb-6">
          <v-card-title class="text-h4">
            <v-icon icon="mdi-video-library" class="mr-3"></v-icon>
            Media Library
          </v-card-title>
          <v-card-subtitle class="text-h6">
            Explore videos and audio content about each layout area
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="3">
        <v-card elevation="2" class="mb-4">
          <v-card-title class="text-h6">Filters</v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedArea"
              :items="areas"
              label="Layout Area"
              clearable
              prepend-icon="mdi-map"
              @update:model-value="filterMedia"
            ></v-select>
            
            <v-select
              v-model="selectedType"
              :items="mediaTypes"
              label="Content Type"
              clearable
              prepend-icon="mdi-filter"
              @update:model-value="filterMedia"
            ></v-select>
            
            <v-select
              v-model="selectedCategory"
              :items="categories"
              label="Category"
              clearable
              prepend-icon="mdi-tag"
              @update:model-value="filterMedia"
            ></v-select>
          </v-card-text>
        </v-card>

        <v-card elevation="2">
          <v-card-title class="text-h6">Quick Access</v-card-title>
          <v-card-text>
            <v-btn 
              block 
              color="primary" 
              class="mb-2"
              @click="showIntroContent"
            >
              <v-icon icon="mdi-play-circle" class="mr-2"></v-icon>
              Introduction
            </v-btn>
            <v-btn 
              block 
              color="accent" 
              class="mb-2"
              @click="showTechnicalContent"
            >
              <v-icon icon="mdi-cog" class="mr-2"></v-icon>
              Technical Details
            </v-btn>
            <v-btn 
              block 
              color="info"
              @click="showOverviewContent"
            >
              <v-icon icon="mdi-map" class="mr-2"></v-icon>
              Layout Overview
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="9">
        <v-row>
          <v-col 
            cols="12" 
            sm="6" 
            lg="4" 
            v-for="media in filteredMedia" 
            :key="media.id"
          >
            <MediaCard 
              :media="media" 
              @play="playMedia"
              @view-details="viewMediaDetails"
            />
          </v-col>
        </v-row>

        <div v-if="filteredMedia.length === 0" class="text-center py-8">
          <v-icon icon="mdi-video-off" size="64" class="text-medium-emphasis mb-4"></v-icon>
          <h3 class="text-h5 text-medium-emphasis mb-2">No media found</h3>
          <p class="text-body-1 text-medium-emphasis">
            Try adjusting your filters or check back later for new content.
          </p>
        </div>
      </v-col>
    </v-row>

    <!-- Media Player Dialog -->
    <v-dialog v-model="playerDialog" max-width="800">
      <v-card v-if="selectedMedia">
        <v-card-title>{{ selectedMedia.title }}</v-card-title>
        <v-card-text>
          <div class="media-player-placeholder">
            <v-icon icon="mdi-play" size="64" class="play-icon"></v-icon>
            <p class="text-h6 mt-4">{{ selectedMedia.title }}</p>
            <p class="text-body-2">{{ selectedMedia.description }}</p>
            <p class="text-caption">Duration: {{ selectedMedia.duration }}</p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="playerDialog = false">Close</v-btn>
          <v-btn color="primary" @click="startPlayback">
            <v-icon icon="mdi-play" class="mr-2"></v-icon>
            Play
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.media-player-placeholder {
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 8px;
  padding: 48px;
  text-align: center;
  border: 2px dashed rgb(var(--v-theme-outline));
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.play-icon {
  opacity: 0.6;
  color: rgb(var(--v-theme-on-surface-variant));
}
</style>
