<template>
  <div class="font-sans">
    <div class="text-center mb-6">
      <h3 class="text-xl font-semibold text-gray-900 mb-2">BBC Sound Effects</h3>
      <p class="text-gray-600 text-sm">Quality sound effects from the BBC archive</p>
    </div>
    
    <!-- Search bar -->
    <div class="mb-4">
      <v-text-field
        v-model="searchQuery"
        placeholder="Search sound effects..."
        variant="outlined"
        density="compact"
        prepend-inner-icon="mdi-magnify"
        clearable
        hide-details
        color="primary"
        bg-color="surface"
      ></v-text-field>
      <div v-if="searchQuery && !loading" class="text-xs text-gray-600 mt-1">
        {{ filteredSoundFiles.length }} of {{ soundFiles.length }} sound files
      </div>
    </div>
    
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="32" class="mb-3"></v-progress-circular>
      <p class="text-gray-700 text-sm font-medium">Loading sound files...</p>
    </div>
    
    <div v-else-if="error" class="text-center py-10">
      <v-alert type="error" variant="tonal" class="mb-4">
        {{ error }}
      </v-alert>
      <v-btn @click="loadSoundFiles" color="primary" variant="tonal">
        Retry
      </v-btn>
    </div>
    
    <div v-else-if="filteredSoundFiles.length === 0" class="text-center py-8">
      <v-icon icon="mdi-music-note-off" size="48" class="text-gray-400 mb-2"></v-icon>
      <p v-if="searchQuery" class="text-lg font-medium text-gray-800">No sound files match "{{ searchQuery }}"</p>
      <p v-else class="text-lg font-medium text-gray-800">No sound files found</p>
      <p v-if="!searchQuery" class="text-sm text-gray-600">Sound files will appear here once they are added to your blob store.</p>
      <p v-else class="text-sm text-gray-600">Try adjusting your search terms</p>
    </div>
    
    <!-- Responsive Grid Layout -->
    <div v-else class="mb-6">
      <v-row>
        <v-col 
          v-for="sound in filteredSoundFiles" 
          :key="sound.url" 
          cols="12"
          sm="6"
          md="4"
          lg="3"
          xl="2"
        >
          <v-card
            variant="tonal"
            :class="{
              'border-primary border-2': selectedSoundFile === sound.url && props.selectionMode,
            }"
            @click="props.selectionMode ? selectSound(sound) : null"
            :clickable="props.selectionMode"
            class="h-100 transition-all hover:shadow-md"
            :color="selectedSoundFile === sound.url && props.selectionMode ? 'primary' : 'surface-variant'"
          >
            <v-card-text class="pa-3">
              <div class="d-flex flex-column h-100">
                <!-- Header with icon and name -->
                <div class="d-flex align-center mb-2">
                  <div class="mr-2 text-primary">
                    <svg v-if="selectedSoundFile === sound.url && props.selectionMode" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                    </svg>
                  </div>
                  
                  <h4 class="text-sm font-semibol text-gray-9s00 dark:text-gray-200 mb-0 flex-1 line-clamp-2">
                    {{ sound.name }}
                  </h4>
                </div>
                
                <!-- Metadata -->
                <div class="d-flex gap-2 text-xs text-gray-700 mb-3">
                  <v-chip 
                    v-if="sound.duration" 
                    size="x-small" 
                    variant="outlined" 
                    color="info"
                    class="font-weight-medium"
                  >
                    {{ formatDuration(sound.duration) }}
                  </v-chip>
                  <v-chip 
                    v-if="sound.size" 
                    size="x-small" 
                    variant="outlined" 
                    color="secondary"
                    class="font-weight-medium"
                  >
                    {{ formatFileSize(sound.size) }}
                  </v-chip>
                </div>
                
                <!-- Audio Controls -->
                <div class="mt-auto">
                  <audio
                    :ref="el => setAudioElement(sound.url, el as HTMLAudioElement)"
                    :src="sound.url"
                    preload="metadata"
                    @loadedmetadata="onAudioLoaded(sound.url, $event)"
                    @ended="onAudioEnded(sound.url)"
                    @error="onAudioError(sound.url, $event)"
                    controls
                    class="audio-controls-compact"
                    @play="onAudioPlay(sound.url)"
                    @pause="onAudioPause(sound.url)"
                  ></audio>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
    
    <div class="text-center mt-4 pt-3 border-t border-gray-200">
      <p class="text-xs text-gray-600">
        Sound effects provided by 
        <a href="https://sound-effects.bbcrewind.co.uk/licensing" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">
          BBC Sound Effects
        </a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { soundFileService, type SoundFile } from './SoundFileService'

interface Props {
  selectionMode?: boolean
  selectedSound?: string
}

const props = withDefaults(defineProps<Props>(), {
  selectionMode: false,
  selectedSound: ''
})

const emit = defineEmits<{
  select: [soundFile: string]
}>()

const soundFiles = ref<SoundFile[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const audioElements = ref<Record<string, HTMLAudioElement | null>>({})
const selectedSoundFile = ref<string>(props.selectedSound)
const searchQuery = ref('')

// Filtered sound files based on search query
const filteredSoundFiles = computed(() => {
  if (!searchQuery.value) return soundFiles.value
  const query = searchQuery.value.toLowerCase()
  return soundFiles.value.filter(sound => 
    sound.name.toLowerCase().includes(query)
  )
})

onMounted(() => {
  loadSoundFiles()
})

onUnmounted(() => {
  // Stop all audio when component unmounts
  Object.values(audioElements.value).forEach(audio => {
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
  })
})

async function loadSoundFiles() {
  loading.value = true
  error.value = null
  
  try {
    const sounds = await soundFileService.listSoundFiles()
    soundFiles.value = sounds
  } catch (err) {
    error.value = 'Failed to load sound files. Please try again.'
    console.error('Error loading sound files:', err)
  } finally {
    loading.value = false
  }
}

function selectSound(sound: SoundFile) {
  if (props.selectionMode) {
    selectedSoundFile.value = sound.url
    emit('select', sound.url)
  }
}

function setAudioElement(url: string, element: HTMLAudioElement | null) {
  if (element) {
    audioElements.value[url] = element
  }
}

function onAudioLoaded(url: string, event: Event) {
  const audio = event.target as HTMLAudioElement
  if (audio && !soundFiles.value.find(s => s.url === url)?.duration) {
    // Update the sound file duration if not already set
    const soundIndex = soundFiles.value.findIndex(s => s.url === url)
    if (soundIndex !== -1) {
      soundFiles.value[soundIndex].duration = audio.duration * 1000 // Convert to ms
    }
  }
}

function onAudioEnded(url: string) {
  // Audio finished playing naturally
  console.log(`Audio ended: ${url}`)
}

function onAudioError(url: string, event: Event) {
  console.error(`Audio error for ${url}:`, event)
  error.value = 'Failed to load audio file.'
}

function onAudioPlay(url: string) {
  // Stop all other audio when one starts playing
  Object.entries(audioElements.value).forEach(([audioUrl, audioEl]) => {
    if (audioEl && audioUrl !== url) {
      audioEl.pause()
      audioEl.currentTime = 0
    }
  })
}

function onAudioPause(url: string) {
  // Handle pause if needed
  console.log(`Audio paused: ${url}`)
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${seconds}s`
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}
</script>

<style scoped>
.audio-controls-compact {
  height: 28px;
  width: 100%;
  max-width: 200px;
}

.audio-controls-compact::-webkit-media-controls-panel {
  background-color: transparent;
}

.audio-controls-compact::-webkit-media-controls-play-button {
  background-color: transparent;
}

.audio-controls-compact::-webkit-media-controls-timeline {
  background-color: transparent;
}

.audio-controls-compact::-webkit-media-controls-current-time-display,
.audio-controls-compact::-webkit-media-controls-time-remaining-display {
  color: #374151;
  font-size: 11px;
  font-weight: 500;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .audio-controls-compact {
    height: 32px;
    max-width: 100%;
  }
}

/* Hover effects */
.v-card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease-in-out;
}

/* Selection state styling */
.v-card.border-primary {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}
</style>
