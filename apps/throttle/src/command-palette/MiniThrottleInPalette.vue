<script setup lang="ts">
import { toRef, computed, onMounted, onUnmounted, type Ref } from 'vue'
import { useThrottle } from '@/throttle/useThrottle'
import type { Loco } from '@repo/modules/locos'

const props = defineProps<{ address: number }>()
const addressRef = toRef(props, 'address')

// useThrottle returns loco cast as Loco but it is actually a ComputedRef<Loco | undefined>
const { currentSpeed, direction, loco, adjustSpeed, setSpeed, stop } = useThrottle(addressRef)
const locoRef = loco as unknown as Ref<Loco | undefined>

const locoName = computed(() => {
  return locoRef.value?.name || `Loco ${props.address}`
})

const SPEED_STEP = 5

function handleSpeedUp() { adjustSpeed(SPEED_STEP) }
function handleSlowDown() { adjustSpeed(-SPEED_STEP) }
function handleStop() { stop() }
function handleReverse() { setSpeed(-Math.abs(currentSpeed.value)) }
function handleForward() { setSpeed(Math.abs(currentSpeed.value)) }

function onKeydown(e: KeyboardEvent) {
  const key = e.key.toLowerCase()
  if (!['w', 's', 'x', 'a', 'd'].includes(key)) return
  e.preventDefault()
  switch (key) {
    case 'w': handleSpeedUp(); break
    case 's': handleSlowDown(); break
    case 'x': handleStop(); break
    case 'a': handleReverse(); break
    case 'd': handleForward(); break
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="mini-throttle">
    <div class="mini-throttle__header">
      <div class="mini-throttle__loco">
        <span class="mini-throttle__plate">#{{ address }}</span>
        {{ locoName }}
      </div>
      <div class="mini-throttle__speed-readout">
        <span class="mini-throttle__arrow">{{ direction ? '→' : '←' }}</span>
        <span class="mini-throttle__num">{{ Math.abs(currentSpeed) }}</span>
      </div>
    </div>

    <div class="mini-throttle__grid">
      <!-- Row 1: empty, W (Speed Up), empty -->
      <div class="mini-throttle__cell"></div>
      <button class="mini-throttle__btn mini-throttle__btn--up" @click="handleSpeedUp">
        <kbd class="mini-throttle__key">W</kbd>
        <v-icon size="20">mdi-chevron-up</v-icon>
        <span class="mini-throttle__label">Speed Up</span>
      </button>
      <div class="mini-throttle__cell"></div>

      <!-- Row 2: A (Reverse), X (Stop), D (Forward) -->
      <button class="mini-throttle__btn mini-throttle__btn--dir" @click="handleReverse">
        <kbd class="mini-throttle__key">A</kbd>
        <v-icon size="20">mdi-arrow-left</v-icon>
        <span class="mini-throttle__label">Reverse</span>
      </button>
      <button class="mini-throttle__btn mini-throttle__btn--stop" @click="handleStop">
        <kbd class="mini-throttle__key">X</kbd>
        <v-icon size="20">mdi-stop</v-icon>
        <span class="mini-throttle__label">Stop</span>
      </button>
      <button class="mini-throttle__btn mini-throttle__btn--dir" @click="handleForward">
        <kbd class="mini-throttle__key">D</kbd>
        <v-icon size="20">mdi-arrow-right</v-icon>
        <span class="mini-throttle__label">Forward</span>
      </button>

      <!-- Row 3: empty, S (Slow Down), empty -->
      <div class="mini-throttle__cell"></div>
      <button class="mini-throttle__btn mini-throttle__btn--down" @click="handleSlowDown">
        <kbd class="mini-throttle__key">S</kbd>
        <v-icon size="20">mdi-chevron-down</v-icon>
        <span class="mini-throttle__label">Slow Down</span>
      </button>
      <div class="mini-throttle__cell"></div>
    </div>
  </div>
</template>

<style scoped>
/* 🎛️ Dark palette aesthetic — matches CommandPalette card style */
.mini-throttle {
  padding: 16px 18px 20px;
}

.mini-throttle__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.mini-throttle__loco {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.mini-throttle__plate {
  font-family: ui-monospace, monospace;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  background: #111;
  color: #e8e8e8;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5), 0 0 4px rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.mini-throttle__speed-readout {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: ui-monospace, monospace;
}

.mini-throttle__arrow {
  font-size: 18px;
  color: #60a5fa;
}

.mini-throttle__num {
  font-size: 22px;
  font-weight: 700;
  color: #e2e8f0;
  min-width: 40px;
  text-align: right;
}

/* 3×3 cross grid */
.mini-throttle__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, auto);
  gap: 6px;
}

.mini-throttle__cell {
  /* empty corner cells */
}

.mini-throttle__btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 8px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.06);
  color: rgba(226, 232, 240, 0.8);
  cursor: pointer;
  transition: background 100ms ease, border-color 100ms ease, box-shadow 100ms ease;
  font-size: 10px;
  font-family: ui-monospace, monospace;
  min-height: 72px;
}

.mini-throttle__btn:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(96, 165, 250, 0.4);
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.15);
  color: #dbeafe;
}

.mini-throttle__btn:active {
  background: rgba(59, 130, 246, 0.25);
  border-color: #60a5fa;
  box-shadow: 0 0 14px rgba(59, 130, 246, 0.3);
}

.mini-throttle__btn--stop {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.08);
  color: #fca5a5;
}

.mini-throttle__btn--stop:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.6);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
  color: #fecaca;
}

.mini-throttle__btn--up,
.mini-throttle__btn--down {
  border-color: rgba(34, 197, 94, 0.25);
  color: rgba(134, 239, 172, 0.85);
}

.mini-throttle__btn--up:hover,
.mini-throttle__btn--down:hover {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.45);
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.15);
  color: #86efac;
}

.mini-throttle__btn--dir {
  border-color: rgba(168, 85, 247, 0.25);
  color: rgba(216, 180, 254, 0.85);
}

.mini-throttle__btn--dir:hover {
  background: rgba(168, 85, 247, 0.12);
  border-color: rgba(168, 85, 247, 0.45);
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.15);
  color: #d8b4fe;
}

/* kbd chip — top-right corner of each button */
.mini-throttle__key {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 1px 4px;
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 3px;
  font-family: ui-monospace, monospace;
  font-size: 9px;
  color: rgba(148, 163, 184, 0.7);
  pointer-events: none;
}

.mini-throttle__label {
  font-size: 9px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: inherit;
  opacity: 0.8;
}
</style>
