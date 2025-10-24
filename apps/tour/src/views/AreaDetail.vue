<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEfx } from '@repo/modules/effects/useEfx'
import { GuestEffectCard } from '@repo/ui'

interface AreaDetail {
  id: string
  name: string
  description: string
  icon: string
  constructionDetails: { label: string; value: string }[]
  technicalFeatures: string[]
  constructionTime: string
  featuredMedia?: {
    id: string
    title: string
    description: string
    type: 'video' | 'audio'
    url: string
  }
}

const { getEffectsByTag } = useEfx()
const route = useRoute()
const areaId = computed(() => route.params.id as string)
const areaEffects = getEffectsByTag(areaId.value, true)

// Layout area data from the actual model train layout
const areas = ref<AreaDetail[]>([
  {
    id: 'tamarack-station',
    name: 'Tamarack Station',
    description: 'The main passenger station with detailed platform scenes and working signals. Passenger operations, station announcements and platform workflows occur here.',
    icon: 'mdi-train',
    constructionTime: '8 months',
    constructionDetails: [
      { label: 'Platform Length', value: '18 inches' },
      { label: 'Buildings', value: '3 structures' },
      { label: 'Signals', value: '6 working units' },
      { label: 'Figures', value: '24 people' }
    ],
    technicalFeatures: [
      'Working Signals',
      'Platform Lighting',
      'Station Announcements',
      'DCC Block Detection'
    ],
    featuredMedia: {
      id: 'tamarack-tour',
      title: 'Tamarack Station Tour',
      description: 'Complete walkthrough of the main station area',
      type: 'video',
      url: '/media/tamarack-tour.mp4'
    }
  },
  {
    id: 'tamarack-station-technical',
    name: 'Tamarack Station (Technical)',
    description: 'Technical dive into the signals, DCC detection and announcements used at the station.',
    icon: 'mdi-cog',
    constructionTime: 'n/a',
    constructionDetails: [],
    technicalFeatures: ['Signal Logic', 'DCC Detection']
  },
  {
    id: 'roseberry-yard',
    name: 'Roseberry Yard',
    description: 'Busy freight yard with multiple tracks and switching operations. Includes an adjacent Industrial Auto Park for freight loading and unloading.',
    icon: 'mdi-train-car',
    constructionTime: '6 months',
    constructionDetails: [
      { label: 'Yard Tracks', value: '8 sidings' },
      { label: 'Freight Cars', value: '45 cars' },
      { label: 'Switch Motors', value: '12 units' },
      { label: 'Yard Tower', value: '1 structure' }
    ],
    technicalFeatures: [
      'Automated Switching',
      'Yard Lighting',
      'Radio Chatter',
      'DCC Turnout Control'
    ],
    featuredMedia: {
      id: 'roseberry-operations',
      title: 'Roseberry Yard Operations',
      description: 'Watch freight operations and switching moves',
      type: 'video',
      url: '/media/roseberry-operations.mp4'
    }
  },
  {
    id: 'roseberry-technical',
    name: 'Roseberry Yard (Technical)',
    description: 'Detailed look at automated switching and yard control systems.',
    icon: 'mdi-cog',
    constructionTime: 'n/a',
    constructionDetails: [],
    technicalFeatures: ['Automated Switching', 'Yard Routing']
  },
  {
    id: 'payette-subdivision',
    name: 'Payette Subdivision',
    description: 'Rural mainline section with scenic countryside and small towns. Trains operate longer runs and encounter grade crossings and scenic bridges.',
    icon: 'mdi-pine-tree',
    constructionTime: '10 months',
    constructionDetails: [
      { label: 'Track Length', value: '24 feet' },
      { label: 'Bridges', value: '2 structures' },
      { label: 'Rural Buildings', value: '8 structures' },
      { label: 'Trees', value: '150+ units' }
    ],
    technicalFeatures: [
      'Scenic Lighting',
      'Crossing Signals',
      'Nature Sounds',
      'Weather Effects'
    ],
    featuredMedia: {
      id: 'payette-scenic',
      title: 'Payette Subdivision Scenic Tour',
      description: 'Journey through the rural countryside',
      type: 'video',
      url: '/media/payette-scenic.mp4'
    }
  },
  {
    id: 'payette-technical',
    name: 'Payette Subdivision (Technical)',
    description: 'Technical dive into crossing controls, longer block detection and scenic automation.',
    icon: 'mdi-cog',
    constructionTime: 'n/a',
    constructionDetails: [],
    technicalFeatures: ['Crossing Controls', 'Long Block Detection']
  },
  {
    id: 'deadmans-curve',
    name: 'Deadman\'s Curve',
    description: 'Dramatic mountain curve with steep grades and challenging operations.',
    icon: 'mdi-mountain',
    constructionTime: '5 months',
    constructionDetails: [
      { label: 'Grade', value: '3.5% maximum' },
      { label: 'Curve Radius', value: '22 inches' },
      { label: 'Rock Work', value: 'Hand carved' },
      { label: 'Retaining Walls', value: '4 sections' }
    ],
    technicalFeatures: [
      'Helper District',
      'Grade Crossing',
      'Echo Effects',
      'Dynamic Braking'
    ],
    featuredMedia: {
      id: 'deadmans-challenge',
      title: 'Conquering Deadman\'s Curve',
      description: 'Heavy freight tackles the steepest grade',
      type: 'video',
      url: '/media/deadmans-challenge.mp4'
    }
  },
  {
    id: 'round-valley',
    name: 'Round Valley',
    description: 'Beautiful valley scenes with detailed landscape and rural structures.',
    icon: 'mdi-valley',
    constructionTime: '7 months',
    constructionDetails: [
      { label: 'Valley Floor', value: '36 sq inches' },
      { label: 'Farm Buildings', value: '5 structures' },
      { label: 'Livestock', value: '32 animals' },
      { label: 'Fencing', value: '48 inches' }
    ],
    technicalFeatures: [
      'Scenic Lighting',
      'Farm Sounds',
      'Animated Windmill',
      'Seasonal Effects'
    ],
    featuredMedia: {
      id: 'round-valley-tour',
      title: 'Round Valley Pastoral Tour',
      description: 'Peaceful journey through the valley farmland',
      type: 'video',
      url: '/media/round-valley-tour.mp4'
    }
  },
  {
    id: 'thunder-city',
    name: 'Thunder City',
    description: 'Urban area with city sounds and busy railroad activity. Street scenes, vehicle traffic and urban lighting are central operations.',
    icon: 'mdi-city-variant',
    constructionTime: '9 months',
    constructionDetails: [
      { label: 'City Blocks', value: '6 sections' },
      { label: 'Buildings', value: '18 structures' },
      { label: 'Street Lights', value: '24 LED units' },
      { label: 'Vehicles', value: '28 cars' }
    ],
    technicalFeatures: [
      'Street Lighting',
      'Traffic Sounds',
      'Animated Signs',
      'DCC Accessories'
    ],
    featuredMedia: {
      id: 'thunder-city-tour',
      title: 'Thunder City Urban Tour',
      description: 'Explore the bustling city district',
      type: 'video',
      url: '/media/thunder-city-tour.mp4'
    }
  },
  {
    id: 'thunder-city-technical',
    name: 'Thunder City (Technical)',
    description: 'Technical systems that control lighting, traffic and animated signage in the city area.',
    icon: 'mdi-cog',
    constructionTime: 'n/a',
    constructionDetails: [],
    technicalFeatures: ['Traffic Control', 'Animated Signs']
  },
  {
    id: 'eagle-nest',
    name: 'Eagle Nest',
    description: 'High mountain area with spectacular views and challenging operations. Includes Payette Canyon approaches and trestle work.',
    icon: 'mdi-bird',
    constructionTime: '6 months',
    constructionDetails: [
      { label: 'Elevation', value: '18 inches high' },
      { label: 'Rock Formations', value: 'Hand sculpted' },
      { label: 'Trestle Bridge', value: '12 inch span' },
      { label: 'Tunnel Portal', value: '1 entrance' }
    ],
    technicalFeatures: [
      'Mountain Lighting',
      'Wind Effects',
      'Echo Sounds',
      'Gradient Lighting'
    ],
    featuredMedia: {
      id: 'eagle-nest-tour',
      title: 'Eagle Nest Mountain Tour',
      description: 'Spectacular mountain views and operations',
      type: 'video',
      url: '/media/eagle-nest-tour.mp4'
    }
  },
  {
    id: 'eagle-nest-technical',
    name: 'Eagle Nest (Technical)',
    description: 'Technical dive into mountain signalling, trestle detection and canyon operations.',
    icon: 'mdi-cog',
    constructionTime: 'n/a',
    constructionDetails: [],
    technicalFeatures: ['Trestle Detection', 'Echo Effects']
  },
  {
    id: 'tripod-peak',
    name: 'Tripod Peak',
    description: 'The highest point on the layout with dramatic scenery and technical challenges.',
    icon: 'mdi-triangle',
    constructionTime: '8 months',
    constructionDetails: [
      { label: 'Peak Height', value: '24 inches' },
      { label: 'Switchbacks', value: '3 levels' },
      { label: 'Snow Effects', value: 'Year-round' },
      { label: 'Observation Deck', value: '1 structure' }
    ],
    technicalFeatures: [
      'Peak Beacon',
      'Snow Machine',
      'Alpine Sounds',
      'Gradient Control'
    ],
    featuredMedia: {
      id: 'tripod-peak-tour',
      title: 'Tripod Peak Summit Tour',
      description: 'Journey to the highest point on the layout',
      type: 'video',
      url: '/media/tripod-peak-tour.mp4'
    }
  }
])

const area = computed(() => 
  areas.value.find(a => a.id === areaId.value)
)

// Media data for the actual layout areas
const allMedia = ref([
  { id: 'tamarack-overview', title: 'Tamarack Station Overview', description: 'Complete tour of the main passenger station', type: 'video' as const, area: 'tamarack-station', duration: '6:45' },
  { id: 'tamarack-technical', title: 'Tamarack Station: Technical Dive', description: 'Detailed look at signals, DCC and detection at the station', type: 'video' as const, area: 'tamarack-station', duration: '9:10' },

  { id: 'roseberry-operations', title: 'Roseberry Yard Operations', description: 'Freight yard switching and operations', type: 'video' as const, area: 'roseberry-yard', duration: '8:20' },
  { id: 'roseberry-technical', title: 'Roseberry Yard: Technical Dive', description: 'Automated switching and yard control systems', type: 'video' as const, area: 'roseberry-yard', duration: '7:50' },

  { id: 'payette-journey', title: 'Payette Subdivision Journey', description: 'Scenic ride through the countryside', type: 'video' as const, area: 'payette-subdivision', duration: '7:15' },
  { id: 'payette-technical', title: 'Payette Subdivision: Technical Dive', description: 'Crossing controls and long block detection details', type: 'video' as const, area: 'payette-subdivision', duration: '6:40' },

  { id: 'deadmans-challenge', title: 'Deadman\'s Curve Challenge', description: 'Heavy freight tackles the mountain grade', type: 'video' as const, area: 'deadmans-curve', duration: '5:30' },

  { id: 'thunder-city-sounds', title: 'Thunder City Ambience', description: 'Urban sounds and railroad activity', type: 'audio' as const, area: 'thunder-city', duration: '4:45' },
  { id: 'thunder-city-technical', title: 'Thunder City: Technical Dive', description: 'How the city lighting and animated signs are controlled', type: 'video' as const, area: 'thunder-city', duration: '7:00' },

  { id: 'round-valley-pastoral', title: 'Round Valley Pastoral', description: 'Peaceful valley scenes with farm activity', type: 'video' as const, area: 'round-valley', duration: '5:15' },

  { id: 'eagle-nest-summit', title: 'Eagle Nest Summit Views', description: 'Spectacular mountain vistas and operations', type: 'video' as const, area: 'eagle-nest', duration: '6:30' },
  { id: 'payette-canyon-technical', title: 'Payette Canyon Technical Dive', description: 'Technical systems for canyon approaches and trestles', type: 'video' as const, area: 'eagle-nest', duration: '8:05' },

  { id: 'tripod-peak-ascent', title: 'Tripod Peak Ascent', description: 'Challenging climb to the highest point', type: 'video' as const, area: 'tripod-peak', duration: '8:45' }
])

const relatedMedia = computed(() => 
  allMedia.value.filter(media => 
    area.value && (media.area === area.value.id || media.area === areaId.value)
  )
)

const playFeaturedMedia = () => {
  if (area.value?.featuredMedia) {
    console.log('Playing featured media:', area.value.featuredMedia.url)
  }
}

const playMedia = (mediaId: string) => {
  console.log('Playing media:', mediaId)
}

const activateEffect = (effectId: string) => {
  const effect = allEffects.value.find(e => e.id === effectId)
  if (effect) {
    effect.isActive = true
    console.log(`Activating effect: ${effect.name}`)
  }
}

const deactivateEffect = (effectId: string) => {
  const effect = allEffects.value.find(e => e.id === effectId)
  if (effect) {
    effect.isActive = false
    console.log(`Deactivating effect: ${effect.name}`)
  }
}

onMounted(() => {
  // Load area-specific data
  console.log('Loading area:', areaId.value)
})
</script>

<template>
  <div v-if="area">
    <v-row>
      <v-col cols="12">
        <v-card elevation="4" class="mb-6">
          <v-card-title class="text-h4">
            <v-icon :icon="area.icon" class="mr-3"></v-icon>
            {{ area.name }}
          </v-card-title>
          <v-card-subtitle class="text-h6">
            {{ area.description }}
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="8">
        <v-card elevation="2" class="mb-4">
          <v-card-title>Featured Media</v-card-title>
          <v-card-text>
            <div v-if="area.featuredMedia" class="featured-media">
              <div class="media-player-placeholder">
                <v-icon icon="mdi-play" size="64" class="play-icon"></v-icon>
                <p class="text-h6 mt-4">{{ area.featuredMedia.title }}</p>
                <p class="text-body-2">{{ area.featuredMedia.description }}</p>
              </div>
              <v-btn 
                color="primary" 
                size="large" 
                class="mt-4"
                @click="playFeaturedMedia"
              >
                <v-icon icon="mdi-play" class="mr-2"></v-icon>
                Play {{ area.featuredMedia.type }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <v-card elevation="2" class="mb-4">
          <v-card-title>Area Details</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <h4 class="text-h6 mb-2">Construction Details</h4>
                <v-list density="compact">
                  <v-list-item 
                    v-for="detail in area.constructionDetails" 
                    :key="detail.label"
                  >
                    <v-list-item-title>{{ detail.label }}</v-list-item-title>
                    <v-list-item-subtitle>{{ detail.value }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12" md="6">
                <h4 class="text-h6 mb-2">Technical Features</h4>
                <v-chip-group column>
                  <v-chip 
                    v-for="feature in area.technicalFeatures" 
                    :key="feature"
                    size="small"
                    color="info"
                  >
                    {{ feature }}
                  </v-chip>
                </v-chip-group>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card elevation="2" v-if="areaEffects.length > 0">
          <v-card-title>Interactive Effects</v-card-title>
          <v-card-text>
            <v-row>
              <v-col 
                cols="12" 
                sm="6" 
                v-for="effect in areaEffects" 
                :key="effect.id"
              >
                <GuestEffectCard 
                  :effect="effect" 
                  @activate="activateEffect"
                  @deactivate="deactivateEffect"
                  :showDescription="false"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card elevation="2" class="mb-4">
          <v-card-title>Related Media</v-card-title>
          <v-card-text>
            <div v-for="media in relatedMedia" :key="media.id" class="mb-3">
              <v-card 
                variant="outlined" 
                class="related-media-card"
                @click="playMedia(media.id)"
              >
                <v-card-text class="pa-3">
                  <div class="d-flex align-center">
                    <v-icon 
                      :icon="media.type === 'video' ? 'mdi-video' : 'mdi-music'" 
                      class="mr-3"
                    ></v-icon>
                    <div class="flex-grow-1">
                      <p class="text-body-2 font-weight-medium mb-1">{{ media.title }}</p>
                      <p class="text-caption text-medium-emphasis">{{ media.duration }}</p>
                    </div>
                    <v-btn icon="mdi-play" size="small" color="primary"></v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-card-text>
        </v-card>

        <v-card elevation="2" class="mb-4">
          <v-card-title>Navigation</v-card-title>
          <v-card-text>
            <v-btn 
              block 
              color="primary" 
              class="mb-2"
              to="/effects"
            >
              <v-icon icon="mdi-lightning-bolt" class="mr-2"></v-icon>
              Control Effects
            </v-btn>
            <v-btn 
              block 
              color="accent" 
              class="mb-2"
              to="/media"
            >
              <v-icon icon="mdi-video-library" class="mr-2"></v-icon>
              All Media
            </v-btn>
            <v-btn 
              block 
              color="info"
              to="/"
            >
              <v-icon icon="mdi-home" class="mr-2"></v-icon>
              Back to Home
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card elevation="2">
          <v-card-title>Area Statistics</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>Media Items</v-list-item-title>
                <v-list-item-subtitle>{{ relatedMedia.length }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Interactive Effects</v-list-item-title>
                <v-list-item-subtitle>{{ areaEffects.length }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Construction Time</v-list-item-title>
                <v-list-item-subtitle>{{ area.constructionTime }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
  
  <div v-else class="text-center py-8">
    <v-icon icon="mdi-map-marker-off" size="64" class="text-medium-emphasis mb-4"></v-icon>
    <h3 class="text-h5 text-medium-emphasis mb-2">Area not found</h3>
    <p class="text-body-1 text-medium-emphasis mb-4">
      The requested layout area could not be found.
    </p>
    <v-btn color="primary" to="/">
      <v-icon icon="mdi-home" class="mr-2"></v-icon>
      Back to Home
    </v-btn>
  </div>
</template>

<style scoped>
.featured-media {
  text-align: center;
}

.media-player-placeholder {
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 8px;
  padding: 48px;
  border: 2px dashed rgb(var(--v-theme-outline));
  margin-bottom: 16px;
}

.play-icon {
  opacity: 0.6;
  color: rgb(var(--v-theme-on-surface-variant));
}

.related-media-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.related-media-card:hover {
  background-color: rgb(var(--v-theme-surface-variant));
}
</style>
