<template>
  <div class="bbc-sound-importer">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-download" class="mr-2" color="blue"></v-icon>
        BBC Sound Effects Importer
      </v-card-title>
      
      <v-card-text>
        <p class="text-body-2 mb-4">
          Import sounds from the BBC Sound Effects Library. Paste a BBC sound URL below to download 
          the MP3 file and metadata, then add it to your local sound collection. 
          Sounds will be played on the <strong>DEJA Server</strong> device.
        </p>

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

    <!-- Imported Sounds List -->
    <v-card class="mt-6">
      <v-card-title>Recently Imported Sounds</v-card-title>
      <v-card-text>
        <div v-if="importedSounds.length === 0" class="text-center py-8 text-grey">
          No sounds imported yet
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="sound in importedSounds"
            :key="sound.id"
            class="d-flex align-center justify-space-between p-3 bg-grey-lighten-4 rounded"
          >
            <div>
              <div class="font-weight-medium">{{ sound.name }}</div>
              <div class="text-caption text-grey">
                {{ sound.category }} • {{ formatDuration(sound.duration) }} • BBC
              </div>
            </div>
            <v-btn
              icon="mdi-play"
              size="small"
              @click="playSound(sound.url)"
            ></v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { soundEffectsService, type SoundEffect, type SoundCategory } from '@repo/modules'

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

const soundCategories = [
  { title: 'Train Sounds', value: 'train' },
  { title: 'Station Sounds', value: 'value' },
  { title: 'City Sounds', value: 'city' },
  { title: 'Nature Sounds', value: 'nature' },
  { title: 'Ambient Sounds', value: 'ambient' },
  { title: 'Mechanical', value: 'mechanical' },
  { title: 'Transport', value: 'transport' },
  { title: 'Industrial', value: 'industrial' }
]

const canImport = computed(() => {
  return soundPreview.value && selectedCategory.value && !importing.value
})

const urlRule = (value: string) => {
  if (!value) return 'BBC URL is required'
  if (!value.includes('sound-effects.bbcrewind.co.uk')) {
    return 'Please enter a valid BBC Sound Effects Library URL'
  }
  return true
}

async function parseUrl() {
  if (!bbcUrl.value) return
  
  try {
    urlError.value = ''
    
    // Extract BBC sound ID from URL
    const url = new URL(bbcUrl.value)
    const searchParams = new URLSearchParams(url.search)
    const query = searchParams.get('q')
    
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
    // For now, we'll simulate the import process
    // In a real implementation, this would call a Vercel API route
    // that handles the actual BBC sound download and storage
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Create mock response (this would come from the API)
    const mockResult = {
      success: true,
      result: {
        soundId: `bbc-${soundPreview.value!.bbcId}`,
        filePath: `/sounds/${selectedCategory.value}/bbc-${soundPreview.value!.bbcId}.mp3`,
        metadata: {
          id: soundPreview.value!.bbcId,
          title: customName.value || soundPreview.value!.title,
          category: selectedCategory.value,
          duration: soundPreview.value!.duration,
          tags: [
            'bbc',
            'professional',
            'high-quality',
            ...customTags.value ? customTags.value.split(',').map(tag => tag.trim()).filter(Boolean) : []
          ],
          source: 'bbc',
          license: 'BBC RemArc Licence',
          attribution: 'BBC Sound Effects Library'
        }
      },
      error: undefined
    }
    
    const result = mockResult
    
    if (result.success && result.result) {
      // Create the imported sound object
      const importedSound: SoundEffect = {
        id: result.result.soundId,
        name: result.result.metadata.title,
        category: result.result.metadata.category as SoundCategory,
        url: `/sounds/${result.result.metadata.category}/${result.result.soundId}.mp3`,
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
      
      // Show success message
      importStatus.value = {
        type: 'success',
        title: 'Sound Imported Successfully!',
        message: `${importedSound.name} has been added to your ${importedSound.category} sounds collection.`
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
</script>

<style scoped>
.bbc-sound-importer {
  max-width: 800px;
  margin: 0 auto;
}

.space-y-3 > * + * {
  margin-top: 12px;
}
</style>
