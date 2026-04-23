<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Throttle } from '@repo/modules/locos'
import ThrottleTile from '@/throttle/ThrottleTile.vue'
import { useLocos } from '@repo/modules/locos'
import { LocoNumberPlate } from '@repo/ui'
import { ROADNAMES } from '@repo/modules'
import { useStorage } from '@vueuse/core'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import draggable from 'vuedraggable'

const { getLocos, getThrottles, acquireThrottle } = useLocos()
const locos = getLocos()
const throttles = getThrottles()

const isRosterOpen = ref(false)
const isAddressMode = ref(false)
const quickAddress = ref('')

const throttleOrder = useStorage<number[]>('@DEJA/throttles/order', [])

const orderedThrottles = computed<Throttle[]>({
  get: () => {
    const list = (throttles.value || []) as unknown as Throttle[]
    const order = throttleOrder.value
    const byOrder = [...list].sort((a, b) => {
      const indexA = order.indexOf(a.address)
      const indexB = order.indexOf(b.address)
      if (indexA === -1 && indexB === -1) return a.address - b.address
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })
    return byOrder
  },
  set: (newOrder) => {
    throttleOrder.value = newOrder.map((item) => item.address)
  }
})

watch(
  throttles,
  (newThrottles) => {
    const items = (newThrottles || []) as unknown as Throttle[]
    const addresses = items.map((item) => item.address)
    const filteredOrder = throttleOrder.value.filter((address) => addresses.includes(address))
    const missingAddresses = addresses.filter((address) => !filteredOrder.includes(address))
    const updatedOrder = [...filteredOrder, ...missingAddresses]
    if (
      updatedOrder.length !== throttleOrder.value.length ||
      updatedOrder.some((address, index) => address !== throttleOrder.value[index])
    ) {
      throttleOrder.value = updatedOrder
    }
  },
  { immediate: true }
)

async function handleAddByAddress() {
  const addr = parseInt(quickAddress.value.trim())
  if (!addr || isNaN(addr) || addr < 1) return
  await acquireThrottle(addr)
  quickAddress.value = ''
  isAddressMode.value = false
}
</script>

<template>
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[100px] -top-[200px] -left-[300px]"></div>
    <div class="absolute w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[80px] -bottom-[100px] -right-[200px]"></div>
    <div class="absolute w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[90px] top-[30%] left-[40%]"></div>
  </div>
  <div v-if="throttles" class="throttle-list-container @container">
    <draggable
      v-model="orderedThrottles"
      item-key="address"
      handle=".drag-handle"
      class="throttle-list-grid"
      :animation="150"
    >
      <template #header>
        <!-- 🚂 Add Throttle card — first item in the list -->
        <div class="basis-full @[600px]:basis-1/2 p-1">
          <div class="add-card">
            <div class="add-card__accent" />
            <div class="add-card__body">
              <span class="add-card__title">Add Throttle</span>

              <!-- Default: two action buttons -->
              <div v-if="!isAddressMode" class="add-card__actions">
                <button class="add-card__btn" @click="isAddressMode = true">
                  <v-icon size="16" class="mr-1">mdi-pound</v-icon>
                  By Address
                </button>
                <button class="add-card__btn" @click="isRosterOpen = true">
                  <v-icon size="16" class="mr-1">mdi-train</v-icon>
                  From Roster
                </button>
              </div>

              <!-- Address entry mode -->
              <form v-else class="add-card__form" @submit.prevent="handleAddByAddress">
                <input
                  v-model="quickAddress"
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  placeholder="DCC #"
                  class="add-card__input"
                  autofocus
                />
                <v-btn size="small" color="green" variant="tonal" :disabled="!quickAddress.trim()" @click="handleAddByAddress">
                  <v-icon size="16">mdi-plus</v-icon>
                </v-btn>
                <v-btn size="small" variant="text" @click="isAddressMode = false; quickAddress = ''">
                  <v-icon size="16">mdi-close</v-icon>
                </v-btn>
              </form>
            </div>
          </div>
        </div>
      </template>
      <template #item="{ element }">
        <div class="basis-full @[600px]:basis-1/2 p-1">
          <ThrottleTile v-if="element.address" :address="element.address" />
        </div>
      </template>
    </draggable>
  </div>

  <!-- 🎸 Roster drawer -->
  <v-navigation-drawer v-model="isRosterOpen" temporary location="right" width="320">
    <div class="pa-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-amber-400">🚂 Roster</h3>
        <v-btn icon size="small" variant="text" @click="isRosterOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <v-row v-auto-animate class="flex justify-center">
        <v-col cols="auto" v-for="loco in locos" :key="loco.address">
          <div class="m-1 cursor-pointer" @click="async () => { await acquireThrottle(loco.address); isRosterOpen = false }">
            <LocoNumberPlate
              :address="loco.address"
              :color="loco.meta?.roadname ? ROADNAMES.find(r => r.value === loco.meta?.roadname)?.color : undefined"
              size="sm"
            />
          </div>
        </v-col>
      </v-row>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.throttle-list-container {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.throttle-list-grid {
  display: flex;
  flex-wrap: wrap-reverse;
  justify-content: flex-end;
  align-items: flex-end;
  width: 100%;
  margin-top: auto;
}

/* 🚂 Add Throttle card */
.add-card {
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(var(--v-theme-surface), 0.5);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(148, 163, 184, 0.25);
}

.add-card__accent {
  width: 4px;
  flex-shrink: 0;
  background: rgba(74, 222, 128, 0.5);
}

.add-card__body {
  flex: 1;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.add-card__title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(148, 163, 184, 0.6);
}

.add-card__actions {
  display: flex;
  gap: 6px;
}

.add-card__btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(var(--v-theme-surface), 0.4);
  color: rgba(226, 232, 240, 0.8);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease;
}

.add-card__btn:hover {
  background: rgba(var(--v-theme-surface), 0.7);
  border-color: rgba(148, 163, 184, 0.3);
}

.add-card__form {
  display: flex;
  align-items: center;
  gap: 6px;
}

.add-card__input {
  flex: 1;
  background: rgba(2, 6, 23, 0.8);
  border: 1.5px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  padding: 6px 10px;
  color: rgba(74, 222, 128, 0.8);
  font-family: 'DM Mono', 'Courier New', monospace;
  font-size: 14px;
  outline: none;
  min-width: 0;
}

.add-card__input:focus {
  border-color: rgba(74, 222, 128, 0.5);
  box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.1);
}

.add-card__input::placeholder {
  color: rgba(148, 163, 184, 0.3);
}

/* Hide number spinners */
.add-card__input::-webkit-outer-spin-button,
.add-card__input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
