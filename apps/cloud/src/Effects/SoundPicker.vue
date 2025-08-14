<template>
  <div class="sound-picker">
    <!-- Sound URL Input -->
    <div class="mb-4">
      <v-text-field
        v-model="soundUrl"
        label="Sound URL"
        variant="outlined"
        placeholder="Enter sound URL or browse BBC sounds below"
        @update:model-value="handleUrlChange"
      >
        <template #append>
          <v-btn
            icon="mdi-play"
            size="small"
            @click="playSound"
            :disabled="!soundUrl"
          ></v-btn>
          <v-btn
            icon="mdi-stop"
            size="small"
            @click="stopSound"
            :disabled="!soundUrl"
          ></v-btn>
        </template>
      </v-text-field>
    </div>

    <!-- Sound Browser -->
    <div class="sound-browser">
      <v-tabs v-model="activeTab" color="primary">
        <v-tab value="bbc-sounds">BBC Sounds</v-tab>
        <v-tab value="search">Search</v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <!-- BBC Sounds Tab -->
        <v-window-item value="bbc-sounds">
          <div class="mt-4">
            <v-select
              v-model="selectedCategory"
              :items="soundCategories"
              label="Category"
              variant="outlined"
              @update:model-value="filterBBCSounds"
            ></v-select>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <v-card
                v-for="sound in filteredSounds"
                :key="sound.id"
                class="sound-card cursor-pointer"
                @click="selectSound(sound)"
                :class="{ 'selected': sound.filePath === soundUrl }"
              >
                <v-card-title class="text-sm font-medium">
                  {{ sound.name }}
                </v-card-title>
                <v-card-text class="text-xs text-gray-600">
                  <div class="mb-2">
                    <v-chip size="small" :color="getCategoryColor(sound.category)">
                      {{ sound.category }}
                    </v-chip>
                  </div>
                  <div class="flex flex-wrap gap-1">
                    <v-chip
                      v-for="tag in sound.tags.slice(0, 3)"
                      :key="tag"
                      size="x-small"
                      variant="outlined"
                    >
                      {{ tag }}
                    </v-chip>
                  </div>
                  <div v-if="sound.metadata?.originalSize" class="mt-2 text-xs">
                    Size: {{ formatFileSize(sound.metadata.originalSize) }}
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    icon="mdi-play"
                    size="small"
                    @click.stop="previewSound(sound)"
                  ></v-btn>
                  <v-btn
                    icon="mdi-content-copy"
                    size="small"
                    @click.stop="copySoundUrl(sound)"
                  ></v-btn>

                </v-card-actions>
              </v-card>
            </div>
          </div>
        </v-window-item>

        <!-- Search Tab -->
        <v-window-item value="search">
          <div class="mt-4">
            <v-text-field
              v-model="searchQuery"
              label="Search sounds"
              variant="outlined"
              placeholder="e.g., train whistle, city traffic, birds"
              @update:model-value="debouncedSearch"
            ></v-text-field>
            
            <div v-if="searchResults.length > 0" class="mt-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <v-card
                  v-for="sound in searchResults"
                  :key="sound.id"
                  class="sound-card cursor-pointer"
                  @click="selectSound(sound)"
                >
                  <v-card-title class="text-sm font-medium">
                    {{ sound.name }}
                  </v-card-title>
                  <v-card-text class="text-xs text-gray-600">
                    <v-chip size="small" :color="getCategoryColor(sound.category)">
                      {{ sound.category }}
                    </v-chip>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </div>
        </v-window-item>


      </v-window>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getAllSounds, getSoundsByCategory, searchSounds as searchSoundsData, type SoundData } from '@repo/sounds'

interface Props {
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'update:soundBlobUrl', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const soundUrl = ref(props.modelValue || '')
const activeTab = ref('bbc-sounds')
const selectedCategory = ref<string>('')
const searchQuery = ref('')
const searchResults = ref<SoundData[]>([])
const audioElement = ref<HTMLAudioElement | null>(null)

const soundCategories = computed(() => [
  { title: 'All Categories', value: '' },
  { title: 'Train Sounds', value: 'train' },
  { title: 'Station Sounds', value: 'station' },
  { title: 'City Sounds', value: 'city' },
  { title: 'Nature Sounds', value: 'nature' },
  { title: 'Ambient Sounds', value: 'ambient' },
  { title: 'Mechanical', value: 'mechanical' },
  { title: 'Transport', value: 'transport' },
  { title: 'Industrial', value: 'industrial' }
])

const filteredBBCSounds = computed(() => {
  console.log('🔍 SoundPicker: filteredBBCSounds computed called')
  console.log('🔍 SoundPicker: selectedCategory:', selectedCategory.value)
  
  // Since the methods are now async, we'll need to handle this differently
  // For now, return an empty array and load sounds in onMounted
  return []
})

const allSounds = ref<SoundData[]>([])
const filteredSounds = ref<SoundData[]>([])

// Load sounds when component mounts
onMounted(async () => {
  console.log('🔍 SoundPicker: onMounted called')
  audioElement.value = new Audio()
  console.log('🔍 SoundPicker: Audio element created:', !!audioElement.value)
  
      // Load sounds directly from the sounds package
    try {
      allSounds.value = getAllSounds()
      console.log('🔍 SoundPicker: Initial sounds check - total sounds:', allSounds.value.length)
      updateFilteredSounds()
    } catch (error) {
      console.error('❌ SoundPicker: Failed to load sounds:', error)
    }
})

// Update filtered sounds based on selected category
function updateFilteredSounds() {
  if (!selectedCategory.value) {
    filteredSounds.value = allSounds.value
  } else {
    filteredSounds.value = allSounds.value.filter(sound => sound.category === selectedCategory.value)
  }
  console.log('🔍 SoundPicker: Filtered sounds updated:', filteredSounds.value.length)
}

// Watch for category changes
watch(selectedCategory, () => {
  updateFilteredSounds()
})

// Debounced search function
let searchTimeout: number | null = null
function debouncedSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    searchSounds()
  }, 300)
}

function handleUrlChange(url: string) {
  soundUrl.value = url
  emit('update:modelValue', url)
}

function selectSound(sound: SoundData) {
  console.log('🔍 SoundPicker: selectSound called for:', sound.name)
  console.log('🔍 SoundPicker: sound object:', sound)
  console.log('🔍 SoundPicker: sound.blobUrl:', sound.blobUrl)
  console.log('🔍 SoundPicker: sound.filePath:', sound.filePath)
  
  // Use blob URL directly from Vercel Blob Store, then fallback to filePath
  soundUrl.value = sound.blobUrl || sound.filePath
  console.log('🔍 SoundPicker: soundUrl set to:', soundUrl.value)
  
  // Emit both the filePath (for display/organization) and blobUrl (for server playback)
  emit('update:modelValue', sound.filePath)
  emit('update:soundBlobUrl', sound.blobUrl || '')
  console.log('🔍 SoundPicker: Emitted filePath:', sound.filePath, 'and blobUrl:', sound.blobUrl)
}

function previewSound(sound: SoundData) {
  console.log('🔍 SoundPicker: previewSound called for:', sound.name)
  console.log('🔍 SoundPicker: sound object:', sound)
  console.log('🔍 SoundPicker: audioElement exists:', !!audioElement.value)
  
  if (audioElement.value) {
    // Use blob URL directly from Vercel Blob Store, then fallback to filePath
    const audioUrl = sound.blobUrl || sound.filePath
    console.log('🔍 SoundPicker: Using audio URL:', audioUrl)
    
    audioElement.value.src = audioUrl
    console.log('🔍 SoundPicker: Audio src set, attempting to play...')
    
    audioElement.value.play().then(() => {
      console.log('✅ SoundPicker: Audio playback started successfully')
    }).catch((error) => {
      console.error('❌ SoundPicker: Audio playback failed:', error)
    })
  } else {
    console.error('❌ SoundPicker: No audio element available')
  }
}

function playSound() {
  if (audioElement.value && soundUrl.value) {
    // soundUrl.value is already set to webUrl in selectSound
    audioElement.value.src = soundUrl.value
    audioElement.value.play()
  }
}

function stopSound() {
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.currentTime = 0
  }
}



function copySoundUrl(sound: SoundData) {
  navigator.clipboard.writeText(sound.filePath)
}

function filterBBCSounds() {
  // This is handled by the computed property
}

async function searchSounds() {
  if (searchQuery.value.trim()) {
    try {
      searchResults.value = searchSoundsData(searchQuery.value, selectedCategory.value)
    } catch (error) {
      console.error('❌ SoundPicker: Search failed:', error)
      searchResults.value = []
    }
  } else {
    searchResults.value = []
  }
}



function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    train: 'blue',
    station: 'green',
    city: 'orange',
    nature: 'teal',
    ambient: 'purple',
    mechanical: 'red',
    transport: 'indigo',
    industrial: 'brown'
  }
  return colors[category] || 'grey'
}

function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
}
</script>

<style scoped>
.sound-picker {
  max-width: 100%;
}

.sound-card {
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.sound-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.sound-card.selected {
  border-color: var(--v-primary-base);
  background-color: var(--v-primary-lighten5);
}

.library-card {
  border: 1px solid var(--v-border-base);
}

.cursor-pointer {
  cursor: pointer;
}
</style>
