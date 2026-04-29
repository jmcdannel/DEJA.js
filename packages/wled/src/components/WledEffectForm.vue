<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { WledEffectConfig } from '../types/config'
import { createDefaultWledConfig, rgbToTuple, type RgbColor } from '../types/config'
import { useWledSegments } from '../composables/useWledSegments'
import { WLED_EFFECTS } from '../constants/effects'
import { WLED_PALETTES } from '../constants/palettes'
import WledStripPreview from './WledStripPreview.vue'
import WledColorPicker from './WledColorPicker.vue'
import WledSlider from './WledSlider.vue'
import WledEffectList from './WledEffectList.vue'
import WledPaletteList from './WledPaletteList.vue'

const props = defineProps<{
  modelValue?: WledEffectConfig
  /** Show the Run button */
  showRun?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [config: WledEffectConfig]
  /** Emitted when user clicks Run — parent should save config + toggle effect on */
  run: []
}>()

const config = ref<WledEffectConfig>(
  props.modelValue
    ? JSON.parse(JSON.stringify(props.modelValue))
    : createDefaultWledConfig()
)

const {
  segments,
  activeSegmentIndex,
  addSegment,
  removeSegment,
  updateSegment,
  setActiveSegment,
} = useWledSegments(config.value.segments)

const activeSeg = computed(() => segments.value[activeSegmentIndex.value])

const activeColor = computed<[number, number, number]>(() => {
  if (!activeSeg.value?.colors?.[0]) return [255, 0, 128]
  return rgbToTuple(activeSeg.value.colors[0])
})

const colorTab = ref<'color' | 'palette'>('color')
const runSending = ref(false)

let isUpdatingFromProp = false

function emitConfig() {
  if (isUpdatingFromProp) return
  config.value.segments = [...segments.value]
  emit('update:modelValue', JSON.parse(JSON.stringify(config.value)))
}

watch(segments, emitConfig, { deep: true })

watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) return
    isUpdatingFromProp = true
    config.value = JSON.parse(JSON.stringify(newVal))
    segments.value = [...config.value.segments]
    nextTick(() => { isUpdatingFromProp = false })
  }
)

function handleEffectChange(effectId: number) {
  const effectName = WLED_EFFECTS.find((fx) => fx.id === effectId)?.name ?? `Effect ${effectId}`
  updateSegment(activeSegmentIndex.value, { effectId, effectName })
}

function handlePaletteChange(paletteId: number) {
  const paletteName = WLED_PALETTES.find((p) => p.id === paletteId)?.name ?? `Palette ${paletteId}`
  updateSegment(activeSegmentIndex.value, { paletteId, paletteName })
}

function handleColorChange(color: [number, number, number]) {
  const colors: RgbColor[] = [...(activeSeg.value?.colors || [])]
  colors[0] = { r: color[0], g: color[1], b: color[2] }
  while (colors.length < 3) colors.push({ r: 0, g: 0, b: 0 })
  updateSegment(activeSegmentIndex.value, { colors })
}

function handleToggleOn(index: number) {
  updateSegment(index, { on: !segments.value[index].on })
}

function handleAddSegment() {
  addSegment()
  setActiveSegment(segments.value.length - 1)
}

function handleRemoveSegment(index: number) {
  removeSegment(index)
}

function handleSelectSegment(index: number) {
  setActiveSegment(index)
}

function handleRun() {
  runSending.value = true
  emitConfig()
  emit('run')
  setTimeout(() => { runSending.value = false }, 1000)
}

const SEGMENT_COLORS = ['#ff0080', '#00ccff', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#d946ef']
function segColor(i: number) { return SEGMENT_COLORS[i % SEGMENT_COLORS.length] }
</script>

<template>
  <div class="wled-form">
    <!-- LED Strip Illustration -->
    <WledStripPreview
      :segments="segments"
      :active-index="activeSegmentIndex"
      @select-segment="handleSelectSegment"
    />

    <!-- Global Controls -->
    <div class="wled-form__global">
      <WledSlider
        label="Brightness"
        icon="☀️"
        :model-value="config.brightness"
        accent-color="#ff0080"
        @update:model-value="(v: number) => { config.brightness = v; emitConfig() }"
      />
      <WledSlider
        label="Transition"
        icon="🔄"
        :model-value="config.transition"
        :max="100"
        accent-color="#a78bfa"
        @update:model-value="(v: number) => { config.transition = v; emitConfig() }"
      />
      <div class="wled-form__transition-hint">{{ (config.transition * 0.1).toFixed(1) }}s</div>
    </div>

    <!-- Segment Tabs -->
    <div class="wled-form__segment-tabs">
      <button
        v-for="(seg, i) in segments"
        :key="i"
        type="button"
        class="wled-form__seg-tab"
        :class="{ 'wled-form__seg-tab--active': activeSegmentIndex === i }"
        :style="activeSegmentIndex === i ? { borderColor: segColor(i), color: segColor(i) } : {}"
        @click="handleSelectSegment(i)"
      >
        <span class="wled-form__seg-tab-dot" :style="{ background: segColor(i) }" />
        Seg {{ i }}
        <span class="wled-form__seg-tab-range">{{ seg.start }}–{{ seg.stop }}</span>
      </button>
      <button type="button" class="wled-form__seg-tab wled-form__seg-tab--add" @click="handleAddSegment">+</button>
    </div>

    <!-- Active Segment Content -->
    <template v-if="activeSeg">
      <div class="wled-form__segment" :style="{ '--seg-color': segColor(activeSegmentIndex) }">

        <!-- Segment Header with Run button -->
        <div class="wled-form__seg-header">
          <span class="wled-form__seg-name">
            <span class="wled-form__seg-dot" :style="{ background: segColor(activeSegmentIndex) }" />
            Segment {{ activeSegmentIndex }}
            <span class="wled-form__seg-effect">{{ activeSeg.effectName }}</span>
          </span>
          <div class="wled-form__seg-actions">
            <button
              v-if="showRun"
              type="button"
              class="wled-form__run-btn"
              :class="{ 'wled-form__run-btn--sending': runSending }"
              :disabled="runSending"
              @click="handleRun"
            >
              ▶ Run
            </button>
            <button
              type="button"
              class="wled-form__toggle"
              :class="{ 'wled-form__toggle--on': activeSeg.on }"
              :style="activeSeg.on ? { background: segColor(activeSegmentIndex) } : {}"
              @click="handleToggleOn(activeSegmentIndex)"
            >
              <span class="wled-form__toggle-dot" />
            </button>
            <button
              v-if="segments.length > 1"
              type="button"
              class="wled-form__remove-btn"
              @click="handleRemoveSegment(activeSegmentIndex)"
            >✕</button>
          </div>
        </div>

        <!-- 🎨 COLOR section with Color/Palette sub-tabs -->
        <div class="wled-form__section">
          <!-- Selected color/palette indicator -->
          <div class="wled-form__color-summary">
            <div
              class="wled-form__color-swatch"
              :style="{ background: `rgb(${activeColor.join(',')})`, boxShadow: `0 0 10px rgb(${activeColor.join(',')})44` }"
            />
            <span class="wled-form__color-info">
              <template v-if="colorTab === 'palette'">
                {{ WLED_PALETTES.find(p => p.id === activeSeg.paletteId)?.name || 'Default' }}
              </template>
              <template v-else>
                #{{ activeColor.map(c => c.toString(16).padStart(2, '0')).join('') }}
              </template>
            </span>
          </div>
          <div class="wled-form__section-tabs">
            <button
              type="button"
              class="wled-form__section-tab"
              :class="{ 'wled-form__section-tab--active': colorTab === 'color' }"
              @click="colorTab = 'color'"
            >🎨 Color</button>
            <button
              type="button"
              class="wled-form__section-tab"
              :class="{ 'wled-form__section-tab--active': colorTab === 'palette' }"
              @click="colorTab = 'palette'"
            >🌈 Palette</button>
          </div>
          <div class="wled-form__section-body">
            <WledColorPicker
              v-if="colorTab === 'color'"
              :model-value="activeColor"
              @update:model-value="handleColorChange"
            />
            <WledPaletteList
              v-if="colorTab === 'palette'"
              :model-value="activeSeg.paletteId"
              @update:model-value="handlePaletteChange"
            />
          </div>
        </div>

        <!-- ✨ EFFECT section -->
        <div class="wled-form__section">
          <div class="wled-form__section-label">✨ Effect</div>
          <div class="wled-form__section-body">
            <WledEffectList
              :model-value="activeSeg.effectId"
              @update:model-value="handleEffectChange"
            />
          </div>
        </div>

        <!-- ⚙️ CONFIG section -->
        <div class="wled-form__section">
          <div class="wled-form__section-label">⚙️ Config</div>
          <div class="wled-form__section-body">
            <div class="wled-form__config-sliders">
              <WledSlider
                label="Speed"
                icon="⚡"
                :model-value="activeSeg.speed"
                accent-color="#f59e0b"
                @update:model-value="(v: number) => updateSegment(activeSegmentIndex, { speed: v })"
              />
              <WledSlider
                label="Intensity"
                icon="💎"
                :model-value="activeSeg.intensity"
                accent-color="#10b981"
                @update:model-value="(v: number) => updateSegment(activeSegmentIndex, { intensity: v })"
              />
              <WledSlider
                label="Seg Brightness"
                icon="🔆"
                :model-value="activeSeg.brightness"
                accent-color="#a78bfa"
                @update:model-value="(v: number) => updateSegment(activeSegmentIndex, { brightness: v })"
              />
            </div>
            <div class="wled-form__range-row">
              <label class="wled-form__range-lbl">Start</label>
              <input
                type="number"
                class="wled-form__range-input"
                :value="activeSeg.start"
                min="0"
                @change="updateSegment(activeSegmentIndex, { start: Number(($event.target as HTMLInputElement).value) })"
              />
              <label class="wled-form__range-lbl">Stop</label>
              <input
                type="number"
                class="wled-form__range-input"
                :value="activeSeg.stop"
                min="1"
                @change="updateSegment(activeSegmentIndex, { stop: Number(($event.target as HTMLInputElement).value) })"
              />
              <span class="wled-form__led-count">{{ activeSeg.stop - activeSeg.start }} LEDs</span>
            </div>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<style scoped>
.wled-form {
  background: #0a0a12; border: 1px solid #1a1a2e; border-radius: 16px;
  overflow: hidden; display: flex; flex-direction: column;
}

/* Global controls */
.wled-form__global {
  padding: 12px 20px; display: flex; flex-wrap: wrap; gap: 16px; align-items: end;
  border-bottom: 1px solid #1a1a2e;
}
.wled-form__global > * { flex: 1; min-width: 120px; }
.wled-form__transition-hint { font: 11px/1 monospace; color: #8b8ba0; align-self: end; flex: 0 0 auto; }

/* Segment tabs */
.wled-form__segment-tabs { display: flex; border-bottom: 1px solid #1a1a2e; overflow-x: auto; }
.wled-form__seg-tab {
  display: flex; align-items: center; gap: 6px; padding: 8px 14px;
  background: none; border: none; border-bottom: 2px solid transparent;
  color: #8b8ba0; font: 500 12px/1 system-ui; cursor: pointer; white-space: nowrap; transition: all 0.15s;
}
.wled-form__seg-tab:hover { color: #e2e8f0; background: #10101a; }
.wled-form__seg-tab--active { background: #10101a; color: #e2e8f0; }
.wled-form__seg-tab--add { color: #a78bfa; font-size: 16px; font-weight: 700; }
.wled-form__seg-tab-dot { width: 6px; height: 6px; border-radius: 50%; }
.wled-form__seg-tab-range { font: 10px/1 monospace; color: #484f58; }

/* Segment content */
.wled-form__segment { padding: 14px 20px; display: flex; flex-direction: column; gap: 10px; }

/* Header */
.wled-form__seg-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.wled-form__seg-name { font: 600 14px/1 system-ui; color: #e2e8f0; display: flex; align-items: center; gap: 8px; }
.wled-form__seg-dot { width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 8px var(--seg-color); }
.wled-form__seg-effect { font: 400 11px/1 system-ui; color: #8b8ba0; }
.wled-form__seg-actions { display: flex; align-items: center; gap: 8px; }

/* Run button */
.wled-form__run-btn {
  padding: 4px 12px; background: #10b98120; border: 1px solid #10b98140;
  border-radius: 6px; color: #10b981; font: 600 11px/1 system-ui;
  cursor: pointer; transition: all 0.15s; white-space: nowrap;
}
.wled-form__run-btn:hover { background: #10b98130; border-color: #10b981; box-shadow: 0 0 8px #10b98130; }
.wled-form__run-btn--sending { opacity: 0.5; cursor: wait; }

/* Toggle */
.wled-form__toggle {
  position: relative; width: 32px; height: 16px; border-radius: 8px;
  background: #2d2d44; border: none; cursor: pointer; transition: background 0.2s;
}
.wled-form__toggle--on .wled-form__toggle-dot { transform: translateX(16px); }
.wled-form__toggle-dot {
  position: absolute; top: 3px; left: 3px; width: 10px; height: 10px;
  border-radius: 50%; background: white; transition: transform 0.2s;
}

.wled-form__remove-btn {
  width: 24px; height: 24px; border-radius: 4px; background: transparent;
  border: 1px solid #2d2d44; color: #8b8ba0; font-size: 11px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.wled-form__remove-btn:hover { background: #ef444422; border-color: #ef4444; color: #ef4444; }

/* Sections */
.wled-form__section { background: #10101a; border: 1px solid #1a1a2e; border-radius: 10px; overflow: hidden; }
.wled-form__section-label {
  font: 600 12px/1 system-ui; color: #a78bfa; padding: 10px 14px;
  text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #1a1a2e;
}
.wled-form__section-body { padding: 14px; }

/* Color/palette summary */
.wled-form__color-summary {
  display: flex; align-items: center; gap: 10px; padding: 10px 14px;
  border-bottom: 1px solid #1a1a2e;
}
.wled-form__color-swatch { width: 24px; height: 24px; border-radius: 6px; border: 1px solid #2d2d44; flex-shrink: 0; }
.wled-form__color-info { font: 500 12px/1 monospace; color: #e2e8f0; }

/* Color/Palette sub-tabs */
.wled-form__section-tabs { display: flex; border-bottom: 1px solid #1a1a2e; }
.wled-form__section-tab {
  flex: 1; padding: 10px 14px; background: none; border: none;
  border-bottom: 2px solid transparent; color: #8b8ba0;
  font: 500 12px/1 system-ui; cursor: pointer; text-align: center; transition: all 0.15s;
}
.wled-form__section-tab:hover { color: #e2e8f0; }
.wled-form__section-tab--active { color: #a78bfa; border-bottom-color: #a78bfa; background: #10101a; }

/* Config */
.wled-form__config-sliders { display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px; }
.wled-form__range-row {
  display: flex; align-items: center; gap: 8px;
  padding-top: 12px; border-top: 1px solid #1a1a2e;
}
.wled-form__range-lbl { font: 500 10px/1 system-ui; color: #8b8ba0; text-transform: uppercase; }
.wled-form__led-count { font: 600 10px/1 system-ui; color: #a78bfa; margin-left: auto; }
.wled-form__range-input {
  width: 60px; padding: 4px 6px; background: #1a1a2e;
  border: 1px solid #2d2d44; border-radius: 4px;
  color: #e2e8f0; font: 12px/1.2 monospace; outline: none;
}
.wled-form__range-input:focus { border-color: #ff0080; box-shadow: 0 0 6px rgba(255, 0, 128, 0.2); }
</style>
