<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLocos, type Loco } from '@repo/modules/locos'
import type { Throttle } from '@/throttle/types'
import { getSignedSpeed } from '@/throttle/utils'
import MiniThrottleControl from './MiniThrottleControl.vue'
import { useQuickThrottleActions } from './useQuickThrottleActions'


const { getLocos, getThrottles, acquireThrottle } = useLocos()
const locos = getLocos()
const throttles = getThrottles()
const { stop, adjustSpeed, park } = useQuickThrottleActions()

const showRoster = ref(false)

interface ThrottleWithLoco {
  address: number
  name: string
  speed: number
  raw: Throttle
}

const throttleItems = computed(() => (throttles.value || []) as Throttle[])

const activeThrottles = computed<ThrottleWithLoco[]>(() => {
  const locoList = (locos.value || []) as Loco[]
  return throttleItems.value.map((t) => {
    const loco = locoList.find((l) => l.address === t.address)
    return {
      address: t.address,
      name: loco?.name || `Loco #${t.address}`,
      speed: getSignedSpeed({ speed: t.speed, direction: t.direction }),
      raw: t,
    }
  })
})

const activeAddresses = computed(() => new Set(throttleItems.value.map((t) => t.address)))

const availableLocos = computed(() =>
  ((locos.value || []) as Loco[]).filter((l) => !activeAddresses.value.has(l.address))
)

function findRaw(address: number): Throttle | undefined {
  return activeThrottles.value.find((t) => t.address === address)?.raw
}

function handleStop(address: number) {
  stop(address)
}

function handleSpeedUp(address: number, amount: number) {
  const raw = findRaw(address)
  if (raw) adjustSpeed(address, amount, raw)
}

function handleSpeedDown(address: number, amount: number) {
  const raw = findRaw(address)
  if (raw) adjustSpeed(address, -amount, raw)
}

function handlePark(address: number) {
  park(address)
}

async function handleAcquire(address: number) {
  await acquireThrottle(address)
  showRoster.value = false
}
</script>

<template>
  <div class="quick-throttles">
    <!-- Active throttles -->
    <template v-if="!showRoster">
      <template v-if="activeThrottles.length > 0">
        <MiniThrottleControl
          v-for="t in activeThrottles"
          :key="t.address"
          :name="t.name"
          :address="t.address"
          :speed="t.speed"
          @stop="handleStop"
          @speed-up="handleSpeedUp"
          @speed-down="handleSpeedDown"
          @park="handlePark"
        />
      </template>
      <div v-else class="quick-throttles__empty">
        <v-icon size="24" class="opacity-20 mb-1">mdi-speedometer</v-icon>
        <span class="quick-throttles__empty-title">No locos running</span>
        <span class="quick-throttles__empty-hint">Tap + to add a loco</span>
      </div>
      <button class="quick-throttles__add" @click="showRoster = true">
        <v-icon size="14">mdi-plus</v-icon>
        <span>Add Loco</span>
      </button>
    </template>

    <!-- Roster picker -->
    <template v-else>
      <button class="quick-throttles__back" @click="showRoster = false">
        <v-icon size="16">mdi-arrow-left</v-icon>
        <span>Select Loco</span>
      </button>
      <div v-if="availableLocos.length > 0" class="quick-throttles__roster">
        <button
          v-for="loco in availableLocos"
          :key="loco.address"
          class="quick-throttles__loco"
          @click="handleAcquire(loco.address)"
        >
          <span class="quick-throttles__plate">#{{ loco.address }}</span>
          <span class="quick-throttles__loco-name">{{ loco.name || `Loco ${loco.address}` }}</span>
        </button>
      </div>
      <div v-else class="quick-throttles__empty">
        <v-icon size="20" class="opacity-20 mb-1">mdi-train</v-icon>
        <span class="quick-throttles__empty-title">All locos are active</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.quick-throttles {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  max-height: 220px;
  overflow-y: auto;
}

/* Empty state */
.quick-throttles__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 12px;
  gap: 2px;
  text-align: center;
}
.quick-throttles__empty-title {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.4);
}
.quick-throttles__empty-hint {
  font-size: 0.6rem;
  color: rgba(var(--v-theme-on-surface), 0.25);
  line-height: 1.4;
}

/* Add button */
.quick-throttles__add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 5px 8px;
  border-radius: 6px;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
  background: none;
  cursor: pointer;
  font-size: 0.65rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.4);
  transition: background 150ms ease, color 150ms ease, border-color 150ms ease;
}
.quick-throttles__add:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
  color: rgba(var(--v-theme-on-surface), 0.6);
  border-color: rgba(var(--v-theme-on-surface), 0.2);
}

/* Roster picker */
.quick-throttles__back {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 6px 4px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.8);
  transition: background 150ms ease;
  border-radius: 4px;
}
.quick-throttles__back:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
}

.quick-throttles__roster {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.quick-throttles__loco {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 8px;
  border: none;
  border-radius: 6px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  cursor: pointer;
  transition: background 150ms ease;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.quick-throttles__loco:hover {
  background: rgba(var(--v-theme-on-surface), 0.08);
}
.quick-throttles__loco:active {
  background: rgba(var(--v-theme-on-surface), 0.12);
}

.quick-throttles__plate {
  font-size: 0.6rem;
  font-weight: 700;
  font-family: monospace;
  letter-spacing: 0.04em;
  padding: 1px 5px;
  border-radius: 3px;
  background: #111;
  color: #e8e8e8;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5), 0 0 4px rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
  line-height: 1.4;
}

.quick-throttles__loco-name {
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
