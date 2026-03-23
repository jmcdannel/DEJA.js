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
    class="h-100 transition-all hover:shadow-md"
    density="compact"
  >
    <v-card-title class="flex flex-nowrap items-center gap-3 !overflow-visible">
      <div class="flex items-center gap-3 min-w-0 cursor-pointer hover:opacity-80 transition-opacity" @click="emit('edit')">
        <v-icon icon="mdi-music-note" color="sky" class="flex-shrink-0" />
        <span class="text-sm font-weight-medium">{{ sound.name }}</span>
      </div>
      <v-spacer />
      <v-btn
        :icon="isPlaying ? 'mdi-stop' : 'mdi-play'"
        size="small"
        variant="tonal"
        color="sky"
        class="flex-shrink-0"
        @click="togglePlay"
      />
    </v-card-title>
    <v-card-text class="py-2">
      <div class="flex justify-between w-full items-start">
        <v-chip-group>
          <v-chip
            v-if="duration || sound.duration"
            size="x-small"
            variant="outlined"
            prepend-icon="mdi-timer-outline"
          >
            {{ formatDuration(duration || sound.duration || 0) }}
          </v-chip>
          <v-chip
            v-if="sound.size"
            size="x-small"
            variant="outlined"
            prepend-icon="mdi-file-outline"
          >
            {{ formatFileSize(sound.size) }}
          </v-chip>
        </v-chip-group>
      </div>
    </v-card-text>
    <v-divider />
    <div class="flex justify-between pa-1" style="background: rgba(var(--v-theme-on-surface), 0.04)">
      <v-btn
        icon="mdi-delete-outline"
        variant="text"
        color="error"
        size="small"
        @click="confirmDelete"
      />
      <v-btn
        icon="mdi-pencil-outline"
        variant="text"
        color="sky"
        size="small"
        @click="emit('edit')"
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
