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

// 🎯 SVG coordinate system — centered at (100, 100) in 200x200 viewBox
const cx = 100
const cy = 100
const outerRadius = 80
const innerRadius = 62
const needleLen = innerRadius - 4

// 🔄 Needle rotation: -135° (min) → +135° (max) = 270° sweep
const rotation = computed(() => {
  const safeSpeed = Math.min(Math.max(Math.abs(props.speed), 0), props.max)
  return -135 + (safeSpeed / props.max) * 270
})

// 🎨 Speed-dependent color (green → amber → red)
const speedColor = computed(() => {
  const ratio = Math.abs(props.speed) / props.max
  if (ratio < 0.3) return '#10b981'  // emerald-500
  if (ratio < 0.7) return '#f59e0b'  // amber-500
  return '#ef4444'                     // red-500
})

// 📐 Generate tick marks — every unit of 10, with minor ticks at 5
const tickMarks = computed(() => {
  const ticks = []
  const step = 5
  const count = Math.floor(props.max / step)

  for (let i = 0; i <= count; i++) {
    const value = i * step
    const ratio = value / props.max
    const angle = -135 + ratio * 270
    const isMajor = value % 10 === 0
    const tickOuter = outerRadius - 2
    const tickInner = isMajor ? tickOuter - 10 : tickOuter - 5

    const rad = (angle * Math.PI) / 180
    const x1 = cx + tickInner * Math.cos(rad)
    const y1 = cy + tickInner * Math.sin(rad)
    const x2 = cx + tickOuter * Math.cos(rad)
    const y2 = cy + tickOuter * Math.sin(rad)

    ticks.push({ x1, y1, x2, y2, isMajor, value })
  }

  return ticks
})

// 🔢 Number labels at every 10
const numberLabels = computed(() => {
  const labels = []
  const step = 10
  const count = Math.floor(props.max / step)
  const labelRadius = outerRadius - 18

  for (let i = 0; i <= count; i++) {
    const value = i * step
    const ratio = value / props.max
    const angle = -135 + ratio * 270
    const rad = (angle * Math.PI) / 180

    labels.push({
      x: cx + labelRadius * Math.cos(rad),
      y: cy + labelRadius * Math.sin(rad),
      value,
    })
  }

  return labels
})

// 💡 LED speed display — pad to 3 digits
const ledSpeed = computed(() => String(Math.abs(props.speed)).padStart(3, '0'))
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <svg
      :width="size"
      :height="size"
      class="drop-shadow-lg"
      viewBox="0 0 200 200"
    >
      <defs>
        <!-- 🌑 Dark face gradient -->
        <radialGradient id="dialFace" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stop-color="#1a1a2e" />
          <stop offset="100%" stop-color="#0d0d1a" />
        </radialGradient>
        <!-- ✨ Needle glow -->
        <filter id="needleGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <!-- 📺 LCD screen glow -->
        <filter id="lcdGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- 🔲 Outer ring -->
      <circle
        :cx="cx" :cy="cy" :r="outerRadius"
        fill="none"
        stroke="#4b5563"
        stroke-width="2.5"
        opacity="0.6"
      />

      <!-- ⚫ Dial face -->
      <circle
        :cx="cx" :cy="cy" :r="outerRadius - 1"
        fill="url(#dialFace)"
      />

      <!-- 📏 Tick marks -->
      <line
        v-for="tick in tickMarks"
        :key="`t-${tick.value}`"
        :x1="tick.x1" :y1="tick.y1"
        :x2="tick.x2" :y2="tick.y2"
        :stroke="tick.isMajor ? '#e5e7eb' : '#4b5563'"
        :stroke-width="tick.isMajor ? 2 : 1"
        stroke-linecap="round"
        :opacity="tick.isMajor ? 0.9 : 0.5"
      />

      <!-- 🔢 Number labels (every 10) -->
      <text
        v-for="label in numberLabels"
        :key="`n-${label.value}`"
        :x="label.x" :y="label.y"
        text-anchor="middle"
        dominant-baseline="central"
        class="dial-number"
      >
        {{ label.value }}
      </text>

      <!-- 📍 Needle -->
      <line
        :x1="cx" :y1="cy"
        :x2="cx + needleLen * Math.cos((rotation * Math.PI) / 180)"
        :y2="cy + needleLen * Math.sin((rotation * Math.PI) / 180)"
        :stroke="speedColor"
        stroke-width="2.5"
        stroke-linecap="round"
        filter="url(#needleGlow)"
        class="dial-needle"
      />

      <!-- ⚙️ Center hub -->
      <circle :cx="cx" :cy="cy" r="4" fill="#6b7280" />
      <circle :cx="cx" :cy="cy" r="2" fill="#d1d5db" />

      <!-- 📺 LCD speed readout at bottom -->
      <g>
        <!-- LCD bezel -->
        <rect
          :x="cx - 32" :y="cy + 22"
          width="64" height="30"
          rx="3"
          fill="#111827"
          stroke="#374151"
          stroke-width="1.5"
        />
        <!-- LCD inner screen -->
        <rect
          :x="cx - 29" :y="cy + 25"
          width="58" height="24"
          rx="2"
          fill="#0c1a0c"
        />
        <!-- LCD ghost digits (unlit segments) -->
        <text
          :x="cx" :y="cy + 37.5"
          text-anchor="middle"
          dominant-baseline="central"
          class="lcd-ghost"
        >
          888
        </text>
        <!-- LCD active digits -->
        <text
          :x="cx" :y="cy + 37.5"
          text-anchor="middle"
          dominant-baseline="central"
          class="lcd-digits"
          filter="url(#lcdGlow)"
        >
          {{ ledSpeed }}
        </text>
      </g>
    </svg>

    <!-- 🏷️ Address label -->
    <div v-if="showLabel" class="text-center bg-gray-800/40 border border-gray-600/30 px-2 py-1 rounded">
      <v-label class="text-lg font-bold text-gray-300">#{{ address }}</v-label>
    </div>
  </div>
</template>

<style scoped>
.dial-needle {
  transition: x2 0.3s ease-out, y2 0.3s ease-out;
}

.dial-number {
  font-size: 8px;
  font-weight: 600;
  fill: #d1d5db;
  opacity: 0.85;
}

/* 📺 LCD "888" ghost segments — dim unlit look */
.lcd-ghost {
  font-family: 'Courier New', 'Consolas', monospace;
  font-size: 18px;
  font-weight: 900;
  fill: #1a3a1a;
  letter-spacing: 0.15em;
}

/* 📺 LCD active digits — green LED glow */
.lcd-digits {
  font-family: 'Courier New', 'Consolas', monospace;
  font-size: 18px;
  font-weight: 900;
  fill: #22c55e;
  letter-spacing: 0.15em;
}
</style>
