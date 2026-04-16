<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { WledEffectConfig } from '../types/config'
import { createDefaultWledConfig, type RgbColor } from '../types/config'
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
}>()

const emit = defineEmits<{
  'update:modelValue': [config: WledEffectConfig]
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

// Convert RgbColor[] → tuple[] for the color picker
const activeSegColors = computed(() => {
  if (!activeSeg.value) return [[255, 0, 128], [0, 0, 0], [0, 0, 0]] as [number, number, number][]
  return activeSeg.value.colors.map((c: RgbColor) => [c.r, c.g, c.b] as [number, number, number])
})

// Per-segment accordion panels (open first by default)
const openPanels = ref<number[]>([0])

// Guard against recursive emit loops
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

function handleColorChange(tuples: [number, number, number][]) {
  const colors: RgbColor[] = tuples.map(([r, g, b]) => ({ r, g, b }))
  updateSegment(activeSegmentIndex.value, { colors })
}

function handleToggleOn(index: number) {
  updateSegment(index, { on: !segments.value[index].on })
}

function handleAddSegment() {
  addSegment()
  // Select and open the new segment
  const newIdx = segments.value.length - 1
  setActiveSegment(newIdx)
  openPanels.value = [newIdx]
}

function handleRemoveSegment(index: number) {
  removeSegment(index)
  openPanels.value = [activeSegmentIndex.value]
}

function handleSelectSegment(index: number) {
  setActiveSegment(index)
  openPanels.value = [index]
}

// Segment accent colors
const SEGMENT_COLORS = ['#ff0080', '#00ccff', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#d946ef']
function segColor(i: number) { return SEGMENT_COLORS[i % SEGMENT_COLORS.length] }
</script>

<template>
  <div class="wled-form">
    <!-- LED Strip Preview -->
    <WledStripPreview :segments="segments" />

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
      <div class="wled-form__transition-hint">
        {{ (config.transition * 0.1).toFixed(1) }}s crossfade
      </div>
    </div>

    <!-- Segment Tabs -->
    <div class="wled-form__segment-tabs">
      <button
        v-for="(seg, i) in segments"
        :key="i"
        type="button"
        class="wled-form__segment-tab"
        :class="{ 'wled-form__segment-tab--active': activeSegmentIndex === i }"
        :style="activeSegmentIndex === i ? { borderColor: segColor(i), color: segColor(i) } : {}"
        @click="handleSelectSegment(i)"
      >
        <span class="wled-form__segment-tab-dot" :style="{ background: segColor(i) }" />
        Seg {{ i }}
        <span class="wled-form__segment-tab-range">{{ seg.start }}–{{ seg.stop }}</span>
      </button>
      <button
        type="button"
        class="wled-form__segment-tab wled-form__segment-tab--add"
        @click="handleAddSegment"
      >
        +
      </button>
    </div>

    <!-- Active Segment Content -->
    <template v-if="activeSeg">
      <div class="wled-form__segment" :style="{ '--seg-color': segColor(activeSegmentIndex) }">

        <!-- Segment Header -->
        <div class="wled-form__segment-header">
          <span class="wled-form__segment-name">
            <span class="wled-form__segment-dot" :style="{ background: segColor(activeSegmentIndex) }" />
            Segment {{ activeSegmentIndex }}
          </span>
          <div class="wled-form__segment-actions">
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

        <!-- COLOR section: picker + palette -->
        <div class="wled-form__accordion">
          <div class="wled-form__accordion-label">🎨 Color</div>
          <div class="wled-form__accordion-body wled-form__color-row">
            <div class="wled-form__color-picker-wrap">
              <WledColorPicker
                :model-value="activeSegColors"
                @update:model-value="handleColorChange"
              />
            </div>
            <div class="wled-form__palette-wrap">
              <WledPaletteList
                :model-value="activeSeg.paletteId"
                @update:model-value="handlePaletteChange"
              />
            </div>
          </div>
        </div>

        <!-- EFFECT section -->
        <div class="wled-form__accordion">
          <div class="wled-form__accordion-label">✨ Effect</div>
          <div class="wled-form__accordion-body">
            <WledEffectList
              :model-value="activeSeg.effectId"
              @update:model-value="handleEffectChange"
            />
          </div>
        </div>

        <!-- CONFIG section: sliders + range -->
        <div class="wled-form__accordion">
          <div class="wled-form__accordion-label">⚙️ Config</div>
          <div class="wled-form__accordion-body">
            <div class="wled-form__config-grid">
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
              <label class="wled-form__range-label">Start</label>
              <input
                type="number"
                class="wled-form__range-input"
                :value="activeSeg.start"
                min="0"
                @change="updateSegment(activeSegmentIndex, { start: Number(($event.target as HTMLInputElement).value) })"
              />
              <label class="wled-form__range-label">Stop</label>
              <input
                type="number"
                class="wled-form__range-input"
                :value="activeSeg.stop"
                min="1"
                @change="updateSegment(activeSegmentIndex, { stop: Number(($event.target as HTMLInputElement).value) })"
              />
              <label class="wled-form__range-label wled-form__range-count">
                {{ activeSeg.stop - activeSeg.start }} LEDs
              </label>
            </div>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<style scoped>
.wled-form {
  background: #0a0a12;
  border: 1px solid #1a1a2e;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Global controls */
.wled-form__global {
  padding: 16px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: end;
  border-bottom: 1px solid #1a1a2e;
}
.wled-form__global > * { flex: 1; min-width: 140px; }
.wled-form__transition-hint { font: 11px/1 monospace; color: #8b8ba0; text-align: right; align-self: end; flex: 0 0 auto; }

/* Segment tabs */
.wled-form__segment-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #1a1a2e;
  overflow-x: auto;
}

.wled-form__segment-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #8b8ba0;
  font: 500 12px/1 system-ui;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.wled-form__segment-tab:hover { color: #e2e8f0; background: #10101a; }
.wled-form__segment-tab--active { background: #10101a; color: #e2e8f0; }
.wled-form__segment-tab--add { color: #a78bfa; font-size: 16px; font-weight: 700; padding: 10px 14px; }
.wled-form__segment-tab--add:hover { color: #e2e8f0; }

.wled-form__segment-tab-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.wled-form__segment-tab-range { font: 10px/1 monospace; color: #484f58; }

/* Active segment content */
.wled-form__segment { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }

.wled-form__segment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.wled-form__segment-name { font: 600 14px/1 system-ui; color: #e2e8f0; display: flex; align-items: center; gap: 8px; }
.wled-form__segment-dot { width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 8px var(--seg-color); }
.wled-form__segment-actions { display: flex; align-items: center; gap: 8px; }

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
  transition: all 0.15s;
}
.wled-form__remove-btn:hover { background: #ef444422; border-color: #ef4444; color: #ef4444; }

/* Accordion sections */
.wled-form__accordion {
  background: #10101a;
  border: 1px solid #1a1a2e;
  border-radius: 10px;
  overflow: hidden;
}
.wled-form__accordion-label {
  font: 600 12px/1 system-ui;
  color: #a78bfa;
  padding: 12px 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #1a1a2e;
}
.wled-form__accordion-body { padding: 14px; }

/* Color section: side-by-side picker + palette */
.wled-form__color-row { display: grid; grid-template-columns: auto 1fr; gap: 16px; }
.wled-form__color-picker-wrap { min-width: 200px; }
.wled-form__palette-wrap { min-height: 0; overflow: hidden; }

@media (max-width: 640px) {
  .wled-form__color-row { grid-template-columns: 1fr; }
}

/* Config section */
.wled-form__config-grid { display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px; }

.wled-form__range-row {
  display: flex; align-items: center; gap: 8px;
  padding-top: 12px; border-top: 1px solid #1a1a2e;
}
.wled-form__range-label { font: 500 10px/1 system-ui; color: #8b8ba0; text-transform: uppercase; letter-spacing: 0.05em; }
.wled-form__range-count { color: #a78bfa; font-weight: 600; margin-left: auto; }
.wled-form__range-input {
  width: 60px; padding: 4px 6px; background: #1a1a2e;
  border: 1px solid #2d2d44; border-radius: 4px;
  color: #e2e8f0; font: 12px/1.2 monospace; outline: none; transition: border-color 0.15s;
}
.wled-form__range-input:focus { border-color: #ff0080; box-shadow: 0 0 6px rgba(255, 0, 128, 0.2); }
</style>
