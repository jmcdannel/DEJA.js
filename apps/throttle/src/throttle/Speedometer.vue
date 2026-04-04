<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  speed: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    default: 126,
  },
  address: {
    type: Number,
    required: true,
  },
  size: {
    type: Number,
    default: 120,
  },
  showLabel: {
    type: Boolean,
    default: true,
  },
})

// SVG coordinate system — everything centered at (100, 100) in a 200x200 viewBox
const cx = 100
const cy = 100
const radius = 64
const needleLen = radius * 0.8

const rotation = computed(() => {
  const safeSpeed = Math.min(Math.max(props.speed, 0), props.max)
  const ratio = safeSpeed / props.max
  return -135 + ratio * 270
})

const speedColor = computed(() => {
  const ratio = props.speed / props.max
  if (ratio < 0.3) return '#10b981'
  if (ratio < 0.7) return '#f59e0b'
  return '#ef4444'
})

// Generate tick marks
const tickMarks = computed(() => {
  const ticks = []
  const minorTickCount = 20
  const majorTickCount = 6

  for (let i = 0; i <= minorTickCount; i++) {
    const ratio = i / minorTickCount
    const angle = -135 + ratio * 270
    const isMajor = i % (minorTickCount / (majorTickCount - 1)) === 0
    const tickLength = isMajor ? 8 : 4
    const tickRadius = radius + (isMajor ? 0 : 4)

    const rad = angle * Math.PI / 180
    const startX = cx + (tickRadius - tickLength) * Math.cos(rad)
    const startY = cy + (tickRadius - tickLength) * Math.sin(rad)
    const endX = cx + tickRadius * Math.cos(rad)
    const endY = cy + tickRadius * Math.sin(rad)

    ticks.push({ startX, startY, endX, endY, isMajor, value: Math.round(ratio * props.max) })
  }

  return ticks
})

// Generate value labels for major ticks
const valueLabels = computed(() => {
  const labels = []
  const majorTickCount = 6

  for (let i = 0; i < majorTickCount; i++) {
    const ratio = i / (majorTickCount - 1)
    const angle = -135 + ratio * 270
    const value = Math.round(ratio * props.max)
    const labelRadius = radius + 18

    const rad = angle * Math.PI / 180
    const x = cx + labelRadius * Math.cos(rad)
    const y = cy + labelRadius * Math.sin(rad)

    labels.push({ x, y, value, angle })
  }

  return labels
})
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <!-- SVG Speedometer -->
    <svg
      :width="size"
      :height="size"
      class="drop-shadow-lg"
      viewBox="0 0 200 200"
    >
      <!-- Background circle -->
      <circle
        :cx="cx"
        :cy="cy"
        :r="radius + 2"
        fill="white"
        stroke="#374151"
        stroke-width="3"
      />

      <!-- Inner circle for depth -->
      <circle
        :cx="cx"
        :cy="cy"
        :r="radius - 2"
        fill="#f8fafc"
        stroke="#e2e8f0"
        stroke-width="1"
      />

      <!-- Tick marks -->
      <g v-for="tick in tickMarks" :key="`tick-${tick.value}-${tick.startX}`">
        <line
          :x1="tick.startX"
          :y1="tick.startY"
          :x2="tick.endX"
          :y2="tick.endY"
          :stroke="tick.isMajor ? '#374151' : '#9ca3af'"
          :stroke-width="tick.isMajor ? 2 : 1"
          stroke-linecap="round"
        />
      </g>

      <!-- Value labels -->
      <g v-for="label in valueLabels" :key="`label-${label.value}`">
        <text
          :x="label.x"
          :y="label.y"
          text-anchor="middle"
          dominant-baseline="central"
          class="speedometer-label"
        >
          {{ label.value }}
        </text>
      </g>

      <!-- Needle -->
      <line
        :x1="cx"
        :y1="cy"
        :x2="cx + needleLen * Math.cos(rotation * Math.PI / 180)"
        :y2="cy + needleLen * Math.sin(rotation * Math.PI / 180)"
        :stroke="speedColor"
        stroke-width="3"
        stroke-linecap="round"
        class="speedometer-needle"
      />

      <!-- Center dot -->
      <circle
        :cx="cx"
        :cy="cy"
        r="4"
        fill="#374151"
      />

      <!-- Current speed display -->
      <text
        :x="cx"
        :y="cy + 24"
        text-anchor="middle"
        dominant-baseline="middle"
        class="speedometer-speed"
      >
        {{ speed }}
      </text>
    </svg>

    <!-- Address label -->
    <div v-if="showLabel" class="text-center bg-gray-400/20 px-2 py-1 rounded-md">
      <v-label class="text-lg font-bold">#{{ address }}</v-label>
    </div>
  </div>
</template>

<style scoped>
.speedometer-needle {
  transition: x2 0.3s ease-out, y2 0.3s ease-out;
}
.speedometer-label {
  font-size: 10px;
  font-weight: 500;
  fill: #9ca3af;
}
.speedometer-speed {
  font-size: 14px;
  font-weight: 700;
  fill: #374151;
}
</style>
