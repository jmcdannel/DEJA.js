<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { WledEffectConfig, WledSegmentConfig } from '../types/config'
import { createDefaultWledConfig } from '../types/config'
import { useWledSegments } from '../composables/useWledSegments'
import { WLED_EFFECTS } from '../constants/effects'
import { WLED_PALETTES } from '../constants/palettes'
import WledStripPreview from './WledStripPreview.vue'
import WledColorPicker from './WledColorPicker.vue'
import WledSlider from './WledSlider.vue'
import WledEffectList from './WledEffectList.vue'
import WledPaletteList from './WledPaletteList.vue'
import WledSegmentEditor from './WledSegmentEditor.vue'

const props = defineProps<{
  modelValue?: WledEffectConfig
}>()

const emit = defineEmits<{
  'update:modelValue': [config: WledEffectConfig]
}>()

const config = ref<WledEffectConfig>(
  props.modelValue ? { ...props.modelValue, segments: [...props.modelValue.segments] }
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

// Sync segments back to config and emit
watch(
  [segments, () => config.value.brightness, () => config.value.transition],
  () => {
    config.value.segments = [...segments.value]
    emit('update:modelValue', { ...config.value })
  },
  { deep: true }
)

// Initialize from prop changes
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      config.value = { ...newVal, segments: [...newVal.segments] }
      segments.value = [...newVal.segments]
    }
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

function handleColorChange(colors: [number, number, number][]) {
  updateSegment(activeSegmentIndex.value, { colors })
}

function handleSpeedChange(speed: number) {
  updateSegment(activeSegmentIndex.value, { speed })
}

function handleIntensityChange(intensity: number) {
  updateSegment(activeSegmentIndex.value, { intensity })
}

function handleSegBrightnessChange(brightness: number) {
  updateSegment(activeSegmentIndex.value, { brightness })
}

function handleToggleOn(index: number) {
  updateSegment(index, { on: !segments.value[index].on })
}
</script>

<template>
  <div class="wled-form">
    <!-- LED Strip Preview -->
    <WledStripPreview :segments="segments" />

    <div class="wled-form__body">
      <!-- Left Column: Color + Sliders -->
      <div class="wled-form__left">
        <div class="wled-form__section">
          <div class="wled-form__section-label">Color</div>
          <WledColorPicker
            v-if="activeSeg"
            :model-value="activeSeg.colors"
            @update:model-value="handleColorChange"
          />
        </div>

        <div class="wled-form__section">
          <div class="wled-form__section-label">Controls</div>
          <div class="wled-form__sliders">
            <WledSlider
              label="Brightness"
              icon="☀️"
              :model-value="config.brightness"
              accent-color="#ff0080"
              @update:model-value="config.brightness = $event"
            />
            <WledSlider
              v-if="activeSeg"
              label="Speed"
              icon="⚡"
              :model-value="activeSeg.speed"
              accent-color="#f59e0b"
              @update:model-value="handleSpeedChange"
            />
            <WledSlider
              v-if="activeSeg"
              label="Intensity"
              icon="💎"
              :model-value="activeSeg.intensity"
              accent-color="#10b981"
              @update:model-value="handleIntensityChange"
            />
          </div>
        </div>
      </div>

      <!-- Right Column: Effects, Palettes, Segments -->
      <div class="wled-form__right">
        <div class="wled-form__section">
          <div class="wled-form__section-label">Effect</div>
          <WledEffectList
            v-if="activeSeg"
            :model-value="activeSeg.effectId"
            @update:model-value="handleEffectChange"
          />
        </div>

        <div class="wled-form__section">
          <div class="wled-form__section-label">Palette</div>
          <WledPaletteList
            v-if="activeSeg"
            :model-value="activeSeg.paletteId"
            @update:model-value="handlePaletteChange"
          />
        </div>

        <div class="wled-form__section">
          <div class="wled-form__section-label">Segments</div>
          <WledSegmentEditor
            :segments="segments"
            :active-index="activeSegmentIndex"
            @select="setActiveSegment"
            @add="addSegment"
            @remove="removeSegment"
            @toggle-on="handleToggleOn"
          />
        </div>

        <div class="wled-form__section">
          <div class="wled-form__section-label">Transition</div>
          <WledSlider
            label="Transition"
            icon="🔄"
            :model-value="config.transition"
            :max="100"
            accent-color="#a78bfa"
            @update:model-value="config.transition = $event"
          />
          <div class="wled-form__transition-hint">
            {{ (config.transition * 0.1).toFixed(1) }}s crossfade
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wled-form { background: #0a0a12; border: 1px solid #1a1a2e; border-radius: 16px; overflow: hidden; }
.wled-form__body { padding: 24px; display: grid; grid-template-columns: 220px 1fr; gap: 24px; }
@media (max-width: 768px) { .wled-form__body { grid-template-columns: 1fr; } }
.wled-form__left, .wled-form__right { display: flex; flex-direction: column; gap: 20px; }
.wled-form__section { background: #10101a; border: 1px solid #1a1a2e; border-radius: 12px; padding: 16px; }
.wled-form__section-label { font: 600 12px/1 system-ui; color: #a78bfa; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
.wled-form__sliders { display: flex; flex-direction: column; gap: 14px; }
.wled-form__transition-hint { font: 11px/1 monospace; color: #8b8ba0; margin-top: 4px; text-align: right; }
</style>
