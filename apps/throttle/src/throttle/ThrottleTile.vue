<script setup lang="ts">
import { computed, ref, toRef, unref, watch } from 'vue'
import { useRouter } from 'vue-router'
import ThrottleButtonControls from './ThrottleButtonControls.vue'
import CurrentSpeed from './CurrentSpeed.vue'
import { LocoNumberPlate } from '@repo/ui'
import { ROADNAMES } from '@repo/modules'
import { useThrottle } from './useThrottle'
import { useThrottleSettings } from './useThrottleSettings'

const props = defineProps({
  address: {
    type: Number,
    required: true
  }
})

const $router = useRouter()
const addressRef = toRef(props, 'address')
const {
  adjustSpeed: handleAdjustSpeed,
  currentSpeed,
  setSpeed,
  loco,
  releaseThrottle,
  stop: handleStop,
  throttle,
} = useThrottle(addressRef)

const { variant } = useThrottleSettings()

// 🎚️ Slider/Dashboard local state
const localSpeed = ref(Math.abs(currentSpeed.value))
const localDirection = ref<'FWD' | 'REV'>(currentSpeed.value >= 0 ? 'FWD' : 'REV')

watch(currentSpeed, (speed) => {
  localSpeed.value = Math.abs(speed)
  if (speed < 0) localDirection.value = 'REV'
  else if (speed > 0) localDirection.value = 'FWD'
})

function setThrottleSpeed(speed: number) {
  if (speed < 0 || speed > 126) return
  localSpeed.value = speed
  const signed = localDirection.value === 'REV' ? -speed : speed
  setSpeed(signed)
}

function toggleDirection(val: boolean | null) {
  if (currentSpeed.value !== 0) return
  localDirection.value = val ? 'FWD' : 'REV'
}

const locoColor = computed(() => {
  const l = unref(loco)
  const roadname = l?.meta?.roadname
  if (!roadname) return undefined
  return ROADNAMES.find(r => r.value === roadname)?.color
})

const COLOR_MAP: Record<string, string> = {
  orange: 'rgb(251, 146, 60)', sky: 'rgb(56, 189, 248)',
  yellow: 'rgb(250, 204, 21)', red: 'rgb(248, 113, 113)',
  indigo: 'rgb(129, 140, 248)', blue: 'rgb(96, 165, 250)',
  green: 'rgb(74, 222, 128)', lime: 'rgb(163, 230, 53)',
  purple: 'rgb(192, 132, 252)', emerald: 'rgb(52, 211, 153)',
  cyan: 'rgb(34, 211, 238)', amber: 'rgb(251, 191, 36)',
  pink: 'rgb(244, 114, 182)', teal: 'rgb(45, 212, 191)',
  rose: 'rgb(251, 113, 133)', violet: 'rgb(167, 139, 250)',
}

const accentColor = computed(() =>
  COLOR_MAP[locoColor.value ?? ''] ?? 'rgba(168, 85, 247, 0.5)'
)

function openThrottle() {
  $router.push({ name: 'throttle', params: { address: props.address } })
}

function handleEject() {
  handleStop()
  releaseThrottle()
}
</script>

<template>
  <div v-if="throttle" @dblclick="openThrottle">

    <!-- ═══════════════════════════════════════════════════════
         🔘 BUTTONS variant
         ═══════════════════════════════════════════════════════ -->
    <div v-if="variant === 'buttons'" class="tile">
      <div class="tile__accent" :style="{ background: accentColor }" />
      <div class="tile__body">
        <div class="tile__info">
          <CurrentSpeed compact class="drag-handle cursor-grab active:cursor-grabbing select-none shrink-0" :speed="currentSpeed" />
          <span class="tile__name">{{ loco?.name || address }}</span>
          <div class="tile__actions">
            <v-btn icon size="x-small" variant="text" color="red-lighten-1" @click.stop="handleEject" title="Eject"><v-icon size="14">mdi-eject</v-icon></v-btn>
            <component v-if="loco" :is="loco.consist?.length ? 'v-badge' : 'div'" :color="loco.consist?.length ? 'primary' : undefined" :content="loco.consist?.length" class="cursor-pointer" @click.stop="openThrottle">
              <LocoNumberPlate :address="loco.address" :color="locoColor" size="sm" />
            </component>
          </div>
        </div>
        <ThrottleButtonControls horizontal compact @stop="handleStop" @update:currentSpeed="handleAdjustSpeed" />
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         🎚️ SLIDER variant
         ═══════════════════════════════════════════════════════ -->
    <div v-else-if="variant === 'slider'" class="tile">
      <div class="tile__accent" :style="{ background: accentColor }" />
      <div class="tile__body">
        <div class="tile__info">
          <CurrentSpeed compact class="drag-handle cursor-grab active:cursor-grabbing select-none shrink-0" :speed="currentSpeed" />
          <span class="tile__name">{{ loco?.name || address }}</span>
          <div class="tile__actions">
            <v-btn icon size="x-small" variant="text" color="red-lighten-1" @click.stop="handleEject" title="Eject"><v-icon size="14">mdi-eject</v-icon></v-btn>
            <component v-if="loco" :is="loco.consist?.length ? 'v-badge' : 'div'" :color="loco.consist?.length ? 'primary' : undefined" :content="loco.consist?.length" class="cursor-pointer" @click.stop="openThrottle">
              <LocoNumberPlate :address="loco.address" :color="locoColor" size="sm" />
            </component>
          </div>
        </div>
        <div class="tile-slider">
          <v-btn size="x-small" color="red" variant="tonal" class="shrink-0" @click.stop="handleStop"><v-icon size="14">mdi-stop</v-icon></v-btn>
          <input type="range" min="0" max="126" step="1" :value="localSpeed" @input="(e) => setThrottleSpeed(Number((e.target as HTMLInputElement).value))" class="tile-slider__range" />
          <div class="tile-slider__rev">
            <span class="text-[9px] font-bold" :class="localDirection === 'REV' ? 'text-red-400' : 'opacity-30'">R</span>
            <v-switch :model-value="localDirection === 'FWD'" @update:model-value="toggleDirection" :disabled="currentSpeed !== 0" color="purple" hide-details density="compact" inset class="tile-lever-switch" />
            <span class="text-[9px] font-bold" :class="localDirection === 'FWD' ? 'text-green-400' : 'opacity-30'">F</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         🎛️ DASHBOARD variant — mini proto-device
         ═══════════════════════════════════════════════════════ -->
    <div v-else class="proto-tile">
      <!-- Info bar -->
      <div class="proto-tile__info">
        <div class="proto-tile__lcd">
          <span class="proto-tile__dir" :class="localDirection === 'FWD' ? 'text-green-400' : 'text-red-400'">{{ localDirection }}</span>
          <span class="proto-tile__speed">{{ localSpeed }}</span>
        </div>
        <span class="proto-tile__name">{{ loco?.name || address }}</span>
        <div class="tile__actions">
          <v-btn icon size="x-small" variant="text" color="red-lighten-1" @click.stop="handleEject" title="Eject"><v-icon size="14">mdi-eject</v-icon></v-btn>
          <component v-if="loco" :is="loco.consist?.length ? 'v-badge' : 'div'" :color="loco.consist?.length ? 'primary' : undefined" :content="loco.consist?.length" class="cursor-pointer" @click.stop="openThrottle">
            <LocoNumberPlate :address="loco.address" :color="locoColor" size="sm" />
          </component>
        </div>
      </div>
      <!-- Slider -->
      <div class="proto-tile__slider-row">
        <v-btn size="x-small" color="red" variant="tonal" class="shrink-0 rounded-lg" @click.stop="handleStop"><v-icon size="14">mdi-stop</v-icon></v-btn>
        <input type="range" min="0" max="126" step="1" :value="localSpeed" @input="(e) => setThrottleSpeed(Number((e.target as HTMLInputElement).value))" class="proto-tile__range" />
      </div>
      <!-- Reverser -->
      <div class="proto-tile__rev-row">
        <span class="text-[9px] font-bold" :class="localDirection === 'REV' ? 'text-red-400' : 'opacity-30'">REV</span>
        <v-switch :model-value="localDirection === 'FWD'" @update:model-value="toggleDirection" :disabled="currentSpeed !== 0" color="purple" hide-details density="compact" inset class="tile-lever-switch" />
        <span class="text-[9px] font-bold" :class="localDirection === 'FWD' ? 'text-green-400' : 'opacity-30'">FWD</span>
      </div>
    </div>
  </div>

  <div v-else class="tile tile--loading">
    <p class="opacity-50 text-sm text-center py-4">Loading…</p>
  </div>
</template>

<style scoped>
/* ── Standard tile shell (buttons + slider) ──────────── */
.tile {
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(var(--v-theme-surface), 0.5);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04);
}
.tile__accent { width: 4px; flex-shrink: 0; }
.tile__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; padding: 6px 6px 4px; }
.tile__info { display: flex; align-items: center; gap: 6px; }
.tile__name { flex: 1; min-width: 0; font-size: 12px; font-weight: 600; color: rgba(226,232,240,0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; }
.tile__actions { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
.tile--loading { justify-content: center; align-items: center; min-height: 60px; }

/* ── Slider variant controls ─────────────────────────── */
.tile-slider { display: flex; align-items: center; gap: 4px; padding: 2px 0; }
.tile-slider__range {
  -webkit-appearance: none; appearance: none; flex: 1; height: 14px;
  background: linear-gradient(180deg, #111827, #1a202c); border-radius: 7px;
  border: 1px solid #374151; box-shadow: inset 0 1px 3px rgba(0,0,0,0.4); outline: none; cursor: pointer;
}
.tile-slider__range::-webkit-slider-thumb {
  -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%;
  background: linear-gradient(180deg, #6b7280, #4b5563 40%, #374151); border: 2px solid #9ca3af;
  box-shadow: 0 1px 4px rgba(0,0,0,0.4); cursor: grab;
}
.tile-slider__range::-moz-range-thumb {
  width: 20px; height: 20px; border-radius: 50%;
  background: linear-gradient(180deg, #6b7280, #4b5563 40%, #374151); border: 2px solid #9ca3af; cursor: grab;
}
.tile-slider__rev { display: flex; align-items: center; gap: 1px; flex-shrink: 0; }

/* ── Dashboard variant — mini proto-device ───────────── */
.proto-tile {
  border-radius: 16px;
  background: linear-gradient(180deg, #2e4268 0%, #263752 40%, #1e2d45 100%);
  border: 2px solid #3a506e;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.proto-tile__info { display: flex; align-items: center; gap: 6px; }
.proto-tile__lcd {
  display: flex; align-items: baseline; gap: 3px; flex-shrink: 0;
  padding: 2px 6px; border-radius: 4px;
  background: #0a1a0a; border: 1px solid #333;
  font-family: 'Courier New', monospace;
}
.proto-tile__dir { font-size: 8px; font-weight: 800; letter-spacing: 0.5px; }
.proto-tile__speed {
  font-size: 16px; font-weight: 900; font-variant-numeric: tabular-nums;
  color: #4ade80; text-shadow: 0 0 6px rgba(74,222,128,0.4); line-height: 1;
}
.proto-tile__name {
  flex: 1; min-width: 0; font-size: 11px; font-weight: 600;
  color: rgba(226,232,240,0.7); white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis; text-align: center;
}
.proto-tile__slider-row { display: flex; align-items: center; gap: 4px; }
.proto-tile__range {
  -webkit-appearance: none; appearance: none; flex: 1; height: 18px;
  background: linear-gradient(180deg, #111827, #1a202c); border-radius: 9px;
  border: 2px solid #374151; box-shadow: inset 0 2px 4px rgba(0,0,0,0.4); outline: none; cursor: pointer;
}
.proto-tile__range::-webkit-slider-thumb {
  -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%;
  background: linear-gradient(180deg, #6b7280, #4b5563 40%, #374151); border: 2px solid #9ca3af;
  box-shadow: 0 2px 6px rgba(0,0,0,0.4); cursor: grab;
}
.proto-tile__range::-moz-range-thumb {
  width: 24px; height: 24px; border-radius: 50%;
  background: linear-gradient(180deg, #6b7280, #4b5563 40%, #374151); border: 2px solid #9ca3af; cursor: grab;
}
.proto-tile__rev-row { display: flex; align-items: center; justify-content: center; gap: 4px; }

/* ── Shared lever switch (mini) ──────────────────────── */
.tile-lever-switch :deep(.v-switch__track) {
  height: 16px; border-radius: 8px; opacity: 1;
  background: linear-gradient(180deg, #1e293b, #334155); border: 1px solid #475569;
}
.tile-lever-switch :deep(.v-switch__thumb) {
  width: 14px; height: 14px;
  background: linear-gradient(180deg, #94a3b8, #64748b); border: 1px solid #cbd5e1;
}
</style>
