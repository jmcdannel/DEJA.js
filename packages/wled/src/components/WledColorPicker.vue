<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  /** Primary color as [R, G, B] tuple */
  modelValue: [number, number, number]
}>(), {
  modelValue: () => [255, 0, 128],
})

const emit = defineEmits<{
  'update:modelValue': [value: [number, number, number]]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

const hexColor = computed(() => {
  const [r, g, b] = props.modelValue
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
})

const quickSwatches: [number, number, number][] = [
  [255, 0, 0],     // red
  [255, 128, 0],   // orange
  [255, 255, 0],   // yellow
  [0, 255, 0],     // green
  [0, 255, 255],   // cyan
  [0, 128, 255],   // blue
  [128, 0, 255],   // purple
  [255, 0, 128],   // pink
  [255, 255, 255], // white
  [255, 180, 100], // warm white
  [0, 0, 0],       // off
]

function setColor(color: [number, number, number]) {
  emit('update:modelValue', [...color] as [number, number, number])
}

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
  if (pixel[3] === 0) return
  setColor([pixel[0], pixel[1], pixel[2]])
}

function drawColorWheel(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const size = canvas.width
  const center = size / 2
  const radius = center
  ctx.clearRect(0, 0, size, size)
  const imageData = ctx.createImageData(size, size)
  const data = imageData.data
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center
      const dy = y - center
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > radius || dist < 12) continue
      const angle = Math.atan2(dy, dx)
      const hue = ((angle / (2 * Math.PI)) * 360 + 360) % 360
      const saturation = dist / radius
      const rgb = hsvToRgb(hue, saturation, 1)
      const idx = (y * size + x) * 4
      data[idx] = rgb[0]; data[idx + 1] = rgb[1]; data[idx + 2] = rgb[2]; data[idx + 3] = 255
    }
  }
  ctx.putImageData(imageData, 0, 0)
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x } else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x } else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c } else { r = c; b = x }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

onMounted(() => { if (canvasRef.value) drawColorWheel(canvasRef.value) })
</script>

<template>
  <div class="wled-color-picker">
    <div class="wled-color-picker__row">
      <!-- Color wheel -->
      <div class="wled-color-picker__wheel-wrap">
        <canvas ref="canvasRef" width="150" height="150" class="wled-color-picker__wheel" @click="handleCanvasClick" />
        <div class="wled-color-picker__hex" :style="{ color: hexColor, textShadow: `0 0 10px ${hexColor}60` }">
          {{ hexColor }}
        </div>
      </div>
      <!-- Selected color preview + swatches -->
      <div class="wled-color-picker__side">
        <div class="wled-color-picker__preview" :style="{ background: hexColor, boxShadow: `0 0 16px ${hexColor}44` }" />
        <div class="wled-color-picker__swatches">
          <button
            v-for="(color, i) in quickSwatches"
            :key="i"
            type="button"
            class="wled-color-picker__swatch"
            :class="{ 'wled-color-picker__swatch--active': modelValue[0] === color[0] && modelValue[1] === color[1] && modelValue[2] === color[2] }"
            :style="{ backgroundColor: `rgb(${color.join(',')})` }"
            @click="setColor(color)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wled-color-picker__row { display: flex; gap: 14px; align-items: start; }

.wled-color-picker__wheel-wrap { position: relative; width: 150px; height: 150px; flex-shrink: 0; }
.wled-color-picker__wheel { width: 150px; height: 150px; border-radius: 50%; cursor: crosshair; }
.wled-color-picker__hex {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font: 700 9px/1 monospace; pointer-events: none;
  background: #0a0a12; width: 24px; height: 24px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-size: 7px;
}

.wled-color-picker__side { display: flex; flex-direction: column; gap: 10px; flex: 1; }
.wled-color-picker__preview { width: 100%; height: 32px; border-radius: 6px; border: 1px solid #2d2d44; }

.wled-color-picker__swatches { display: flex; flex-wrap: wrap; gap: 4px; }
.wled-color-picker__swatch {
  width: 20px; height: 20px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);
  cursor: pointer; transition: transform 0.1s;
}
.wled-color-picker__swatch:hover { transform: scale(1.15); }
.wled-color-picker__swatch--active { outline: 2px solid #fff; outline-offset: 1px; }
</style>
