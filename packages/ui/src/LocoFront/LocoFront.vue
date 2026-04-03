<script setup lang="ts">
/**
 * LocoFront — A pure SVG illustration of a locomotive from the front,
 * styled per the roadname's livery colours.
 *
 * Inspired by the front-on photographs of GE ES44AC / ET44AC wide-cab units.
 * Proportions aim for a realistic wide-cab squat silhouette.
 */
import { computed } from 'vue'
import { getLocoFrontDesign, type LocoFrontDesign } from './locoFrontData'

const props = defineProps<{
  /** Roadname key (e.g. 'bnsf', 'up', 'csx') */
  roadname?: string | null
  /** Road number to display on number boards (e.g. '7132') */
  roadNumber?: string | number
  /** Optional logo image src — rendered on the nose instead of text */
  logoSrc?: string
  /** Width in px – height auto-scales to maintain aspect ratio */
  size?: number
}>()

const design = computed<LocoFrontDesign>(() => getLocoFrontDesign(props.roadname))
const number = computed(() => props.roadNumber?.toString() ?? '')
const width = computed(() => props.size ?? 280)

/* Unique IDs for SVG defs so multiple instances don't clash */
const uid = Math.random().toString(36).slice(2, 8)
const bodyGradId = computed(() => `lf-body-${uid}`)
const glassGradId = computed(() => `lf-glass-${uid}`)
const headlightGradId = computed(() => `lf-hl-${uid}`)
const glowFilterId = computed(() => `lf-glow-${uid}`)
const reflectId = computed(() => `lf-reflect-${uid}`)
const shadowId = computed(() => `lf-shadow-${uid}`)
</script>

<template>
  <!--
    viewBox 0 0 400 440  — squatter proportions (was 520).
    The cab body is now shorter relative to width, closer to real GE wide-cab.
  -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 400 440"
    :width="width"
    :style="{ height: 'auto', display: 'block' }"
    role="img"
    :aria-label="`${design.noseText || 'Locomotive'} front view`"
  >
    <defs>
      <!-- Body gradient (single colour or two-tone) -->
      <linearGradient :id="bodyGradId" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" :stop-color="design.bodyColor" />
        <stop offset="55%" :stop-color="design.bodyColor" />
        <stop
          v-if="design.bodyColor2"
          offset="100%"
          :stop-color="design.bodyColor2"
        />
        <stop v-else offset="100%" :stop-color="design.bodyColor" />
      </linearGradient>

      <!-- Glass gradient -->
      <linearGradient :id="glassGradId" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="rgba(160,195,220,0.45)" />
        <stop offset="40%" :stop-color="design.glassTint" />
        <stop offset="100%" stop-color="rgba(20,25,35,0.92)" />
      </linearGradient>

      <!-- Headlight radial -->
      <radialGradient :id="headlightGradId" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fffde8" />
        <stop offset="50%" stop-color="#ffe97a" />
        <stop offset="100%" :stop-color="design.headlightHousing" />
      </radialGradient>

      <!-- Glow filter for headlights -->
      <filter :id="glowFilterId" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- Glass reflection highlight -->
      <linearGradient :id="reflectId" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="rgba(255,255,255,0.35)" />
        <stop offset="30%" stop-color="rgba(255,255,255,0.08)" />
        <stop offset="100%" stop-color="rgba(255,255,255,0)" />
      </linearGradient>

      <!-- Drop shadow for the whole locomotive -->
      <filter :id="shadowId" x="-8%" y="-4%" width="116%" height="112%">
        <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="rgba(0,0,0,0.4)" />
      </filter>
    </defs>

    <!-- ──────── MAIN BODY GROUP ──────── -->
    <g :filter="`url(#${shadowId})`">

      <!-- ══════ LOWER FRAME / ANTI-CLIMBER ══════ -->
      <rect x="55" y="310" width="290" height="100" rx="6" :fill="design.frameColor" />
      <!-- Coupler pocket -->
      <rect x="165" y="370" width="70" height="42" rx="4" fill="#2a2a2a" stroke="#444" stroke-width="1" />
      <rect x="180" y="385" width="40" height="18" rx="3" fill="#1a1a1a" />

      <!-- Pilot / plow shape -->
      <path d="M65,405 Q200,418 335,405 L342,414 Q200,432 58,414 Z" :fill="design.frameColor" stroke="#333" stroke-width="1" />

      <!-- MU hoses (curvy pipes on lower front) -->
      <path d="M140,390 Q155,404 175,395" fill="none" stroke="#c4a832" stroke-width="2.5" stroke-linecap="round" />
      <path d="M260,390 Q245,404 225,395" fill="none" stroke="#c4a832" stroke-width="2.5" stroke-linecap="round" />

      <!-- ══════ CAB NOSE ══════ -->
      <path
        d="M75,105 L75,310 L325,310 L325,105 L280,48 L120,48 Z"
        :fill="`url(#${bodyGradId})`"
        stroke="#222"
        stroke-width="1.5"
      />

      <!-- ══════ WINDSHIELD / CAB GLASS ══════ -->
      <!-- Left window -->
      <path
        d="M95,72 L118,50 L188,50 L188,128 L95,128 Z"
        :fill="`url(#${glassGradId})`"
        stroke="#2a2a2a"
        stroke-width="3"
      />
      <!-- Right window -->
      <path
        d="M305,72 L282,50 L212,50 L212,128 L305,128 Z"
        :fill="`url(#${glassGradId})`"
        stroke="#2a2a2a"
        stroke-width="3"
      />
      <!-- Window divider (center post) -->
      <rect x="194" y="46" width="12" height="86" :fill="design.bodyColor" stroke="#222" stroke-width="1" />

      <!-- ══════ NUMBER BOARDS — large, centered in each window ══════ -->
      <g v-if="number">
        <!-- Left number board — centered in left pane -->
        <rect x="112" y="62" width="66" height="22" rx="3" :fill="design.numberBoardBg" stroke="#555" stroke-width="0.75" />
        <text
          x="145" y="76"
          text-anchor="middle"
          dominant-baseline="central"
          :fill="design.numberBoardText"
          font-size="15"
          font-weight="800"
          font-family="'Roboto Condensed', 'Arial Narrow', sans-serif"
          letter-spacing="1.5"
        >{{ number }}</text>

        <!-- Right number board — centered in right pane -->
        <rect x="222" y="62" width="66" height="22" rx="3" :fill="design.numberBoardBg" stroke="#555" stroke-width="0.75" />
        <text
          x="255" y="76"
          text-anchor="middle"
          dominant-baseline="central"
          :fill="design.numberBoardText"
          font-size="15"
          font-weight="800"
          font-family="'Roboto Condensed', 'Arial Narrow', sans-serif"
          letter-spacing="1.5"
        >{{ number }}</text>
      </g>

      <!-- Glass reflections -->
      <path
        d="M101,78 L120,56 L155,56 L155,88 Z"
        :fill="`url(#${reflectId})`"
        opacity="0.45"
      />
      <path
        d="M299,78 L280,56 L255,56 L255,88 Z"
        :fill="`url(#${reflectId})`"
        opacity="0.35"
      />

      <!-- Wipers -->
      <line x1="145" y1="125" x2="120" y2="76" stroke="#555" stroke-width="1.5" stroke-linecap="round" />
      <line x1="255" y1="125" x2="280" y2="76" stroke="#555" stroke-width="1.5" stroke-linecap="round" />

      <!-- ══════ ROOF / CAB TOP ══════ -->
      <path
        d="M120,48 L140,28 L260,28 L280,48 Z"
        fill="#3a3a3a"
        stroke="#222"
        stroke-width="1"
      />
      <!-- Roof edge detail -->
      <rect x="145" y="26" width="110" height="4" rx="2" fill="#4a4a4a" />

      <!-- Horns -->
      <rect x="175" y="14" width="8" height="16" rx="2" fill="#666" stroke="#444" stroke-width="1" />
      <rect x="217" y="14" width="8" height="16" rx="2" fill="#666" stroke="#444" stroke-width="1" />
      <rect x="172" y="10" width="14" height="6" rx="2" fill="#777" />
      <rect x="214" y="10" width="14" height="6" rx="2" fill="#777" />

      <!-- ══════ HEADLIGHTS ══════ -->
      <!-- Center cluster -->
      <g>
        <rect x="187" y="138" width="26" height="36" rx="4" :fill="design.headlightHousing" stroke="#444" stroke-width="1" />
        <circle cx="200" cy="148" r="7" :fill="`url(#${headlightGradId})`" :filter="`url(#${glowFilterId})`" />
        <circle cx="200" cy="166" r="6" :fill="`url(#${headlightGradId})`" :filter="`url(#${glowFilterId})`" />
      </g>

      <!-- Left ditch light -->
      <circle cx="100" cy="302" r="8" :fill="design.ditchLightColor" stroke="#555" stroke-width="1.5" />
      <circle cx="100" cy="302" r="4.5" :fill="`url(#${headlightGradId})`" :filter="`url(#${glowFilterId})`" />

      <!-- Right ditch light -->
      <circle cx="300" cy="302" r="8" :fill="design.ditchLightColor" stroke="#555" stroke-width="1.5" />
      <circle cx="300" cy="302" r="4.5" :fill="`url(#${headlightGradId})`" :filter="`url(#${glowFilterId})`" />

      <!-- Classification / Marker light (red) -->
      <circle cx="200" cy="378" r="6" fill="#8a1111" stroke="#444" stroke-width="1" opacity="0.9" />
      <circle cx="200" cy="378" r="3" fill="#ee2222" opacity="0.8" />

      <!-- ══════ LOGO / NOSE ART ══════ -->
      <!-- If a logo image is provided, render it centered on the nose -->
      <image
        v-if="logoSrc"
        :href="logoSrc"
        x="120" y="180"
        width="160" height="100"
        preserveAspectRatio="xMidYMid meet"
      />
      <!-- Fallback: nose text when no logo is available -->
      <text
        v-else
        x="200"
        y="220"
        text-anchor="middle"
        dominant-baseline="central"
        :fill="design.noseTextColor"
        :font-size="design.noseText.length > 4 ? 36 : 48"
        font-weight="900"
        :font-family="design.noseTextFont || `'Impact', 'Arial Black', sans-serif`"
        letter-spacing="3"
        paint-order="stroke"
        :stroke="design.accent2Color || 'rgba(0,0,0,0.15)'"
        stroke-width="1"
      >{{ design.noseText }}</text>

      <!-- ══════ HANDRAILS / GRAB IRONS ══════ -->
      <!-- Left handrail -->
      <path
        d="M75,140 Q67,140 67,150 L67,340 Q67,350 75,350"
        fill="none"
        :stroke="design.handrailColor"
        stroke-width="3.5"
        stroke-linecap="round"
      />
      <!-- Right handrail -->
      <path
        d="M325,140 Q333,140 333,150 L333,340 Q333,350 325,350"
        fill="none"
        :stroke="design.handrailColor"
        stroke-width="3.5"
        stroke-linecap="round"
      />

      <!-- Front grab irons (vertical bars in the center) -->
      <rect x="168" y="275" width="4" height="42" rx="1.5" :fill="design.handrailColor" />
      <rect x="180" y="270" width="4" height="47" rx="1.5" :fill="design.handrailColor" />
      <rect x="216" y="270" width="4" height="47" rx="1.5" :fill="design.handrailColor" />
      <rect x="228" y="275" width="4" height="42" rx="1.5" :fill="design.handrailColor" />

      <!-- Horizontal grab bar across front -->
      <rect x="165" y="318" width="70" height="3" rx="1.5" :fill="design.handrailColor" />

      <!-- ══════ BODY PANEL LINES (subtle) ══════ -->
      <line x1="75" y1="178" x2="325" y2="178" stroke="rgba(0,0,0,0.1)" stroke-width="0.5" />
      <line x1="75" y1="310" x2="325" y2="310" stroke="rgba(0,0,0,0.25)" stroke-width="1" />

      <!-- ══════ WALKWAY EDGE / ANTI-SLIP ══════ -->
      <rect x="50" y="308" width="300" height="5" rx="1" fill="#333" stroke="#222" stroke-width="0.5" />

    </g>
  </svg>
</template>
