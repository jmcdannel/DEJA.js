<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Turnout } from '@repo/modules/turnouts'

type CTCSwitchState = 'normal' | 'reverse'

type CTCSwitchEmits = {
  (event: 'update:state', state: boolean): void
  (event: 'state-change', state: boolean): void
  (event: 'update:locked', locked: boolean): void
  (event: 'update:occupied', occupied: boolean): void
}

const props = withDefaults(defineProps<{
  label?: string
  trackSegment?: string
  turnout?: Turnout
  turnoutId?: string
  state?: boolean
  locked?: boolean
  occupied?: boolean
}>(), {
  locked: false,
  occupied: false,
})

const emit = defineEmits<CTCSwitchEmits>()

const internalState = ref<boolean>(props.state ?? props.turnout?.state ?? false)
const locked = ref<boolean>(props.locked ?? false)
const occupied = ref<boolean>(props.occupied ?? false)

const label = computed(() => props.label ?? props.turnout?.name ?? 'Switch 12')
const labelNumber = computed(() => label.value.match(/\d+/)?.[0] ?? label.value)
const labelText = computed(() => {
  const stripped = label.value.replace(/\d+/g, '').trim()
  return stripped ? stripped.toUpperCase() : 'SWITCH'
})
const trackSegment = computed(() => props.trackSegment ?? props.turnout?.device ?? '12R–12L')

const displayState = computed<CTCSwitchState>(() => (internalState.value ? 'reverse' : 'normal'))

const disabledReason = computed(() => {
  if (locked.value) return 'Lever locked'
  if (occupied.value) return 'Track occupied'
  return null
})

const leverAngle = computed(() => (displayState.value === 'normal' ? -28 : 28))

watch(
  () => props.state,
  (next) => {
    if (typeof next === 'boolean') {
      internalState.value = next
    }
  }
)

watch(
  () => props.turnout?.state,
  (next) => {
    if (typeof next === 'boolean' && props.state === undefined) {
      internalState.value = next
    }
  }
)

watch(
  () => props.locked,
  (next) => {
    if (typeof next === 'boolean') {
      locked.value = next
    }
  }
)

watch(
  () => props.occupied,
  (next) => {
    if (typeof next === 'boolean') {
      occupied.value = next
    }
  }
)

function updateState(next: boolean) {
  internalState.value = next
  emit('update:state', next)
  emit('state-change', next)
}

function toggleLocked() {
  const next = !locked.value
  locked.value = next
  emit('update:locked', next)
}

function toggleOccupied() {
  const next = !occupied.value
  occupied.value = next
  emit('update:occupied', next)
}

function handleThrow() {
  if (disabledReason.value) return
  updateState(!internalState.value)
}
</script>

<template>
  <div class="ctc-panel">
    <section class="ctc-track-diagram" aria-hidden="true">
      <svg viewBox="0 0 220 60" class="h-full w-full">
        <g stroke="#111" stroke-width="6" stroke-linecap="round" fill="none">
          <line x1="10" y1="12" x2="70" y2="12" />
          <line x1="150" y1="12" x2="210" y2="12" />
          <line x1="70" y1="12" x2="110" y2="46" />
          <line x1="150" y1="12" x2="110" y2="46" />
          <line x1="10" y1="46" x2="70" y2="46" stroke-dasharray="16 8" />
          <line x1="150" y1="46" x2="210" y2="46" />
        </g>
        <g fill="#111" font-size="12" font-family="'IBM Plex Sans', 'Segoe UI', sans-serif" font-weight="600">
          <text x="18" y="50">{{ trackSegment }}</text>
        </g>
      </svg>
    </section>

    <section class="ctc-indicators" aria-label="Switch state indicators">
      <div class="ctc-lamp">
        <span class="ctc-lamp-light" :class="displayState === 'normal' ? 'ctc-lamp-active-green' : ''" />
        <span class="ctc-lamp-label">N</span>
      </div>
      <div class="ctc-lever">
        <svg viewBox="0 0 180 200" class="ctc-base" aria-hidden="true">
          <path d="M20 186 L90 20 L160 186 Z" class="ctc-base-fill" />
          <path d="M20 186 L90 20 L160 186 Z" class="ctc-base-stroke" />
          <text x="90" y="88" class="ctc-label-number">{{ labelNumber }}</text>
          <text x="90" y="120" class="ctc-label-text">{{ labelText }}</text>
          <text x="40" y="168" class="ctc-legends">N</text>
          <text x="140" y="168" class="ctc-legends">R</text>
        </svg>
        <button
          type="button"
          class="ctc-lever-handle"
          :class="{ 'ctc-lever-disabled': Boolean(disabledReason) }"
          :aria-pressed="displayState === 'reverse'"
          :aria-label="`Throw switch to ${displayState === 'normal' ? 'reverse' : 'normal'}`"
          :title="disabledReason ?? 'Throw switch'"
          :disabled="Boolean(disabledReason)"
          @click="handleThrow"
        >
          <div class="ctc-handle" :style="{ transform: `rotate(${leverAngle}deg)` }">
            <div class="ctc-handle-rod" />
            <div class="ctc-handle-knob">
              <div class="ctc-handle-knob-inner" />
            </div>
          </div>
          <div class="ctc-pivot" />
        </button>
      </div>
      <div class="ctc-lamp">
        <span class="ctc-lamp-light" :class="displayState === 'reverse' ? 'ctc-lamp-active-amber' : ''" />
        <span class="ctc-lamp-label">R</span>
      </div>
    </section>

    <section class="ctc-controls">
      <button
        type="button"
        class="ctc-control"
        :class="{ 'ctc-control-active-red': locked }"
        :aria-pressed="locked"
        @click="toggleLocked"
      >
        <span class="ctc-control-label">LOCK</span>
        <span class="ctc-control-indicator" :class="locked ? 'ctc-lamp-active-red' : ''" />
      </button>
      <button
        type="button"
        class="ctc-control"
        :class="{ 'ctc-control-active-amber': occupied }"
        :aria-pressed="occupied"
        @click="toggleOccupied"
      >
        <span class="ctc-control-label">TRACK</span>
        <span class="ctc-control-indicator" :class="occupied ? 'ctc-lamp-active-amber' : ''" />
      </button>
    </section>

    <footer class="ctc-status">
      <div class="ctc-status-heading">STATUS</div>
      <div class="ctc-status-state">{{ displayState.toUpperCase() }}</div>
      <div class="ctc-status-note">{{ disabledReason ? disabledReason : 'LEVER FREE' }}</div>
    </footer>
  </div>
</template>

<style scoped>
.ctc-panel {
  @apply w-full max-w-xs border-[6px] border-blue-700 bg-white text-[10px] uppercase tracking-[0.25em] text-neutral-900 shadow-lg;
  font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem 1rem 1.75rem;
}

.ctc-track-diagram {
  height: 60px;
  border: 2px solid #111827;
  border-radius: 6px;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 0.25rem 0.5rem;
}

.ctc-indicators {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.75rem;
}

.ctc-lamp {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
}

.ctc-lamp-light {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  border: 2px solid #111;
  background: #d4d4d8;
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.3);
  transition: box-shadow 0.3s ease, background 0.3s ease;
}

.ctc-lamp-active-green {
  background: #16a34a;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.85);
}

.ctc-lamp-active-amber {
  background: #facc15;
  box-shadow: 0 0 8px rgba(250, 204, 21, 0.85);
}

.ctc-lamp-active-red {
  background: #ef4444;
  box-shadow: 0 0 8px rgba(248, 113, 113, 0.9);
}

.ctc-lever {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0;
}

.ctc-base {
  width: 7.25rem;
  height: 9.75rem;
}

.ctc-base-fill {
  fill: #0f172a;
}

.ctc-base-stroke {
  fill: none;
  stroke: #1f2937;
  stroke-width: 6;
}

.ctc-label-number {
  fill: #f1f5f9;
  font-size: 36px;
  text-anchor: middle;
  dominant-baseline: middle;
  font-weight: 700;
}

.ctc-label-text {
  fill: #e2e8f0;
  font-size: 16px;
  text-anchor: middle;
  dominant-baseline: middle;
  letter-spacing: 0.35em;
}

.ctc-legends {
  fill: #e5e7eb;
  font-size: 16px;
  font-weight: 600;
  text-anchor: middle;
}

.ctc-lever-handle {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  width: 5.5rem;
  height: 7.75rem;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.ctc-lever-handle:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 4px;
}

.ctc-lever-disabled {
  cursor: not-allowed;
}

.ctc-handle {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  transform-origin: center bottom;
  transition: transform 0.45s cubic-bezier(0.33, 1, 0.68, 1);
}

.ctc-handle-rod {
  width: 0.55rem;
  height: 6rem;
  border-radius: 9999px;
  background: linear-gradient(180deg, #f8fafc 0%, #94a3b8 100%);
  box-shadow: inset 0 0 4px rgba(30, 41, 59, 0.5);
}

.ctc-handle-knob {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 9999px;
  background: linear-gradient(180deg, #f8fafc 0%, #cbd5f5 100%);
  border: 2px solid #0f172a;
  display: grid;
  place-items: center;
  box-shadow: 0 6px 0 rgba(15, 23, 42, 0.6);
}

.ctc-handle-knob-inner {
  width: 70%;
  height: 70%;
  border-radius: 9999px;
  background: radial-gradient(circle at 30% 30%, #f8fafc 0%, #94a3b8 85%);
}

.ctc-pivot {
  position: absolute;
  bottom: 0.65rem;
  width: 3.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  background: #1f2937;
  box-shadow: inset 0 -4px 0 rgba(15, 23, 42, 0.7);
}

.ctc-controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.ctc-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  padding: 0.75rem 0.5rem;
  border: 2px solid #0f172a;
  background: #f8fafc;
  transition: background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}

.ctc-control-label {
  font-weight: 700;
  letter-spacing: 0.35em;
}

.ctc-control-indicator {
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  border: 2px solid #111;
  background: #d4d4d8;
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.3);
  transition: box-shadow 0.3s ease, background 0.3s ease;
}

.ctc-control-active-red {
  background: #fee2e2;
  color: #7f1d1d;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}

.ctc-control-active-amber {
  background: #fef3c7;
  color: #78350f;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.45);
}

.ctc-status {
  border: 2px solid #0f172a;
  text-align: center;
  padding: 0.75rem 0.5rem;
  display: grid;
  gap: 0.35rem;
  letter-spacing: 0.3em;
}

.ctc-status-heading {
  font-weight: 700;
}

.ctc-status-state {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.45em;
}

.ctc-status-note {
  font-size: 0.6rem;
}

@media (prefers-reduced-motion: reduce) {
  .ctc-handle {
    transition: none;
  }
  .ctc-lamp-light,
  .ctc-control-indicator {
    transition: none;
  }
  .ctc-control {
    transition: none;
  }
}
</style>
