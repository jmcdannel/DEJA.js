<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
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

interface TimelineEvent {
  id: string
  name: string
  delay: number
  duration: number
  color: string
  rangeMode: RangeMode
  start: number
  end: number
}

interface ConfigState {
  strip: string | number | undefined
  stripLength: number
  rangeMode: RangeMode
  rangeStart: number
  rangeEnd: number
  events: TimelineEvent[]
}

const { getDevice } = useLayout()

const deviceData = ref<Device | null>(null)
const stripLength = ref<number>(150)
const rangeMode = ref<RangeMode>('all')
const rangeSelection = reactive<[number, number]>([0, 150])
const events = ref<TimelineEvent[]>([])

const showColorPicker = ref(false)
const colorPickerIndex = ref<number | null>(null)
const colorPickerModel = ref<string>('')

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
    }))
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
    if (Array.isArray(parsed.events)) {
      events.value = parsed.events.map((event, index) => ({
        id: event.id ?? `event-${index}`,
        name: event.name ?? `Step ${index + 1}`,
        delay: Number.isFinite(event.delay) ? event.delay : 0,
        duration: Number.isFinite(event.duration) ? event.duration : 1000,
        color: event.color ?? '#ffffff',
        rangeMode: event.rangeMode === 'custom' ? 'custom' : 'all',
        start: Number.isFinite(event.start) ? event.start : 0,
        end: Number.isFinite(event.end) ? event.end : maxRangeValue.value
      }))
    }
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
    end: clampRange(rangeSelection[1])
  }
  events.value = [...events.value, newEvent]
}

function removeEvent(id: string): void {
  events.value = events.value.filter((event) => event.id !== id)
}

function openColorPicker(index: number): void {
  colorPickerIndex.value = index
  colorPickerModel.value = events.value[index].color
  showColorPicker.value = true
}

function handleColorPickerSelect(): void {
  if (colorPickerIndex.value === null) {
    showColorPicker.value = false
    return
  }
  events.value[colorPickerIndex.value].color = colorPickerModel.value
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
    if (events.value.length === 0) {
      addEvent()
      events.value[0].color = value
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
  () => pattern.value,
  () => {
    updateConfig()
  }
)

onMounted(() => {
  if (!config.value) {
    updateConfig()
  }
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
      <header class="flex items-center justify-between">
        <h3 class="text-base font-semibold uppercase tracking-wide opacity-80">Timeline</h3>
        <v-btn
          prepend-icon="mdi-plus"
          :color="props.color || 'teal'"
          variant="tonal"
          @click="addEvent"
        >
          Add Step
        </v-btn>
      </header>
      <p class="text-sm opacity-70">
        Define a sequence of color changes. Each step can target the full strip or a custom range with its own timing.
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
                <v-text-field
                  v-model.number="event.delay"
                  label="Delay (ms)"
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
              </div>
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
