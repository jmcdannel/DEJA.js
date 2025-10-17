<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Turnout } from '@repo/modules/turnouts'

type CTCSwitchState = 'normal' | 'reverse'

type CTCSwitchEmits = {
  (event: 'update:state', state: boolean): void
  (event: 'state-change', state: boolean): void
}

const props = withDefaults(defineProps<{
  label?: string
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

function handleThrow() {
  if (disabledReason.value) return
  updateState(!internalState.value)
}
</script>

<template>
  <div class="ctc-panel">
    <section class="ctc-indicators" aria-label="Switch state indicators">
      <div class="ctc-lamp">
        <span class="ctc-lamp-light" :class="displayState === 'normal' ? 'ctc-lamp-active-green' : ''" />
        <span class="ctc-lamp-label">N</span>
      </div>
      <div class="ctc-lever">
        <svg viewBox="0 0 180 200" class="ctc-base" aria-hidden="true">
          <path d="M20 186 L90 20 L160 186 Z" class="ctc-base-fill" />
          <path d="M20 186 L90 20 L160 186 Z" class="ctc-base-stroke" />
          <g class="ctc-label-group">
            <rect x="45" y="72" width="90" height="62" rx="10" class="ctc-label-plate" />
            <text x="90" y="100" class="ctc-label-number">{{ labelNumber }}</text>
            <text x="90" y="128" class="ctc-label-text">{{ labelText }}</text>
          </g>
          <text x="40" y="170" class="ctc-legends">N</text>
          <text x="140" y="170" class="ctc-legends">R</text>
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
            <div class="ctc-handle-pointer">
              <div class="ctc-handle-pointer-core" />
            </div>
            <div class="ctc-handle-rod" />
            <div class="ctc-handle-counterweight" />
          </div>
          <div class="ctc-pivot" />
        </button>
      </div>
      <div class="ctc-lamp">
        <span class="ctc-lamp-light" :class="displayState === 'reverse' ? 'ctc-lamp-active-amber' : ''" />
        <span class="ctc-lamp-label">R</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ctc-panel {
  @apply w-full max-w-[11rem] border-[6px] text-[10px] uppercase tracking-[0.25em] text-neutral-100 shadow-lg;
  border-color: #1e3a2a;
  font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 1.25rem;
  padding: 1.75rem 1.25rem 1.5rem;
  background: linear-gradient(130deg, #48684b 0%, #2f4a34 45%, #203524 100%);
}

.ctc-indicators {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.85rem;
}

.ctc-lamp {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
  color: #f8fafc;
}

.ctc-lamp-label {
  font-size: 0.7rem;
  letter-spacing: 0.3em;
}

.ctc-lamp-light {
  width: 1.45rem;
  height: 1.45rem;
  border-radius: 9999px;
  border: 2px solid #0b0b0b;
  background: #6b7280;
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.35);
  transition: box-shadow 0.3s ease, background 0.3s ease;
}

.ctc-lamp-active-green {
  background: #5fe072;
  box-shadow: 0 0 8px rgba(111, 231, 132, 0.95);
}

.ctc-lamp-active-amber {
  background: #f8d067;
  box-shadow: 0 0 8px rgba(248, 208, 103, 0.9);
}

.ctc-lever {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0;
}

.ctc-base {
  width: 7rem;
  height: 9.5rem;
}

.ctc-base-fill {
  fill: #121214;
}

.ctc-base-stroke {
  fill: none;
  stroke: #050505;
  stroke-width: 4.5;
}

.ctc-label-group {
  paint-order: stroke fill;
}

.ctc-label-plate {
  fill: #12192a;
  stroke: #9ca3af;
  stroke-width: 1.8;
}

.ctc-label-number {
  fill: #f8fafc;
  font-size: 34px;
  text-anchor: middle;
  dominant-baseline: middle;
  font-weight: 700;
}

.ctc-label-text {
  fill: #e2e8f0;
  font-size: 13px;
  text-anchor: middle;
  dominant-baseline: middle;
  letter-spacing: 0.3em;
}

.ctc-legends {
  fill: #f8fafc;
  font-size: 15px;
  font-weight: 700;
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
  justify-content: flex-end;
  gap: 0.45rem;
  transform-origin: center bottom;
  transition: transform 0.45s cubic-bezier(0.33, 1, 0.68, 1);
}

.ctc-handle-pointer {
  width: 2.05rem;
  height: 3.8rem;
  display: grid;
  place-items: center;
  clip-path: polygon(50% 0%, 85% 18%, 92% 100%, 8% 100%, 15% 18%);
  background: linear-gradient(180deg, #f5f7fa 0%, #cfd8e3 45%, #b1bac7 100%);
  border: 2px solid #303030;
  box-shadow: inset 0 -6px 0 rgba(31, 41, 55, 0.55);
}

.ctc-handle-pointer-core {
  width: 55%;
  height: 70%;
  background: radial-gradient(circle at 50% 20%, #f8fafc 0%, #d5dce5 70%);
  clip-path: polygon(50% 0%, 83% 24%, 88% 100%, 12% 100%, 17% 24%);
  border-radius: 0 0 6px 6px;
}

.ctc-handle-rod {
  width: 0.55rem;
  height: 4.7rem;
  border-radius: 0.5rem;
  background: linear-gradient(180deg, #e5e7eb 0%, #a0aec0 100%);
  box-shadow: inset 0 0 4px rgba(30, 41, 59, 0.45);
}

.ctc-handle-counterweight {
  width: 2.2rem;
  height: 1.45rem;
  border-radius: 12px 12px 18px 18px;
  background: linear-gradient(180deg, #cbd5f5 0%, #94a3b8 85%, #64748b 100%);
  border: 2px solid #303030;
  box-shadow: 0 4px 0 rgba(55, 65, 81, 0.55);
}

.ctc-pivot {
  position: absolute;
  bottom: 0.6rem;
  width: 3.4rem;
  height: 1.45rem;
  border-radius: 0.9rem;
  background: linear-gradient(180deg, #111827 0%, #020617 90%);
  box-shadow: inset 0 -4px 0 rgba(15, 23, 42, 0.65);
}

@media (prefers-reduced-motion: reduce) {
  .ctc-handle {
    transition: none;
  }
  .ctc-lamp-light {
    transition: none;
  }
}
</style>
