<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
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

interface SimpleEvent {
  id: string
  name: string
  delay: number
  duration: number
  color: string
}

interface ConfigState {
  strip: string | number | undefined
  stripLength: number
  rangeMode: RangeMode
  rangeStart: number
  rangeEnd: number
  events: SimpleEvent[]
}

const { getDevice } = useLayout()

const deviceData = ref<Device | null>(null)
const stripLength = ref<number>(150)
const rangeMode = ref<RangeMode>('all')
const rangeSelection = reactive<[number, number]>([0, 150])
const events = ref<SimpleEvent[]>([])

const showColorPicker = ref(false)
const colorPickerIndex = ref<number | null>(null)
const colorPickerModel = ref<string>('')

const hydrating = ref(false)

if (!pattern.value) {
  pattern.value = 'solid'
}

if (!range.value) {
  range.value = 'all'
}

const patterns = [
  { id: 'solid', label: 'Solid', description: 'Fill the selected LEDs with a single color.' },
  { id: 'rainbow', label: 'Rainbow', description: 'Cycle smoothly through the color spectrum.' },
  { id: 'chaserainbow', label: 'Chase Rainbow', description: 'Animate a rainbow that chases along the strip.' },
  { id: 'chasecolor', label: 'Chase Color', description: 'Animate a single color that chases along the strip.' },
  { id: 'wipe', label: 'Wipe', description: 'Wipe the color across the selected LEDs.' }
]

const stripOptions = computed(() => {
  const strips = (deviceData.value?.strips ?? []) as Array<number | Record<string, any>>
  if (strips.length === 0) {
    return [
      { id: '0', label: 'Strip 0', pin: 0, length: stripLength.value || 150 }
    ]
  }
  return strips.map((entry, index) => {
    if (typeof entry === 'number') {
      return {
        id: entry.toString(),
        label: `Strip ${entry}`,
        pin: entry,
        length: stripLength.value || 150
      }
    }
    const pinValue = entry?.pin ?? entry?.id ?? index
    const lengthValue = entry?.length ?? entry?.count ?? entry?.pixels ?? stripLength.value ?? 150
    return {
      id: String(pinValue),
      label: entry?.label ?? `Strip ${pinValue}`,
      pin: pinValue,
      length: typeof lengthValue === 'number' ? lengthValue : stripLength.value || 150
    }
  })
})

const selectedStripOption = computed(() =>
  stripOptions.value.find((option) => String(option.pin) === String(strip.value))
)

const maxRangeValue = computed(() => selectedStripOption.value?.length ?? stripLength.value ?? 150)

function clampRange(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.min(Math.max(value, 0), Math.max(maxRangeValue.value, 0))
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

function updateRangeModel(): void {
  if (rangeMode.value === 'all') {
    if (range.value !== 'all') {
      range.value = 'all'
    }
  } else {
    const start = clampRange(rangeSelection[0])
    const end = clampRange(rangeSelection[1])
    const rangeString = `${start}:${end}`
    if (range.value !== rangeString) {
      range.value = rangeString
    }
  }
}

function buildConfig(): ConfigState {
  return {
    strip: strip.value,
    stripLength: maxRangeValue.value,
    rangeMode: rangeMode.value,
    rangeStart: clampRange(rangeSelection[0]),
    rangeEnd: clampRange(rangeSelection[1]),
    events: events.value.map((event, index) => ({
      id: event.id || `event-${index}`,
      name: event.name || `Step ${index + 1}`,
      delay: Number.isFinite(event.delay) ? event.delay : 0,
      duration: Number.isFinite(event.duration) ? event.duration : 1000,
      color: event.color || props.color || '#ffffff'
    }))
  }
}

function emitChange(): void {
  if (hydrating.value) {
    return
  }
  ensureRangeWithinBounds()
  updateRangeModel()
  const configState = buildConfig()
  const nextConfig = JSON.stringify(configState)
  if (config.value !== nextConfig) {
    config.value = nextConfig
  }
  emit('change', {
    pattern: pattern.value ?? 'solid',
    range: range.value ?? 'all',
    config: config.value ?? nextConfig
  })
}

function addEvent(): void {
  const lastEvent = events.value[events.value.length - 1]
  events.value.push({
    id: `event-${Date.now()}`,
    name: `Step ${events.value.length + 1}`,
    delay: lastEvent ? lastEvent.delay + lastEvent.duration : 0,
    duration: 1000,
    color: lastEvent?.color ?? props.color ?? '#ffffff'
  })
}

function removeEvent(id: string): void {
  events.value = events.value.filter((event) => event.id !== id)
}

function openColorPicker(index: number): void {
  const event = events.value[index]
  if (!event) return
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
  if (event) {
    event.color = colorPickerModel.value
  }
  showColorPicker.value = false
}

function ensureDefaultEvent(): void {
  if (events.value.length === 0) {
    events.value.push({
      id: `event-${Date.now()}`,
      name: 'Step 1',
      delay: 0,
      duration: 1000,
      color: props.color || '#ffffff'
    })
  }
}

async function loadDevice(deviceId: string | undefined): Promise<void> {
  if (!deviceId) return
  try {
    const device = await getDevice(deviceId)
    deviceData.value = device ?? null
    const firstStrip = (device?.strips ?? [])[0]
    const initialStrip = strip.value ?? (
      typeof firstStrip === 'number'
        ? firstStrip
        : (firstStrip as any)?.pin ?? (firstStrip as any)?.id ?? 0
    )
    if (strip.value !== initialStrip) {
      strip.value = initialStrip
    }
  } catch (error) {
    console.error('Failed to load device information for IALED form', error)
  }
}

function loadConfig(configString?: string): void {
  if (!configString) {
    ensureDefaultEvent()
    emitChange()
    return
  }
  try {
    hydrating.value = true
    const parsed = JSON.parse(configString) as Partial<ConfigState>
    if (typeof parsed.stripLength === 'number') {
      stripLength.value = parsed.stripLength
    }
    if (typeof parsed.rangeStart === 'number' && typeof parsed.rangeEnd === 'number') {
      rangeSelection[0] = parsed.rangeStart
      rangeSelection[1] = parsed.rangeEnd
      rangeMode.value = parsed.rangeMode === 'custom' ? 'custom' : 'all'
    }
    if (Array.isArray(parsed.events)) {
      events.value = parsed.events.map((event, index) => ({
        id: event.id ?? `event-${index}`,
        name: event.name ?? `Step ${index + 1}`,
        delay: Number.isFinite(event.delay) ? event.delay : 0,
        duration: Number.isFinite(event.duration) ? event.duration : 1000,
        color: event.color ?? props.color ?? '#ffffff'
      }))
    } else {
      ensureDefaultEvent()
    }
  } catch (error) {
    console.warn('Unable to parse IALED config – using defaults', error)
    ensureDefaultEvent()
  } finally {
    nextTick(() => {
      hydrating.value = false
      emitChange()
    })
  }
}

watch(
  () => props.device,
  (newDevice) => {
    loadDevice(newDevice)
  },
  { immediate: true }
)

watch(
  () => config.value,
  (value, previous) => {
    if (value && value !== previous) {
      loadConfig(value)
    } else if (!value) {
      ensureDefaultEvent()
      emitChange()
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
    emitChange()
  },
  { immediate: true }
)

watch(
  () => [rangeMode.value, rangeSelection[0], rangeSelection[1]],
  () => {
    emitChange()
  },
  { deep: true }
)

watch(
  events,
  () => {
    emitChange()
  },
  { deep: true }
)

watch(
  () => props.color,
  (value) => {
    if (!value || hydrating.value) return
    if (events.value.length === 0) {
      ensureDefaultEvent()
    }
    if (colorPickerIndex.value === null) {
      events.value[0].color = value
    }
  },
  { immediate: true }
)

watch(
  () => pattern.value,
  () => {
    emitChange()
  }
)
</script>

<template>
  <div class="space-y-6">
    <section class="space-y-4">
      <header class="flex items-center justify-between">
        <h3 class="text-base font-semibold uppercase tracking-wide opacity-80">LED Strip</h3>
        <span class="text-sm opacity-70">Select the strip that should run this animation.</span>
      </header>
      <v-select
        v-model="strip"
        :items="stripOptions"
        item-title="label"
        item-value="pin"
        label="Strip"
        variant="outlined"
        density="comfortable"
        hide-details
        class="max-w-sm"
      ></v-select>
    </section>

    <v-divider class="border-opacity-100" :color="props.color"></v-divider>

    <section class="space-y-4">
      <header class="flex items-center justify-between">
        <h3 class="text-base font-semibold uppercase tracking-wide opacity-80">Pattern</h3>
        <span class="text-sm opacity-70">Choose how the animation behaves.</span>
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
        <span class="text-sm opacity-70">Target a section of the selected strip.</span>
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
      <header class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-semibold uppercase tracking-wide opacity-80">Animation Steps</h3>
          <p class="text-xs opacity-60">Create a sequence of color changes to play on the strip.</p>
        </div>
        <v-btn
          prepend-icon="mdi-plus"
          :color="props.color || 'teal'"
          variant="tonal"
          @click="addEvent"
        >
          Add Step
        </v-btn>
      </header>
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
              </div>
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

    <v-dialog max-width="80vw" v-model="showColorPicker">
      <ColorPicker
        v-model="colorPickerModel"
        @cancel="showColorPicker = false"
        @select="handleColorPickerSelect"
      />
    </v-dialog>
  </div>
</template>
