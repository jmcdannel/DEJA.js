<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch, type Ref } from 'vue'
import { useEfx, useSignals, useTurnouts } from '@repo/modules'
import type { Effect } from '@repo/modules/effects'
import type { Signal, SignalAspect } from '@repo/modules/signals/types'
import type { Turnout } from '@repo/modules/turnouts/types'
import ColorPicker from '@/Common/Color/ColorPicker.vue'

const emit = defineEmits<{
  (event: 'change', payload: { config: string }): void
}>()

const config = defineModel<string | undefined>('config')

const props = defineProps<{
  efx: Effect
  color: string
}>()

interface TimelineTrack {
  id: string
  name: string
  type: 'action' | 'audio'
}

interface TimelineAudioAsset {
  name: string
  size: number
  type: string
  lastModified: number
  objectUrl?: string
}

type MultimediaActionType = 'light' | 'effect' | 'signal' | 'turnout'

type EffectState = 'on' | 'off' | 'toggle'

type TurnoutState = 'straight' | 'divergent'

interface TimelineEvent {
  id: string
  name: string
  delay: number
  duration: number
  type: 'action' | 'audio'
  trackId: string
  actionType?: MultimediaActionType
  targetId?: string | null
  targetName?: string | null
  targetDevice?: string | null
  color?: string
  signalAspect?: SignalAspect | null
  turnoutState?: TurnoutState
  effectState?: EffectState
  asset?: TimelineAudioAsset | null
}

interface ConfigState {
  events: TimelineEvent[]
  tracks: TimelineTrack[]
  version: number
}

const { getEffects } = useEfx()
const { getTurnouts } = useTurnouts()
const { getSignals } = useSignals()

const effects = getEffects() as unknown as Ref<Effect[]>
const turnouts = getTurnouts() as unknown as Ref<Turnout[]>
const signals = getSignals() as unknown as Ref<Signal[]>

const events = ref<TimelineEvent[]>([])
const timelineTracks = ref<TimelineTrack[]>([])

const showColorPicker = ref(false)
const colorPickerIndex = ref<number | null>(null)
const colorPickerModel = ref<string>('')

const showTimelineEditor = ref(false)
const timelineZoom = ref(0.08)
const timelineScrollContainer = ref<HTMLElement | null>(null)

interface ActiveInteractionState {
  eventId: string | null
  mode: 'move' | 'resize-start' | 'resize-end' | null
  pointerId: number | null
  startX: number
  originalDelay: number
  originalDuration: number
}

const activeInteraction = reactive<ActiveInteractionState>({
  eventId: null,
  mode: null,
  pointerId: null,
  startX: 0,
  originalDelay: 0,
  originalDuration: 0
})

const DEFAULT_ACTION_TRACK_ID = 'action-track'

let audioTrackIncrement = 1

const actionTypeOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Effect', value: 'effect' },
  { label: 'Signal', value: 'signal' },
  { label: 'Turnout', value: 'turnout' }
] as const

const effectStateOptions: Array<{ label: string; value: EffectState }> = [
  { label: 'On', value: 'on' },
  { label: 'Off', value: 'off' },
  { label: 'Toggle', value: 'toggle' }
]

const turnoutStateOptions: Array<{ label: string; value: TurnoutState }> = [
  { label: 'Straight', value: 'straight' },
  { label: 'Divergent', value: 'divergent' }
]

const signalAspectOptions: Array<{ label: string; value: SignalAspect | null }> = [
  { label: 'Red', value: 'red' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Green', value: 'green' }
]

const effectOptions = computed(() =>
  (effects.value || []).map((effect) => ({
    label: effect.name || effect.id,
    value: effect.id,
    device: effect.device || null,
    type: effect.type
  }))
)

const turnoutOptions = computed(() =>
  (turnouts.value || []).map((turnout) => ({
    label: turnout.name || turnout.id,
    value: turnout.id,
    device: turnout.device
  }))
)

const signalOptions = computed(() =>
  (signals.value || []).map((signal) => ({
    label: signal.name || signal.id,
    value: signal.id,
    device: signal.device || null
  }))
)

const trackOptions = computed(() =>
  timelineTracks.value.map((track) => ({
    label: track.name,
    value: track.id
  }))
)

const eventsByTrack = computed(() =>
  timelineTracks.value.map((track) => ({
    track,
    events: events.value.filter((event) => event.trackId === track.id)
  }))
)

const timelineDuration = computed(() => {
  if (events.value.length === 0) {
    return 5000
  }
  return Math.max(
    5000,
    ...events.value.map((event) => event.delay + event.duration)
  )
})

const msToPixels = (ms: number): number => {
  return Math.max(ms * timelineZoom.value, 1)
}

const pixelsToMs = (px: number): number => {
  const ms = px / timelineZoom.value
  return Math.max(0, Math.round(ms))
}

const timelineWidth = computed(() => msToPixels(timelineDuration.value))

const gridSize = computed(() => Math.max(msToPixels(1000), 40))

const timelineMarkers = computed(() => {
  const markers: Array<{ position: number; label: string }> = []
  const total = timelineDuration.value
  for (let ms = 0; ms <= total; ms += 1000) {
    markers.push({
      position: msToPixels(ms),
      label: `${Math.round(ms / 100) / 10}s`
    })
  }
  return markers
})

const timelineCanvasWidth = computed(() => {
  return Math.max(timelineWidth.value, timelineScrollContainer.value?.clientWidth ?? 0)
})

function createDefaultTracks(): TimelineTrack[] {
  return [
    { id: DEFAULT_ACTION_TRACK_ID, name: 'Actions', type: 'action' },
    { id: `audio-track-${audioTrackIncrement++}`, name: 'Audio Track 1', type: 'audio' }
  ]
}

function ensureTracks(): void {
  if (timelineTracks.value.length === 0) {
    timelineTracks.value = createDefaultTracks()
  }
  const actionTrack = timelineTracks.value.find((track) => track.type === 'action')
  if (!actionTrack) {
    timelineTracks.value = [
      { id: DEFAULT_ACTION_TRACK_ID, name: 'Actions', type: 'action' },
      ...timelineTracks.value
    ]
  }
  events.value = events.value.map((event, index) => {
    const eventType = event.type ?? 'action'
    const matchingTrack = timelineTracks.value.find((track) => track.id === event.trackId)
    if (matchingTrack) {
      return {
        ...event,
        type: eventType
      }
    }
    const fallbackTrack = timelineTracks.value.find((track) => track.type === eventType) ??
      timelineTracks.value.find((track) => track.type === 'action') ??
      timelineTracks.value[0]
    return {
      ...event,
      id: event.id ?? `event-${index}`,
      type: eventType,
      trackId: fallbackTrack?.id ?? DEFAULT_ACTION_TRACK_ID
    }
  })
}

function addAudioTrack(): void {
  const trackId = `audio-track-${audioTrackIncrement++}`
  const trackNumber = timelineTracks.value.filter((track) => track.type === 'audio').length + 1
  timelineTracks.value = [
    ...timelineTracks.value,
    { id: trackId, name: `Audio Track ${trackNumber}`, type: 'audio' }
  ]
}

function removeAudioTrack(id: string): void {
  const track = timelineTracks.value.find((entry) => entry.id === id)
  if (!track || track.type !== 'audio') {
    return
  }
  const hasEvents = events.value.some((event) => event.trackId === id)
  if (hasEvents) {
    return
  }
  timelineTracks.value = timelineTracks.value.filter((entry) => entry.id !== id)
}

let hydratingFromConfig = false

function msToTimeline(ms: number): number {
  return Math.max(0, Math.round(ms))
}

function beginInteraction(event: TimelineEvent, mode: ActiveInteractionState['mode'], pointer: PointerEvent): void {
  activeInteraction.eventId = event.id
  activeInteraction.mode = mode
  activeInteraction.pointerId = pointer.pointerId
  activeInteraction.startX = pointer.clientX
  activeInteraction.originalDelay = event.delay
  activeInteraction.originalDuration = event.duration
  ;(pointer.target as HTMLElement | null)?.setPointerCapture?.(pointer.pointerId)
}

function endInteraction(): void {
  activeInteraction.eventId = null
  activeInteraction.mode = null
  activeInteraction.pointerId = null
}

function handlePointerMove(event: PointerEvent): void {
  if (!activeInteraction.eventId || !activeInteraction.mode) {
    return
  }
  const timelineEvent = events.value.find((item) => item.id === activeInteraction.eventId)
  if (!timelineEvent) {
    return
  }
  const deltaX = event.clientX - activeInteraction.startX
  const deltaMs = pixelsToMs(deltaX)
  if (activeInteraction.mode === 'move') {
    timelineEvent.delay = msToTimeline(activeInteraction.originalDelay + deltaMs)
  } else if (activeInteraction.mode === 'resize-start') {
    const proposedDelay = msToTimeline(activeInteraction.originalDelay + deltaMs)
    const maxDelay = activeInteraction.originalDelay + activeInteraction.originalDuration - 100
    const clampedDelay = Math.min(Math.max(0, proposedDelay), maxDelay)
    const newDuration = activeInteraction.originalDuration + (activeInteraction.originalDelay - clampedDelay)
    timelineEvent.delay = clampedDelay
    timelineEvent.duration = Math.max(100, newDuration)
  } else if (activeInteraction.mode === 'resize-end') {
    const proposedDuration = activeInteraction.originalDuration + deltaMs
    timelineEvent.duration = Math.max(100, proposedDuration)
  }
}

function handlePointerUp(event: PointerEvent): void {
  if (activeInteraction.pointerId !== null) {
    (event.target as HTMLElement | null)?.releasePointerCapture?.(activeInteraction.pointerId)
  }
  endInteraction()
}

function eventBlockStyle(entry: TimelineEvent): Record<string, string> {
  const baseColor = entry.type === 'action' ? entry.color || '#16a34a' : '#38bdf8'
  return {
    left: `${msToPixels(entry.delay)}px`,
    width: `${Math.max(msToPixels(entry.duration), 6)}px`,
    backgroundColor: entry.type === 'action' ? baseColor : 'rgba(56, 189, 248, 0.35)',
    borderColor: entry.type === 'action' ? '#ffffff50' : '#38bdf880'
  }
}

function timelineLaneStyle(type: TimelineTrack['type']): Record<string, string> {
  const tint = type === 'audio' ? 'rgba(56, 189, 248, 0.05)' : 'rgba(52, 211, 153, 0.07)'
  return {
    backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px)',
    backgroundSize: `${gridSize.value}px 100%`,
    backgroundColor: tint
  }
}

const pendingAudioTrackId = ref<string | null>(null)
const audioFileInput = ref<HTMLInputElement | null>(null)

function handleAudioDragOver(event: DragEvent): void {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

function createAudioEventFromFile(file: File, trackId: string, offsetMs: number): TimelineEvent {
  return {
    id: `audio-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: file.name,
    delay: msToTimeline(offsetMs),
    duration: 3000,
    type: 'audio',
    trackId,
    asset: {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }
  }
}

function handleAudioDrop(event: DragEvent, track: TimelineTrack): void {
  if (!track || track.type !== 'audio') {
    return
  }
  event.preventDefault()
  const files = Array.from(event.dataTransfer?.files ?? []).filter((file) =>
    file.type?.startsWith('audio/')
  )
  if (files.length === 0) {
    return
  }
  const laneElement = event.currentTarget as HTMLElement | null
  const rect = laneElement?.getBoundingClientRect()
  const scrollOffset = timelineScrollContainer.value?.scrollLeft ?? 0
  const dropPosition = rect ? event.clientX - rect.left + scrollOffset : 0
  const baseDelay = pixelsToMs(dropPosition)
  const nextEvents = files.map((file, index) =>
    createAudioEventFromFile(file, track.id, baseDelay + index * 250)
  )
  events.value = [...events.value, ...nextEvents]
}

function triggerAudioImport(trackId?: string): void {
  pendingAudioTrackId.value = trackId ?? timelineTracks.value.find((track) => track.type === 'audio')?.id ?? null
  if (!pendingAudioTrackId.value) {
    addAudioTrack()
    pendingAudioTrackId.value = timelineTracks.value.find((track) => track.type === 'audio')?.id ?? null
  }
  if (audioFileInput.value) {
    audioFileInput.value.value = ''
    audioFileInput.value.click()
  }
}

function handleAudioFileSelection(event: Event): void {
  const input = event.target as HTMLInputElement | null
  if (!input || !input.files || input.files.length === 0) {
    return
  }
  const targetTrackId = pendingAudioTrackId.value ??
    timelineTracks.value.find((track) => track.type === 'audio')?.id ??
    timelineTracks.value[0]?.id ?? DEFAULT_ACTION_TRACK_ID
  const files = Array.from(input.files).filter((file) => file.type?.startsWith('audio/'))
  if (files.length === 0) {
    return
  }
  const nextEvents = files.map((file, index) =>
    createAudioEventFromFile(file, targetTrackId, index * 250)
  )
  events.value = [...events.value, ...nextEvents]
  pendingAudioTrackId.value = null
}

function addActionEvent(): void {
  const lastAction = events.value.filter((event) => event.type === 'action').slice(-1)[0]
  const actionTrackId = timelineTracks.value.find((track) => track.type === 'action')?.id ?? DEFAULT_ACTION_TRACK_ID
  events.value = [
    ...events.value,
    {
      id: `action-${Date.now()}`,
      name: `Cue ${events.value.filter((event) => event.type === 'action').length + 1}`,
      delay: lastAction ? lastAction.delay + lastAction.duration : 0,
      duration: 1000,
      type: 'action',
      trackId: actionTrackId,
      actionType: 'light',
      color: props.color || '#16a34a',
      effectState: 'on',
      turnoutState: 'straight',
      signalAspect: 'green'
    }
  ]
}

function removeEvent(id: string): void {
  events.value = events.value.filter((event) => event.id !== id)
}

function openColorPicker(index: number): void {
  const event = events.value[index]
  if (!event || event.type !== 'action' || event.actionType !== 'light') {
    return
  }
  colorPickerIndex.value = index
  colorPickerModel.value = event.color || props.color || '#16a34a'
  showColorPicker.value = true
}

function handleColorPickerSelect(): void {
  if (colorPickerIndex.value === null) {
    showColorPicker.value = false
    return
  }
  const event = events.value[colorPickerIndex.value]
  if (event && event.type === 'action' && event.actionType === 'light') {
    event.color = colorPickerModel.value
  }
  showColorPicker.value = false
}

function resolveTargetMetadata(event: TimelineEvent): void {
  if (event.type !== 'action') {
    return
  }
  if (event.actionType === 'light' || event.actionType === 'effect') {
    const option = effectOptions.value.find((item) => item.value === event.targetId)
    event.targetName = option?.label ?? null
    event.targetDevice = option?.device ?? null
  } else if (event.actionType === 'turnout') {
    const option = turnoutOptions.value.find((item) => item.value === event.targetId)
    event.targetName = option?.label ?? null
    event.targetDevice = option?.device ?? null
  } else if (event.actionType === 'signal') {
    const option = signalOptions.value.find((item) => item.value === event.targetId)
    event.targetName = option?.label ?? null
    event.targetDevice = option?.device ?? null
  }
}

function normalizeEvents(): void {
  events.value = events.value.map((event) => {
    if (event.type === 'action') {
      resolveTargetMetadata(event)
      if (!event.actionType) {
        event.actionType = 'light'
      }
      if (event.actionType === 'light' && !event.color) {
        event.color = props.color || '#16a34a'
      }
      if (event.actionType === 'effect' && !event.effectState) {
        event.effectState = 'toggle'
      }
      if (event.actionType === 'turnout' && !event.turnoutState) {
        event.turnoutState = 'straight'
      }
      if (event.actionType === 'signal' && !event.signalAspect) {
        event.signalAspect = 'green'
      }
    }
    event.delay = Math.max(0, Math.round(event.delay))
    event.duration = Math.max(100, Math.round(event.duration))
    return event
  })
}

function buildConfig(): ConfigState {
  return {
    events: events.value.map((event) => ({
      ...event,
      asset: event.asset ? { ...event.asset } : null
    })),
    tracks: [...timelineTracks.value],
    version: 2
  }
}

function updateConfig(): void {
  if (hydratingFromConfig) {
    return
  }
  normalizeEvents()
  ensureTracks()
  const configState = buildConfig()
  const configString = JSON.stringify(configState)
  if (config.value !== configString) {
    config.value = configString
  }
  emit('change', { config: config.value ?? configString })
}

function loadConfigFromString(configString?: string): void {
  if (!configString) {
    events.value = []
    timelineTracks.value = createDefaultTracks()
    addActionEvent()
    updateConfig()
    return
  }
  try {
    hydratingFromConfig = true
    const parsed = JSON.parse(configString) as Partial<ConfigState>
    if (Array.isArray(parsed.tracks) && parsed.tracks.length > 0) {
      timelineTracks.value = parsed.tracks.map((track, index) => ({
        id: track.id ?? `track-${index}`,
        name: track.name ?? (track.type === 'audio' ? `Audio Track ${index + 1}` : 'Actions'),
        type: track.type === 'audio' ? 'audio' : 'action'
      }))
      const audioTracks = timelineTracks.value.filter((track) => track.type === 'audio').length
      audioTrackIncrement = Math.max(audioTrackIncrement, audioTracks + 1)
    } else {
      timelineTracks.value = createDefaultTracks()
    }
    if (Array.isArray(parsed.events)) {
      events.value = parsed.events.map((event, index) => ({
        id: event.id ?? `event-${index}`,
        name: event.name ?? `Cue ${index + 1}`,
        delay: Number.isFinite(event.delay) ? event.delay : 0,
        duration: Number.isFinite(event.duration) ? event.duration : 1000,
        type: event.type === 'audio' ? 'audio' : 'action',
        trackId: event.trackId ?? (event.type === 'audio'
          ? timelineTracks.value.find((track) => track.type === 'audio')?.id ?? DEFAULT_ACTION_TRACK_ID
          : timelineTracks.value.find((track) => track.type === 'action')?.id ?? DEFAULT_ACTION_TRACK_ID),
        actionType: event.actionType ?? 'light',
        targetId: event.targetId ?? null,
        targetName: event.targetName ?? null,
        targetDevice: event.targetDevice ?? null,
        color: event.color ?? (event.actionType === 'light' ? props.color || '#16a34a' : undefined),
        signalAspect: event.signalAspect ?? null,
        turnoutState: event.turnoutState ?? 'straight',
        effectState: event.effectState ?? 'toggle',
        asset: event.asset ?? null
      }))
    } else {
      events.value = []
    }
    if (events.value.length === 0) {
      addActionEvent()
    }
    ensureTracks()
    normalizeEvents()
    nextTick(() => {
      hydratingFromConfig = false
      updateConfig()
    })
  } catch (error) {
    console.warn('Unable to parse Multimedia config – using defaults', error)
    hydratingFromConfig = false
    events.value = []
    timelineTracks.value = createDefaultTracks()
    addActionEvent()
    nextTick(() => updateConfig())
  }
}

watch(
  () => config.value,
  (value, oldValue) => {
    if (value && value !== oldValue) {
      loadConfigFromString(value)
    } else if (!value) {
      loadConfigFromString(undefined)
    }
  },
  { immediate: true }
)

watch(
  events,
  () => {
    updateConfig()
  },
  { deep: true }
)

watch(
  timelineTracks,
  () => {
    ensureTracks()
    updateConfig()
  },
  { deep: true }
)

watch(
  () => props.color,
  (value) => {
    if (!value || hydratingFromConfig) {
      return
    }
    events.value
      .filter((event) => event.type === 'action' && event.actionType === 'light')
      .forEach((event) => {
        if (!event.color || event.color === props.efx?.color) {
          event.color = value
        }
      })
  }
)

watch(
  [effectOptions, turnoutOptions, signalOptions],
  () => {
    if (hydratingFromConfig) {
      return
    }
    events.value.forEach((event) => resolveTargetMetadata(event))
  }
)

const pointerMoveListener = (event: PointerEvent) => handlePointerMove(event)
const pointerUpListener = (event: PointerEvent) => handlePointerUp(event)

onMounted(() => {
  window.addEventListener('pointermove', pointerMoveListener)
  window.addEventListener('pointerup', pointerUpListener)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', pointerMoveListener)
  window.removeEventListener('pointerup', pointerUpListener)
})
</script>

<template>
  <div class="space-y-6">
    <section class="space-y-4">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 class="text-base font-semibold uppercase tracking-wide opacity-80">Timeline</h3>
          <p class="text-xs opacity-60">Arrange multimedia cues, trigger layout hardware, and layer overlapping sounds.</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <v-btn
            prepend-icon="mdi-playlist-plus"
            :color="props.color || 'teal'"
            variant="tonal"
            @click="addActionEvent"
          >
            Add Action Cue
          </v-btn>
          <v-btn
            prepend-icon="mdi-movie-open-outline"
            color="surface"
            variant="flat"
            class="border border-white/10 bg-white/5"
            @click="showTimelineEditor = true"
          >
            Open Timeline Editor
          </v-btn>
        </div>
      </header>
      <p class="text-sm opacity-70">
        Drag audio files directly onto sound tracks to layer ambience, then orchestrate lights, turnouts, signals, and other effects alongside them.
      </p>
      <div v-if="events.length === 0" class="rounded border border-dashed border-neutral-500/40 p-6 text-center text-sm opacity-70">
        No cues yet. Click “Add Action Cue” to begin building the show.
      </div>
      <div v-else class="space-y-4">
        <v-card
          v-for="event in events"
          :key="event.id"
          variant="tonal"
          class="bg-surface-dark/40 border border-white/10"
        >
          <v-card-item>
            <div class="flex flex-col gap-4">
              <div class="flex flex-wrap items-center gap-4">
                <v-text-field
                  v-model="event.name"
                  label="Cue name"
                  density="comfortable"
                  hide-details
                  variant="outlined"
                  class="min-w-[12rem] flex-1"
                ></v-text-field>
                <v-select
                  v-model="event.trackId"
                  :items="trackOptions"
                  item-title="label"
                  item-value="value"
                  label="Track"
                  density="comfortable"
                  hide-details
                  variant="outlined"
                  class="w-48"
                ></v-select>
                <v-text-field
                  v-model.number="event.delay"
                  label="Start (ms)"
                  type="number"
                  min="0"
                  hide-details
                  density="comfortable"
                  variant="outlined"
                  class="w-36"
                ></v-text-field>
                <v-text-field
                  v-model.number="event.duration"
                  label="Duration (ms)"
                  type="number"
                  min="0"
                  hide-details
                  density="comfortable"
                  variant="outlined"
                  class="w-36"
                ></v-text-field>
                <v-chip
                  v-if="event.type === 'audio'"
                  size="small"
                  color="blue"
                  variant="flat"
                  class="uppercase tracking-wide"
                >
                  Audio Clip
                </v-chip>
              </div>
              <template v-if="event.type === 'action'">
                <div class="flex flex-wrap items-center gap-4">
                  <v-select
                    v-model="event.actionType"
                    :items="actionTypeOptions"
                    item-title="label"
                    item-value="value"
                    label="Action Type"
                    density="comfortable"
                    hide-details
                    variant="outlined"
                    class="w-48"
                    @update:model-value="resolveTargetMetadata(event)"
                  ></v-select>
                  <template v-if="event.actionType === 'light'">
                    <v-select
                      v-model="event.targetId"
                      :items="effectOptions"
                      item-title="label"
                      item-value="value"
                      label="Lighting Effect"
                      density="comfortable"
                      hide-details
                      variant="outlined"
                      class="min-w-[16rem] flex-1"
                      @update:model-value="resolveTargetMetadata(event)"
                    ></v-select>
                    <div class="flex items-center gap-2">
                      <span class="text-xs uppercase tracking-wide opacity-70">Color</span>
                      <v-btn
                        :style="{ backgroundColor: event.color || props.color }"
                        class="h-10 w-10 border"
                        variant="flat"
                        @click="openColorPicker(events.indexOf(event))"
                      ></v-btn>
                      <span class="text-xs opacity-70">{{ event.color }}</span>
                    </div>
                  </template>
                  <template v-else-if="event.actionType === 'effect'">
                    <v-select
                      v-model="event.targetId"
                      :items="effectOptions"
                      item-title="label"
                      item-value="value"
                      label="Effect"
                      density="comfortable"
                      hide-details
                      variant="outlined"
                      class="min-w-[16rem] flex-1"
                      @update:model-value="resolveTargetMetadata(event)"
                    ></v-select>
                    <v-select
                      v-model="event.effectState"
                      :items="effectStateOptions"
                      item-title="label"
                      item-value="value"
                      label="State"
                      density="comfortable"
                      hide-details
                      variant="outlined"
                      class="w-36"
                    ></v-select>
                  </template>
                  <template v-else-if="event.actionType === 'turnout'">
                    <v-select
                      v-model="event.targetId"
                      :items="turnoutOptions"
                      item-title="label"
                      item-value="value"
                      label="Turnout"
                      density="comfortable"
                      hide-details
                      variant="outlined"
                      class="min-w-[16rem] flex-1"
                      @update:model-value="resolveTargetMetadata(event)"
                    ></v-select>
                    <v-select
                      v-model="event.turnoutState"
                      :items="turnoutStateOptions"
                      item-title="label"
                      item-value="value"
                      label="State"
                      density="comfortable"
                      hide-details
                      variant="outlined"
                      class="w-36"
                    ></v-select>
                  </template>
                  <template v-else-if="event.actionType === 'signal'">
                    <v-select
                      v-model="event.targetId"
                      :items="signalOptions"
                      item-title="label"
                      item-value="value"
                      label="Signal"
                      density="comfortable"
                      hide-details
                      variant="outlined"
                      class="min-w-[16rem] flex-1"
                      @update:model-value="resolveTargetMetadata(event)"
                    ></v-select>
                    <v-select
                      v-model="event.signalAspect"
                      :items="signalAspectOptions"
                      item-title="label"
                      item-value="value"
                      label="Aspect"
                      density="comfortable"
                      hide-details
                      variant="outlined"
                      class="w-36"
                    ></v-select>
                  </template>
                </div>
                <div class="text-xs opacity-60" v-if="event.targetName">
                  Target: {{ event.targetName }} <span v-if="event.targetDevice">(Device: {{ event.targetDevice }})</span>
                </div>
              </template>
              <template v-else>
                <div class="rounded border border-white/10 bg-white/5 p-4 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="uppercase tracking-wide opacity-60">Audio File</span>
                    <span class="font-medium">{{ event.asset?.name ?? 'Unknown clip' }}</span>
                  </div>
                  <div class="mt-2 grid grid-cols-2 gap-2 text-[0.7rem] opacity-70">
                    <div>Type: {{ event.asset?.type || 'audio' }}</div>
                    <div>Size: {{ event.asset?.size ? `${Math.round(event.asset.size / 1024)} KB` : '—' }}</div>
                    <div>Track: {{ trackOptions.find((option) => option.value === event.trackId)?.label }}</div>
                    <div>Starts at: {{ event.delay }} ms</div>
                  </div>
                </div>
              </template>
            </div>
          </v-card-item>
          <v-card-actions class="justify-end">
            <v-btn
              icon="mdi-delete"
              color="red"
              variant="text"
              @click="removeEvent(event.id)"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </section>

    <v-dialog
      v-model="showTimelineEditor"
      fullscreen
      transition="dialog-bottom-transition"
      :scrim="false"
    >
      <v-card class="bg-[#111827] text-white">
        <v-toolbar flat class="bg-[#0f172a] text-white">
          <v-toolbar-title class="font-semibold tracking-wide">Multimedia Timeline Editor</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            class="text-white/80"
            prepend-icon="mdi-content-save"
            @click="showTimelineEditor = false"
          >
            Close &amp; Save
          </v-btn>
        </v-toolbar>
        <v-card-text class="h-full p-0">
          <div class="flex h-full flex-col">
            <div class="flex flex-wrap items-center gap-4 border-b border-white/10 bg-white/5 px-6 py-4 text-sm">
              <div class="flex items-center gap-3">
                <span class="uppercase tracking-wide opacity-60">Zoom</span>
                <v-slider
                  v-model="timelineZoom"
                  :min="0.02"
                  :max="0.5"
                  :step="0.01"
                  hide-details
                  class="w-52"
                ></v-slider>
              </div>
              <div class="flex items-center gap-3">
                <span class="uppercase tracking-wide opacity-60">Audio</span>
                <v-btn
                  prepend-icon="mdi-music-note-plus"
                  color="white"
                  class="text-slate-900"
                  variant="flat"
                  @click="triggerAudioImport()"
                >
                  Import Clips
                </v-btn>
                <v-btn
                  prepend-icon="mdi-plus"
                  color="white"
                  class="text-slate-900"
                  variant="flat"
                  @click="addAudioTrack"
                >
                  Add Audio Track
                </v-btn>
              </div>
            </div>
            <div class="flex-1 overflow-hidden">
              <div class="flex h-full overflow-hidden">
                <aside class="w-52 border-r border-white/10 bg-white/5 px-4 py-6 text-sm">
                  <h4 class="mb-4 text-xs font-semibold uppercase tracking-wide text-white/60">Tracks</h4>
                  <ul class="space-y-2">
                    <li v-for="track in timelineTracks" :key="track.id" class="flex items-center justify-between">
                      <span class="truncate">{{ track.name }}</span>
                      <v-btn
                        v-if="track.type === 'audio'"
                        size="x-small"
                        icon="mdi-delete"
                        variant="text"
                        class="text-white/60"
                        @click="removeAudioTrack(track.id)"
                      ></v-btn>
                    </li>
                  </ul>
                </aside>
                <div class="relative flex-1 overflow-hidden">
                  <div
                    ref="timelineScrollContainer"
                    class="h-full overflow-auto"
                  >
                    <div :style="{ width: `${timelineCanvasWidth}px` }" class="relative">
                      <div class="sticky top-0 z-10 flex h-12 items-center bg-[#0f172a] px-6">
                        <div class="relative flex-1">
                          <div class="absolute inset-0 flex items-center" :style="{ width: `${timelineWidth}px` }">
                            <div
                              v-for="marker in timelineMarkers"
                              :key="marker.position"
                              class="flex h-full flex-col items-center text-[0.65rem] text-white/60"
                              :style="{ left: `${marker.position}px` }
                              "
                            >
                              <span class="mb-2 border-l border-white/20" :style="{ height: '16px' }"></span>
                              {{ marker.label }}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="space-y-4 px-6 py-6">
                        <div
                          v-for="entry in eventsByTrack"
                          :key="entry.track.id"
                          class="rounded-lg border border-white/10 bg-white/5"
                        >
                          <div class="flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm uppercase tracking-wide">
                            <span>{{ entry.track.name }}</span>
                            <span class="text-white/60">{{ entry.track.type === 'audio' ? 'Sound' : 'Action' }} Track</span>
                          </div>
                          <div
                            class="relative flex-1 overflow-hidden py-4"
                            :style="timelineLaneStyle(entry.track.type)"
                            @dragover.prevent="entry.track.type === 'audio' && handleAudioDragOver($event)"
                            @drop.prevent="entry.track.type === 'audio' && handleAudioDrop($event, entry.track)"
                          >
                            <div
                              v-for="trackEvent in entry.events"
                              :key="trackEvent.id"
                              class="timeline-event"
                              :class="[trackEvent.type === 'audio' ? 'timeline-event--audio' : 'timeline-event--action']"
                              :style="eventBlockStyle(trackEvent)"
                            >
                              <div
                                class="timeline-event__resize timeline-event__resize--start"
                                @pointerdown.prevent="beginInteraction(trackEvent, 'resize-start', $event)"
                              ></div>
                              <div
                                class="timeline-event__content"
                                @pointerdown.prevent="beginInteraction(trackEvent, 'move', $event)"
                              >
                                <span class="truncate text-[0.7rem] font-medium">
                                  {{ trackEvent.name }}
                                </span>
                                <span class="text-[0.6rem] opacity-70">{{ trackEvent.duration }} ms</span>
                              </div>
                              <div
                                class="timeline-event__resize timeline-event__resize--end"
                                @pointerdown.prevent="beginInteraction(trackEvent, 'resize-end', $event)"
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <input
      ref="audioFileInput"
      type="file"
      accept="audio/*"
      class="hidden"
      multiple
      @change="handleAudioFileSelection"
    />

    <v-dialog max-width="80vw" v-model="showColorPicker">
      <ColorPicker
        v-model="colorPickerModel"
        @cancel="showColorPicker = false"
        @select="handleColorPickerSelect"
      />
    </v-dialog>
  </div>
</template>

<style scoped>
.timeline-event {
  position: absolute;
  top: 12px;
  min-width: 12px;
  height: 52px;
  display: flex;
  align-items: stretch;
  border-width: 1px;
  border-style: solid;
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: grab;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.timeline-event__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.5rem;
  gap: 0.15rem;
  color: #f9fafb;
}

.timeline-event--audio .timeline-event__content {
  color: #e0f2ff;
}

.timeline-event__resize {
  width: 8px;
  background: rgba(255, 255, 255, 0.2);
  cursor: ew-resize;
  pointer-events: auto;
}

.timeline-event__resize--start {
  border-right: 1px solid rgba(0, 0, 0, 0.3);
}

.timeline-event__resize--end {
  border-left: 1px solid rgba(0, 0, 0, 0.3);
}

.timeline-event__resize::after {
  content: '';
  display: block;
  width: 4px;
  height: 60%;
  margin: auto;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.5);
}

.timeline-event__resize:hover {
  background: rgba(255, 255, 255, 0.35);
}
</style>
