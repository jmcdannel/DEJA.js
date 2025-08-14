<template>
  <div class="sound-picker">
    <!-- Sound URL Input -->
    <div class="mb-4">
      <v-text-field
        v-model="soundUrl"
        label="Sound URL"
        variant="outlined"
        placeholder="Enter sound URL or browse curated sounds below"
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
        <v-tab value="curated">Curated Sounds</v-tab>
        <v-tab value="search">Search</v-tab>
        <v-tab value="libraries">External Libraries</v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <!-- Curated Sounds Tab -->
        <v-window-item value="curated">
          <div class="mt-4">
            <v-select
              v-model="selectedCategory"
              :items="soundCategories"
              label="Category"
              variant="outlined"
              @update:model-value="filterCuratedSounds"
            ></v-select>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <v-card
                v-for="sound in filteredCuratedSounds"
                :key="sound.id"
                class="sound-card cursor-pointer"
                @click="selectSound(sound)"
                :class="{ 'selected': sound.url === soundUrl }"
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
                  <div class="mt-2 text-xs">
                    Duration: {{ formatDuration(sound.duration) }}
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
                  <v-btn
                    icon="mdi-server"
                    size="small"
                    @click.stop="testSoundOnServer(sound)"
                    title="Test on Server"
                    color="success"
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
              @update:model-value="searchSounds"
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

        <!-- External Libraries Tab -->
        <v-window-item value="libraries">
          <div class="mt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <v-card
                v-for="library in availableLibraries"
                :key="library.name"
                class="library-card"
              >
                <v-card-title class="text-sm font-medium">
                  {{ library.name }}
                </v-card-title>
                <v-card-text class="text-xs text-gray-600">
                  <div class="mb-2">
                    <strong>License:</strong> {{ library.license }}
                  </div>
                  <div class="mb-2">
                    <strong>Categories:</strong>
                    <div class="flex flex-wrap gap-1 mt-1">
                      <v-chip
                        v-for="category in library.categories.slice(0, 5)"
                        :key="category"
                        size="x-small"
                        variant="outlined"
                      >
                        {{ category }}
                      </v-chip>
                    </div>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    size="small"
                    @click="searchExternalLibrary(library)"
                    :disabled="!library.apiKey"
                  >
                    Search Library
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </div>
        </v-window-item>
      </v-window>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { soundEffectsService, type SoundEffect, type SoundCategory } from '@repo/modules'

interface Props {
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const soundUrl = ref(props.modelValue || '')
const activeTab = ref('curated')
const selectedCategory = ref<SoundCategory | 'all'>('all')
const searchQuery = ref('')
const searchResults = ref<SoundEffect[]>([])
const audioElement = ref<HTMLAudioElement | null>(null)

const soundCategories = computed(() => [
  { title: 'All Categories', value: 'all' },
  { title: 'Train Sounds', value: 'train' },
  { title: 'Station Sounds', value: 'station' },
  { title: 'City Sounds', value: 'city' },
  { title: 'Nature Sounds', value: 'nature' },
  { title: 'Ambient Sounds', value: 'ambient' },
  { title: 'Mechanical', value: 'mechanical' },
  { title: 'Transport', value: 'transport' },
  { title: 'Industrial', value: 'industrial' }
])

const availableLibraries = computed(() => soundEffectsService.getLibraries())

const filteredCuratedSounds = computed(() => {
  if (selectedCategory.value === 'all') {
    return soundEffectsService.getAllSounds()
  }
  return soundEffectsService.getSoundsByCategory(selectedCategory.value as SoundCategory)
})

onMounted(() => {
  audioElement.value = new Audio()
})

function handleUrlChange(url: string) {
  soundUrl.value = url
  emit('update:modelValue', url)
}

function selectSound(sound: SoundEffect) {
  // Resolve the asset ID to a web URL for the cloud app
  const webUrl = soundEffectsService.getWebUrl(sound, '/sounds/')
  soundUrl.value = webUrl
  emit('update:modelValue', sound.url) // Keep the original asset ID for the server
}

function previewSound(sound: SoundEffect) {
  if (audioElement.value) {
    // Resolve the asset ID to a web URL for preview
    const webUrl = soundEffectsService.getWebUrl(sound, '/sounds/')
    audioElement.value.src = webUrl
    audioElement.value.play()
  }
}

function playSound() {
  if (audioElement.value && soundUrl.value) {
    // If it's an asset ID, resolve it to web URL
    if (soundEffectsService.isAssetIdReference(soundUrl.value)) {
      const sound = soundEffectsService.getSoundById(soundEffectsService.extractAssetId(soundUrl.value) || '')
      if (sound) {
        const webUrl = soundEffectsService.getWebUrl(sound, '/sounds/')
        audioElement.value.src = webUrl
      }
    } else {
      audioElement.value.src = soundUrl.value
    }
    audioElement.value.play()
  }
}

function stopSound() {
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.currentTime = 0
  }
}

// New function to test sound on server via Firebase
async function testSoundOnServer(sound: SoundEffect) {
  try {
    // Create a temporary effect in Firebase to trigger server playback
    const testEffect = {
      id: `test-sound-${Date.now()}`,
      name: `Test: ${sound.name}`,
      type: 'sound',
      sound: sound.url, // Use the asset ID reference
      state: true,
      device: 'test-device',
      timestamp: new Date().toISOString()
    }
    
    // Import Firebase functions
    const { db } = await import('@repo/firebase-config')
    const { doc, setDoc } = await import('firebase/firestore')
    
    // Add to a test collection that the server can monitor
    const testRef = doc(db, 'testEffects', testEffect.id)
    await setDoc(testRef, testEffect)
    
    console.log('Testing sound on server via Firebase:', testEffect)
    alert(`Sound "${sound.name}" sent to server via Firebase. Check server logs for playback.`)
    
    // Clean up the test effect after a delay
    setTimeout(async () => {
      try {
        const { deleteDoc } = await import('firebase/firestore')
        await deleteDoc(testRef)
        console.log('Test effect cleaned up')
      } catch (error) {
        console.error('Error cleaning up test effect:', error)
      }
    }, 5000)
    
  } catch (error) {
    console.error('Error testing sound on server:', error)
    alert('Error testing sound on server')
  }
}

function copySoundUrl(sound: SoundEffect) {
  navigator.clipboard.writeText(sound.url)
}

function filterCuratedSounds() {
  // This is handled by the computed property
}

function searchSounds() {
  if (searchQuery.value.trim()) {
    searchResults.value = soundEffectsService.searchSounds(searchQuery.value)
  } else {
    searchResults.value = []
  }
}

function searchExternalLibrary(library: any) {
  // Placeholder for external library search
  console.log('Searching external library:', library.name)
}

function getCategoryColor(category: SoundCategory): string {
  const colors: Record<SoundCategory, string> = {
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
