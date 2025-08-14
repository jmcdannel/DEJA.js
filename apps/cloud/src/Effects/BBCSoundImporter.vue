<template>
  <div class="bbc-sound-importer">
    <!-- Header with API Status -->
    <v-card class="mb-4">
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="mdi-download" class="mr-2" color="blue"></v-icon>
          BBC Sound Effects Importer
        </div>
        <div class="d-flex align-center gap-2">
          <!-- Proxy Status Indicator -->
          <v-chip
            v-if="isDevelopment"
            color="info"
            size="small"
            variant="outlined"
            class="mr-2"
          >
            <v-icon icon="mdi-server-network" class="mr-1"></v-icon>
            Proxy: {{ getProxyMode() }}
          </v-chip>
          
          <v-chip
            :color="apiStatus === 'online' ? 'success' : 'error'"
            size="small"
            class="mr-2"
          >
            <v-icon :icon="apiStatus === 'online' ? 'mdi-check-circle' : 'mdi-alert-circle'" class="mr-1"></v-icon>
            {{ apiStatus === 'online' ? 'API Online' : 'API Offline' }}
          </v-chip>
          <v-btn
            icon="mdi-refresh"
            size="small"
            variant="text"
            @click="checkApiStatus"
            :loading="checkingApi"
            title="Check API Status"
          ></v-btn>
        </div>
      </v-card-title>
      
      <v-card-text>
        <p class="text-body-2 mb-4">
          Import sounds from the BBC Sound Effects Library. Search directly or paste a BBC sound URL below to download 
          the MP3 file and metadata, then add it to your local sound collection. 
          Sounds will be played on the <strong>DEJA Server</strong> device.
        </p>
      </v-card-text>
    </v-card>

    <!-- BBC Search Interface -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon icon="mdi-magnify" class="mr-2" color="primary"></v-icon>
        Search BBC Sound Effects
      </v-card-title>
      
      <v-card-text>
        <div class="d-flex gap-3 mb-4">
          <v-text-field
            v-model="searchQuery"
            label="Search for sounds"
            placeholder="e.g., train, whistle, station, crowd"
            variant="outlined"
            class="flex-grow-1"
            @keyup.enter="searchBBCSounds"
          ></v-text-field>
          
          <v-select
            v-model="searchCategory"
            :items="searchCategories"
            label="Category"
            variant="outlined"
            style="min-width: 150px"
          ></v-select>
          
          <v-btn
            color="primary"
            @click="searchBBCSounds"
            :loading="searching"
            :disabled="!searchQuery.trim()"
          >
            <v-icon icon="mdi-magnify" class="mr-2"></v-icon>
            Search
          </v-btn>
        </div>

        <!-- Search Results -->
        <div v-if="searchResults.length > 0" class="mt-4">
          <h3 class="text-h6 mb-3">Search Results ({{ searchResults.length }})</h3>
          <div class="search-results">
            <v-card
              v-for="result in searchResults"
              :key="result.id"
              variant="outlined"
              class="mb-3 pa-3"
            >
              <div class="d-flex align-center justify-space-between">
                <div class="flex-grow-1">
                  <div class="font-weight-medium">{{ result.title }}</div>
                  <div class="text-caption text-grey">
                    {{ result.category }} • {{ formatDuration(result.duration) }} • BBC Sound Effects Library
                  </div>
                  <div class="text-caption text-blue-darken-1">
                    Licensed under BBC RemArc Licence
                  </div>
                </div>
                <div class="d-flex align-center">
                  <v-btn
                    size="small"
                    variant="outlined"
                    @click="previewSearchResult(result)"
                    class="mr-2"
                  >
                    <v-icon icon="mdi-eye" class="mr-1"></v-icon>
                    Preview
                  </v-btn>
                  <v-btn
                    size="small"
                    color="primary"
                    @click="importFromSearch(result)"
                  >
                    <v-icon icon="mdi-download" class="mr-1"></v-icon>
                    Import
                  </v-btn>
                </div>
              </div>
            </v-card>
          </div>
        </div>

        <!-- Search Status -->
        <div v-if="searchStatus" class="mt-3">
          <v-alert
            :type="searchStatus.type"
            :title="searchStatus.title"
            :text="searchStatus.message"
            variant="tonal"
          ></v-alert>
        </div>
      </v-card-text>
    </v-card>

    <!-- Direct URL Import -->
    <v-card class="mb-4 import-from-url">
      <v-card-title>
        <v-icon icon="mdi-link" class="mr-2" color="secondary"></v-icon>
        Import from URL
      </v-card-title>
      
      <v-card-text>
        <!-- BBC URL Input -->
        <v-text-field
          v-model="bbcUrl"
          label="BBC Sound Effects URL"
          placeholder="https://sound-effects.bbcrewind.co.uk/search?q=..."
          variant="outlined"
          :rules="[urlRule]"
          @update:model-value="parseUrl"
        >
          <template #append>
            <v-btn
              icon="mdi-content-paste"
              size="small"
              @click="pasteFromClipboard"
              title="Paste from clipboard"
            ></v-btn>
          </template>
        </v-text-field>

        <!-- URL Validation -->
        <div v-if="urlError" class="text-error text-caption mt-1">
          {{ urlError }}
        </div>

        <!-- Sound Preview -->
        <div v-if="soundPreview" class="mt-4">
          <v-card variant="outlined" class="pa-4">
            <h3 class="text-h6 mb-3">Sound Preview</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Title:</strong> {{ soundPreview.title }}
              </div>
              <div>
                <strong>Duration:</strong> {{ formatDuration(soundPreview.duration) }}
              </div>
              <div>
                <strong>Category:</strong> 
                <v-chip size="small" :color="getCategoryColor(soundPreview.category)">
                  {{ soundPreview.category }}
                </v-chip>
              </div>
              <div>
                <strong>Source:</strong> BBC Sound Effects Library
              </div>
            </div>
            
            <!-- Audio Preview -->
            <div class="mt-4">
              <audio 
                v-if="audioUrl" 
                :src="audioUrl" 
                controls 
                class="w-full"
              ></audio>
            </div>

            <!-- Import Options -->
            <div class="mt-4">
              <!-- BBC Attribution Alert -->
              <v-alert
                type="info"
                variant="tonal"
                title="BBC Sound Effects Library"
                text="Sounds are licensed under BBC RemArc Licence. Educational and personal use permitted. Commercial use requires separate licensing."
                class="mb-3"
              >
                <template #append>
                  <v-btn
                    size="small"
                    variant="text"
                    href="https://sound-effects.bbcrewind.co.uk/licensing"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View License
                  </v-btn>
                </template>
              </v-alert>
              
              <v-alert
                type="info"
                variant="tonal"
                title="Device: DEJA Server"
                text="This sound will be played on the DEJA Server device. No additional hardware required."
                class="mb-3"
              ></v-alert>
              
              <v-select
                v-model="selectedCategory"
                :items="soundCategories"
                label="Import Category"
                variant="outlined"
                class="mb-3"
              ></v-select>
              
              <v-text-field
                v-model="customTags"
                label="Additional Tags (comma-separated)"
                placeholder="e.g., bbc, professional, high-quality"
                variant="outlined"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="customName"
                label="Custom Name (optional)"
                placeholder="Leave empty to use BBC title"
                variant="outlined"
                class="mb-3"
              ></v-text-field>
            </div>
          </v-card>
        </div>

        <!-- Import Actions -->
        <div v-if="soundPreview" class="mt-4 d-flex gap-2">
          <v-btn
            color="primary"
            @click="importSound"
            :loading="importing"
            :disabled="!canImport"
          >
            <v-icon icon="mdi-download" class="mr-2"></v-icon>
            Import Sound
          </v-btn>
          
          <v-btn
            variant="outlined"
            @click="resetForm"
          >
            Reset
          </v-btn>
        </div>

        <!-- Import Status -->
        <div v-if="importStatus" class="mt-4">
          <v-alert
            :type="importStatus.type"
            :title="importStatus.title"
            :text="importStatus.message"
            variant="tonal"
          ></v-alert>
        </div>
      </v-card-text>
    </v-card>

    <!-- Imported Sounds Management -->
    <v-card class="mb-4">
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="mdi-music-note" class="mr-2" color="success"></v-icon>
          Imported Sounds ({{ importedSounds.length }})
        </div>
        <div class="d-flex align-center">
          <v-btn
            size="small"
            variant="outlined"
            @click="exportSoundList"
            class="mr-2"
          >
            <v-icon icon="mdi-download" class="mr-1"></v-icon>
            Export List
          </v-btn>
          <v-btn
            size="small"
            color="error"
            variant="outlined"
            @click="clearAllSounds"
            :disabled="importedSounds.length === 0"
          >
            <v-icon icon="mdi-delete" class="mr-1"></v-icon>
            Clear All
          </v-btn>
        </div>
      </v-card-title>
      
      <v-card-text>
        <div v-if="importedSounds.length === 0" class="text-center py-8 text-grey">
          <v-icon icon="mdi-music-note-off" size="48" class="mb-3"></v-icon>
          <div class="text-h6 mb-2">No sounds imported yet</div>
          <div class="text-body-2">Start by searching for sounds or importing from a URL</div>
        </div>
        
        <div v-else>
          <!-- Sound Filters -->
          <div class="d-flex gap-3 mb-4">
            <v-select
              v-model="filterCategory"
              :items="filterCategories"
              label="Filter by Category"
              variant="outlined"
              style="min-width: 150px"
              clearable
            ></v-select>
            
            <v-text-field
              v-model="filterSearch"
              label="Search sounds"
              placeholder="Search by name or tags"
              variant="outlined"
              class="flex-grow-1"
              prepend-inner-icon="mdi-magnify"
            ></v-text-field>
          </div>

          <!-- Filtered Sounds List -->
          <div class="filtered-sounds">
            <v-card
              v-for="sound in filteredSounds"
              :key="sound.id"
              variant="outlined"
              class="mb-3 pa-3"
            >
              <div class="d-flex align-center justify-space-between">
                <div class="flex-grow-1">
                  <div class="font-weight-medium">{{ sound.name }}</div>
                  <div class="text-caption text-grey">
                    {{ sound.category }} • {{ formatDuration(sound.duration) }} • BBC Sound Effects Library
                  </div>
                  <div class="text-caption text-blue-darken-1">
                    Licensed under BBC RemArc Licence
                  </div>
                  <div class="text-caption text-grey-darken-1 mt-1">
                    Tags: {{ sound.tags.join(', ') }}
                  </div>
                </div>
                <div class="d-flex align-center">
                  <v-btn
                    icon="mdi-play"
                    size="small"
                    @click="playSound(sound.url)"
                    class="mr-2"
                    title="Play sound"
                    color="success"
                  ></v-btn>
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    @click="editSound(sound)"
                    class="mr-2"
                    title="Edit sound"
                  ></v-btn>
                  <v-btn
                    icon="mdi-information"
                    size="small"
                    variant="text"
                    href="https://sound-effects.bbcrewind.co.uk/licensing"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View BBC License"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="deleteSound(sound)"
                    title="Delete sound"
                  ></v-btn>
                </div>
              </div>
            </v-card>
          </div>

          <!-- No Results Message -->
          <div v-if="filteredSounds.length === 0 && (filterCategory || filterSearch)" class="text-center py-4 text-grey">
            No sounds match your filters
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Sound Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="500">
      <v-card>
        <v-card-title>Edit Sound</v-card-title>
        <v-card-text v-if="editingSound">
          <v-text-field
            v-model="editingSound.name"
            label="Sound Name"
            variant="outlined"
            class="mb-3"
          ></v-text-field>
          
          <v-select
            v-model="editingSound.category"
            :items="soundCategories"
            label="Category"
            variant="outlined"
            class="mb-3"
          ></v-select>
          
          <v-text-field
            v-model="editingSoundTags"
            label="Tags (comma-separated)"
            variant="outlined"
            class="mb-3"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="editDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveSoundEdit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="confirmDialog" max-width="400">
      <v-card>
        <v-card-title>{{ confirmTitle }}</v-card-title>
        <v-card-text>{{ confirmMessage }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="confirmDialog = false">Cancel</v-btn>
          <v-btn :color="confirmAction === 'delete' ? 'error' : 'primary'" @click="executeConfirmAction">
            {{ confirmAction === 'delete' ? 'Delete' : 'Confirm' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { soundEffectsService, type SoundEffect, type SoundCategory } from '@repo/modules'
import { validateBBCUrl, extractSearchQuery } from '@/config/bbc-api'

// Proxy configuration for development
const PROXY_CONFIG = {
  // Development proxy endpoints
  bbcApi: import.meta.env.DEV ? '/api/bbc' : 'https://sound-effects.bbcrewind.co.uk',
  bbcAudio: import.meta.env.DEV ? '/api/bbc-audio' : 'https://sound-effects.bbcrewind.co.uk/audio',
  bbcSearch: import.meta.env.DEV ? '/api/bbc-search' : 'https://sound-effects.bbcrewind.co.uk/search',
  
  // Local API endpoint
  localApi: import.meta.env.DEV ? '/api/bbc-sounds/import' : '/api/bbc-sounds/import',
  
  // Mock API endpoint
  mockApi: import.meta.env.DEV ? '/api/mock' : null
}

interface ImportStatus {
  type: 'success' | 'error' | 'info'
  title: string
  message: string
}

interface BBCSoundPreview {
  title: string
  duration: number
  category: SoundCategory
  bbcId: string
}

interface BBCSearchResult {
  id: string
  title: string
  duration: number
  category: SoundCategory
  bbcId: string
  downloadUrl: string
}

interface SearchStatus {
  type: 'success' | 'error' | 'info'
  title: string
  message: string
}

// API Status
const apiStatus = ref<'online' | 'offline' | 'checking'>('offline')
const checkingApi = ref(false)

// Search Interface
const searchQuery = ref('')
const searchCategory = ref<SoundCategory | ''>('')
const searching = ref(false)
const searchResults = ref<BBCSearchResult[]>([])
const searchStatus = ref<SearchStatus | null>(null)

// Import Interface
const bbcUrl = ref('')
const urlError = ref('')
const soundPreview = ref<BBCSoundPreview | null>(null)
const audioUrl = ref('')
const selectedCategory = ref<SoundCategory>('train')
const customTags = ref('')
const customName = ref('')
const importing = ref(false)
const importStatus = ref<ImportStatus | null>(null)
const importedSounds = ref<SoundEffect[]>([])

// Sound Management
const filterCategory = ref<SoundCategory | ''>('')
const filterSearch = ref('')
const editDialog = ref(false)
const editingSound = ref<SoundEffect | null>(null)
const editingSoundTags = ref('')

// Confirmation Dialog
const confirmDialog = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmAction = ref<'delete' | 'clear' | ''>('')
const confirmCallback = ref<(() => void) | null>(null)

const soundCategories = [
  { title: 'Train Sounds', value: 'train' },
  { title: 'Station Sounds', value: 'station' },
  { title: 'City Sounds', value: 'city' },
  { title: 'Nature Sounds', value: 'nature' },
  { title: 'Ambient Sounds', value: 'ambient' },
  { title: 'Mechanical', value: 'mechanical' },
  { title: 'Transport', value: 'transport' },
  { title: 'Industrial', value: 'industrial' }
]

const searchCategories = [
  { title: 'All Categories', value: '' },
  ...soundCategories
]

const filterCategories = [
  { title: 'All Categories', value: '' },
  ...soundCategories
]

const canImport = computed(() => {
  return soundPreview.value && selectedCategory.value && !importing.value
})

// Development mode detection
const isDevelopment = computed(() => import.meta.env.DEV)

// Filtered sounds based on category and search
const filteredSounds = computed(() => {
  let sounds = importedSounds.value

  if (filterCategory.value) {
    sounds = sounds.filter(sound => sound.category === filterCategory.value)
  }

  if (filterSearch.value) {
    const search = filterSearch.value.toLowerCase()
    sounds = sounds.filter(sound => 
      sound.name.toLowerCase().includes(search) ||
      sound.tags.some(tag => tag.toLowerCase().includes(search))
    )
  }

  return sounds
})

const urlRule = (value: string) => {
  if (!value) return 'BBC URL is required'
  if (!validateBBCUrl(value)) {
    return 'Please enter a valid BBC Sound Effects Library URL'
  }
  return true
}

async function parseUrl() {
  if (!bbcUrl.value) return
  
  try {
    urlError.value = ''
    
    // Extract BBC sound ID from URL using helper function
    const query = extractSearchQuery(bbcUrl.value)
    
    if (!query) {
      urlError.value = 'Could not extract sound query from URL'
      return
    }

    // For now, we'll create a mock preview based on the query
    // In a real implementation, you'd fetch the actual metadata from BBC
    const mockPreview: BBCSoundPreview = {
      title: `BBC Sound: ${query}`,
      duration: 5000, // Default duration, would come from BBC API
      category: 'train' as SoundCategory, // Would be determined from BBC metadata
      bbcId: query
    }
    
    soundPreview.value = mockPreview
    
    // Generate a mock audio URL (in real implementation, this would be the actual BBC audio URL)
    audioUrl.value = `https://sound-effects.bbcrewind.co.uk/audio/${query}.mp3`
    
  } catch (error) {
    urlError.value = 'Invalid URL format'
    console.error('Error parsing URL:', error)
  }
}

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText()
    bbcUrl.value = text
    await parseUrl()
  } catch (error) {
    console.error('Failed to read clipboard:', error)
  }
}

async function importSound() {
  if (!soundPreview.value) return
  
  importing.value = true
  importStatus.value = null
  
  try {
    // Call the Vercel API route for BBC sound import
    const response = await fetch('/api/bbc-sounds/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bbcUrl: bbcUrl.value,
        category: selectedCategory.value,
        customName: customName.value,
        customTags: customTags.value ? customTags.value.split(',').map(tag => tag.trim()).filter(Boolean) : []
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.success && result.result) {
      // Create the imported sound object
      const importedSound: SoundEffect = {
        id: result.result.soundId,
        name: result.result.metadata.title,
        category: result.result.metadata.category as SoundCategory,
        url: result.result.filePath, // Use the actual storage URL from the API
        duration: result.result.metadata.duration,
        tags: result.result.metadata.tags,
        source: 'bbc',
        license: result.result.metadata.license,
        attribution: result.result.metadata.attribution
      }
      
      // Add to the sound service
      soundEffectsService.addCustomSound(importedSound)
      
      // Add to imported sounds list
      importedSounds.value.unshift(importedSound)
      
      // Show success message with BBC attribution
      importStatus.value = {
        type: 'success',
        title: 'Sound Imported Successfully!',
        message: `${importedSound.name} has been added to your ${importedSound.category} sounds collection. BBC Sound Effects Library - Licensed under BBC RemArc Licence.`
      }
      
      // Reset form
      resetForm()
      
    } else {
      throw new Error(result.error || 'Import failed')
    }
    
  } catch (error) {
    importStatus.value = {
      type: 'error',
      title: 'Import Failed',
      message: `Failed to import sound: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
    console.error('Import error:', error)
  } finally {
    importing.value = false
  }
}

function resetForm() {
  bbcUrl.value = ''
  urlError.value = ''
  soundPreview.value = null
  audioUrl.value = ''
  selectedCategory.value = 'train'
  customTags.value = ''
  customName.value = ''
  importStatus.value = null
}

function playSound(url: string) {
  // Create a temporary audio element to play the sound
  const audio = new Audio(url)
  audio.play().catch(error => {
    console.error('Failed to play sound:', error)
  })
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

// Helper function to get proxy mode for display
function getProxyMode(): string {
  if (!import.meta.env.DEV) return 'Production'
  
  // Check environment variables for proxy mode
  const proxyMode = import.meta.env.VITE_PROXY_MODE || 'bbc'
  const useMock = import.meta.env.VITE_USE_MOCK_API === 'true'
  
  if (useMock) return 'Mock API'
  if (proxyMode === 'bbc') return 'BBC Proxy'
  if (proxyMode === 'local') return 'Local API'
  
  return 'Custom'
}

// API Status Functions
async function checkApiStatus() {
  checkingApi.value = true
  try {
    // Check if the BBC API is accessible
    const response = await fetch('https://sound-effects.bbcrewind.co.uk')
    apiStatus.value = response.ok ? 'online' : 'offline'
  } catch (error) {
    apiStatus.value = 'offline'
    console.error('BBC API check failed:', error)
  } finally {
    checkingApi.value = false
  }
}

// Search Functions
async function searchBBCSounds() {
  if (!searchQuery.value.trim()) return
  
  searching.value = true
  searchStatus.value = null
  
  try {
    // Mock search results for now
    // In production, this would call the actual BBC API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockResults: BBCSearchResult[] = [
      {
        id: `search-${Date.now()}-1`,
        title: `BBC Sound: ${searchQuery.value}`,
        duration: Math.floor(Math.random() * 10000) + 2000,
        category: searchCategory.value || 'train',
        bbcId: searchQuery.value,
        downloadUrl: `https://sound-effects.bbcrewind.co.uk/audio/${searchQuery.value}.mp3`
      },
      {
        id: `search-${Date.now()}-2`,
        title: `BBC Sound: ${searchQuery.value} Extended`,
        duration: Math.floor(Math.random() * 15000) + 5000,
        category: searchCategory.value || 'ambient',
        bbcId: `${searchQuery.value}-extended`,
        downloadUrl: `https://sound-effects.bbcrewind.co.uk/audio/${searchQuery.value}-extended.mp3`
      }
    ]
    
    searchResults.value = mockResults
    searchStatus.value = {
      type: 'success',
      title: 'Search Complete',
      message: `Found ${mockResults.length} sounds matching "${searchQuery.value}"`
    }
    
  } catch (error) {
    searchStatus.value = {
      type: 'error',
      title: 'Search Failed',
      message: `Failed to search BBC sounds: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
    console.error('BBC search error:', error)
  } finally {
    searching.value = false
  }
}

function previewSearchResult(result: BBCSearchResult) {
  // Set up the sound preview for import
  soundPreview.value = {
    title: result.title,
    duration: result.duration,
    category: result.category,
    bbcId: result.bbcId
  }
  
  audioUrl.value = result.downloadUrl
  selectedCategory.value = result.category
  customTags.value = 'bbc, professional, high-quality'
  
  // Scroll to import section
  document.querySelector('.import-from-url')?.scrollIntoView({ behavior: 'smooth' })
}

async function importFromSearch(result: BBCSearchResult) {
  // Set up the import data
  soundPreview.value = {
    title: result.title,
    duration: result.duration,
    category: result.category,
    bbcId: result.bbcId
  }
  
  audioUrl.value = result.downloadUrl
  selectedCategory.value = result.category
  customTags.value = 'bbc, professional, high-quality'
  
  // Trigger the import
  await importSound()
}

// Sound Management Functions
function exportSoundList() {
  const data = filteredSounds.value.map(sound => ({
    name: sound.name,
    category: sound.category,
    duration: sound.duration,
    tags: sound.tags,
    source: sound.source,
    license: sound.license,
    attribution: sound.attribution
  }))
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'bbc-sounds-export.json'
  a.click()
  URL.revokeObjectURL(url)
}

function clearAllSounds() {
  confirmTitle.value = 'Clear All Sounds'
  confirmMessage.value = `Are you sure you want to delete all ${importedSounds.value.length} imported sounds? This action cannot be undone.`
  confirmAction.value = 'clear'
  confirmCallback.value = () => {
    importedSounds.value = []
    soundEffectsService.clearAllCustomSounds()
    confirmDialog.value = false
  }
  confirmDialog.value = true
}

function editSound(sound: SoundEffect) {
  editingSound.value = { ...sound }
  editingSoundTags.value = sound.tags.join(', ')
  editDialog.value = true
}

function saveSoundEdit() {
  if (!editingSound.value) return
  
  const updatedSound: SoundEffect = {
    ...editingSound.value,
    tags: editingSoundTags.value.split(',').map(tag => tag.trim()).filter(Boolean)
  }
  
  // Update in the service
  soundEffectsService.updateCustomSound(updatedSound)
  
  // Update in local list
  const index = importedSounds.value.findIndex(s => s.id === updatedSound.id)
  if (index !== -1) {
    importedSounds.value[index] = updatedSound
  }
  
  editDialog.value = false
  editingSound.value = null
}

function deleteSound(sound: SoundEffect) {
  confirmTitle.value = 'Delete Sound'
  confirmMessage.value = `Are you sure you want to delete "${sound.name}"? This action cannot be undone.`
  confirmAction.value = 'delete'
  confirmCallback.value = () => {
    // Remove from service
    soundEffectsService.removeCustomSound(sound.id)
    
    // Remove from local list
    importedSounds.value = importedSounds.value.filter(s => s.id !== sound.id)
    
    confirmDialog.value = false
  }
  confirmDialog.value = true
}

function executeConfirmAction() {
  if (confirmCallback.value) {
    confirmCallback.value()
  }
}

// Initialize API status on mount
onMounted(() => {
  checkApiStatus()
})
</script>

<style scoped>
.bbc-sound-importer {
  max-width: 1000px;
  margin: 0 auto;
}

.space-y-3 > * + * {
  margin-top: 12px;
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
}

.filtered-sounds {
  max-height: 500px;
  overflow-y: auto;
}

.v-card {
  transition: all 0.2s ease-in-out;
}

.v-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.import-from-url {
  scroll-margin-top: 20px;
}

/* Responsive grid for search results */
@media (max-width: 768px) {
  .d-flex.gap-3 {
    flex-direction: column;
    gap: 16px !important;
  }
  
  .search-results,
  .filtered-sounds {
    max-height: 300px;
  }
}
</style>
