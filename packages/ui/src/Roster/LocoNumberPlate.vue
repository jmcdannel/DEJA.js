<script setup lang="ts">
import { computed } from 'vue'

type PlateSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface Props {
  address: number
  color?: string
  size?: PlateSize
  showLabel?: boolean
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: '',
  size: 'md',
  showLabel: false,
  label: '',
})

// 🎨 Color map — roadname color keys to plate hex values
interface PlateColor {
  border: string
  text: string
}

const COLOR_MAP: Record<string, PlateColor> = {
  orange: { border: '#e87020', text: '#e87020' },
  sky: { border: '#5080bb', text: '#80b0e8' },
  yellow: { border: '#d4b830', text: '#e8c840' },
  red: { border: '#c02828', text: '#e04040' },
  indigo: { border: '#4060c0', text: '#5878d8' },
  zinc: { border: '#777777', text: '#b0b0b0' },
  blue: { border: '#4070aa', text: '#6090cc' },
  green: { border: '#3a7a3a', text: '#50a850' },
}

const DEFAULT_COLOR: PlateColor = { border: '#b8972e', text: '#d4b44a' }

// 📐 Size specifications
interface SizeSpec {
  width: number
  height: number
  fontSize: number
  letterSpacing: number
  rivetCount: number
  rivetPositions: string[]
}

const SIZE_SPECS: Record<PlateSize, SizeSpec> = {
  xs: {
    width: 52,
    height: 22,
    fontSize: 14,
    letterSpacing: 1.5,
    rivetCount: 2,
    rivetPositions: ['tl', 'tr'],
  },
  sm: {
    width: 76,
    height: 30,
    fontSize: 18,
    letterSpacing: 2,
    rivetCount: 2,
    rivetPositions: ['tl', 'tr'],
  },
  md: {
    width: 104,
    height: 40,
    fontSize: 26,
    letterSpacing: 3,
    rivetCount: 2,
    rivetPositions: ['tl', 'tr'],
  },
  lg: {
    width: 136,
    height: 52,
    fontSize: 34,
    letterSpacing: 4,
    rivetCount: 4,
    rivetPositions: ['tl', 'tr', 'bl', 'br'],
  },
  xl: {
    width: 176,
    height: 66,
    fontSize: 44,
    letterSpacing: 5,
    rivetCount: 5,
    rivetPositions: ['tl', 'tr', 'bl', 'br', 'tc'],
  },
  '2xl': {
    width: 220,
    height: 82,
    fontSize: 56,
    letterSpacing: 7,
    rivetCount: 6,
    rivetPositions: ['tl', 'tr', 'bl', 'br', 'tc', 'bc'],
  },
}

// 🔧 Darken/lighten a hex color by a given amount
function adjustBrightness(hex: string, amount: number): string {
  const cleaned = hex.replace('#', '')
  const num = parseInt(cleaned, 16)
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

const plateColor = computed<PlateColor>(() => {
  if (!props.color) return DEFAULT_COLOR
  return COLOR_MAP[props.color] ?? DEFAULT_COLOR
})

const spec = computed(() => SIZE_SPECS[props.size])

// 🔩 Rivet size scales with the plate
const rivetSize = computed(() => {
  const s = spec.value
  return Math.max(2, Math.round(s.height * 0.08))
})

// 🔩 Rivet offset from edges
const rivetOffset = computed(() => {
  const s = spec.value
  return Math.max(3, Math.round(s.height * 0.15))
})

// 📐 Inner border width scales with size
const innerBorderWidth = computed(() => {
  const s = spec.value
  if (s.width <= 76) return 1
  if (s.width <= 136) return 1.5
  return 2
})

// 🎨 Outer wrapper style — gradient border
const outerStyle = computed(() => {
  const s = spec.value
  const c = plateColor.value
  const darker = adjustBrightness(c.border, -40)
  const borderRadius = Math.round(s.height * 0.15)
  const padding = Math.max(2, Math.round(s.height * 0.06))
  return {
    display: 'inline-flex',
    width: `${s.width}px`,
    height: `${s.height}px`,
    padding: `${padding}px`,
    borderRadius: `${borderRadius}px`,
    background: `linear-gradient(180deg, ${c.border} 0%, ${darker} 100%)`,
    boxSizing: 'border-box' as const,
    position: 'relative' as const,
    flexShrink: 0,
  }
})

// 🎨 Inner face style — dark plate face with colored border
const innerStyle = computed(() => {
  const c = plateColor.value
  const bw = innerBorderWidth.value
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#111',
    border: `${bw}px solid ${c.border}`,
    borderRadius: `${Math.max(1, Math.round(spec.value.height * 0.1))}px`,
    position: 'relative' as const,
    overflow: 'hidden',
  }
})

// 🔢 Number text style
const numberStyle = computed(() => {
  const s = spec.value
  const c = plateColor.value
  return {
    fontFamily: "'Roboto Condensed', sans-serif",
    fontWeight: 700,
    fontSize: `${s.fontSize}px`,
    letterSpacing: `${s.letterSpacing}px`,
    color: c.text,
    lineHeight: 1,
    textAlign: 'center' as const,
    userSelect: 'none' as const,
    // Offset letter-spacing so text appears centered
    paddingLeft: `${s.letterSpacing}px`,
  }
})

// 🏷️ Label style
const labelStyle = computed(() => {
  const s = spec.value
  const c = plateColor.value
  const labelFontSize = Math.max(9, Math.round(s.fontSize * 0.38))
  return {
    fontFamily: "'Roboto Condensed', sans-serif",
    fontWeight: 700,
    fontSize: `${labelFontSize}px`,
    color: c.text,
    opacity: 0.7,
    textAlign: 'center' as const,
    marginTop: '2px',
    lineHeight: 1.2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    maxWidth: `${s.width}px`,
  }
})

// 🔩 Compute rivet positions as absolute CSS coordinates
interface RivetPosition {
  top?: string
  bottom?: string
  left?: string
  right?: string
}

const rivetPositions = computed<RivetPosition[]>(() => {
  const s = spec.value
  const offset = rivetOffset.value
  const centerX = Math.round(s.width / 2)

  const positionMap: Record<string, RivetPosition> = {
    tl: { top: `${offset}px`, left: `${offset}px` },
    tr: { top: `${offset}px`, right: `${offset}px` },
    bl: { bottom: `${offset}px`, left: `${offset}px` },
    br: { bottom: `${offset}px`, right: `${offset}px` },
    tc: { top: `${offset}px`, left: `${centerX}px` },
    bc: { bottom: `${offset}px`, left: `${centerX}px` },
  }

  return s.rivetPositions.map((key) => positionMap[key]).filter(Boolean)
})

// 🔩 Rivet dot style (shared base)
const rivetBaseStyle = computed(() => {
  const size = rivetSize.value
  return {
    position: 'absolute' as const,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    background: 'radial-gradient(circle at 40% 35%, #666, #333)',
    boxShadow: 'inset 0 0.5px 1px rgba(0,0,0,0.6)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none' as const,
  }
})

const displayAddress = computed(() => String(props.address))
</script>

<template>
  <div class="inline-flex flex-col items-center">
    <!-- 🚂 Cast-brass number plate -->
    <div :style="outerStyle">
      <div :style="innerStyle">
        <!-- 🔢 Address number -->
        <span :style="numberStyle">{{ displayAddress }}</span>

        <!-- 🔩 Rivet dots -->
        <span
          v-for="(pos, idx) in rivetPositions"
          :key="idx"
          :style="{ ...rivetBaseStyle, ...pos }"
        />
      </div>
    </div>

    <!-- 🏷️ Optional label below -->
    <span v-if="showLabel && label" :style="labelStyle">{{ label }}</span>
  </div>
</template>
