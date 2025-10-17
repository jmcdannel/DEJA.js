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
        <svg viewBox="0 0 200 210" class="ctc-base" aria-hidden="true">
          <path
            d="M46 46 C92 8 108 8 154 46 L182 178 C184 188 178 196 168 196 H32 C22 196 16 188 18 178 Z"
            class="ctc-base-fill"
          />
          <path
            d="M46 46 C92 8 108 8 154 46 L182 178 C184 188 178 196 168 196 H32 C22 196 16 188 18 178 Z"
            class="ctc-base-stroke"
          />
          <text x="60" y="168" class="ctc-legends">N</text>
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
            <div class="ctc-handle-assembly">
              <span class="ctc-handle-pin" />
              <div class="ctc-handle-pointer">
                <span class="ctc-handle-notch" />
              </div>
              <div class="ctc-handle-rod" />
              <div class="ctc-handle-counterweight" />
            </div>
          </div>
          <div class="ctc-pivot">
            <span class="ctc-pivot-screw" />
          </div>
        </button>
      </div>
      <div class="ctc-lamp">
        <span class="ctc-lamp-light" :class="displayState === 'reverse' ? 'ctc-lamp-active-amber' : ''" />
        <span class="ctc-lamp-label">R</span>
      </div>
    </section>
    <p class="ctc-label-caption">{{ label }}</p>
  </div>
</template>

<style scoped>
.ctc-panel {
  @apply w-full border-[5px] text-[9px] uppercase tracking-[0.25em] text-neutral-100 shadow-lg;
  border-color: #1e3a2a;
  font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 0.9rem;
  padding: 1.1rem 1rem 1rem;
  background: linear-gradient(130deg, #48684b 0%, #2f4a34 45%, #203524 100%);
}

.ctc-indicators {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.65rem;
}

.ctc-lamp {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
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
  padding: 0.15rem 0;
}

.ctc-base {
  width: 6.35rem;
  height: 8.8rem;
}

.ctc-base-fill {
  fill: #0f0f11;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6));
}

.ctc-base-stroke {
  fill: none;
  stroke: #d9d9d9;
  stroke-width: 3.6;
}

.ctc-legends {
  fill: #f8fafc;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-anchor: middle;
}

.ctc-lever-handle {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 5.2rem;
  height: 7.1rem;
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
  transform-origin: center 88%;
  transition: transform 0.4s cubic-bezier(0.33, 1, 0.68, 1);
}

.ctc-handle-assembly {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.ctc-handle-pin {
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #f9fbff 0%, #cfd8e3 55%, #9ca3af 100%);
  border: 2px solid #2d2d2f;
  box-shadow: inset 0 2px 1px rgba(255, 255, 255, 0.45);
}

.ctc-handle-pointer {
  width: 2.2rem;
  height: 3.45rem;
  position: relative;
  background: linear-gradient(175deg, #f2f4f7 0%, #cbd5e1 55%, #9ca8ba 100%);
  clip-path: polygon(50% 0%, 82% 16%, 88% 44%, 92% 100%, 8% 100%, 12% 44%, 18% 16%);
  border: 2px solid #2d2d2f;
  box-shadow: inset 0 -8px 0 rgba(31, 41, 55, 0.55);
}

.ctc-handle-notch {
  position: absolute;
  bottom: 0.35rem;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 0.6rem;
  background: linear-gradient(180deg, #f8fafc 0%, #d1d9e6 95%);
  border-radius: 0 0 10px 10px;
  box-shadow: inset 0 -2px 0 rgba(55, 65, 81, 0.45);
}

.ctc-handle-rod {
  width: 0.5rem;
  height: 3.65rem;
  border-radius: 0.4rem;
  background: linear-gradient(180deg, #e5e7eb 0%, #a0aec0 100%);
  box-shadow: inset 0 0 4px rgba(30, 41, 59, 0.35);
}

.ctc-handle-counterweight {
  width: 2rem;
  height: 1.3rem;
  border-radius: 16px 16px 22px 22px;
  background: linear-gradient(180deg, #d7deef 0%, #9ba6bc 85%, #6b7280 100%);
  border: 2px solid #2d2d2f;
  box-shadow: 0 3px 0 rgba(31, 41, 55, 0.55);
}

.ctc-label-caption {
  font-size: 0.55rem;
  letter-spacing: 0.32em;
  text-align: center;
  color: rgba(241, 245, 249, 0.86);
  padding-top: 0.2rem;
}

.ctc-pivot {
  position: absolute;
  bottom: 0.55rem;
  width: 3.05rem;
  height: 1.3rem;
  border-radius: 0.85rem;
  background: linear-gradient(180deg, #090b12 0%, #020308 95%);
  box-shadow: inset 0 -3px 0 rgba(15, 23, 42, 0.6);
  display: grid;
  place-items: center;
}

.ctc-pivot-screw {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 9999px;
  background: radial-gradient(circle at 40% 35%, #f9fbff 0%, #d1d5db 65%, #6b7280 100%);
  border: 1.5px solid #20252d;
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
