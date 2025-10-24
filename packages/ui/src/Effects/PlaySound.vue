<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useEfx, type Effect } from '@repo/modules/effects'

interface Props {
  effect: Effect
  viewAs?: string
}

const props = defineProps<Props>()
const { xs, smAndDown } = useDisplay()

// Audio refs and state
const audioRef = ref<HTMLAudioElement>()
const isPlaying = ref(false)
const currentTime = ref(0)
const progressValue = ref(0)

const audioSrc = computed(() => 
  props.effect.sound
)

const duration = computed(() => props.effect.soundDuration ?? 0)

const playIcon = computed(() => 
  isPlaying.value ? 'mdi-stop' : 'mdi-play'
)

const currentTimeFormatted = computed(() => 
  formatTime(currentTime.value)
)

const durationFormatted = computed(() => 
  formatTime(duration.value)
)

const progressMax = computed(() => 
  Math.max(duration.value, 1)
)

// Responsive sizing
const progressWidth = computed(() => {
  if (xs.value) return '120px'
  if (smAndDown.value) return '150px'
  return '200px'
})

const showFullTime = computed(() => !xs.value)

// Utility functions
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes}:${String(secs).padStart(2, '0')}`
}

// Audio event handlers
function handleTimeUpdate(event: Event) {
  const audio = event.target as HTMLAudioElement
  currentTime.value = audio.currentTime
  progressValue.value = audio.currentTime
}

function handlePlay() {
  isPlaying.value = true
}

function handlePause() {
  isPlaying.value = false
}

function togglePlayback() {
  if (!audioRef.value) return
  
  if (audioRef.value.paused) {
    audioRef.value.play()
  } else {
    audioRef.value.pause()
  }
}

function handleProgressClick(event: MouseEvent) {
  if (!audioRef.value) return
  
  const target = event.target as HTMLElement
  const rect = target.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const width = rect.width
  const clickRatio = clickX / width
  const newTime = clickRatio * duration.value
  
  audioRef.value.currentTime = newTime
}
</script>

<template>
  <v-row 
    class="play-sound align-center" 
    :class="{ 'mx-0': xs }"
    no-gutters
  >
    <!-- Hidden audio element -->
    <audio
      ref="audioRef"
      :src="audioSrc"
      @timeupdate="handleTimeUpdate"
      @play="handlePlay"
      @pause="handlePause"
    />

    <!-- Play/Stop Button -->
    <v-col cols="auto">
      <v-btn
        :icon="playIcon"
        variant="text"
        :size="xs ? 'small' : 'default'"
        @click="togglePlayback"
        :aria-label="isPlaying ? 'Stop' : 'Play'"
      />
    </v-col>

    <!-- Progress Bar -->
    <v-col>
      <v-progress-linear
        v-model="progressValue"
        :max="progressMax"
        :height="xs ? 6 : 8"
        color="primary"
        :style="{ maxWidth: progressWidth, cursor: 'pointer' }"
        @click="handleProgressClick"
        class="mx-2"
      />
    </v-col>

    <!-- Time Display -->
    <v-col cols="auto">
      <v-chip
        variant="text"
        :size="xs ? 'small' : 'default'"
        class="text-caption font-mono"
        :class="{ 'px-1': xs }"
      >
        <template v-if="showFullTime">
          {{ currentTimeFormatted }} / {{ durationFormatted }}
        </template>
        <template v-else>
          {{ currentTimeFormatted }}
        </template>
      </v-chip>
    </v-col>
  </v-row>
</template>