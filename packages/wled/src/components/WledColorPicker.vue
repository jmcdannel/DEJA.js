<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

type RgbColor = [number, number, number]

interface Props {
  modelValue: RgbColor[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [[255, 0, 128], [0, 0, 0], [0, 0, 0]],
})

const emit = defineEmits<{
  'update:modelValue': [value: RgbColor[]]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const activeSlot = ref(0)

// 🎨 Quick swatch colors
const SWATCHES: RgbColor[] = [
  [255, 0, 0],     // red
  [255, 128, 0],   // orange
  [255, 255, 0],   // yellow
  [0, 255, 0],     // green
  [0, 255, 255],   // cyan
  [128, 0, 255],   // purple
  [255, 0, 128],   // pink
  [255, 255, 255], // white
]

const SLOT_LABELS = ['Fx', 'Bg', 'Cs']

// 🌈 Active color as hex for center display
const activeColorHex = computed(() => {
  const color = props.modelValue[activeSlot.value] ?? [255, 0, 128]
  return rgbToHex(color)
})

const activeColorGlow = computed(() => {
  return `0 0 12px ${activeColorHex.value}`
})

function rgbToHex([r, g, b]: RgbColor): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// 🖌️ Draw the color wheel on canvas
function drawColorWheel(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const size = canvas.width
  const centerX = size / 2
  const centerY = size / 2
  const radius = size / 2

  ctx.clearRect(0, 0, size, size)

  // Draw using image data for performance: full HSV wheel
  const imageData = ctx.createImageData(size, size)
  const data = imageData.data

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - centerX
      const dy = y - centerY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist > radius || dist < 14) {
        // outside wheel or center cutout
        continue
      }

      // Hue from angle
      const angle = Math.atan2(dy, dx)
      const hue = ((angle / (2 * Math.PI)) * 360 + 360) % 360

      // Saturation from radius (0 at center → 1 at edge)
      const saturation = dist / radius

      const rgb = hsvToRgb(hue, saturation, 1)
      const idx = (y * size + x) * 4
      data[idx] = rgb[0]
      data[idx + 1] = rgb[1]
      data[idx + 2] = rgb[2]
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

function hsvToRgb(h: number, s: number, v: number): RgbColor {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c

  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x; b = 0 }
  else if (h < 120) { r = x; g = c; b = 0 }
  else if (h < 180) { r = 0; g = c; b = x }
  else if (h < 240) { r = 0; g = x; b = c }
  else if (h < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ]
}

// 🖱️ Click on wheel to sample color
function handleCanvasClick(event: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  const x = Math.floor((event.clientX - rect.left) * scaleX)
  const y = Math.floor((event.clientY - rect.top) * scaleY)

  const pixel = ctx.getImageData(x, y, 1, 1).data
  if (pixel[3] === 0) return // transparent (outside wheel or cutout)

  const newColors = [...props.modelValue] as RgbColor[]
  while (newColors.length < 3) newColors.push([0, 0, 0])
  newColors[activeSlot.value] = [pixel[0], pixel[1], pixel[2]]
  emit('update:modelValue', newColors)
}

function selectSwatch(color: RgbColor) {
  const newColors = [...props.modelValue] as RgbColor[]
  while (newColors.length < 3) newColors.push([0, 0, 0])
  newColors[activeSlot.value] = color
  emit('update:modelValue', newColors)
}

function slotColor(index: number): string {
  const color = props.modelValue[index]
  if (!color || (color[0] === 0 && color[1] === 0 && color[2] === 0)) return '#1a1a2e'
  return rgbToHex(color)
}

onMounted(() => {
  if (canvasRef.value) {
    drawColorWheel(canvasRef.value)
  }
})
</script>

<template>
  <div class="wled-color-picker">
    <!-- Canvas color wheel -->
    <div class="wheel-container">
      <canvas
        ref="canvasRef"
        width="170"
        height="170"
        class="color-wheel"
        @click="handleCanvasClick"
      />
      <!-- Center hex display -->
      <div
        class="center-hex"
        :style="{
          color: activeColorHex,
          textShadow: activeColorGlow,
        }"
      >
        {{ activeColorHex }}
      </div>
    </div>

    <!-- Slot buttons: Fx, Bg, Cs -->
    <div class="slot-buttons">
      <button
        v-for="(label, i) in SLOT_LABELS"
        :key="i"
        class="slot-btn"
        :class="{ active: activeSlot === i }"
        :style="activeSlot === i ? {
          borderColor: slotColor(i),
          background: `${slotColor(i)}22`,
          color: slotColor(i),
        } : {}"
        @click="activeSlot = i"
      >
        <span class="slot-dot" :style="{ background: slotColor(i) }" />
        {{ label }}
      </button>
    </div>

    <!-- Quick swatch row -->
    <div class="swatch-row">
      <button
        v-for="(color, i) in SWATCHES"
        :key="i"
        class="swatch"
        :style="{
          background: rgbToHex(color),
          boxShadow: `0 0 6px ${rgbToHex(color)}88`,
        }"
        @click="selectSwatch(color)"
      />
    </div>
  </div>
</template>

<style scoped>
/* 🎨 Neon color picker */
.wled-color-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #10101a;
  border-radius: 12px;
  border: 1px solid #1a1a2e;
}

.wheel-container {
  position: relative;
  width: 170px;
  height: 170px;
}

.color-wheel {
  width: 170px;
  height: 170px;
  border-radius: 50%;
  cursor: crosshair;
  display: block;
}

/* Center cutout hex display */
.center-hex {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  font-family: 'Courier New', monospace;
  font-weight: 700;
  letter-spacing: 0.05em;
  pointer-events: none;
  background: #0a0a12;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
}

/* Slot buttons */
.slot-buttons {
  display: flex;
  gap: 8px;
}

.slot-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid #2d2d44;
  background: #12121e;
  color: #8b8ba0;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.slot-btn:hover {
  border-color: #ff0080;
  color: #e2e8f0;
}

.slot-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Swatch row */
.swatch-row {
  display: flex;
  gap: 6px;
}

.swatch {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.15s ease;
}

.swatch:hover {
  transform: scale(1.2);
}
</style>
