<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTimeoutFn, useIntervalFn } from '@vueuse/core'
import { useEfx, type Effect } from '@repo/modules/effects'
import { createLogger } from '@repo/utils'
import EffectSwitch from './EffectSwitch.vue'
import EffectCard from './EffectCard.vue'
import EffectButton from './EffectButton.vue'
import EffectRaw from './EffectRaw.vue'

const log = createLogger('EffectItem')

interface Props {
  effect: Effect
  viewAs?: string
}

const props = defineProps<Props>()
const { runEffect } = useEfx()
const state = ref(props.effect?.state)
const isRunning = ref(false)
const progress = ref(0)

const isSound = computed(() => props.effect.type === 'sound')

// Prefer stored duration; fall back to detecting from audio metadata
const resolvedDurationMs = ref((props.effect.soundDuration ?? 5) * 1000)
if (isSound.value && !props.effect.soundDuration) {
  const audioUrl = props.effect.soundBlobUrl || props.effect.sound
  if (audioUrl) {
    const audio = new Audio()
    audio.src = audioUrl
    audio.addEventListener('loadedmetadata', () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        resolvedDurationMs.value = audio.duration * 1000
      }
    }, { once: true })
  }
}

const timeoutMs = computed(() => isSound.value ? resolvedDurationMs.value : 2000)

let playStartTime = 0

const { pause: pauseProgress, resume: resumeProgress } = useIntervalFn(() => {
  progress.value = Math.min(100, ((Date.now() - playStartTime) / resolvedDurationMs.value) * 100)
}, 50, { immediate: false })

const { start, stop } = useTimeoutFn(() => {
  isRunning.value = false
  pauseProgress()
  progress.value = 0
  if (isSound.value) state.value = false
}, timeoutMs)

watch(state, async (newState) => {
  log.debug('Effect state watched to:', newState)

  if (isSound.value && !newState) {
    isRunning.value = false
    stop()
    pauseProgress()
    progress.value = 0
  } else {
    isRunning.value = true
    stop()
    start()
    if (isSound.value) {
      playStartTime = Date.now()
      progress.value = 0
      pauseProgress()
      resumeProgress()
    }
  }

  await runEffect({ ...props.effect, id: props.effect.id, state: newState })
})
</script>

<template>
  <EffectSwitch
    v-if="viewAs === 'switch'"
    :effect="effect"
    :is-running="isRunning"
    :progress="progress"
    v-model:state.sync="state"
  />
  <EffectCard
    v-else-if="viewAs === 'card'"
    :effect="effect"
    :is-running="isRunning"
    :progress="progress"
    v-model:state.sync="state"
  />
  <EffectButton
    v-else-if="viewAs === 'button'"
    :effect="effect"
    :is-running="isRunning"
    :progress="progress"
    v-model:state.sync="state"
  />
  <EffectRaw
    v-else-if="viewAs === 'raw'"
    :effect="effect"
  />
  <EffectButton
    v-else
    :effect="effect"
    :is-running="isRunning"
    :progress="progress"
    v-model:state.sync="state"
  />
</template>