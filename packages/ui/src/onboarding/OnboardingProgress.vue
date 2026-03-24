<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useTemplateRef } from 'vue'
import { useTrainAnimation } from './useTrainAnimation'
import {
  TRACK_PATH_D,
  STATION_COORDS,
  STATUS_COLORS,
  VIEWBOX,
  type OnboardingStep,
} from './trackPath'

interface Props {
  currentStep: number
  steps: OnboardingStep[]
  statusMessage?: string
}

const props = defineProps<Props>()

const trackPathRef = useTemplateRef<SVGPathElement>('trackPathEl')
const { trainTransform } = useTrainAnimation(trackPathRef, toRef(() => props.currentStep))

const activeStationIndex = computed(() =>
  props.steps.findIndex((s) => s.status === 'active')
)
</script>

<template>
  <div class="rounded-xl bg-[#0d1422] p-4">
    <svg :viewBox="VIEWBOX" preserveAspectRatio="xMidYMid meet" class="w-full">
      <defs>
        <path id="trackPath" :d="TRACK_PATH_D" />
        <radialGradient id="smokeGrad">
          <stop offset="0%" stop-color="#94a3b8" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#94a3b8" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Track layers -->
      <use
        href="#trackPath"
        fill="none"
        stroke="#5c3d1a"
        stroke-width="26"
        stroke-linecap="butt"
        stroke-dasharray="3 8"
      />
      <use
        href="#trackPath"
        fill="none"
        stroke="#3a4a5e"
        stroke-width="20"
        stroke-linecap="round"
      />
      <use
        href="#trackPath"
        fill="none"
        stroke="#4a5a6e"
        stroke-width="14"
        stroke-linecap="round"
      />
      <use
        href="#trackPath"
        fill="none"
        stroke="#94a3b820"
        stroke-width="2"
        stroke-linecap="round"
      />

      <!-- Stations -->
      <g v-for="(step, i) in steps" :key="i">
        <!-- Station pole -->
        <line
          v-if="STATION_COORDS[i]"
          :x1="STATION_COORDS[i].x"
          :y1="STATION_COORDS[i].y - 32"
          :x2="STATION_COORDS[i].x"
          :y2="STATION_COORDS[i].y - 7"
          :stroke="STATUS_COLORS[step.status]"
          stroke-width="2"
        />

        <!-- Signal dot — outer -->
        <circle
          v-if="STATION_COORDS[i]"
          :cx="STATION_COORDS[i].x"
          :cy="STATION_COORDS[i].y - 35"
          r="7"
          fill="#0d1422"
          :stroke="STATUS_COLORS[step.status]"
          stroke-width="2.5"
        />
        <!-- Signal dot — inner -->
        <circle
          v-if="STATION_COORDS[i]"
          :cx="STATION_COORDS[i].x"
          :cy="STATION_COORDS[i].y - 35"
          r="3.5"
          :fill="STATUS_COLORS[step.status]"
        />
        <!-- Signal dot — glow -->
        <circle
          v-if="STATION_COORDS[i]"
          :cx="STATION_COORDS[i].x"
          :cy="STATION_COORDS[i].y - 35"
          r="10"
          :fill="STATUS_COLORS[step.status]"
          opacity="0.15"
        />
        <!-- Signal dot — active pulse -->
        <circle
          v-if="STATION_COORDS[i] && i === activeStationIndex"
          :cx="STATION_COORDS[i].x"
          :cy="STATION_COORDS[i].y - 35"
          r="14"
          :fill="STATUS_COLORS[step.status]"
          opacity="0.08"
        >
          <animate
            attributeName="r"
            values="14;18;14"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.08;0.02;0.08"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>

        <!-- Label -->
        <text
          v-if="STATION_COORDS[i]"
          :x="STATION_COORDS[i].x"
          :y="STATION_COORDS[i].labelY"
          :fill="STATUS_COLORS[step.status]"
          font-weight="700"
          text-anchor="middle"
          letter-spacing="0.08em"
          :font-size="i === activeStationIndex ? 13 : 11"
        >
          {{ step.label.toUpperCase() }}
        </text>
      </g>

      <!-- Invisible path ref for train animation -->
      <path ref="trackPathEl" :d="TRACK_PATH_D" fill="none" stroke="none" />

      <!-- Train -->
      <g :transform="trainTransform">
        <!-- Smoke puffs (rise from funnel) -->
        <g>
          <circle cx="8" cy="-38" r="4" fill="url(#smokeGrad)" opacity="0">
            <animate attributeName="cy" values="-38;-62" dur="1.4s" repeatCount="indefinite" />
            <animate attributeName="r" values="3;9" dur="1.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="12" cy="-38" r="3" fill="url(#smokeGrad)" opacity="0">
            <animate attributeName="cy" values="-38;-58" dur="1.1s" begin="0.4s" repeatCount="indefinite" />
            <animate attributeName="r" values="2;7" dur="1.1s" begin="0.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="1.1s" begin="0.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="6" cy="-38" r="2" fill="url(#smokeGrad)" opacity="0">
            <animate attributeName="cy" values="-38;-54" dur="1s" begin="0.7s" repeatCount="indefinite" />
            <animate attributeName="r" values="2;6" dur="1s" begin="0.7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0" dur="1s" begin="0.7s" repeatCount="indefinite" />
          </circle>
        </g>

        <!-- Boiler (round cylinder) -->
        <ellipse cx="4" cy="-2" rx="16" ry="11" fill="#3b82f6" />
        <ellipse cx="4" cy="-5" rx="14" ry="3" fill="#60a5fa" opacity="0.3" />
        <circle cx="18" cy="-2" r="10" fill="#2563eb" />
        <circle cx="18" cy="-2" r="7" fill="#1e40af" opacity="0.5" />

        <!-- Cab (rear box with roof) -->
        <rect x="-20" y="-16" width="18" height="22" rx="2" fill="#2563eb" />
        <rect x="-22" y="-18" width="22" height="4" rx="2" fill="#1e40af" />
        <rect x="-17" y="-12" width="11" height="8" rx="1.5" fill="#0ea5e9" opacity="0.85" />
        <rect x="-16" y="-11" width="3" height="6" rx="0.5" fill="#7dd3fc" opacity="0.4" />

        <!-- Funnel / Smokestack -->
        <rect x="5" y="-22" width="8" height="10" rx="2" fill="#475569" />
        <path d="M 3,-22 L 5,-32 L 13,-32 L 15,-22 Z" fill="#64748b" />
        <rect x="4" y="-33" width="10" height="2" rx="1" fill="#94a3b8" />

        <!-- Headlight (on front) -->
        <circle cx="26" cy="-4" r="3.5" fill="#fbbf24" opacity="0.9" />
        <circle cx="26" cy="-4" r="5.5" fill="#fbbf24" opacity="0.2" />
        <circle cx="26" cy="-4" r="9" fill="#fbbf24" opacity="0.06">
          <animate attributeName="r" values="9;13;9" dur="2s" repeatCount="indefinite" />
        </circle>

        <!-- Cowcatcher (front) -->
        <path d="M 26,4 L 32,8 L 32,-2 Z" fill="#1e3a8a" opacity="0.8" />

        <!-- Wheels -->
        <circle cx="-12" cy="11" r="7" fill="#1e293b" stroke="#475569" stroke-width="2" />
        <circle cx="-12" cy="11" r="4" fill="none" stroke="#64748b" stroke-width="1" opacity="0.5" />
        <circle cx="-12" cy="11" r="1.5" fill="#94a3b8" />
        <line x1="-12" y1="4" x2="-12" y2="18" stroke="#64748b" stroke-width="1" opacity="0.4" />
        <line x1="-19" y1="11" x2="-5" y2="11" stroke="#64748b" stroke-width="1" opacity="0.4" />
        <circle cx="4" cy="11" r="7" fill="#1e293b" stroke="#475569" stroke-width="2" />
        <circle cx="4" cy="11" r="4" fill="none" stroke="#64748b" stroke-width="1" opacity="0.5" />
        <circle cx="4" cy="11" r="1.5" fill="#94a3b8" />
        <line x1="4" y1="4" x2="4" y2="18" stroke="#64748b" stroke-width="1" opacity="0.4" />
        <line x1="-3" y1="11" x2="11" y2="11" stroke="#64748b" stroke-width="1" opacity="0.4" />
        <circle cx="20" cy="11" r="5" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
        <circle cx="20" cy="11" r="1.5" fill="#94a3b8" />
        <line x1="-12" y1="14" x2="4" y2="14" stroke="#94a3b8" stroke-width="2" opacity="0.6" />
        <line x1="4" y1="11" x2="20" y2="11" stroke="#94a3b8" stroke-width="1.5" opacity="0.4" />

        <!-- Chassis / Frame -->
        <rect x="-20" y="5" width="48" height="3" rx="1" fill="#1e3a8a" />

        <!-- Bell (on top of boiler) -->
        <circle cx="-2" cy="-16" r="3" fill="#d4a017" />
        <rect x="-3" y="-14" width="2" height="3" fill="#b8860b" />
        <circle cx="-2" cy="-16" r="4" fill="#fbbf24" opacity="0.15" />
      </g>
    </svg>

    <p v-if="statusMessage" class="text-center text-sm italic text-slate-500 mt-4">
      {{ statusMessage }}
    </p>
  </div>
</template>
