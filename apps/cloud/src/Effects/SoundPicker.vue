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
        <v-tab value="curated">Sound Store</v-tab>
        <v-tab value="search">Search</v-tab>
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
                  <div v-if="sound.duration" class="mt-2 text-xs">
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


      </v-window>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { soundStoreService, type StoredSound } from '@repo/modules/effects/soundStore'

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
const selectedCategory = ref<string>('')
const searchQuery = ref('')
const searchResults = ref<StoredSound[]>([])
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

const filteredCuratedSounds = computed(() => {
  if (!selectedCategory.value) {
    return soundStoreService.getAllSounds()
  }
  return soundStoreService.getSoundsByCategory(selectedCategory.value)
})

onMounted(() => {
  audioElement.value = new Audio()
})

function handleUrlChange(url: string) {
  soundUrl.value = url
  emit('update:modelValue', url)
}

function selectSound(sound: StoredSound) {
  soundUrl.value = sound.filePath
  emit('update:modelValue', sound.filePath)
}

function previewSound(sound: StoredSound) {
  if (audioElement.value) {
    audioElement.value.src = sound.filePath
    audioElement.value.play()
  }
}

function playSound() {
  if (audioElement.value && soundUrl.value) {
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



function copySoundUrl(sound: StoredSound) {
  navigator.clipboard.writeText(sound.filePath)
}

function filterCuratedSounds() {
  // This is handled by the computed property
}

function searchSounds() {
  if (searchQuery.value.trim()) {
    searchResults.value = soundStoreService.searchSounds(searchQuery.value, selectedCategory.value)
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
