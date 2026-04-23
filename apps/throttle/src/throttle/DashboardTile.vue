<script setup lang="ts">
import { computed, ref, toRef, unref, watch } from 'vue'
import { useRouter } from 'vue-router'
import CurrentSpeed from './CurrentSpeed.vue'
import { LocoNumberPlate } from '@repo/ui'
import { ROADNAMES } from '@repo/modules'
import { useThrottle } from './useThrottle'

const props = defineProps({
  address: {
    type: Number,
    required: true
  }
})

const $router = useRouter()
const addressRef = toRef(props, 'address')
const {
  currentSpeed,
  setSpeed,
  loco,
  releaseThrottle,
  stop: handleStop,
  throttle,
} = useThrottle(addressRef)

const localSpeed = ref(0)
const localDirection = ref<'FWD' | 'REV'>('FWD')

// Sync from external speed changes
watch(currentSpeed, (speed) => {
  localSpeed.value = Math.abs(speed)
  if (speed < 0) localDirection.value = 'REV'
  else if (speed > 0) localDirection.value = 'FWD'
})

function setThrottleSpeed(speed: number) {
  if (speed < 0 || speed > 126) return
  localSpeed.value = speed
  const signedSpeed = localDirection.value === 'REV' ? -speed : speed
  setSpeed(signedSpeed)
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

const borderStyle = computed(() => {
  const color = locoColor.value
  if (!color) return 'border-color: rgba(148, 163, 184, 0.3)'
  const colorMap: Record<string, string> = {
    orange: 'rgb(251, 146, 60)', sky: 'rgb(56, 189, 248)',
    yellow: 'rgb(250, 204, 21)', red: 'rgb(248, 113, 113)',
    indigo: 'rgb(129, 140, 248)', blue: 'rgb(96, 165, 250)',
    green: 'rgb(74, 222, 128)', lime: 'rgb(163, 230, 53)',
    purple: 'rgb(192, 132, 252)', emerald: 'rgb(52, 211, 153)',
    cyan: 'rgb(34, 211, 238)', amber: 'rgb(251, 191, 36)',
    pink: 'rgb(244, 114, 182)', teal: 'rgb(45, 212, 191)',
    rose: 'rgb(251, 113, 133)', violet: 'rgb(167, 139, 250)',
  }
  return `border-color: ${colorMap[color] || 'rgba(148, 163, 184, 0.3)'}`
})

function openThrottle() {
  $router.push({ name: 'throttle', params: { address: props.address } })
}

function handleEject() {
  handleStop()
  releaseThrottle()
}
</script>

<template>
  <main v-if="throttle" class="dashboard-tile rounded-xl shadow-lg relative" :style="borderStyle">
    <!-- 🖥️ LCD-style top bar: direction + speed + name + nameplate -->
    <div class="lcd-bar">
      <div class="lcd-bar__left">
        <span class="lcd-bar__dir" :class="localDirection === 'FWD' ? 'text-green-400' : 'text-red-400'">
          {{ localDirection }}
        </span>
        <span class="lcd-bar__speed">{{ localSpeed }}</span>
      </div>
      <span class="lcd-bar__name">{{ loco?.name || throttle.address }}</span>
      <div class="lcd-bar__right">
        <v-btn icon size="x-small" variant="text" color="red-lighten-1" @click="handleEject" title="Eject loco">
          <v-icon size="14">mdi-eject</v-icon>
        </v-btn>
        <component
          v-if="loco"
          :is="loco.consist?.length ? 'v-badge' : 'div'"
          :color="loco.consist?.length ? 'primary' : undefined"
          :content="loco.consist?.length"
          class="cursor-pointer"
          @click="openThrottle"
        >
          <LocoNumberPlate :address="loco.address" :color="locoColor" size="sm" />
        </component>
      </div>
    </div>

    <!-- 🎚️ Throttle slider (0–126) -->
    <div class="slider-row">
      <input
        type="range"
        min="0"
        max="126"
        step="1"
        :value="localSpeed"
        @input="(e) => setThrottleSpeed(Number((e.target as HTMLInputElement).value))"
        class="tile-throttle-range"
      />
    </div>

    <!-- ⏹️ Stop + Reverser row -->
    <div class="controls-row">
      <v-btn size="x-small" color="red" variant="tonal" @click="handleStop" class="rounded-lg">
        <v-icon size="14">mdi-stop</v-icon>
      </v-btn>
      <div class="flex items-center gap-1">
        <span class="text-[10px] font-bold" :class="localDirection === 'REV' ? 'text-red-400' : 'opacity-40'">R</span>
        <v-switch
          :model-value="localDirection === 'FWD'"
          @update:model-value="toggleDirection"
          :disabled="currentSpeed !== 0"
          color="purple"
          hide-details
          density="compact"
          inset
          class="tile-lever-switch"
        />
        <span class="text-[10px] font-bold" :class="localDirection === 'FWD' ? 'text-green-400' : 'opacity-40'">F</span>
      </div>
    </div>
  </main>

  <main v-else>
    <div class="flex items-center justify-center h-full">
      <p class="opacity-50">Loading...</p>
    </div>
  </main>
</template>

<style scoped>
.dashboard-tile {
  border: 2px solid #3a506e;
  background: linear-gradient(180deg, #2e4268 0%, #263752 40%, #1e2d45 100%);
  border-radius: 16px;
  padding: 6px;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

/* 🖥️ LCD bar: top row */
.lcd-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding: 2px 4px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  margin-bottom: 2px;
}

.lcd-bar__left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  min-width: 0;
}

.lcd-bar__dir {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.5px;
  font-family: 'Courier New', monospace;
}

.lcd-bar__speed {
  font-size: 18px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  color: #e9d5ff;
  text-shadow: 0 0 6px rgba(168, 85, 247, 0.4);
  font-family: 'Courier New', monospace;
  line-height: 1;
}

.lcd-bar__name {
  flex: 1;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.lcd-bar__right {
  display: flex;
  align-items: center;
  gap: 2px;
}

/* 🎚️ Slider row */
.slider-row {
  padding: 2px 6px;
}

.tile-throttle-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 16px;
  background: linear-gradient(180deg, #111827 0%, #1a202c 100%);
  border-radius: 8px;
  border: 1px solid #374151;
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.4);
  outline: none;
  cursor: pointer;
}

.tile-throttle-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(180deg, #6b7280 0%, #4b5563 40%, #374151 100%);
  border: 2px solid #9ca3af;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  cursor: grab;
}

.tile-throttle-range::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(180deg, #6b7280 0%, #4b5563 40%, #374151 100%);
  border: 2px solid #9ca3af;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  cursor: grab;
}

/* ⏹️ Controls row */
.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px 2px;
}

/* 🔀 Mini lever switch */
.tile-lever-switch :deep(.v-switch__track) {
  height: 18px;
  border-radius: 9px;
  opacity: 1;
  background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
  border: 1px solid #475569;
}
.tile-lever-switch :deep(.v-switch__thumb) {
  width: 16px;
  height: 16px;
  background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
  border: 1px solid #cbd5e1;
}
</style>
