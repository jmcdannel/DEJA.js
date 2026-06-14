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

const emit = defineEmits<{
  navigate: [address: number]
}>()

function handleRowClick(address: number) {
  emit('navigate', address)
}

type Mode = 'list' | 'roster' | 'address'
const mode = ref<Mode>('list')
const quickAddress = ref('')

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
  mode.value = 'list'
}

async function handleAcquireByAddress() {
  const addr = parseInt(quickAddress.value.trim())
  if (!addr || isNaN(addr) || addr < 1) return
  await acquireThrottle(addr)
  quickAddress.value = ''
  mode.value = 'list'
}
</script>

<template>
  <div class="quick-throttles">
    <!-- Active throttles + add actions -->
    <template v-if="mode === 'list'">
      <template v-if="activeThrottles.length > 0">
        <div
          v-for="t in activeThrottles"
          :key="t.address"
          class="quick-throttles__row"
          role="button"
          tabindex="0"
          @click="handleRowClick(t.address)"
          @keydown.enter="handleRowClick(t.address)"
          @keydown.space.prevent="handleRowClick(t.address)"
        >
          <MiniThrottleControl
            :name="t.name"
            :address="t.address"
            :speed="t.speed"
            @stop="handleStop"
            @speed-up="handleSpeedUp"
            @speed-down="handleSpeedDown"
            @park="handlePark"
          />
        </div>
      </template>
      <div v-else class="quick-throttles__empty">
        <v-icon size="32" color="green" class="opacity-60 mb-1">mdi-train</v-icon>
        <span class="quick-throttles__empty-title">No locos running</span>
        <span class="quick-throttles__empty-hint">Enter a DCC address or pick one from your roster</span>
      </div>

      <!-- Add actions — consistent with the throttle list page -->
      <div class="quick-throttles__actions">
        <button class="quick-throttles__action" @click="mode = 'address'">
          <v-icon size="16">mdi-pound</v-icon>
          <span>Enter Loco #</span>
        </button>
        <button class="quick-throttles__action" @click="mode = 'roster'">
          <v-icon size="16">mdi-train</v-icon>
          <span>Roster</span>
        </button>
      </div>
    </template>

    <!-- Enter loco number -->
    <template v-else-if="mode === 'address'">
      <button class="quick-throttles__back" @click="mode = 'list'; quickAddress = ''">
        <v-icon size="18">mdi-arrow-left</v-icon>
        <v-icon size="18">mdi-pound</v-icon>
        <span>Enter Loco #</span>
      </button>
      <form class="quick-throttles__address" @submit.prevent="handleAcquireByAddress">
        <input
          v-model="quickAddress"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          placeholder="DCC #"
          class="quick-throttles__input"
          autofocus
        />
        <v-btn
          size="default"
          color="green"
          variant="tonal"
          :disabled="!quickAddress.trim()"
          @click="handleAcquireByAddress"
        >
          <v-icon size="20">mdi-plus</v-icon>
        </v-btn>
      </form>
    </template>

    <!-- Roster picker -->
    <template v-else>
      <button class="quick-throttles__back" @click="mode = 'list'">
        <v-icon size="18">mdi-arrow-left</v-icon>
        <v-icon size="18">mdi-train</v-icon>
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
        <v-icon size="28" color="amber" class="opacity-60 mb-1">mdi-train</v-icon>
        <span class="quick-throttles__empty-title">All locos are active</span>
        <span class="quick-throttles__empty-hint">Enter a DCC address to add another</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.quick-throttles {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.quick-throttles__row {
  cursor: pointer;
  border-radius: 8px;
  transition: background 120ms ease;
  outline: none;
}
.quick-throttles__row:focus-visible {
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.6);
}
.quick-throttles__row:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

/* Empty state */
.quick-throttles__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  gap: 3px;
  text-align: center;
}
.quick-throttles__empty-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
.quick-throttles__empty-hint {
  font-size: 0.68rem;
  color: rgba(var(--v-theme-on-surface), 0.4);
  line-height: 1.4;
  max-width: 200px;
}

/* Add actions — two affordances, easy to tap */
.quick-throttles__actions {
  display: flex;
  gap: 6px;
}
.quick-throttles__action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 10px 8px;
  border-radius: 8px;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.14);
  background: none;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.55);
  transition:
    background 150ms ease,
    color 150ms ease,
    border-color 150ms ease;
}
.quick-throttles__action:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
  color: rgba(var(--v-theme-on-surface), 0.85);
  border-color: rgba(var(--v-theme-on-surface), 0.25);
}

/* Back button (address + roster modes) */
.quick-throttles__back {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 4px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.8);
  transition: background 150ms ease;
  border-radius: 6px;
}
.quick-throttles__back:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
}

/* Address entry */
.quick-throttles__address {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0 4px;
}
.quick-throttles__input {
  flex: 1;
  background: rgba(2, 6, 23, 0.8);
  border: 1.5px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  padding: 10px 12px;
  color: rgba(74, 222, 128, 0.85);
  font-family: 'DM Mono', 'Courier New', monospace;
  font-size: 16px;
  outline: none;
  min-width: 0;
}
.quick-throttles__input:focus {
  border-color: rgba(74, 222, 128, 0.5);
  box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.1);
}
.quick-throttles__input::placeholder {
  color: rgba(148, 163, 184, 0.3);
}
.quick-throttles__input::-webkit-outer-spin-button,
.quick-throttles__input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.quick-throttles__roster {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quick-throttles__loco {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 10px;
  border: none;
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  cursor: pointer;
  transition: background 150ms ease;
  color: rgba(var(--v-theme-on-surface), 0.8);
}
.quick-throttles__loco:hover {
  background: rgba(var(--v-theme-on-surface), 0.08);
}
.quick-throttles__loco:active {
  background: rgba(var(--v-theme-on-surface), 0.12);
}

.quick-throttles__plate {
  font-size: 0.7rem;
  font-weight: 700;
  font-family: monospace;
  letter-spacing: 0.04em;
  padding: 2px 6px;
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
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
