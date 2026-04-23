<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: number
  label: string
  icon?: string
  min?: number
  max?: number
  accentColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 255,
  accentColor: '#ff0080',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

// 🎚️ Calculate fill percentage for track and thumb position
const fillPercent = computed(() => {
  const range = props.max - props.min
  if (range === 0) return 0
  return ((props.modelValue - props.min) / range) * 100
})

const thumbGlow = computed(() => `0 0 10px ${props.accentColor}`)

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', Number(target.value))
}
</script>

<template>
  <div class="wled-slider">
    <!-- Header row: label + icon on left, value badge on right -->
    <div class="slider-header">
      <div class="slider-label">
        <span v-if="icon" class="slider-icon">{{ icon }}</span>
        <span class="label-text">{{ label }}</span>
      </div>
      <div class="value-badge" :style="{ color: accentColor, borderColor: accentColor }">
        {{ modelValue }}
      </div>
    </div>

    <!-- Track container -->
    <div class="track-wrapper">
      <!-- Background track -->
      <div class="track-bg" />
      <!-- Gradient fill -->
      <div
        class="track-fill"
        :style="{
          width: `${fillPercent}%`,
          background: `linear-gradient(90deg, #7928ca, ${accentColor})`,
        }"
      />
      <!-- Glowing thumb indicator (visual only) -->
      <div
        class="track-thumb"
        :style="{
          left: `${fillPercent}%`,
          background: accentColor,
          boxShadow: thumbGlow,
        }"
      />
      <!-- Native range input overlaid for interaction -->
      <input
        type="range"
        class="native-range"
        :min="min"
        :max="max"
        :value="modelValue"
        @input="handleInput"
      />
    </div>
  </div>
</template>

<style scoped>
/* 🎨 Neon Studio theme */
.wled-slider {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
}

.slider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.slider-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.slider-icon {
  font-size: 14px;
}

.label-text {
  font-size: 12px;
  font-weight: 500;
  color: #a78bfa;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.value-badge {
  font-size: 12px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.03);
  min-width: 36px;
  text-align: center;
}

/* Track */
.track-wrapper {
  position: relative;
  height: 16px;
  display: flex;
  align-items: center;
}

.track-bg {
  position: absolute;
  left: 0;
  right: 0;
  height: 8px;
  border-radius: 4px;
  background: #1a1a2e;
}

.track-fill {
  position: absolute;
  left: 0;
  height: 8px;
  border-radius: 4px;
  transition: width 0.05s ease;
  pointer-events: none;
}

/* 🌟 Glowing thumb */
.track-thumb {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  transform: translateX(-50%);
  transition: left 0.05s ease;
  pointer-events: none;
  z-index: 2;
}

/* Hidden native range overlaid for interaction */
.native-range {
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
  z-index: 3;
}
</style>
