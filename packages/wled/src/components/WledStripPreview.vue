<script setup lang="ts">
import { computed } from 'vue'
import type { WledSegmentConfig } from '../types/config'

interface Props {
  segments: WledSegmentConfig[]
}

const props = defineProps<Props>()

// 🔢 Calculate total LED count for proportional widths
const totalLeds = computed(() => {
  if (props.segments.length === 0) return 1
  return Math.max(...props.segments.map((seg) => seg.stop))
})

interface SegmentDisplay {
  seg: WledSegmentConfig
  widthPercent: number
  leftPercent: number
  gradient: string
  dimmed: boolean
  label: string
}

const segmentDisplays = computed<SegmentDisplay[]>(() => {
  const total = totalLeds.value
  return props.segments.map((seg, i) => {
    const width = ((seg.stop - seg.start) / total) * 100
    const left = (seg.start / total) * 100

    // 🎨 Build gradient from segment colors
    const color1 = seg.colors[0] ? rgbToHex(seg.colors[0]) : '#ff0080'
    const color2 = seg.colors[1] ? rgbToHex(seg.colors[1]) : color1

    const gradient = `linear-gradient(90deg, ${color1}, ${color2})`

    return {
      seg,
      widthPercent: width,
      leftPercent: left,
      gradient,
      dimmed: !seg.on,
      label: `Seg ${i}: ${seg.start}–${seg.stop}`,
    }
  })
})

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
</script>

<template>
  <div class="wled-strip-preview">
    <!-- Horizontal LED strip bar -->
    <div class="strip-bar">
      <div
        v-for="(display, i) in segmentDisplays"
        :key="i"
        class="strip-segment"
        :class="{ dimmed: display.dimmed }"
        :style="{
          width: `${display.widthPercent}%`,
          left: `${display.leftPercent}%`,
          background: display.dimmed ? '#1a1a2e' : display.gradient,
          opacity: display.dimmed ? 0.3 : 1,
        }"
      />
    </div>

    <!-- Labels below strip -->
    <div class="strip-labels">
      <span
        v-for="(display, i) in segmentDisplays"
        :key="i"
        class="segment-label"
        :style="{ left: `${display.leftPercent}%`, width: `${display.widthPercent}%` }"
      >
        {{ display.label }}
      </span>
    </div>
  </div>
</template>

<style scoped>
/* 💡 LED strip preview */
.wled-strip-preview {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.strip-bar {
  position: relative;
  height: 20px;
  background: #1a1a2e;
  border-radius: 4px;
  overflow: hidden;
}

.strip-segment {
  position: absolute;
  top: 0;
  bottom: 0;
  transition: opacity 0.2s ease;
}

/* Labels row */
.strip-labels {
  position: relative;
  height: 18px;
}

.segment-label {
  position: absolute;
  font-size: 10px;
  color: #8b8ba0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}
</style>
