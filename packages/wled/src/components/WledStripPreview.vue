<script setup lang="ts">
import { computed } from 'vue'
import type { WledSegmentConfig } from '../types/config'

interface Props {
  segments: WledSegmentConfig[]
  activeIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  activeIndex: -1,
})

const emit = defineEmits<{
  selectSegment: [index: number]
}>()

const totalLeds = computed(() => {
  if (props.segments.length === 0) return 1
  return Math.max(...props.segments.map((seg) => seg.stop))
})

// Generate individual LED dots for the strip
const ledDots = computed(() => {
  const total = totalLeds.value
  // Cap at 120 dots for performance, scale if more LEDs
  const maxDots = Math.min(total, 120)
  const scale = total / maxDots

  const dots: { color: string; segIndex: number; dimmed: boolean }[] = []

  for (let i = 0; i < maxDots; i++) {
    const ledIndex = Math.floor(i * scale)
    // Find which segment this LED belongs to
    let segIndex = -1
    let color = '#1a1a2e'
    let dimmed = true

    for (let s = 0; s < props.segments.length; s++) {
      const seg = props.segments[s]
      if (ledIndex >= seg.start && ledIndex < seg.stop) {
        segIndex = s
        dimmed = !seg.on
        if (seg.on && seg.colors[0]) {
          color = rgbToHex(seg.colors[0])
        }
        break
      }
    }

    dots.push({ color, segIndex, dimmed })
  }

  return dots
})

// Segment boundary markers for labels
const segmentMarkers = computed(() =>
  props.segments.map((seg, i) => {
    const total = totalLeds.value
    const left = (seg.start / total) * 100
    const width = ((seg.stop - seg.start) / total) * 100
    return { index: i, left, width, start: seg.start, stop: seg.stop }
  })
)

const SEGMENT_COLORS = ['#ff0080', '#00ccff', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#d946ef']
function segColor(i: number) { return SEGMENT_COLORS[i % SEGMENT_COLORS.length] }

function rgbToHex(c: { r: number; g: number; b: number }): string {
  return `#${c.r.toString(16).padStart(2, '0')}${c.g.toString(16).padStart(2, '0')}${c.b.toString(16).padStart(2, '0')}`
}
</script>

<template>
  <div class="wled-strip">
    <!-- PCB board background -->
    <div class="wled-strip__board">
      <!-- Wire trace line -->
      <div class="wled-strip__wire" />
      <!-- LED dots -->
      <div class="wled-strip__leds">
        <div
          v-for="(dot, i) in ledDots"
          :key="i"
          class="wled-strip__led"
          :class="{
            'wled-strip__led--off': dot.dimmed,
            'wled-strip__led--active-seg': dot.segIndex === activeIndex,
          }"
          :style="{
            '--led-color': dot.color,
            backgroundColor: dot.dimmed ? '#1a1a2e' : dot.color,
            boxShadow: dot.dimmed ? 'none' : `0 0 4px ${dot.color}, 0 2px 8px ${dot.color}44`,
          }"
        />
      </div>
    </div>

    <!-- Segment labels below -->
    <div class="wled-strip__labels">
      <button
        v-for="marker in segmentMarkers"
        :key="marker.index"
        type="button"
        class="wled-strip__label"
        :class="{ 'wled-strip__label--active': marker.index === activeIndex }"
        :style="{
          left: `${marker.left}%`,
          width: `${marker.width}%`,
          '--seg-color': segColor(marker.index),
        }"
        @click="emit('selectSegment', marker.index)"
      >
        <span class="wled-strip__label-line" />
        <span class="wled-strip__label-text">Seg {{ marker.index }}: {{ marker.start }}–{{ marker.stop }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.wled-strip { display: flex; flex-direction: column; gap: 2px; padding: 8px 12px 0; }

/* PCB board */
.wled-strip__board {
  position: relative;
  background: linear-gradient(180deg, #0d0d14 0%, #111118 100%);
  border: 1px solid #1e1e2e;
  border-radius: 6px;
  padding: 8px 6px;
  min-height: 28px;
}

/* Wire trace */
.wled-strip__wire {
  position: absolute;
  top: 50%;
  left: 4px;
  right: 4px;
  height: 1px;
  background: #2a2a3a;
  transform: translateY(-50%);
}

/* LED row */
.wled-strip__leds {
  position: relative;
  display: flex;
  gap: 1px;
  z-index: 1;
}

/* Individual LED */
.wled-strip__led {
  flex: 1;
  height: 10px;
  border-radius: 2px;
  transition: all 0.2s;
  min-width: 2px;
}

.wled-strip__led--off { opacity: 0.2; }
.wled-strip__led--active-seg { transform: scaleY(1.2); }

/* Segment labels */
.wled-strip__labels {
  position: relative;
  height: 22px;
}

.wled-strip__label {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.15s;
}
.wled-strip__label:hover { opacity: 0.8; }

.wled-strip__label-line {
  width: 100%;
  height: 3px;
  border-radius: 1px;
  background: var(--seg-color);
  opacity: 0.3;
  transition: opacity 0.15s;
}
.wled-strip__label--active .wled-strip__label-line { opacity: 0.8; }

.wled-strip__label-text {
  font: 9px/1 monospace;
  color: #8b8ba0;
  white-space: nowrap;
  margin-top: 2px;
}
.wled-strip__label--active .wled-strip__label-text { color: var(--seg-color); }
</style>
