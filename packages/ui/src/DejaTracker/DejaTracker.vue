<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  /** 0-based index of the current active step (0=Account, 1=Plan, 2=Layout, 3=Install, 4=Drive) */
  activeStep: number
  /** Show cycling status text below the tracker */
  showStatus?: boolean
  /** Compact mode — smaller viewBox height, no status text */
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showStatus: false,
  compact: false,
})

const PHRASES = [
  'Full steam ahead...',
  'Coupling the cars...',
  'Clearing the signal...',
  'Getting up to speed...',
  'Pulling into the station...',
  'Checking the switches...',
]
const phraseIndex = ref(0)
const phrase = computed(() => PHRASES[phraseIndex.value])
let phraseTimer: ReturnType<typeof setInterval> | undefined

const steps = ['Sign Up', 'Select Plan', 'Create Layout', 'Install', 'Drive Trains']

function signalColor(i: number) {
  if (i < props.activeStep) return '#22c55e'
  if (i === props.activeStep) return '#38bdf8'
  return '#7c3aed'
}
function labelColor(i: number) {
  if (i < props.activeStep) return '#4ade80'
  if (i === props.activeStep) return '#e0f2fe'
  return '#a78bfa'
}
function labelWeight(i: number) {
  return i === props.activeStep ? 'bold' : '600'
}

// Station X positions (evenly spaced)
const sx = [70, 195, 320, 445, 565]
// Station Y positions (winding wave — shifted down for top padding)
const sy = [105, 68, 98, 64, 94]

// Build a smooth cubic bezier winding path
const trackPath = computed(() => {
  let d = `M ${sx[0]} ${sy[0]}`
  for (let i = 1; i < sx.length; i++) {
    const mx = (sx[i - 1] + sx[i]) / 2
    d += ` C ${mx} ${sy[i - 1]}, ${mx} ${sy[i]}, ${sx[i]} ${sy[i]}`
  }
  return d
})

// Train position
const trainX = computed(() => sx[props.activeStep])
const trainY = computed(() => sy[props.activeStep])

// Measure path length on mount for dasharray trick
const pathLength = ref(800)
const trackRef = ref<SVGPathElement | null>(null)

const viewBox = computed(() =>
  props.compact ? '0 0 630 140' : '0 0 630 190',
)

function startPhraseTimer() {
  stopPhraseTimer()
  phraseTimer = setInterval(() => {
    phraseIndex.value = (phraseIndex.value + 1) % PHRASES.length
  }, 3000)
}
function stopPhraseTimer() {
  if (phraseTimer !== undefined) {
    clearInterval(phraseTimer)
    phraseTimer = undefined
  }
}

onMounted(() => {
  if (props.showStatus && !props.compact) {
    startPhraseTimer()
  }
  if (trackRef.value) {
    pathLength.value = trackRef.value.getTotalLength()
  }
})

onUnmounted(() => stopPhraseTimer())

watch(trackRef, (el) => {
  if (el) pathLength.value = el.getTotalLength()
})

watch(
  () => props.showStatus,
  (show) => {
    if (show && !props.compact) {
      startPhraseTimer()
    } else {
      stopPhraseTimer()
    }
  },
)

watch(
  () => props.compact,
  (isCompact) => {
    if (isCompact) {
      stopPhraseTimer()
    } else if (props.showStatus) {
      startPhraseTimer()
    }
  },
)
</script>

<template>
  <div class="tracker-card">
    <svg :viewBox="viewBox" class="w-full block" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Glows -->
        <filter id="gl" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="gl2" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="trainShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3" />
        </filter>
        <linearGradient id="trackGlow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#06b6d4" />
          <stop offset="100%" stop-color="#22d3ee" />
        </linearGradient>
        <!-- Wood tie gradient -->
        <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#92400e" />
          <stop offset="50%" stop-color="#78350f" />
          <stop offset="100%" stop-color="#451a03" />
        </linearGradient>
      </defs>

      <!-- ═══ TRACK BED (gravel/ballast) ═══ -->
      <path :d="trackPath" fill="none" stroke="#292524" stroke-width="30" stroke-linecap="round" />

      <!-- ═══ RAILROAD TIES ═══ -->
      <path :d="trackPath" fill="none" stroke="url(#wood)" stroke-width="24" stroke-linecap="butt" stroke-dasharray="5 11" opacity="0.6" />

      <!-- ═══ RAILS ═══ -->
      <!-- Dark rail bed -->
      <path :d="trackPath" fill="none" stroke="#1c1917" stroke-width="14" stroke-linecap="round" />
      <!-- Steel rails -->
      <path ref="trackRef" :d="trackPath" fill="none" stroke="#78716c" stroke-width="2.5" stroke-linecap="round" transform="translate(0 -5)" />
      <path :d="trackPath" fill="none" stroke="#78716c" stroke-width="2.5" stroke-linecap="round" transform="translate(0 5)" />
      <!-- Subtle rail highlight -->
      <path :d="trackPath" fill="none" stroke="#a8a29e" stroke-width="0.8" stroke-linecap="round" transform="translate(0 -5.5)" opacity="0.3" />

      <!-- ═══ SIGNAL LIGHTS ═══ -->
      <g v-for="(step, i) in steps" :key="'sig' + i">
        <!-- Signal post -->
        <line
          :x1="sx[i]" :y1="sy[i] - 10"
          :x2="sx[i]" :y2="sy[i] - 34"
          stroke="#78716c" stroke-width="3" stroke-linecap="round"
        />
        <!-- Signal housing (dark box) -->
        <rect
          :x="sx[i] - 9" :y="sy[i] - 50"
          width="18" height="18" rx="4"
          fill="#1c1917" stroke="#44403c" stroke-width="1"
        />

        <!-- Outer glow circle -->
        <circle
          :cx="sx[i]" :cy="sy[i] - 41"
          :r="i === activeStep ? 14 : 10"
          :fill="signalColor(i)"
          :opacity="i === activeStep ? 0.3 : 0.15"
          :filter="i === activeStep ? 'url(#gl2)' : undefined"
        >
          <animate
            v-if="i === activeStep"
            attributeName="r" values="14;20;14"
            dur="3s" repeatCount="indefinite"
          />
          <animate
            v-if="i === activeStep"
            attributeName="opacity" values="0.3;0.5;0.3"
            dur="3s" repeatCount="indefinite"
          />
        </circle>

        <!-- Signal orb -->
        <circle
          :cx="sx[i]" :cy="sy[i] - 41"
          r="6"
          :fill="signalColor(i)"
          filter="url(#gl)"
        />
        <!-- Specular highlight -->
        <circle
          :cx="sx[i] - 1.5" :cy="sy[i] - 43"
          r="2"
          fill="white"
          :opacity="i <= activeStep ? 0.6 : 0.15"
        />

        <!-- Sparkle rays on active -->
        <g v-if="i === activeStep" :transform="`translate(${sx[i]}, ${sy[i] - 41})`">
          <line x1="-12" y1="0" x2="-17" y2="0" :stroke="signalColor(i)" stroke-width="2" stroke-linecap="round">
            <animate attributeName="opacity" values="0.7;0;0.7" dur="3s" repeatCount="indefinite" />
          </line>
          <line x1="12" y1="0" x2="17" y2="0" :stroke="signalColor(i)" stroke-width="2" stroke-linecap="round">
            <animate attributeName="opacity" values="0.7;0;0.7" dur="3s" repeatCount="indefinite" />
          </line>
          <line x1="0" y1="-12" x2="0" y2="-17" :stroke="signalColor(i)" stroke-width="2" stroke-linecap="round">
            <animate attributeName="opacity" values="0;0.7;0" dur="3s" repeatCount="indefinite" />
          </line>
          <line x1="-8" y1="-8" x2="-12" y2="-12" :stroke="signalColor(i)" stroke-width="1.5" stroke-linecap="round">
            <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
          </line>
          <line x1="8" y1="-8" x2="12" y2="-12" :stroke="signalColor(i)" stroke-width="1.5" stroke-linecap="round">
            <animate attributeName="opacity" values="0;0.5;0" dur="3s" repeatCount="indefinite" />
          </line>
        </g>

        <!-- Station label -->
        <text
          :x="sx[i]" :y="sy[i] + 28"
          text-anchor="middle"
          :fill="labelColor(i)"
          :font-size="i === activeStep ? 11 : 9.5"
          :font-weight="labelWeight(i)"
          font-family="system-ui, -apple-system, sans-serif"
          letter-spacing="0.08em"
        >{{ step.toUpperCase() }}</text>
      </g>

      <!-- ═══ LOCOMOTIVE ═══ -->
      <g :transform="`translate(${trainX}, ${trainY})`" class="loco" filter="url(#trainShadow)">
        <!-- Smoke puffs -->
        <circle cx="-2" cy="-30" r="4" fill="#d6d3d1" opacity="0.35" class="smoke s1" />
        <circle cx="4" cy="-36" r="5" fill="#d6d3d1" opacity="0.2" class="smoke s2" />
        <circle cx="-4" cy="-42" r="4" fill="#d6d3d1" opacity="0.1" class="smoke s3" />

        <!-- Chimney/Smokestack -->
        <rect x="-5" y="-24" width="7" height="12" rx="1.5" fill="#1e40af" />
        <rect x="-7" y="-26" width="11" height="4" rx="2" fill="#1e3a8a" />

        <!-- Boiler (main body) -->
        <rect x="-18" y="-14" width="36" height="18" rx="6" fill="#1d4ed8" stroke="#2563eb" stroke-width="1.5" />
        <!-- Boiler band -->
        <rect x="-18" y="-6" width="36" height="2" rx="1" fill="#3b82f6" opacity="0.4" />

        <!-- Cab -->
        <rect x="-18" y="-18" width="14" height="22" rx="2" fill="#1e40af" stroke="#2563eb" stroke-width="1" />
        <!-- Cab window -->
        <rect x="-16" y="-15" width="10" height="8" rx="2" fill="#0c4a6e" />
        <rect x="-15" y="-14" width="8" height="6" rx="1.5" fill="#7dd3fc" opacity="0.2" />

        <!-- Headlight -->
        <circle cx="16" cy="-6" r="4" fill="#fbbf24" filter="url(#gl)" />
        <circle cx="16" cy="-6" r="2" fill="#fef9c3" />

        <!-- Cowcatcher/Pilot -->
        <polygon points="16,0 24,5 16,5" fill="#1e3a8a" stroke="#2563eb" stroke-width="0.5" />

        <!-- Wheels -->
        <circle cx="-10" cy="6" r="5.5" fill="#0f172a" stroke="#64748b" stroke-width="2" />
        <circle cx="-10" cy="6" r="2" fill="#334155" />
        <line x1="-10" y1="1" x2="-10" y2="11" stroke="#475569" stroke-width="1" class="wheel-spoke" />
        <line x1="-15" y1="6" x2="-5" y2="6" stroke="#475569" stroke-width="1" class="wheel-spoke" />

        <circle cx="6" cy="6" r="5.5" fill="#0f172a" stroke="#64748b" stroke-width="2" />
        <circle cx="6" cy="6" r="2" fill="#334155" />
        <line x1="6" y1="1" x2="6" y2="11" stroke="#475569" stroke-width="1" class="wheel-spoke" />
        <line x1="1" y1="6" x2="11" y2="6" stroke="#475569" stroke-width="1" class="wheel-spoke" />

        <!-- Connecting rod between wheels -->
        <line x1="-10" y1="8" x2="6" y2="8" stroke="#64748b" stroke-width="1.5" />
      </g>
    </svg>

    <!-- Cycling status text -->
    <Transition v-if="showStatus && !compact" name="phrase" mode="out-in">
      <p :key="phraseIndex" class="status-text mt-3">{{ phrase }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.tracker-card {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 28px 24px 20px;
  border: 1px solid rgba(56, 189, 248, 0.12);
}
.status-text {
  text-align: center;
  font-size: 0.85rem;
  font-weight: 500;
  color: #7dd3fc;
}

/* Phrase transition */
.phrase-enter-active { transition: all 0.3s ease; }
.phrase-leave-active { transition: all 0.2s ease; }
.phrase-enter-from { opacity: 0; transform: translateY(6px); }
.phrase-leave-to { opacity: 0; transform: translateY(-6px); }

/* Locomotive slides between stations */
.loco {
  transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Track progress fill animation */
.progress-fill {
  transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Smoke puffs — slow and gentle */
.smoke { animation: puff 3.5s ease-out infinite; }
.s1 { animation-delay: 0s; }
.s2 { animation-delay: 1.2s; }
.s3 { animation-delay: 2.4s; }
@keyframes puff {
  0% { opacity: 0.3; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-25px) scale(3); }
}

/* Wheel spokes rotate (subtle) */
.wheel-spoke {
  transform-origin: center;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
