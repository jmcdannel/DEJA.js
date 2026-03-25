<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  /** 0-based index of the current active step */
  activeStep: number
  /** Whether to show the cycling status text */
  showStatus?: boolean
  /** Compact mode for persistent banner (thinner bar, no status text) */
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showStatus: true,
  compact: false,
})

const STEPS = [
  { number: 1, label: 'Account' },
  { number: 2, label: 'Plan' },
  { number: 3, label: 'Layout' },
  { number: 4, label: 'Install' },
  { number: 5, label: 'Drive!' },
]

const STATUS_PHRASES = [
  'Downloading server...',
  'Configuring your railroad...',
  'Detecting CommandStation...',
  'Setting up cloud sync...',
  'Preparing your throttle...',
  'Full steam ahead...',
  'All aboard the setup express...',
  'Coupling the cars together...',
  'Checking the switches...',
  'Getting up to speed...',
  'Clearing the signal...',
  'Pulling into the station...',
]

const currentPhraseIndex = ref(0)
const currentPhrase = computed(() => STATUS_PHRASES[currentPhraseIndex.value])
let phraseInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (props.showStatus) {
    phraseInterval = setInterval(() => {
      currentPhraseIndex.value = (currentPhraseIndex.value + 1) % STATUS_PHRASES.length
    }, 3000)
  }
})

onUnmounted(() => {
  if (phraseInterval) clearInterval(phraseInterval)
})

function stepClass(index: number) {
  if (index < props.activeStep) return 'pizza-bar__segment--complete'
  if (index === props.activeStep) return 'pizza-bar__segment--active'
  return 'pizza-bar__segment--pending'
}
</script>

<template>
  <div class="pizza-tracker" :class="{ 'pizza-tracker--compact': compact }">
    <div class="pizza-bar">
      <div
        v-for="(step, i) in STEPS"
        :key="step.number"
        class="pizza-bar__segment"
        :class="stepClass(i)"
      >
        <span class="pizza-bar__number">{{ step.number }}</span>
        <span class="pizza-bar__label">{{ step.label }}</span>
        <div v-if="i === activeStep" class="pizza-bar__shimmer" />
      </div>
    </div>

    <div v-if="showStatus && !compact" class="pizza-tracker__status">
      <div class="pizza-tracker__glow" />
      <Transition name="phrase-slide" mode="out-in">
        <p :key="currentPhraseIndex" class="pizza-tracker__phrase">
          {{ currentPhrase }}
        </p>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.pizza-tracker {
  padding: 16px 20px 12px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(56, 189, 248, 0.15);
}
.pizza-tracker--compact {
  padding: 8px 12px;
  border-radius: 0;
  border-left: none;
  border-right: none;
}
.pizza-bar {
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  height: 48px;
  border: 1px solid rgba(56, 189, 248, 0.2);
  background: rgba(2, 6, 23, 0.6);
}
.pizza-tracker--compact .pizza-bar {
  height: 36px;
  border-radius: 8px;
}
.pizza-bar__segment {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
  border-right: 1px solid rgba(148, 163, 184, 0.1);
}
.pizza-bar__segment:last-child {
  border-right: none;
}
.pizza-bar__number {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  font-family: monospace;
  flex-shrink: 0;
}
.pizza-tracker--compact .pizza-bar__number {
  width: 18px;
  height: 18px;
  font-size: 0.6rem;
}
.pizza-bar__label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
}
.pizza-tracker--compact .pizza-bar__label {
  font-size: 0.6rem;
}
@media (max-width: 480px) {
  .pizza-bar__label { display: none; }
  .pizza-bar { height: 40px; }
  .pizza-tracker--compact .pizza-bar { height: 32px; }
}

/* Complete segments */
.pizza-bar__segment--complete {
  background: linear-gradient(135deg, #0891b2, #06b6d4, #22d3ee);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
.pizza-bar__segment--complete .pizza-bar__number {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}
.pizza-bar__segment--complete .pizza-bar__label {
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Active segment — dramatic pulsing glow */
.pizza-bar__segment--active {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.35), rgba(34, 211, 238, 0.2));
  animation: segment-pulse 2s ease-in-out infinite;
  box-shadow:
    inset 0 0 20px rgba(56, 189, 248, 0.15),
    0 0 15px rgba(56, 189, 248, 0.2);
}
.pizza-bar__segment--active .pizza-bar__number {
  background: rgba(56, 189, 248, 0.4);
  color: #fff;
  box-shadow:
    0 0 12px rgba(56, 189, 248, 0.5),
    0 0 24px rgba(56, 189, 248, 0.2);
  animation: number-glow 2s ease-in-out infinite;
}
.pizza-bar__segment--active .pizza-bar__label {
  color: #bae6fd;
  text-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
}

/* Shimmer sweep */
.pizza-bar__shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.15), rgba(255, 255, 255, 0.08), transparent);
  animation: shimmer-sweep 3s ease-in-out infinite;
}

/* Pending segments */
.pizza-bar__segment--pending {
  background: rgba(2, 6, 23, 0.4);
}
.pizza-bar__segment--pending .pizza-bar__number {
  background: rgba(148, 163, 184, 0.1);
  color: rgba(148, 163, 184, 0.3);
}
.pizza-bar__segment--pending .pizza-bar__label {
  color: rgba(148, 163, 184, 0.3);
}

/* Status text */
.pizza-tracker__status {
  position: relative;
  text-align: center;
  margin-top: 12px;
  overflow: hidden;
  height: 24px;
}
.pizza-tracker__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 30px;
  background: radial-gradient(ellipse, rgba(56, 189, 248, 0.15), transparent 70%);
  animation: glow-breathe 3s ease-in-out infinite;
  pointer-events: none;
}
.pizza-tracker__phrase {
  font-size: 0.8rem;
  font-weight: 500;
  color: #7dd3fc;
  letter-spacing: 0.02em;
  position: relative;
  z-index: 1;
}

/* Transitions */
.phrase-slide-enter-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.phrase-slide-leave-active { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.phrase-slide-enter-from { opacity: 0; transform: translateY(8px); }
.phrase-slide-leave-to { opacity: 0; transform: translateY(-8px); }

@keyframes segment-pulse {
  0%, 100% {
    background: linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(34, 211, 238, 0.15));
    box-shadow:
      inset 0 0 20px rgba(56, 189, 248, 0.1),
      0 0 12px rgba(56, 189, 248, 0.15);
  }
  50% {
    background: linear-gradient(135deg, rgba(56, 189, 248, 0.5), rgba(34, 211, 238, 0.35));
    box-shadow:
      inset 0 0 30px rgba(56, 189, 248, 0.25),
      0 0 25px rgba(56, 189, 248, 0.3);
  }
}
@keyframes number-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(56, 189, 248, 0.3); }
  50% { box-shadow: 0 0 16px rgba(56, 189, 248, 0.6); }
}
@keyframes shimmer-sweep {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}
@keyframes glow-breathe {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
}
</style>
