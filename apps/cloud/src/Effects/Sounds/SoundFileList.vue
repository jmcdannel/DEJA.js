<template>
  <div class="max-w-4xl mx-auto p-5 font-sans">
    <div class="text-center mb-8">
      <h3 class="text-2xl font-semibold text-gray-900 mb-2">BBC Sound Effects</h3>
      <p class="text-gray-600 text-sm">Quality sound effects from the BBC archive</p>
    </div>
    
    <div v-if="loading" class="text-center py-10">
      <div class="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gray-600">Loading sound files...</p>
    </div>
    
    <div v-else-if="error" class="text-center py-10 text-red-600">
      <p>{{ error }}</p>
      <button @click="loadSoundFiles" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-4 transition-colors">
        Retry
      </button>
    </div>
    
    <div v-else-if="soundFiles.length === 0" class="text-center py-10 text-gray-600">
      <p>No sound files found in the BBC sounds collection.</p>
      <p>Sound files will appear here once they are added to your blob store.</p>
    </div>
    
    <div v-else class="space-y-4 mb-8">
      <div 
        v-for="sound in soundFiles" 
        :key="sound.url" 
        class="flex items-center p-4 bg-white border border-gray-200 rounded-lg cursor-pointer transition-all hover:border-blue-500 hover:shadow-md"
        @click="playSound(sound)"
      >
        <div class="mr-4 text-blue-500">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
          </svg>
        </div>
        <div class="flex-1">
          <h4 class="text-base font-medium text-gray-900 mb-2">{{ sound.name }}</h4>
          <div class="flex gap-4 text-xs text-gray-600">
            <span v-if="sound.duration" class="whitespace-nowrap">{{ formatDuration(sound.duration) }}</span>
            <span v-if="sound.size" class="whitespace-nowrap">{{ formatFileSize(sound.size) }}</span>
            <span v-if="sound.uploadedAt" class="whitespace-nowrap">{{ formatDate(sound.uploadedAt) }}</span>
          </div>
        </div>
        <div class="ml-4">
          <button 
            @click.stop="playSound(sound)" 
            class="w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white rounded-full flex items-center justify-center transition-colors disabled:cursor-not-allowed"
            :disabled="currentlyPlaying === sound.url"
            :title="currentlyPlaying === sound.url ? 'Stop' : 'Play'"
          >
            <svg v-if="currentlyPlaying !== sound.url" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
              <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div class="text-center mt-8 pt-5 border-t border-gray-200">
      <p class="text-sm text-gray-600">
        Sound effects provided by 
        <a href="https://sound-effects.bbcrewind.co.uk/licensing" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">
          BBC Sound Effects
        </a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { soundFileService, type SoundFile } from './SoundFileService'

const soundFiles = ref<SoundFile[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const currentlyPlaying = ref<string | null>(null)
const audioContext = ref<AudioContext | null>(null)

onMounted(() => {
  loadSoundFiles()
})

async function loadSoundFiles() {
  loading.value = true
  error.value = null
  
  try {
    const sounds = await soundFileService.listSoundFiles()
    soundFiles.value = sounds
  } catch (err) {
    error.value = 'Failed to load sound files. Please try again.'
    console.error('Error loading sound files:', err)
  } finally {
    loading.value = false
  }
}

async function playSound(sound: SoundFile) {
  try {
    if (currentlyPlaying.value === sound.url) {
      // Stop current playback
      currentlyPlaying.value = null
      return
    }
    
    currentlyPlaying.value = sound.url
    
    // Create audio context if it doesn't exist
    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    
    // Fetch and play the audio
    const response = await fetch(sound.url)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await audioContext.value.decodeAudioData(arrayBuffer)
    
    const source = audioContext.value.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioContext.value.destination)
    
    source.onended = () => {
      if (currentlyPlaying.value === sound.url) {
        currentlyPlaying.value = null
      }
    }
    
    source.start(0)
  } catch (err) {
    console.error('Error playing sound:', err)
    currentlyPlaying.value = null
    error.value = 'Failed to play sound file.'
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${seconds}s`
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}
</script>
