<script setup lang="ts">
import { ref } from 'vue'
import type { SoundFile } from '@/Effects/Sounds/SoundFileService'

defineProps<{
  sound: SoundFile
  isPlaying: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  play: []
  stop: []
}>()

const audioEl = ref<HTMLAudioElement | null>(null)
const duration = ref<number | null>(null)
const showDeleteConfirm = ref(false)

function onMetadataLoaded(event: Event) {
  const audio = event.target as HTMLAudioElement
  duration.value = audio.duration * 1000
}

function togglePlay() {
  if (!audioEl.value) return
  if (audioEl.value.paused) {
    audioEl.value.play()
    emit('play')
  } else {
    audioEl.value.pause()
    audioEl.value.currentTime = 0
    emit('stop')
  }
}

function onEnded() {
  emit('stop')
}

function confirmDelete() {
  showDeleteConfirm.value = true
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  if (minutes > 0) {
    return `${minutes}:${remaining.toString().padStart(2, '0')}`
  }
  return `${seconds}s`
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
</script>
<template>
  <v-card
    variant="tonal"
    color="surface-variant"
    class="h-100 transition-all hover:shadow-md"
  >
    <v-card-text class="pa-3 d-flex flex-column h-100">
      <!-- Header -->
      <div class="d-flex align-center mb-2">
        <v-icon size="20" class="mr-2 text-sky-400">mdi-music-note</v-icon>
        <h4 class="text-sm font-weight-medium flex-1 line-clamp-2">
          {{ sound.name }}
        </h4>
      </div>

      <!-- Metadata chips -->
      <div class="d-flex flex-wrap gap-1 mb-3">
        <v-chip
          v-if="duration || sound.duration"
          size="x-small"
          variant="outlined"
          color="info"
        >
          {{ formatDuration(duration || sound.duration || 0) }}
        </v-chip>
        <v-chip
          v-if="sound.size"
          size="x-small"
          variant="outlined"
          color="secondary"
        >
          {{ formatFileSize(sound.size) }}
        </v-chip>
      </div>

      <v-spacer />

      <!-- Play button -->
      <div class="d-flex align-center gap-2 mt-auto">
        <v-btn
          :icon="isPlaying ? 'mdi-stop' : 'mdi-play'"
          size="small"
          variant="tonal"
          color="sky"
          @click="togglePlay"
        />
        <v-btn
          icon="mdi-delete"
          size="small"
          variant="text"
          color="error"
          @click="confirmDelete"
        />
      </div>

      <!-- Hidden audio element -->
      <audio
        ref="audioEl"
        :src="sound.url"
        preload="metadata"
        @loadedmetadata="onMetadataLoaded"
        @ended="onEnded"
      />
    </v-card-text>
  </v-card>

  <!-- Delete confirmation dialog -->
  <v-dialog v-model="showDeleteConfirm" max-width="400">
    <v-card>
      <v-card-title>Delete Sound</v-card-title>
      <v-card-text>
        Are you sure you want to delete "{{ sound.name }}"? This action cannot be undone.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="showDeleteConfirm = false">Cancel</v-btn>
        <v-btn
          color="error"
          variant="flat"
          @click="showDeleteConfirm = false; emit('delete')"
        >
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
