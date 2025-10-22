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
})

const rotation = computed(() => {
  const safeSpeed = Math.min(Math.max(props.speed, 0), props.max)
  const ratio = safeSpeed / props.max
  return -135 + ratio * 270 // Start at -135° (bottom left) and go to +135° (bottom right)
})

// Speed range indicator color
const speedColor = computed(() => {
  const ratio = props.speed / props.max
  if (ratio < 0.3) return '#10b981' // Green for low speed
  if (ratio < 0.7) return '#f59e0b' // Amber for medium speed
  return '#ef4444' // Red for high speed
})

const centerX = computed(() => props.size / 2)
const centerY = computed(() => props.size / 2)
const radius = computed(() => (props.size * 0.4))
const needleLength = computed(() => radius.value * 0.8)

// Generate tick marks
const tickMarks = computed(() => {
  const ticks = []
  const majorTickCount = 6 // Major ticks at 0, 25%, 50%, 75%, 100%
  const minorTickCount = 20 // Minor ticks between major ticks
  
  for (let i = 0; i <= minorTickCount; i++) {
    const ratio = i / minorTickCount
    const angle = -135 + ratio * 270 // Start at -135° (bottom left) and go to +135° (bottom right)
    const isMajor = i % (minorTickCount / (majorTickCount - 1)) === 0
    const tickLength = isMajor ? 8 : 4
    const tickRadius = radius.value + (isMajor ? 0 : 4)
    
    const startX = centerX.value + (tickRadius - tickLength) * Math.cos(angle * Math.PI / 180)
    const startY = centerY.value + (tickRadius - tickLength) * Math.sin(angle * Math.PI / 180)
    const endX = centerX.value + tickRadius * Math.cos(angle * Math.PI / 180)
    const endY = centerY.value + tickRadius * Math.sin(angle * Math.PI / 180)
    
    ticks.push({
      startX,
      startY,
      endX,
      endY,
      isMajor,
      value: Math.round(ratio * props.max)
    })
  }
  
  return ticks
})

// Generate value labels for major ticks
const valueLabels = computed(() => {
  const labels = []
  const majorTickCount = 6
  
  for (let i = 0; i < majorTickCount; i++) {
    const ratio = i / (majorTickCount - 1)
    const angle = -135 + ratio * 270 // Start at -135° (bottom left) and go to +135° (bottom right)
    const value = Math.round(ratio * props.max)
    const labelRadius = radius.value + 20
    
    const x = centerX.value + labelRadius * Math.cos(angle * Math.PI / 180)
    const y = centerY.value + labelRadius * Math.sin(angle * Math.PI / 180)
    
    labels.push({
      x,
      y,
      value,
      angle
    })
  }
  
  return labels
})
</script>

<template>
  <v-list-item class="flex flex-col items-center gap-2" base-color="red">
    <!-- SVG Speedometer -->
    <svg 
      :width="size" 
      :height="size" 
      class="drop-shadow-lg"
      viewBox="0 0 160 160"
    >
      <!-- Background circle -->
      <circle
        :cx="centerX + 20"
        :cy="centerY + 20"
        :r="radius + 2"
        fill="white"
        stroke="#374151"
        stroke-width="3"
        class="drop-shadow-sm"
      />
      
      <!-- Inner circle for depth -->
      <circle
        :cx="centerX + 20"
        :cy="centerY + 20"
        :r="radius - 2"
        fill="#f8fafc"
        stroke="#e2e8f0"
        stroke-width="1"
      />
      
      <!-- Tick marks -->
      <g v-for="tick in tickMarks" :key="`tick-${tick.value}`">
        <line
          :x1="tick.startX + 20"
          :y1="tick.startY + 20"
          :x2="tick.endX + 20"
          :y2="tick.endY + 20"
          :stroke="tick.isMajor ? '#374151' : '#9ca3af'"
          :stroke-width="tick.isMajor ? 2 : 1"
          stroke-linecap="round"
        />
      </g>
      
      <!-- Value labels -->
      <g v-for="label in valueLabels" :key="`label-${label.value}`">
        <text
          :x="label.x + 20"
          :y="label.y + 20"
          :text-anchor="label.angle > 90 || label.angle < -90 ? 'end' : 'start'"
          :dominant-baseline="label.angle > 0 ? 'hanging' : 'auto'"
          class="text-xs font-medium fill-gray-100"
        >
          {{ label.value }}
        </text>
      </g>
      
      <!-- Needle -->
      <line
        :x1="centerX + 20"
        :y1="centerY + 20"
        :x2="centerX + 20 + needleLength * Math.cos(rotation * Math.PI / 180)"
        :y2="centerY + 20 + needleLength * Math.sin(rotation * Math.PI / 180)"
        :stroke="speedColor"
        stroke-width="3"
        stroke-linecap="round"
        class="drop-shadow-md"
      />
      
      <!-- Center dot -->
      <circle
        :cx="centerX + 20"
        :cy="centerY + 20"
        r="4"
        fill="#374151"
        class="drop-shadow-sm"
      />
      
      <!-- Current speed display -->
      <text
        :x="centerX + 20"
        :y="centerY + 36"
        text-anchor="middle"
        dominant-baseline="middle"
        class="text-sm font-bold fill-gray-800"
      >
        {{ speed }}
      </text>
    </svg>
    
    <!-- Address label -->
    <div class="text-center">
      <v-label color="red" class="text-lg font-bold">#{{ address }}</v-label>
    </div>
  </v-list-item>
</template>

<style scoped>
/* Smooth needle animation */
line[stroke] {
  transition: x2 0.3s ease-out, y2 0.3s ease-out;
}
</style>
