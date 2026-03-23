<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { soundFileService, type SoundFile } from '@/Effects/Sounds/SoundFileService'
import { createLogger } from '@repo/utils'
import SoundListItem from '@/Sounds/SoundListItem.vue'
import EmptyState from '@/Core/UI/EmptyState.vue'

const log = createLogger('SoundList')

const emit = defineEmits<{
  edit: [sound: SoundFile]
}>()

const soundFiles = ref<SoundFile[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const playingUrl = ref<string | null>(null)

const filteredSoundFiles = computed(() => {
  if (!searchQuery.value) return soundFiles.value
  const query = searchQuery.value.toLowerCase()
  return soundFiles.value.filter((sound) =>
    sound.name.toLowerCase().includes(query),
  )
})

onMounted(() => {
  loadSoundFiles()
})

onUnmounted(() => {
  playingUrl.value = null
})

async function loadSoundFiles() {
  loading.value = true
  error.value = null

  try {
    soundFiles.value = await soundFileService.listSoundFiles()
  } catch (err) {
    error.value = 'Failed to load sound files. Please try again.'
    log.error('Error loading sound files:', err)
  } finally {
    loading.value = false
  }
}

async function handleDelete(sound: SoundFile) {
  if (!sound.pathname) return

  try {
    await soundFileService.deleteSoundFile(sound.pathname)
    soundFiles.value = soundFiles.value.filter((s) => s.url !== sound.url)
  } catch (err) {
    log.error('Error deleting sound file:', err)
    error.value = 'Failed to delete sound file.'
  }
}

function handlePlay(url: string) {
  playingUrl.value = url
}

function handleStop() {
  playingUrl.value = null
}
</script>
<template>
  <div class="mb-4">
    <v-text-field
      v-model="searchQuery"
      placeholder="Search sounds..."
      variant="outlined"
      density="compact"
      prepend-inner-icon="mdi-magnify"
      clearable
      hide-details
      color="primary"
      bg-color="surface"
    />
    <div v-if="searchQuery && !loading" class="text-xs opacity-60 mt-1">
      {{ filteredSoundFiles.length }} of {{ soundFiles.length }} sounds
    </div>
  </div>

  <div v-if="loading" class="text-center py-8">
    <v-progress-circular indeterminate color="primary" size="32" class="mb-3" />
    <p class="opacity-60 text-sm">Loading sounds...</p>
  </div>

  <div v-else-if="error" class="text-center py-10">
    <v-alert type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
    <v-btn @click="loadSoundFiles" color="primary" variant="tonal">Retry</v-btn>
  </div>

  <template v-else-if="filteredSoundFiles.length === 0 && !searchQuery">
    <EmptyState
      icon="mdi-volume-high"
      color="sky"
      title="No Sounds Yet"
      description="Upload audio files to build your sound library. Sounds can be used in effects to trigger audio playback on your layout."
      :use-cases="[
        { icon: 'mdi-train', text: 'Train Whistles' },
        { icon: 'mdi-bullhorn', text: 'Station Announcements' },
        { icon: 'mdi-nature', text: 'Ambient Sounds' },
        { icon: 'mdi-cog', text: 'Mechanical Effects' },
      ]"
      action-label="Upload Sound"
      action-to="/sounds/new"
    />
  </template>

  <template v-else>
    <v-row>
      <v-col cols="6" sm="4" md="3" lg="2">
        <slot name="prepend" />
      </v-col>
      <v-col
        v-for="sound in filteredSoundFiles"
        :key="sound.url"
        cols="6"
        sm="4"
        md="3"
        lg="2"
      >
        <SoundListItem
          :sound="sound"
          :is-playing="playingUrl === sound.url"
          @edit="emit('edit', sound)"
          @delete="handleDelete(sound)"
          @play="handlePlay(sound.url)"
          @stop="handleStop"
        />
      </v-col>
    </v-row>
  </template>
</template>
