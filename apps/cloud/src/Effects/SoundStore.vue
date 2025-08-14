<template>
  <div class="sound-store">
    <!-- Header -->
    <v-card class="mb-4">
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="mdi-music-box" class="mr-2" color="primary"></v-icon>
          Sound Store
        </div>
        <div class="d-flex align-center gap-2">
          <v-chip
            :color="storeStats.total > 0 ? 'success' : 'warning'"
            size="small"
            variant="outlined"
          >
            {{ storeStats.total }} Sounds
          </v-chip>
          
          <v-btn
            @click="refreshStore"
            :loading="refreshing"
            variant="outlined"
            size="small"
            prepend-icon="mdi-refresh"
          >
            Refresh
          </v-btn>
        </div>
      </v-card-title>
      
      <v-card-text>
        <p class="text-body-2 mb-4">
          Browse and manage your imported sound effects. Sounds are automatically categorized and tagged for easy discovery.
        </p>
        
        <!-- Store Statistics -->
        <div class="d-flex flex-wrap gap-4 mb-4">
          <div v-for="(count, category) in storeStats.byCategory" :key="category" class="text-center">
            <div class="text-h6 font-weight-bold" :class="getCategoryColor(category)">
              {{ count }}
            </div>
            <div class="text-caption text-grey">{{ category }}</div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Search and Filters -->
    <v-card class="mb-4">
      <v-card-title>
        <v-icon icon="mdi-magnify" class="mr-2" color="primary"></v-icon>
        Search & Filter
      </v-card-title>
      
      <v-card-text>
        <div class="d-flex gap-3 mb-4">
          <v-text-field
            v-model="searchQuery"
            label="Search sounds"
            placeholder="e.g., train, whistle, crowd"
            variant="outlined"
            class="flex-grow-1"
            @keyup.enter="performSearch"
            prepend-inner-icon="mdi-magnify"
          ></v-text-field>
          
          <v-select
            v-model="filterCategory"
            :items="categoryOptions"
            label="Category"
            variant="outlined"
            style="min-width: 150px"
            clearable
          ></v-select>
          
          <v-btn
            color="primary"
            @click="performSearch"
            :disabled="!searchQuery.trim() && !filterCategory"
          >
            Search
          </v-btn>
          
          <v-btn
            variant="outlined"
            @click="clearFilters"
            :disabled="!searchQuery.trim() && !filterCategory"
          >
            Clear
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Sound List -->
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <v-icon icon="mdi-playlist-music" class="mr-2" color="success"></v-icon>
          Sounds ({{ filteredSounds.length }})
        </div>
        
        <div class="d-flex gap-2">
          <v-btn
            @click="exportStore"
            variant="outlined"
            size="small"
            prepend-icon="mdi-download"
          >
            Export Store
          </v-btn>
          
          <v-btn
            @click="showImportDialog = true"
            variant="outlined"
            size="small"
            prepend-icon="mdi-upload"
          >
            Import Store
          </v-btn>
          
          <v-btn
            @click="confirmClearStore"
            color="error"
            variant="outlined"
            size="small"
            prepend-icon="mdi-delete"
          >
            Clear All
          </v-btn>
        </div>
      </v-card-title>
      
      <v-card-text>
        <!-- No sounds message -->
        <div v-if="filteredSounds.length === 0" class="text-center py-8">
          <v-icon icon="mdi-music-off" size="64" color="grey-lighten-1"></v-icon>
          <div class="text-h6 text-grey mt-4">
            {{ searchQuery || filterCategory ? 'No sounds match your search' : 'No sounds in store yet' }}
          </div>
          <div class="text-body-2 text-grey mt-2">
            {{ searchQuery || filterCategory ? 'Try adjusting your search terms' : 'Run the sound scanner to import sounds from the package' }}
          </div>
        </div>
        
        <!-- Sound grid -->
        <div v-else class="sound-grid">
          <v-card
            v-for="sound in filteredSounds"
            :key="sound.id"
            variant="outlined"
            class="sound-card"
            @click="selectSound(sound)"
          >
            <v-card-title class="text-h6 pa-4 pb-2">
              {{ sound.name }}
            </v-card-title>
            
            <v-card-text class="pa-4 pt-0">
              <div class="d-flex align-center justify-space-between mb-2">
                <v-chip
                  :color="getCategoryColor(sound.category)"
                  size="small"
                  variant="outlined"
                >
                  {{ sound.category }}
                </v-chip>
                
                <v-chip
                  :color="sound.source === 'local' ? 'success' : 'info'"
                  size="small"
                  variant="outlined"
                >
                  {{ sound.source }}
                </v-chip>
              </div>
              
              <div class="text-body-2 text-grey mb-2">
                {{ sound.filePath }}
              </div>
              
              <div v-if="sound.duration" class="text-body-2 text-grey mb-2">
                Duration: {{ formatDuration(sound.duration) }}
              </div>
              
              <div class="tags-container">
                <v-chip
                  v-for="tag in sound.tags.slice(0, 3)"
                  :key="tag"
                  size="x-small"
                  variant="tonal"
                  class="mr-1 mb-1"
                >
                  {{ tag }}
                </v-chip>
                <v-chip
                  v-if="sound.tags.length > 3"
                  size="x-small"
                  variant="tonal"
                  color="grey"
                >
                  +{{ sound.tags.length - 3 }}
                </v-chip>
              </div>
              
              <div class="text-caption text-grey mt-2">
                Imported: {{ formatDate(sound.importedAt) }}
              </div>
            </v-card-text>
            
            <v-card-actions class="pa-4 pt-0">
              <v-btn
                @click.stop="playSound(sound)"
                variant="text"
                size="small"
                prepend-icon="mdi-play"
              >
                Play
              </v-btn>
              
              <v-btn
                @click.stop="editSound(sound)"
                variant="text"
                size="small"
                prepend-icon="mdi-pencil"
              >
                Edit
              </v-btn>
              
              <v-btn
                @click.stop="deleteSound(sound)"
                variant="text"
                size="small"
                prepend-icon="mdi-delete"
                color="error"
              >
                Delete
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </v-card-text>
    </v-card>

    <!-- Sound Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon icon="mdi-pencil" class="mr-2"></v-icon>
          Edit Sound
        </v-card-title>
        
        <v-card-text v-if="editingSound">
          <v-text-field
            v-model="editingSound.name"
            label="Name"
            variant="outlined"
            class="mb-3"
          ></v-text-field>
          
          <v-select
            v-model="editingSound.category"
            :items="categoryOptions"
            label="Category"
            variant="outlined"
            class="mb-3"
          ></v-select>
          
          <v-text-field
            v-model="editingSoundTags"
            label="Tags (comma-separated)"
            variant="outlined"
            class="mb-3"
            hint="Enter tags separated by commas"
          ></v-text-field>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="editDialog = false" variant="text">Cancel</v-btn>
          <v-btn @click="saveSoundEdit" color="primary">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Import Dialog -->
    <v-dialog v-model="showImportDialog" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon icon="mdi-upload" class="mr-2"></v-icon>
          Import Sound Store
        </v-card-title>
        
        <v-card-text>
          <v-file-input
            v-model="importFile"
            label="Select store file"
            accept=".json"
            variant="outlined"
            prepend-icon="mdi-file-json"
            hint="Select a previously exported sound store file"
          ></v-file-input>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showImportDialog = false" variant="text">Cancel</v-btn>
          <v-btn @click="importStore" color="primary" :disabled="!importFile">Import</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="confirmDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          {{ confirmTitle }}
        </v-card-title>
        
        <v-card-text>
          {{ confirmMessage }}
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="confirmDialog = false" variant="text">Cancel</v-btn>
          <v-btn @click="executeConfirmAction" :color="confirmAction === 'clear' ? 'error' : 'primary'">
            {{ confirmAction === 'clear' ? 'Clear All' : 'Confirm' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { soundStoreService, type StoredSound } from '@repo/modules/effects/soundStore'

// Reactive state
const refreshing = ref(false)
const searchQuery = ref('')
const filterCategory = ref('')
const editDialog = ref(false)
const editingSound = ref<StoredSound | null>(null)
const editingSoundTags = ref('')
const showImportDialog = ref(false)
const importFile = ref<File | null>(null)
const confirmDialog = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmAction = ref<'clear' | ''>('')

// Store data
const storeStats = ref(soundStoreService.getStats())
const allSounds = ref<StoredSound[]>([])

// Computed properties
const categoryOptions = computed(() => [
  { title: 'All Categories', value: '' },
  { title: 'Train', value: 'train' },
  { title: 'Station', value: 'station' },
  { title: 'City', value: 'city' },
  { title: 'Nature', value: 'nature' },
  { title: 'Ambient', value: 'ambient' },
  { title: 'Mechanical', value: 'mechanical' },
  { title: 'Transport', value: 'transport' },
  { title: 'Industrial', value: 'industrial' }
])

const filteredSounds = computed(() => {
  let sounds = allSounds.value
  
  if (filterCategory.value) {
    sounds = sounds.filter(sound => sound.category === filterCategory.value)
  }
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    sounds = sounds.filter(sound => 
      sound.name.toLowerCase().includes(query) ||
      sound.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }
  
  return sounds
})

// Methods
function refreshStore() {
  refreshing.value = true
  try {
    storeStats.value = soundStoreService.getStats()
    allSounds.value = soundStoreService.getAllSounds()
  } finally {
    refreshing.value = false
  }
}

function performSearch() {
  // Search is handled by computed property
}

function clearFilters() {
  searchQuery.value = ''
  filterCategory.value = ''
}

function selectSound(sound: StoredSound) {
  // Handle sound selection
  console.log('Selected sound:', sound)
}

function playSound(sound: StoredSound) {
  // Handle sound playback
  console.log('Playing sound:', sound)
}

function editSound(sound: StoredSound) {
  editingSound.value = { ...sound }
  editingSoundTags.value = sound.tags.join(', ')
  editDialog.value = true
}

function saveSoundEdit() {
  if (editingSound.value) {
    const tags = editingSoundTags.value
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean)
    
    soundStoreService.updateSound(editingSound.value.id, {
      name: editingSound.value.name,
      category: editingSound.value.category,
      tags
    })
    
    editDialog.value = false
    editingSound.value = null
    editingSoundTags.value = ''
    refreshStore()
  }
}

function deleteSound(sound: StoredSound) {
  if (confirm(`Are you sure you want to delete "${sound.name}"?`)) {
    soundStoreService.removeSound(sound.id)
    refreshStore()
  }
}

function exportStore() {
  const data = soundStoreService.exportStore()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `deja-sound-store-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importStore() {
  if (!importFile.value) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const data = e.target?.result as string
    const result = soundStoreService.importStore(data)
    
    if (result.success) {
      alert(`Successfully imported ${result.imported} sounds`)
      refreshStore()
    } else {
      alert(`Import failed: ${result.errors.join(', ')}`)
    }
    
    showImportDialog.value = false
    importFile.value = null
  }
  
  reader.readAsText(importFile.value)
}

function confirmClearStore() {
  confirmTitle.value = 'Clear Sound Store'
  confirmMessage.value = 'Are you sure you want to clear all sounds? This action cannot be undone.'
  confirmAction.value = 'clear'
  confirmDialog.value = true
}

function executeConfirmAction() {
  if (confirmAction.value === 'clear') {
    soundStoreService.clearAllSounds()
    refreshStore()
    confirmDialog.value = false
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  refreshStore()
})
</script>

<style scoped>
.sound-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.sound-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.sound-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* Responsive design */
@media (max-width: 768px) {
  .sound-grid {
    grid-template-columns: 1fr;
  }
  
  .d-flex.gap-2 {
    flex-direction: column;
  }
}
</style>
