<script setup lang="ts">
import { computed } from 'vue'
import type { WledSegmentConfig } from '../types/config'

interface Props {
  segments: WledSegmentConfig[]
  activeIndex: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [index: number]
  add: []
  remove: [index: number]
  toggleOn: [index: number]
}>()

// 🎨 Segment color palette — cycles through these
const SEGMENT_COLORS = [
  '#ff0080', '#00ccff', '#10b981', '#f59e0b',
  '#8b5cf6', '#ef4444', '#06b6d4', '#d946ef',
]

function segmentColor(index: number): string {
  return SEGMENT_COLORS[index % SEGMENT_COLORS.length]
}

// 📐 Calculate total LEDs for proportional strip
const totalLeds = computed(() => {
  if (props.segments.length === 0) return 30
  return Math.max(...props.segments.map((s) => s.stop), 1)
})

interface StripSegment {
  leftPercent: number
  widthPercent: number
  color: string
  isActive: boolean
}

const stripSegments = computed<StripSegment[]>(() => {
  const total = totalLeds.value
  return props.segments.map((seg, i) => ({
    leftPercent: (seg.start / total) * 100,
    widthPercent: ((seg.stop - seg.start) / total) * 100,
    color: segmentColor(i),
    isActive: i === props.activeIndex,
  }))
})

// LED index labels
const ledLabels = computed(() => {
  const total = totalLeds.value
  return props.segments.map((seg) => ({
    start: seg.start,
    stop: seg.stop,
    startPercent: (seg.start / total) * 100,
    stopPercent: (seg.stop / total) * 100,
  }))
})
</script>

<template>
  <div class="wled-segment-editor">
    <!-- Visual strip at top -->
    <div class="visual-strip-wrapper">
      <div class="visual-strip">
        <div
          v-for="(s, i) in stripSegments"
          :key="i"
          class="visual-strip-seg"
          :class="{ active: s.isActive }"
          :style="{
            left: `${s.leftPercent}%`,
            width: `${s.widthPercent}%`,
            background: s.color,
            boxShadow: s.isActive ? `0 0 8px ${s.color}` : 'none',
            outline: s.isActive ? `2px solid white` : 'none',
          }"
          @click="emit('select', i)"
        />
      </div>

      <!-- LED index labels below strip -->
      <div class="led-labels">
        <template v-for="(lbl, i) in ledLabels" :key="i">
          <span
            class="led-label"
            :style="{ left: `${lbl.startPercent}%` }"
          >
            {{ lbl.start }}
          </span>
          <span
            class="led-label led-label-end"
            :style="{ left: `${lbl.stopPercent}%` }"
          >
            {{ lbl.stop }}
          </span>
        </template>
      </div>
    </div>

    <!-- Segment cards -->
    <div class="segment-cards">
      <div
        v-for="(seg, i) in segments"
        :key="i"
        class="segment-card"
        :class="{ active: i === activeIndex }"
        :style="i === activeIndex ? { borderColor: segmentColor(i) } : {}"
        @click="emit('select', i)"
      >
        <!-- Left: colored dot + info -->
        <div class="segment-info">
          <span
            class="segment-dot"
            :style="{
              background: segmentColor(i),
              boxShadow: `0 0 6px ${segmentColor(i)}`,
            }"
          />
          <div class="segment-text">
            <div class="segment-title">Segment {{ i }}</div>
            <div class="segment-meta">
              LED {{ seg.start }}–{{ seg.stop }}
              · {{ seg.effectName }}
              · {{ seg.paletteName }}
            </div>
          </div>
        </div>

        <!-- Right: on/off toggle + remove button -->
        <div class="segment-actions" @click.stop>
          <!-- Toggle switch -->
          <button
            class="toggle-switch"
            :class="{ on: seg.on }"
            :style="seg.on ? { background: segmentColor(i) } : {}"
            :aria-label="seg.on ? 'Turn off' : 'Turn on'"
            @click="emit('toggleOn', i)"
          >
            <span class="toggle-dot" />
          </button>
          <!-- Remove button -->
          <button
            class="remove-btn"
            :aria-label="`Remove segment ${i}`"
            @click="emit('remove', i)"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Add Segment button -->
    <button class="add-segment-btn" @click="emit('add')">
      + Add Segment
    </button>
  </div>
</template>

<style scoped>
/* 🎨 Neon segment editor */
.wled-segment-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Visual strip */
.visual-strip-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.visual-strip {
  position: relative;
  height: 24px;
  background: #1a1a2e;
  border-radius: 6px;
  overflow: visible;
}

.visual-strip-seg {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 4px;
  cursor: pointer;
  transition: box-shadow 0.15s ease;
}

.visual-strip-seg:hover {
  filter: brightness(1.2);
}

/* LED labels */
.led-labels {
  position: relative;
  height: 16px;
}

.led-label {
  position: absolute;
  font-size: 9px;
  color: #484f58;
  transform: translateX(-50%);
  white-space: nowrap;
}

/* Segment cards */
.segment-cards {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.segment-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #10101a;
  border: 1px solid #1a1a2e;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.segment-card:hover {
  border-color: #2d2d44;
}

.segment-card.active {
  background: #12121e;
}

.segment-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

/* Colored dot */
.segment-dot {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.segment-text {
  min-width: 0;
}

.segment-title {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
}

.segment-meta {
  font-size: 11px;
  color: #8b8ba0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Actions area */
.segment-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 🔘 Toggle switch — 28x14px pill */
.toggle-switch {
  position: relative;
  width: 28px;
  height: 14px;
  border-radius: 7px;
  background: #2d2d44;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.toggle-switch.on .toggle-dot {
  transform: translateX(14px);
}

.toggle-dot {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
  transition: transform 0.2s ease;
}

/* Remove button */
.remove-btn {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: transparent;
  border: 1px solid #2d2d44;
  color: #8b8ba0;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: #ef444422;
  border-color: #ef4444;
  color: #ef4444;
}

/* ➕ Add Segment button */
.add-segment-btn {
  padding: 10px;
  border-radius: 8px;
  border: 1px dashed #2d2d44;
  background: transparent;
  color: #8b5cf6;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
}

.add-segment-btn:hover {
  border-color: #8b5cf6;
  background: #8b5cf610;
}
</style>
