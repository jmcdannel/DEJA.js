<script setup lang="ts">
import { computed, nextTick, ref, reactive, watch } from 'vue'
import { useLayout } from '@repo/modules'
import type { Device } from '@repo/modules'
import type { Effect } from '@repo/modules/effects'
import ColorPicker from '@/Common/Color/ColorPicker.vue'

/* ------------------------------------------------------------------ */
/*  Models & Props                                                     */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type RangeMode = 'all' | 'custom'

interface AnimationStep {
  id: string
  name: string
  delay: number
  duration: number
  color: string
}

interface IALEDConfig {
  strip: string | number | undefined
  stripLength: number
  rangeMode: RangeMode
  rangeStart: number
  rangeEnd: number
  events: AnimationStep[]
}

/* ------------------------------------------------------------------ */
/*  Device & Strip Data                                                */
/* ------------------------------------------------------------------ */

const { getDevice } = useLayout()
const deviceData = ref<Device | null>(null)
const stripLength = ref<number>(150)
const hydrating = ref(false)

/* ------------------------------------------------------------------ */
/*  Range State                                                        */
/* ------------------------------------------------------------------ */

const rangeMode = ref<RangeMode>('all')
const rangeSelection = reactive<[number, number]>([0, 150])

/* ------------------------------------------------------------------ */
/*  Animation Steps State                                              */
/* ------------------------------------------------------------------ */

const steps = ref<AnimationStep[]>([])

/* ------------------------------------------------------------------ */
/*  Color Picker State                                                 */
/* ------------------------------------------------------------------ */

const showColorPicker = ref(false)
const colorPickerStepIndex = ref<number | null>(null)
const colorPickerModel = ref<string>('')

/* ------------------------------------------------------------------ */
/*  Pattern Definitions                                                */
/* ------------------------------------------------------------------ */

if (!pattern.value) {
  pattern.value = 'solid'
}

if (!range.value) {
  range.value = 'all'
}

const patterns = [
  {
    id: 'solid',
    label: 'Solid',
    icon: 'mdi-square-rounded',
    description: 'Fill the strip with a single steady color.'
  },
  {
    id: 'rainbow',
    label: 'Rainbow',
    icon: 'mdi-looks',
    description: 'Cycle smoothly through the full color spectrum.'
  },
  {
    id: 'chaserainbow',
    label: 'Chase Rainbow',
    icon: 'mdi-motion',
    description: 'Animate a rainbow that chases along the strip.'
  },
  {
    id: 'chasecolor',
    label: 'Chase Color',
    icon: 'mdi-run-fast',
    description: 'Animate a single color chasing along the strip.'
  },
  {
    id: 'wipe',
    label: 'Wipe',
    icon: 'mdi-transition',
    description: 'Wipe the color across the selected LEDs.'
  }
]

/* ------------------------------------------------------------------ */
/*  Computed: Strip Options from Device                                */
/* ------------------------------------------------------------------ */

const stripOptions = computed(() => {
  const strips = (deviceData.value?.strips ?? []) as Array<number | Record<string, unknown>>
  if (strips.length === 0) {
    return [{ id: '0', label: 'Strip 0', pin: 0, length: stripLength.value || 150 }]
  }
  return strips.map((entry, index) => {
    if (typeof entry === 'number') {
      return { id: entry.toString(), label: `Strip ${entry}`, pin: entry, length: stripLength.value || 150 }
    }
    const pinValue = (entry as Record<string, number>)?.pin ?? (entry as Record<string, number>)?.id ?? index
    const lengthValue = (entry as Record<string, number>)?.length
      ?? (entry as Record<string, number>)?.count
      ?? (entry as Record<string, number>)?.pixels
      ?? stripLength.value
      ?? 150
    return {
      id: String(pinValue),
      label: (entry as Record<string, string>)?.label ?? `Strip ${pinValue}`,
      pin: pinValue,
      length: typeof lengthValue === 'number' ? lengthValue : stripLength.value || 150
    }
  })
})

const selectedStripOption = computed(() =>
  stripOptions.value.find((opt) => String(opt.pin) === String(strip.value))
)

const maxRange = computed(() => selectedStripOption.value?.length ?? stripLength.value ?? 150)

/* ------------------------------------------------------------------ */
/*  Computed: Pattern requires color                                   */
/* ------------------------------------------------------------------ */

const patternNeedsColor = computed(() => {
  const colorPatterns = ['solid', 'chasecolor', 'wipe']
  return colorPatterns.includes(pattern.value ?? '')
})

/* ------------------------------------------------------------------ */
/*  Computed: Timeline visual for steps preview                        */
/* ------------------------------------------------------------------ */

const totalDuration = computed(() => {
  if (steps.value.length === 0) return 3000
  return Math.max(3000, ...steps.value.map((s) => s.delay + s.duration))
})

/* ------------------------------------------------------------------ */
/*  Range Helpers                                                      */
/* ------------------------------------------------------------------ */

function clampRange(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(Math.max(value, 0), Math.max(maxRange.value, 0))
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
    if (range.value !== 'all') range.value = 'all'
  } else {
    const start = clampRange(rangeSelection[0])
    const end = clampRange(rangeSelection[1])
    const rangeString = `${start}:${end}`
    if (range.value !== rangeString) range.value = rangeString
  }
}

/* ------------------------------------------------------------------ */
/*  Config Build & Emit                                                */
/* ------------------------------------------------------------------ */

function buildConfig(): IALEDConfig {
  return {
    strip: strip.value,
    stripLength: maxRange.value,
    rangeMode: rangeMode.value,
    rangeStart: clampRange(rangeSelection[0]),
    rangeEnd: clampRange(rangeSelection[1]),
    events: steps.value.map((step, index) => ({
      id: step.id || `step-${index}`,
      name: step.name || `Step ${index + 1}`,
      delay: Number.isFinite(step.delay) ? step.delay : 0,
      duration: Number.isFinite(step.duration) ? step.duration : 1000,
      color: step.color || props.color || '#ffffff'
    }))
  }
}

function emitChange(): void {
  if (hydrating.value) return
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

/* ------------------------------------------------------------------ */
/*  Step Management                                                    */
/* ------------------------------------------------------------------ */

function ensureDefaultStep(): void {
  if (steps.value.length === 0) {
    steps.value.push({
      id: `step-${Date.now()}`,
      name: 'Step 1',
      delay: 0,
      duration: 1000,
      color: props.color || '#ffffff'
    })
  }
}

function addStep(): void {
  const lastStep = steps.value[steps.value.length - 1]
  steps.value.push({
    id: `step-${Date.now()}`,
    name: `Step ${steps.value.length + 1}`,
    delay: lastStep ? lastStep.delay + lastStep.duration : 0,
    duration: 1000,
    color: lastStep?.color ?? props.color ?? '#ffffff'
  })
}

function removeStep(id: string): void {
  steps.value = steps.value.filter((s) => s.id !== id)
  if (steps.value.length === 0) {
    ensureDefaultStep()
  }
}

function duplicateStep(index: number): void {
  const source = steps.value[index]
  if (!source) return
  const clone: AnimationStep = {
    id: `step-${Date.now()}`,
    name: `${source.name} (copy)`,
    delay: source.delay + source.duration,
    duration: source.duration,
    color: source.color
  }
  steps.value.splice(index + 1, 0, clone)
}

/* ------------------------------------------------------------------ */
/*  Color Picker Handlers                                              */
/* ------------------------------------------------------------------ */

function openColorPicker(index: number): void {
  const step = steps.value[index]
  if (!step) return
  colorPickerStepIndex.value = index
  colorPickerModel.value = step.color
  showColorPicker.value = true
}

function handleColorPickerSelect(): void {
  if (colorPickerStepIndex.value === null) {
    showColorPicker.value = false
    return
  }
  const step = steps.value[colorPickerStepIndex.value]
  if (step) {
    step.color = colorPickerModel.value
  }
  showColorPicker.value = false
}

/* ------------------------------------------------------------------ */
/*  Device Loading                                                     */
/* ------------------------------------------------------------------ */

async function loadDevice(deviceId: string | undefined): Promise<void> {
  if (!deviceId) return
  try {
    const device = await getDevice(deviceId)
    deviceData.value = device ?? null
    const firstStrip = (device?.strips ?? [])[0]
    const initialStrip = strip.value ?? (
      typeof firstStrip === 'number'
        ? firstStrip
        : (firstStrip as Record<string, number>)?.pin ?? (firstStrip as Record<string, number>)?.id ?? 0
    )
    if (strip.value !== initialStrip) {
      strip.value = initialStrip
    }
  } catch (error) {
    console.error('Failed to load device information for IALED form', error)
  }
}

/* ------------------------------------------------------------------ */
/*  Config Hydration                                                   */
/* ------------------------------------------------------------------ */

function loadConfig(configString?: string): void {
  if (!configString) {
    ensureDefaultStep()
    emitChange()
    return
  }
  try {
    hydrating.value = true
    const parsed = JSON.parse(configString) as Partial<IALEDConfig>
    if (typeof parsed.stripLength === 'number') {
      stripLength.value = parsed.stripLength
    }
    if (typeof parsed.rangeStart === 'number' && typeof parsed.rangeEnd === 'number') {
      rangeSelection[0] = parsed.rangeStart
      rangeSelection[1] = parsed.rangeEnd
      rangeMode.value = parsed.rangeMode === 'custom' ? 'custom' : 'all'
    }
    if (Array.isArray(parsed.events)) {
      steps.value = parsed.events.map((evt, index) => ({
        id: evt.id ?? `step-${index}`,
        name: evt.name ?? `Step ${index + 1}`,
        delay: Number.isFinite(evt.delay) ? evt.delay : 0,
        duration: Number.isFinite(evt.duration) ? evt.duration : 1000,
        color: evt.color ?? props.color ?? '#ffffff'
      }))
    } else {
      ensureDefaultStep()
    }
  } catch (error) {
    console.warn('Unable to parse IALED config, using defaults', error)
    ensureDefaultStep()
  } finally {
    nextTick(() => {
      hydrating.value = false
      emitChange()
    })
  }
}

/* ------------------------------------------------------------------ */
/*  Watchers                                                           */
/* ------------------------------------------------------------------ */

watch(
  () => props.device,
  (newDevice) => loadDevice(newDevice),
  { immediate: true }
)

watch(
  () => config.value,
  (value, previous) => {
    if (value && value !== previous) {
      loadConfig(value)
    } else if (!value) {
      ensureDefaultStep()
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
  () => emitChange(),
  { deep: true }
)

watch(steps, () => emitChange(), { deep: true })

watch(
  () => props.color,
  (value) => {
    if (!value || hydrating.value) return
    if (steps.value.length === 0) ensureDefaultStep()
    if (colorPickerStepIndex.value === null && steps.value[0]) {
      steps.value[0].color = value
    }
  },
  { immediate: true }
)

watch(() => pattern.value, () => emitChange())
</script>

<template>
  <div class="space-y-6">
    <!-- ============================================================ -->
    <!-- STRIP SELECTION                                               -->
    <!-- ============================================================ -->
    <section class="space-y-3">
      <header class="flex items-center gap-3">
        <v-icon color="teal" size="20">mdi-led-strip-variant</v-icon>
        <h3 class="text-sm font-semibold uppercase tracking-[0.12em] text-sky-200">
          LED Strip
        </h3>
      </header>
      <p class="text-xs text-slate-400">
        Select which addressable LED strip this animation should target.
      </p>
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
      />
      <div class="flex items-center gap-4 text-xs text-slate-400">
        <v-icon size="14">mdi-information-outline</v-icon>
        <span>Strip length: <strong class="text-sky-300">{{ maxRange }} LEDs</strong></span>
      </div>
    </section>

    <v-divider class="border-opacity-100" :color="props.color" />

    <!-- ============================================================ -->
    <!-- PATTERN SELECTION                                             -->
    <!-- ============================================================ -->
    <section class="space-y-3">
      <header class="flex items-center gap-3">
        <v-icon color="teal" size="20">mdi-animation-play</v-icon>
        <h3 class="text-sm font-semibold uppercase tracking-[0.12em] text-sky-200">
          Pattern
        </h3>
      </header>
      <p class="text-xs text-slate-400">
        Choose how the animation behaves on the strip.
      </p>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        <v-card
          v-for="p in patterns"
          :key="p.id"
          class="cursor-pointer transition-all duration-150"
          :class="pattern === p.id
            ? 'border-2 border-sky-400 shadow-lg shadow-sky-400/20'
            : 'border border-slate-700 hover:border-slate-500'"
          :color="pattern === p.id ? props.color || 'teal' : 'surface'"
          variant="tonal"
          @click="pattern = p.id"
        >
          <v-card-text class="flex flex-col items-center text-center gap-2 py-4 px-2">
            <v-icon :icon="p.icon" size="28" />
            <span class="text-sm font-semibold">{{ p.label }}</span>
            <span class="text-xs opacity-60 leading-tight">{{ p.description }}</span>
          </v-card-text>
        </v-card>
      </div>
    </section>

    <v-divider class="border-opacity-100" :color="props.color" />

    <!-- ============================================================ -->
    <!-- LED RANGE                                                     -->
    <!-- ============================================================ -->
    <section class="space-y-3">
      <header class="flex items-center gap-3">
        <v-icon color="teal" size="20">mdi-arrow-expand-horizontal</v-icon>
        <h3 class="text-sm font-semibold uppercase tracking-[0.12em] text-sky-200">
          LED Range
        </h3>
      </header>
      <p class="text-xs text-slate-400">
        Target the entire strip or a custom subset of LEDs.
      </p>
      <v-btn-toggle v-model="rangeMode" mandatory class="flex gap-2">
        <v-btn
          value="all"
          :color="rangeMode === 'all' ? (props.color || 'teal') : 'surface'"
          variant="flat"
          size="large"
          class="flex-1"
        >
          <v-icon class="mr-2">mdi-select-all</v-icon>
          Entire Strip
        </v-btn>
        <v-btn
          value="custom"
          :color="rangeMode === 'custom' ? (props.color || 'teal') : 'surface'"
          variant="flat"
          size="large"
          class="flex-1"
        >
          <v-icon class="mr-2">mdi-select-group</v-icon>
          Custom Range
        </v-btn>
      </v-btn-toggle>

      <div v-if="rangeMode === 'custom'" class="space-y-2 p-4 rounded-lg bg-[#0f172a]/50 border border-slate-700">
        <div class="flex justify-between text-xs uppercase tracking-[0.12em] text-slate-400">
          <span>Start: <strong class="text-sky-300">{{ rangeSelection[0] }}</strong></span>
          <span>End: <strong class="text-sky-300">{{ rangeSelection[1] }}</strong></span>
        </div>
        <v-range-slider
          v-model="rangeSelection"
          :max="maxRange"
          :step="1"
          thumb-label="always"
          :color="props.color || 'teal'"
          hide-details
          class="mx-1"
        />
        <div class="flex items-center gap-4">
          <v-text-field
            v-model.number="rangeSelection[0]"
            label="Start LED"
            type="number"
            :min="0"
            :max="rangeSelection[1]"
            density="compact"
            variant="outlined"
            hide-details
            class="max-w-[8rem]"
          />
          <v-icon size="16" class="text-slate-500">mdi-arrow-right</v-icon>
          <v-text-field
            v-model.number="rangeSelection[1]"
            label="End LED"
            type="number"
            :min="rangeSelection[0]"
            :max="maxRange"
            density="compact"
            variant="outlined"
            hide-details
            class="max-w-[8rem]"
          />
        </div>
      </div>
    </section>

    <v-divider class="border-opacity-100" :color="props.color" />

    <!-- ============================================================ -->
    <!-- ANIMATION STEPS (TIMELINE)                                    -->
    <!-- ============================================================ -->
    <section class="space-y-4">
      <header class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <v-icon color="teal" size="20">mdi-timeline-clock</v-icon>
          <div>
            <h3 class="text-sm font-semibold uppercase tracking-[0.12em] text-sky-200">
              Animation Steps
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Build a sequence of timed color changes for the strip.
            </p>
          </div>
        </div>
        <v-btn
          prepend-icon="mdi-plus"
          :color="props.color || 'teal'"
          variant="tonal"
          size="small"
          @click="addStep"
        >
          Add Step
        </v-btn>
      </header>

      <!-- Timeline Preview Bar -->
      <div
        v-if="steps.length > 0"
        class="relative h-12 rounded-lg bg-[#0f172a]/60 border border-slate-700 overflow-hidden"
      >
        <div
          v-for="step in steps"
          :key="`preview-${step.id}`"
          class="absolute top-1 bottom-1 rounded opacity-80 transition-all duration-150"
          :style="{
            left: `${(step.delay / totalDuration) * 100}%`,
            width: `${Math.max((step.duration / totalDuration) * 100, 2)}%`,
            backgroundColor: step.color
          }"
        />
        <!-- Time markers -->
        <div class="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[0.6rem] text-slate-500">
          <span>0s</span>
          <span>{{ (totalDuration / 2000).toFixed(1) }}s</span>
          <span>{{ (totalDuration / 1000).toFixed(1) }}s</span>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="steps.length === 0"
        class="rounded-lg border border-dashed border-slate-600 p-8 text-center"
      >
        <v-icon size="48" class="text-slate-600 mb-2">mdi-led-strip-variant</v-icon>
        <p class="text-sm text-slate-400">
          No animation steps yet. Click <strong>"Add Step"</strong> to begin building your animation.
        </p>
      </div>

      <!-- Step Cards -->
      <div v-else class="space-y-3">
        <v-card
          v-for="(step, index) in steps"
          :key="step.id"
          variant="tonal"
          class="border border-slate-700/60"
        >
          <v-card-item class="py-3">
            <div class="flex flex-col gap-3">
              <!-- Step Header: Number + Name -->
              <div class="flex items-center gap-3">
                <v-chip
                  size="small"
                  :color="props.color || 'teal'"
                  variant="flat"
                  class="font-mono font-bold"
                >
                  {{ index + 1 }}
                </v-chip>
                <v-text-field
                  v-model="step.name"
                  label="Step name"
                  density="compact"
                  hide-details
                  variant="outlined"
                  class="flex-1"
                />
              </div>

              <!-- Timing Controls Row -->
              <div class="flex flex-wrap items-center gap-3">
                <v-text-field
                  v-model.number="step.delay"
                  label="Start (ms)"
                  type="number"
                  :min="0"
                  hide-details
                  density="compact"
                  variant="outlined"
                  class="w-28"
                  prepend-inner-icon="mdi-timer-outline"
                />
                <v-text-field
                  v-model.number="step.duration"
                  label="Duration (ms)"
                  type="number"
                  :min="50"
                  hide-details
                  density="compact"
                  variant="outlined"
                  class="w-28"
                  prepend-inner-icon="mdi-clock-outline"
                />

                <!-- Color Swatch -->
                <div
                  v-if="patternNeedsColor"
                  class="flex items-center gap-2"
                >
                  <span class="text-xs uppercase tracking-[0.1em] text-slate-400">Color</span>
                  <v-btn
                    :style="{ backgroundColor: step.color }"
                    class="h-9 w-9 rounded-lg border border-white/20 transition-transform duration-150 hover:scale-110"
                    variant="flat"
                    size="small"
                    @click="openColorPicker(index)"
                  />
                  <span class="text-xs font-mono text-slate-400">{{ step.color }}</span>
                </div>
              </div>

              <!-- Step Actions -->
              <div class="flex justify-end gap-1">
                <v-btn
                  icon="mdi-content-copy"
                  size="x-small"
                  variant="text"
                  :color="props.color || 'teal'"
                  title="Duplicate step"
                  @click="duplicateStep(index)"
                />
                <v-btn
                  icon="mdi-delete-outline"
                  size="x-small"
                  variant="text"
                  color="red"
                  title="Remove step"
                  @click="removeStep(step.id)"
                />
              </div>
            </div>
          </v-card-item>
        </v-card>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- COLOR PICKER DIALOG                                           -->
    <!-- ============================================================ -->
    <v-dialog max-width="80vw" v-model="showColorPicker">
      <ColorPicker
        v-model="colorPickerModel"
        @cancel="showColorPicker = false"
        @select="handleColorPickerSelect"
      />
    </v-dialog>
  </div>
</template>
