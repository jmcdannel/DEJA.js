<script setup lang="ts">
import { WLED_PALETTES } from '../constants/palettes'

interface Props {
  modelValue: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [paletteId: number]
}>()

// 🎨 Fallback gradient for palettes without one
const FALLBACK_GRADIENT = 'linear-gradient(90deg, #7928ca, #ff0080)'

function selectPalette(id: number) {
  emit('update:modelValue', id)
}

function paletteGlow(palette: typeof WLED_PALETTES[0], isActive: boolean): string {
  if (!isActive) return 'none'
  const color = '#ff008060'
  return `0 0 10px ${color}`
}
</script>

<template>
  <div class="wled-palette-list">
    <div class="palette-scroll">
      <button
        v-for="palette in WLED_PALETTES"
        :key="palette.id"
        type="button"
        class="palette-row"
        :class="{ active: modelValue === palette.id }"
        @click="selectPalette(palette.id)"
      >
        <!-- 🌈 Gradient preview strip -->
        <div
          class="palette-gradient"
          :style="{
            background: palette.gradient ?? FALLBACK_GRADIENT,
            boxShadow: modelValue === palette.id ? '0 0 10px #ff008060' : 'none',
          }"
        />
        <!-- Palette name -->
        <span class="palette-name">{{ palette.name }}</span>
        <!-- Palette ID in monospace -->
        <span class="palette-id">{{ palette.id }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 🎨 Neon palette list */
.wled-palette-list {
  display: flex;
  flex-direction: column;
}

.palette-scroll {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  scrollbar-width: thin;
  scrollbar-color: #2d2d44 transparent;
}

.palette-scroll::-webkit-scrollbar {
  width: 4px;
}

.palette-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.palette-scroll::-webkit-scrollbar-thumb {
  background: #2d2d44;
  border-radius: 2px;
}

/* Palette row */
.palette-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 8px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.palette-row:hover {
  background: #12121e;
  border-color: #2d2d44;
}

/* ✨ Active row */
.palette-row.active {
  background: #12121e;
  border-color: #ff008040;
}

/* Gradient strip */
.palette-gradient {
  flex-shrink: 0;
  width: 90px;
  height: 14px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: box-shadow 0.15s ease;
}

/* Palette name */
.palette-name {
  flex: 1;
  font-size: 12px;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Palette ID */
.palette-id {
  flex-shrink: 0;
  font-size: 11px;
  font-family: 'Courier New', monospace;
  color: #484f58;
  min-width: 24px;
  text-align: right;
}
</style>
