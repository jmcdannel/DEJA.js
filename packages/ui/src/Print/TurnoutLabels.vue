
<script setup lang="ts">
import { computed } from 'vue'
import type { Turnout } from '@repo/modules/turnouts'

interface Props {
  turnouts: Turnout[]
}

const props = defineProps<Props>()

const items = computed(() => props.turnouts || [])

type RGB = { r: number; g: number; b: number }

function clamp(n: number, min = 0, max = 255): number {
  return Math.max(min, Math.min(max, n))
}

function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (v: number) => clamp(Math.round(v)).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function parseHex(src: string): RGB | null {
  const s = src.replace('#', '')
  if (s.length === 3) {
    const r = parseInt(s[0] + s[0], 16)
    const g = parseInt(s[1] + s[1], 16)
    const b = parseInt(s[2] + s[2], 16)
    return { r, g, b }
  }
  if (s.length === 6) {
    const r = parseInt(s.slice(0, 2), 16)
    const g = parseInt(s.slice(2, 4), 16)
    const b = parseInt(s.slice(4, 6), 16)
    return { r, g, b }
  }
  return null
}

function parseRgbTuple(src: string): RGB | null {
  const m = src.match(/^\(?\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)?$/)
  if (!m) return null
  return { r: +m[1], g: +m[2], b: +m[3] }
}

function resolveCssColorName(name: string): RGB | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null
  const el = document.createElement('div')
  el.style.display = 'none'
  el.style.color = name
  document.body.appendChild(el)
  const cs = getComputedStyle(el).color // rgb(r, g, b)
  document.body.removeChild(el)
  const m = cs.match(/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/)
  if (!m) return null
  return { r: +m[1], g: +m[2], b: +m[3] }
}

function normalizeColor(input?: string): string {
  if (!input) return '#777777'
  const src = String(input).trim()
  return (
    (src.startsWith('#') && parseHex(src)) ||
    parseRgbTuple(src) ||
    resolveCssColorName(src) ||
    { r: 119, g: 119, b: 119 }
  ) && rgbToHex(
    ((src.startsWith('#') && parseHex(src)) || parseRgbTuple(src) || resolveCssColorName(src) || { r: 119, g: 119, b: 119 }) as RGB
  )
}

function lighten({ r, g, b }: RGB, amount = 0.08): RGB {
  return {
    r: clamp(r + (255 - r) * amount),
    g: clamp(g + (255 - g) * amount),
    b: clamp(b + (255 - b) * amount),
  }
}

function darken({ r, g, b }: RGB, amount = 0.12): RGB {
  return {
    r: clamp(r * (1 - amount)),
    g: clamp(g * (1 - amount)),
    b: clamp(b * (1 - amount)),
  }
}

function hexToRgb(hex: string): RGB {
  return parseHex(hex) || { r: 119, g: 119, b: 119 }
}

function gradientStyle(bg: string): string {
  const base = hexToRgb(bg)
  const start = rgbToHex(lighten(base))
  const end = rgbToHex(darken(base))
  return `linear-gradient(270deg, ${start}, ${end})`
}

function getTextColor(bg: string): string {
  const { r, g, b } = hexToRgb(bg)
  const rs = r / 255, gs = g / 255, bs = b / 255
  const lum = 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  return lum < 0.5 ? '#FFFFFF' : '#000000'
}
</script>

<template>
  <div class="labels no-selection">
    <div
      v-for="t in items"
      :key="t.id"
      class="label"
      :style="{
        background: gradientStyle(normalizeColor(t.color)),
        color: getTextColor(normalizeColor(t.color))
      }"
    >
      <span class="text">{{ t.name }}</span>
      <span v-if="t.turnoutIdx !== undefined" class="idx">#{{ t.turnoutIdx }}</span>
    </div>
  </div>
</template>

<style scoped>
.labels {
  display: flex;
  flex-wrap: wrap;
  gap: 0.05in;
}

.label {
  height: 0.3in; /* Required height */
  line-height: 0.3in; /* Vertically center text */
  padding: 0 0.1in;
  border: 0.5pt solid rgba(0,0,0,0.3);
  color: #000;
  font-weight: 600;
  font-size: 11pt;
  display: inline-flex;
  align-items: center;
  gap: 0.08in;
  white-space: nowrap;
}

.idx {
  font-weight: 700;
}

.no-selection {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

@media print {
  .labels {
    margin: 0;
    padding: 0;
  }
  .label {
    page-break-inside: avoid;
  }
}
</style>


