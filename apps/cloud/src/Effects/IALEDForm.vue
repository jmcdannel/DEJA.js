<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useLayout } from '@repo/modules'
import type { Device } from '@repo/modules/layouts/types'
import type { Effect } from '@repo/modules/effects'
import ColorPicker from '@/Common/Color/ColorPicker.vue'

const emit = defineEmits<{
  (event: 'change', payload: { pattern: string; range: string; config: string }): void
}>()

const pattern = defineModel<string | undefined>('pattern')
const range = defineModel<string | undefined>('range')
const config = defineModel<string | undefined>('config')
const strip = defineModel<string | number | undefined>('strip')

const props = defineProps<{
  efx: Effect
  device: string
  color: string
}>()

type RangeMode = 'all' | 'custom'

interface TimelineTrack {
  id: string
  name: string
  type: 'color' | 'audio'
}

interface TimelineAudioAsset {
  name: string
  size: number
  type: string
  lastModified: number
  objectUrl?: string
}

interface TimelineEvent {
  id: string
  name: string
  delay: number
  duration: number
  color: string
  rangeMode: RangeMode
  start: number
  end: number
  type: 'color' | 'audio'
  trackId: string
  asset?: TimelineAudioAsset | null
}

interface ConfigState {
  strip: string | number | undefined
  stripLength: number
  rangeMode: RangeMode
  rangeStart: number
  rangeEnd: number
  events: TimelineEvent[]
  tracks: TimelineTrack[]
}

const { getDevice } = useLayout()

const deviceData = ref<Device | null>(null)
const stripLength = ref<number>(150)
const rangeMode = ref<RangeMode>('all')
const rangeSelection = reactive<[number, number]>([0, 150])
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

const DEFAULT_COLOR_TRACK_ID = 'color-track'

let audioTrackIncrement = 1

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
    { id: DEFAULT_COLOR_TRACK_ID, name: 'Color Track', type: 'color' },
    { id: `audio-track-${audioTrackIncrement++}`, name: 'Audio Track 1', type: 'audio' }
  ]
}

function ensureTracks(): void {
  if (timelineTracks.value.length === 0) {
    timelineTracks.value = createDefaultTracks()
  }
  const colorTrack = timelineTracks.value.find((track) => track.type === 'color')
  if (!colorTrack) {
    timelineTracks.value = [
      { id: DEFAULT_COLOR_TRACK_ID, name: 'Color Track', type: 'color' },
      ...timelineTracks.value
    ]
  }
  events.value = events.value.map((event, index) => {
    const eventType = event.type ?? 'color'
    const matchingTrack = timelineTracks.value.find((track) => track.id === event.trackId)
    if (matchingTrack) {
      return {
        ...event,
        type: eventType
      }
    }
    const fallbackTrack = timelineTracks.value.find((track) => track.type === eventType) ??
      timelineTracks.value.find((track) => track.type === 'color') ??
      timelineTracks.value[0]
    return {
      ...event,
      id: event.id ?? `event-${index}`,
      type: eventType,
      trackId: fallbackTrack?.id ?? DEFAULT_COLOR_TRACK_ID
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

const patterns = [
  {
    id: 'solid',
    label: 'Solid',
    description: 'Fill the selected LEDs with a single color.'
  },
  {
    id: 'rainbow',
    label: 'Rainbow',
    description: 'Cycle smoothly through the color spectrum.'
  },
  {
    id: 'chaserainbow',
    label: 'Chase Rainbow',
    description: 'Animate a rainbow that chases along the strip.'
  },
  {
    id: 'chasecolor',
    label: 'Chase Color',
    description: 'Animate a single color that chases along the strip.'
  },
  {
    id: 'wipe',
    label: 'Wipe',
    description: 'Wipe the color across the selected LEDs.'
  }
]

const stripOptions = computed(() => {
  const strips = (deviceData.value?.strips ?? []) as Array<number | Record<string, any>>
  return strips.map((entry, index) => {
    if (typeof entry === 'number') {
      return {
        id: entry.toString(),
        label: `Strip ${entry}`,
        pin: entry,
        length: stripLength.value
      }
    }
    const pinValue = entry?.pin ?? entry?.id ?? index
    const lengthValue = entry?.length ?? entry?.count ?? entry?.pixels ?? stripLength.value
    return {
      id: String(pinValue),
      label: entry?.label ?? `Strip ${pinValue}`,
      pin: pinValue,
      length: typeof lengthValue === 'number' ? lengthValue : stripLength.value
    }
  })
})

const selectedStripOption = computed(() =>
  stripOptions.value.find((option) => String(option.pin) === String(strip.value))
)

const maxRangeValue = computed(() => {
  return selectedStripOption.value?.length ?? stripLength.value ?? 150
})

function clampRange(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.min(Math.max(value, 0), Math.max(maxRangeValue.value, 0))
}

function getColorTrack(): TimelineTrack {
  let track = timelineTracks.value.find((entry) => entry.type === 'color')
  if (!track) {
    ensureTracks()
    track = timelineTracks.value.find((entry) => entry.type === 'color')
  }
  return track ?? timelineTracks.value[0]
}

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
  const baseColor = entry.type === 'color' ? entry.color || '#16a34a' : '#38bdf8'
  return {
    left: `${msToPixels(entry.delay)}px`,
    width: `${Math.max(msToPixels(entry.duration), 6)}px`,
    backgroundColor: entry.type === 'color' ? baseColor : 'rgba(56, 189, 248, 0.35)',
    borderColor: entry.type === 'color' ? '#ffffff50' : '#38bdf880'
  }
}

function timelineLaneStyle(): Record<string, string> {
  return {
    backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px)',
    backgroundSize: `${gridSize.value}px 100%`
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
    color: '#38bdf8',
    rangeMode: 'all',
    start: clampRange(rangeSelection[0]),
    end: clampRange(rangeSelection[1]),
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
    getColorTrack().id
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

const canRemoveAudioTrack = (id: string): boolean => {
  return !events.value.some((event) => event.trackId === id)
}

function ensureRangeWithinBounds(): void {
  rangeSelection[0] = clampRange(rangeSelection[0])
  rangeSelection[1] = clampRange(rangeSelection[1])
  if (rangeSelection[0] > rangeSelection[1]) {
    const temp = rangeSelection[0]
    rangeSelection[0] = rangeSelection[1]
    rangeSelection[1] = temp
  }
}

function normalizeEvents(): void {
  const globalStart = rangeMode.value === 'all' ? 0 : clampRange(rangeSelection[0])
  const globalEnd = rangeMode.value === 'all' ? maxRangeValue.value : clampRange(rangeSelection[1])
  events.value = events.value.map((event) => {
    if (event.type !== 'color') {
      return {
        ...event,
        start: clampRange(event.start),
        end: clampRange(event.end)
      }
    }
    const normalizedStart = event.rangeMode === 'all' ? globalStart : clampRange(event.start)
    const normalizedEnd = event.rangeMode === 'all'
      ? globalEnd
      : clampRange(event.end < normalizedStart ? normalizedStart : event.end)
    return {
      ...event,
      start: normalizedStart,
      end: normalizedEnd
    }
  })
}

function toRangeString(): string {
  return rangeMode.value === 'all'
    ? 'all'
    : `${clampRange(rangeSelection[0])}:${clampRange(rangeSelection[1])}`
}

function updateRangeModel(): void {
  const nextRange = toRangeString()
  if (range.value !== nextRange) {
    range.value = nextRange
  }
}

function buildConfig(): ConfigState {
  return {
    strip: strip.value,
    stripLength: maxRangeValue.value,
    rangeMode: rangeMode.value,
    rangeStart: clampRange(rangeSelection[0]),
    rangeEnd: clampRange(rangeSelection[1]),
    events: events.value.map((event) => ({
      ...event,
      start: clampRange(event.start),
      end: clampRange(event.end)
    })),
    tracks: timelineTracks.value.map((track) => ({ ...track }))
  }
}

function updateConfig(): void {
  if (hydratingFromConfig) {
    return
  }
  ensureRangeWithinBounds()
  normalizeEvents()
  const configState = buildConfig()
  const configString = JSON.stringify(configState)
  if (config.value !== configString) {
    config.value = configString
  }
  emit('change', {
    pattern: pattern.value ?? '',
    range: range.value ?? '',
    config: config.value ?? ''
  })
}

function loadConfigFromString(configString?: string): void {
  if (!configString) return
  try {
    hydratingFromConfig = true
    const parsed = JSON.parse(configString) as Partial<ConfigState>
    if (typeof parsed.stripLength === 'number') {
      stripLength.value = parsed.stripLength
    }
    if (typeof parsed.rangeStart === 'number' && typeof parsed.rangeEnd === 'number') {
      rangeSelection[0] = parsed.rangeStart
      rangeSelection[1] = parsed.rangeEnd
      rangeMode.value = parsed.rangeMode === 'custom' ? 'custom' : 'all'
    }
    if (Array.isArray(parsed.tracks) && parsed.tracks.length > 0) {
      timelineTracks.value = parsed.tracks.map((track, index) => ({
        id: track.id ?? `track-${index}`,
        name: track.name ?? (track.type === 'audio' ? `Audio Track ${index}` : 'Color Track'),
        type: track.type === 'audio' ? 'audio' : 'color'
      }))
      const audioTracks = timelineTracks.value.filter((track) => track.type === 'audio').length
      audioTrackIncrement = Math.max(audioTrackIncrement, audioTracks + 1)
    } else {
      timelineTracks.value = createDefaultTracks()
    }
    if (Array.isArray(parsed.events)) {
      events.value = parsed.events.map((event, index) => ({
        id: event.id ?? `event-${index}`,
        name: event.name ?? `Step ${index + 1}`,
        delay: Number.isFinite(event.delay) ? event.delay : 0,
        duration: Number.isFinite(event.duration) ? event.duration : 1000,
        color: event.color ?? '#ffffff',
        rangeMode: event.rangeMode === 'custom' ? 'custom' : 'all',
        start: Number.isFinite(event.start) ? event.start : 0,
        end: Number.isFinite(event.end) ? event.end : maxRangeValue.value,
        type: event.type === 'audio' ? 'audio' : 'color',
        trackId: event.trackId ?? (event.type === 'audio'
          ? timelineTracks.value.find((track) => track.type === 'audio')?.id ?? DEFAULT_COLOR_TRACK_ID
          : getColorTrack().id),
        asset: event.asset ?? null
      }))
    }
    ensureTracks()
    nextTick(() => {
      hydratingFromConfig = false
      updateConfig()
    })
  } catch (error) {
    console.warn('Unable to parse IALED config – using defaults', error)
    hydratingFromConfig = false
  }
}

async function loadDevice(deviceId: string | undefined): Promise<void> {
  if (!deviceId) return
  try {
    const device = await getDevice(deviceId)
    deviceData.value = device ?? null
    if (device?.strips && device.strips.length > 0) {
      const firstStrip = device.strips[0]
      const initialStrip = strip.value ?? (typeof firstStrip === 'number' ? firstStrip : (firstStrip as any)?.pin ?? (firstStrip as any)?.id ?? 0)
      if (strip.value !== initialStrip) {
        strip.value = initialStrip
      }
    }
  } catch (error) {
    console.error('Failed to load device information for IALED form', error)
  }
}

ensureTracks()

function addEvent(): void {
  const colorSource =
    events.value.length === 0
      ? props.color || props.efx?.color || '#ffffff'
      : events.value[events.value.length - 1].color
  const newEvent: TimelineEvent = {
    id: `event-${Date.now()}`,
    name: `Step ${events.value.length + 1}`,
    delay: events.value.length === 0 ? 0 : events.value[events.value.length - 1].delay + events.value[events.value.length - 1].duration,
    duration: 1000,
    color: colorSource,
    rangeMode: rangeMode.value,
    start: clampRange(rangeSelection[0]),
    end: clampRange(rangeSelection[1]),
    type: 'color',
    trackId: getColorTrack().id,
    asset: null
  }
  events.value = [...events.value, newEvent]
}

function removeEvent(id: string): void {
  events.value = events.value.filter((event) => event.id !== id)
}

function openColorPicker(index: number): void {
  const event = events.value[index]
  if (!event || event.type !== 'color') {
    return
  }
  colorPickerIndex.value = index
  colorPickerModel.value = event.color
  showColorPicker.value = true
}

function handleColorPickerSelect(): void {
  if (colorPickerIndex.value === null) {
    showColorPicker.value = false
    return
  }
  const event = events.value[colorPickerIndex.value]
  if (event?.type === 'color') {
    event.color = colorPickerModel.value
  }
  showColorPicker.value = false
}

watch(
  () => props.device,
  (newDevice) => {
    loadDevice(newDevice)
  },
  { immediate: true }
)

watch(
  () => props.color,
  (value) => {
    if (!value) return
    const firstColorEvent = events.value.find((event) => event.type === 'color')
    if (firstColorEvent) {
      firstColorEvent.color = value
    } else {
      addEvent()
      const createdEvent = events.value.find((event) => event.type === 'color')
      if (createdEvent) {
        createdEvent.color = value
      }
    }
  },
  { immediate: true }
)

watch(
  () => config.value,
  (value, oldValue) => {
    if (value && value !== oldValue) {
      loadConfigFromString(value)
    }
  },
  { immediate: true }
)

watch(
  () => strip.value,
  () => {
    if (selectedStripOption.value?.length) {
      stripLength.value = selectedStripOption.value.length
      rangeSelection[1] = clampRange(selectedStripOption.value.length)
    }
    updateRangeModel()
    updateConfig()
  },
  { immediate: true }
)

watch(
  () => maxRangeValue.value,
  () => {
    ensureRangeWithinBounds()
    normalizeEvents()
    updateRangeModel()
    updateConfig()
  }
)

watch(
  () => range.value,
  (value) => {
    if (hydratingFromConfig) {
      return
    }
    if (!value || value === 'all') {
      rangeMode.value = 'all'
      rangeSelection[0] = 0
      rangeSelection[1] = maxRangeValue.value
    } else {
      const [start, end] = value.split(':').map((part) => Number.parseInt(part, 10))
      if (Number.isFinite(start) && Number.isFinite(end)) {
        rangeMode.value = 'custom'
        rangeSelection[0] = clampRange(start)
        rangeSelection[1] = clampRange(end)
      }
    }
  },
  { immediate: true }
)

watch(
  () => [rangeMode.value, rangeSelection[0], rangeSelection[1]],
  () => {
    updateRangeModel()
    updateConfig()
  },
  { deep: true }
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
  showTimelineEditor,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        timelineScrollContainer.value?.scrollTo?.({ left: 0 })
      })
    }
  }
)

watch(
  () => pattern.value,
  () => {
    updateConfig()
  }
)

onMounted(() => {
  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', handlePointerUp)
  ensureTracks()
  if (!config.value) {
    updateConfig()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', handlePointerUp)
})
</script>

<template>
  <div class="space-y-6">
    <section class="space-y-3">
      <header class="flex items-center justify-between">
        <h3 class="text-base font-semibold uppercase tracking-wide opacity-80">Strip Selection</h3>
        <span class="text-sm opacity-70">
          {{ selectedStripOption ? `LEDs: ${selectedStripOption.length}` : `LEDs: ${Math.round(maxRangeValue)}` }}
        </span>
      </header>
      <div v-if="stripOptions.length === 0" class="rounded border border-dashed border-neutral-500/40 p-4 text-sm opacity-70">
        No strips defined for this device. Enter the pin or identifier manually below.
      </div>
      <div class="flex flex-wrap gap-2">
        <v-btn
          v-for="option in stripOptions"
          :key="option.id"
          :value="option.pin"
          :color="String(strip) === String(option.pin) ? (props.color || 'teal') : 'surface'"
          class="min-w-[8rem]"
          variant="flat"
          @click="strip = option.pin"
        >
          <div class="flex flex-col items-center text-xs">
            <span class="font-medium">{{ option.label }}</span>
            <span class="opacity-70">Pin {{ option.pin }}</span>
            <span class="opacity-70">{{ option.length }} LEDs</span>
          </div>
        </v-btn>
      </div>
      <v-text-field
        v-model="strip"
        label="Pin / Strip Identifier"
        hint="Value sent to the controller when this effect is triggered"
        density="comfortable"
        variant="outlined"
        hide-details
        class="max-w-sm"
      ></v-text-field>
      <v-text-field
        v-model.number="stripLength"
        label="Strip Length (LEDs)"
        type="number"
        min="1"
        density="comfortable"
        variant="outlined"
        hide-details
        class="max-w-sm"
      ></v-text-field>
    </section>

    <v-divider class="border-opacity-100" :color="props.color"></v-divider>

    <section class="space-y-4">
      <header class="flex items-center justify-between">
        <h3 class="text-base font-semibold uppercase tracking-wide opacity-80">Pattern</h3>
        <span class="text-sm opacity-70">Choose how the animation behaves</span>
      </header>
      <v-btn-toggle class="flex flex-wrap" v-model="pattern">
        <v-btn
          v-for="p in patterns"
          :key="p.id"
          :value="p.id"
          :color="pattern === p.id ? (props.color || 'teal') : 'surface'"
          class="min-h-[7rem] min-w-[12rem] text-left"
          variant="flat"
        >
          <div class="flex flex-col items-start space-y-1">
            <span class="font-semibold">{{ p.label }}</span>
            <span class="text-xs opacity-70">{{ p.description }}</span>
          </div>
        </v-btn>
      </v-btn-toggle>
    </section>

    <v-divider class="border-opacity-100" :color="props.color"></v-divider>

    <section class="space-y-4">
      <header class="flex items-center justify-between">
        <h3 class="text-base font-semibold uppercase tracking-wide opacity-80">Range</h3>
        <span class="text-sm opacity-70">Target a section of the selected strip</span>
      </header>
      <v-btn-toggle v-model="rangeMode" class="flex gap-2">
        <v-btn value="all" :color="rangeMode === 'all' ? (props.color || 'teal') : 'surface'" variant="flat">Entire Strip</v-btn>
        <v-btn value="custom" :color="rangeMode === 'custom' ? (props.color || 'teal') : 'surface'" variant="flat">Custom Range</v-btn>
      </v-btn-toggle>
      <div v-if="rangeMode === 'custom'" class="space-y-2">
        <div class="flex justify-between text-xs uppercase tracking-wide opacity-70">
          <span>Start: {{ rangeSelection[0] }}</span>
          <span>End: {{ rangeSelection[1] }}</span>
        </div>
        <v-range-slider
          v-model="rangeSelection"
          :max="maxRangeValue"
          :step="1"
          thumb-label="always"
          class="mx-1"
          hide-details
        ></v-range-slider>
      </div>
    </section>

    <v-divider class="border-opacity-100" :color="props.color"></v-divider>

    <section class="space-y-4">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 class="text-base font-semibold uppercase tracking-wide opacity-80">Timeline</h3>
          <p class="text-xs opacity-60">Arrange lighting cues and layer audio clips along the same schedule.</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <v-btn
            prepend-icon="mdi-timeline-plus"
            :color="props.color || 'teal'"
            variant="tonal"
            @click="addEvent"
          >
            Add Color Step
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
        Build your animation one step at a time or jump into the full timeline editor to drag color cues and audio clips into
        place. Audio can overlap by stacking clips on separate tracks.
      </p>
      <div v-if="events.length === 0" class="rounded border border-dashed border-neutral-500/40 p-6 text-center text-sm opacity-70">
        No animation steps yet. Click “Add Step” to begin.
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
                  label="Step name"
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
              <template v-if="event.type === 'color'">
                <div class="flex flex-wrap items-center gap-4">
                  <div class="flex items-center gap-2">
                    <span class="text-xs uppercase tracking-wide opacity-70">Color</span>
                    <v-btn
                      :style="{ backgroundColor: event.color }"
                      class="h-10 w-10 border"
                      variant="flat"
                      @click="openColorPicker(events.indexOf(event))"
                    ></v-btn>
                    <span class="text-xs opacity-70">{{ event.color }}</span>
                  </div>
                  <v-btn-toggle v-model="event.rangeMode" class="flex gap-1">
                    <v-btn value="all" :color="event.rangeMode === 'all' ? (props.color || 'teal') : 'surface'" variant="flat">Entire Strip</v-btn>
                    <v-btn value="custom" :color="event.rangeMode === 'custom' ? (props.color || 'teal') : 'surface'" variant="flat">Custom</v-btn>
                  </v-btn-toggle>
                </div>
                <div v-if="event.rangeMode === 'custom'" class="space-y-2">
                  <div class="flex justify-between text-xs uppercase tracking-wide opacity-70">
                    <span>Start: {{ event.start }}</span>
                    <span>End: {{ event.end }}</span>
                  </div>
                  <v-range-slider
                    :model-value="[event.start, event.end]"
                    :max="maxRangeValue"
                    :step="1"
                    hide-details
                    thumb-label="always"
                    @update:model-value="(value: [number, number]) => { event.start = value[0]; event.end = value[1] }"
                  ></v-range-slider>
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
          <v-toolbar-title class="font-semibold tracking-wide">Timeline Editor</v-toolbar-title>
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
              <div class="flex flex-wrap items-center gap-2">
                <v-btn
                  prepend-icon="mdi-timeline-plus"
                  :color="props.color || 'teal'"
                  variant="tonal"
                  @click="addEvent"
                >
                  Add Color Step
                </v-btn>
                <v-btn
                  prepend-icon="mdi-music-note-plus"
                  color="blue"
                  variant="tonal"
                  @click="triggerAudioImport()"
                >
                  Import Audio
                </v-btn>
                <v-btn
                  prepend-icon="mdi-view-parallel"
                  color="surface"
                  variant="flat"
                  class="border border-white/10 bg-white/5"
                  @click="addAudioTrack"
                >
                  Add Audio Track
                </v-btn>
              </div>
            </div>
            <div ref="timelineScrollContainer" class="flex-1 overflow-auto">
              <div :style="{ width: `${timelineCanvasWidth}px` }">
                <div class="flex border-b border-white/10 bg-white/5">
                  <div class="w-48 flex-shrink-0 border-r border-white/10 px-4 py-2 text-xs uppercase tracking-wide opacity-60">
                    Timecode
                  </div>
                  <div class="relative flex-1 py-2 pointer-events-none">
                    <div
                      v-for="marker in timelineMarkers"
                      :key="marker.position"
                      class="absolute top-0 flex h-full w-px flex-col items-start"
                      :style="{ left: `${marker.position}px` }"
                    >
                      <div class="h-full w-px bg-white/10"></div>
                      <span class="-ml-3 mt-1 text-[0.6rem] uppercase tracking-wide text-white/60">{{ marker.label }}</span>
                    </div>
                  </div>
                </div>
                <div
                  v-for="entry in eventsByTrack"
                  :key="entry.track.id"
                  class="flex border-b border-white/10"
                >
                  <div class="w-48 flex-shrink-0 border-r border-white/10 px-4 py-4">
                    <div class="flex items-center gap-2">
                      <v-icon size="18" :icon="entry.track.type === 'audio' ? 'mdi-music-note' : 'mdi-palette'" class="opacity-70"></v-icon>
                      <v-text-field
                        v-model="entry.track.name"
                        density="compact"
                        variant="underlined"
                        label="Track"
                        hide-details
                        class="text-sm"
                      ></v-text-field>
                    </div>
                    <div v-if="entry.track.type === 'audio'" class="mt-2 flex items-center gap-2">
                      <v-btn
                        size="small"
                        variant="text"
                        class="text-xs uppercase tracking-wide opacity-70"
                        prepend-icon="mdi-upload"
                        @click="triggerAudioImport(entry.track.id)"
                      >
                        Import Clip
                      </v-btn>
                      <v-btn
                        v-if="canRemoveAudioTrack(entry.track.id)"
                        size="small"
                        icon="mdi-delete"
                        variant="text"
                        class="text-white/60"
                        @click="removeAudioTrack(entry.track.id)"
                      ></v-btn>
                    </div>
                  </div>
                  <div
                    class="relative flex-1 overflow-hidden py-4"
                    :class="{ 'bg-blue-500/5': entry.track.type === 'audio', 'bg-emerald-500/5': entry.track.type === 'color' }"
                    :style="timelineLaneStyle()"
                    @dragover.prevent="entry.track.type === 'audio' && handleAudioDragOver($event)"
                    @drop.prevent="entry.track.type === 'audio' && handleAudioDrop($event, entry.track)"
                  >
                    <div
                      v-for="trackEvent in entry.events"
                      :key="trackEvent.id"
                      class="timeline-event"
                      :class="[trackEvent.type === 'audio' ? 'timeline-event--audio' : 'timeline-event--color']"
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

.timeline-event__resize:active,
.timeline-event:active {
  cursor: grabbing;
}

.timeline-event--color {
  color: #0f172a;
}

.timeline-event--audio {
  background: rgba(56, 189, 248, 0.35) !important;
  border-color: rgba(125, 211, 252, 0.7) !important;
}

.timeline-event--color {
  border-color: rgba(255, 255, 255, 0.3) !important;
}

.timeline-event__resize,
.timeline-event__content {
  pointer-events: auto;
}

.timeline-event__content span {
  pointer-events: none;
}

.timeline-event__content span:first-child {
  font-weight: 600;
}

.timeline-event__content span:last-child {
  letter-spacing: 0.08em;
}

.timeline-event__resize--start,
.timeline-event__resize--end {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
