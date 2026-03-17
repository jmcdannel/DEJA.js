<script setup lang="ts">
import { ref, computed } from 'vue'
import { soundFileService } from '@/Effects/Sounds/SoundFileService'
import { createLogger } from '@repo/utils'

const log = createLogger('SoundForm')

const emit = defineEmits<{
  close: []
}>()

const file = ref<File | null>(null)
const uploading = ref(false)
const error = ref<string | null>(null)
const uploadedSound = ref<{ name: string; url: string } | null>(null)
const audioPreviewUrl = ref<string | null>(null)
const dragOver = ref(false)

const ACCEPTED_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/flac',
  'audio/aac',
]

const isValidFile = computed(() => {
  if (!file.value) return false
  return ACCEPTED_TYPES.includes(file.value.type)
})

const fileInfo = computed(() => {
  if (!file.value) return null
  return {
    name: file.value.name,
    size: formatFileSize(file.value.size),
    type: file.value.type,
  }
})

function onFileChange(files: File[] | File | null) {
  error.value = null
  uploadedSound.value = null

  const selected = Array.isArray(files) ? files[0] : files
  if (!selected) {
    file.value = null
    audioPreviewUrl.value = null
    return
  }

  if (!ACCEPTED_TYPES.includes(selected.type)) {
    error.value = `Unsupported file type: ${selected.type}. Please select an audio file (MP3, WAV, OGG, M4A, FLAC, AAC).`
    file.value = null
    audioPreviewUrl.value = null
    return
  }

  file.value = selected
  audioPreviewUrl.value = URL.createObjectURL(selected)
}

function onDrop(event: DragEvent) {
  dragOver.value = false
  const droppedFile = event.dataTransfer?.files[0]
  if (droppedFile) {
    onFileChange(droppedFile)
  }
}

function onDragOver() {
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

async function handleUpload() {
  if (!file.value || !isValidFile.value) return

  uploading.value = true
  error.value = null

  try {
    const sound = await soundFileService.uploadSoundFile(file.value)
    uploadedSound.value = sound
    log.info('Sound uploaded:', sound.name)

    // Auto-close after brief success display
    setTimeout(() => emit('close'), 1500)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    error.value = message
    log.error('Upload error:', err)
  } finally {
    uploading.value = false
  }
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
  <v-card class="mx-auto" max-width="600">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2" color="sky">mdi-cloud-upload</v-icon>
      Upload Sound
    </v-card-title>

    <v-card-text>
      <!-- Success state -->
      <v-alert v-if="uploadedSound" type="success" variant="tonal" class="mb-4">
        "{{ uploadedSound.name }}" uploaded successfully.
      </v-alert>

      <!-- Error state -->
      <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = null">
        {{ error }}
      </v-alert>

      <!-- Drop zone -->
      <div
        v-if="!uploadedSound"
        class="drop-zone rounded-lg pa-8 text-center cursor-pointer mb-4"
        :class="{
          'drop-zone--active': dragOver,
          'drop-zone--has-file': file,
        }"
        @drop.prevent="onDrop"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
        @click="($refs.fileInput as HTMLElement)?.click()"
      >
        <input
          ref="fileInput"
          type="file"
          accept="audio/*"
          class="d-none"
          @change="onFileChange(($event.target as HTMLInputElement).files?.[0] ?? null)"
        />

        <div v-if="!file">
          <v-icon size="48" class="text-slate-400 mb-2">mdi-cloud-upload-outline</v-icon>
          <p class="text-slate-400 mb-1">Drag and drop an audio file here</p>
          <p class="text-xs text-slate-500">or click to browse. MP3, WAV, OGG, M4A, FLAC, AAC</p>
        </div>

        <div v-else>
          <v-icon size="48" class="text-sky-400 mb-2">mdi-music-note</v-icon>
          <p class="font-weight-medium mb-1">{{ fileInfo?.name }}</p>
          <div class="d-flex justify-center gap-2">
            <v-chip size="x-small" variant="outlined" color="info">{{ fileInfo?.size }}</v-chip>
            <v-chip size="x-small" variant="outlined" color="secondary">{{ fileInfo?.type }}</v-chip>
          </div>
        </div>
      </div>

      <!-- Audio preview -->
      <div v-if="audioPreviewUrl && !uploadedSound" class="mb-4">
        <p class="text-xs text-slate-400 mb-1">Preview</p>
        <audio :src="audioPreviewUrl" controls class="w-100" style="height: 36px" />
      </div>
    </v-card-text>

    <v-card-actions v-if="!uploadedSound">
      <v-spacer />
      <v-btn @click="emit('close')">Cancel</v-btn>
      <v-btn
        color="primary"
        variant="flat"
        :disabled="!isValidFile || uploading"
        :loading="uploading"
        @click="handleUpload"
      >
        Upload
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.drop-zone {
  border: 2px dashed rgba(100, 116, 139, 0.3);
  transition: all 0.2s ease;
}

.drop-zone:hover,
.drop-zone--active {
  border-color: rgb(14, 165, 233);
  background: rgba(14, 165, 233, 0.05);
}

.drop-zone--has-file {
  border-color: rgb(14, 165, 233);
  border-style: solid;
  background: rgba(14, 165, 233, 0.05);
}
</style>
