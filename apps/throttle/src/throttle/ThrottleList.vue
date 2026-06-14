<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Throttle } from '@repo/modules/locos'
import ThrottleTile from '@/throttle/ThrottleTile.vue'
import AddThrottleCard from '@/throttle/AddThrottleCard.vue'
import { useLocos } from '@repo/modules/locos'
import { EmptyState, LocoNumberPlate } from '@repo/ui'
import { ROADNAMES } from '@repo/modules'
import { useStorage } from '@vueuse/core'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import draggable from 'vuedraggable'

const { getLocos, getThrottles, acquireThrottle } = useLocos()
const locos = getLocos()
const throttles = getThrottles()

const isRosterOpen = ref(false)

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

const hasThrottles = computed(() => orderedThrottles.value.length > 0)

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
</script>

<template>
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[100px] -top-[200px] -left-[300px]"></div>
    <div class="absolute w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[80px] -bottom-[100px] -right-[200px]"></div>
    <div class="absolute w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[90px] top-[30%] left-[40%]"></div>
  </div>
  <div v-if="throttles" class="throttle-list-container @container">
    <!-- 🪧 Rich empty state — no active throttles -->
    <div v-if="!hasThrottles" class="throttle-list-empty">
      <EmptyState
        icon="mdi-train"
        color="green"
        title="No active throttles"
        description="Pick a locomotive to start driving — enter a DCC address or select one from your roster."
      />
      <AddThrottleCard variant="rich" @open-roster="isRosterOpen = true" />
    </div>

    <!-- 🚂 Active throttles -->
    <draggable
      v-else
      v-model="orderedThrottles"
      item-key="address"
      handle=".drag-handle"
      class="throttle-list-grid"
      :animation="150"
    >
      <template #header>
        <!-- 🚂 Add Throttle card — first item in the list -->
        <div class="basis-full @[600px]:basis-1/2 p-1.5">
          <AddThrottleCard variant="card" @open-roster="isRosterOpen = true" />
        </div>
      </template>
      <template #item="{ element }">
        <div class="basis-full @[600px]:basis-1/2 p-1.5">
          <ThrottleTile v-if="element.address" :address="element.address" />
        </div>
      </template>
    </draggable>
  </div>

  <!-- 🎸 Roster drawer -->
  <v-navigation-drawer v-model="isRosterOpen" temporary location="right" width="340">
    <div class="pa-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-amber-400 flex items-center gap-2">
          <v-icon size="22" color="amber">mdi-train</v-icon>
          Roster
        </h3>
        <v-btn icon size="small" variant="text" @click="isRosterOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-row v-if="locos && locos.length" v-auto-animate class="flex justify-center">
        <v-col cols="auto" v-for="loco in locos" :key="loco.address">
          <button
            class="roster-loco"
            @click="async () => { await acquireThrottle(loco.address); isRosterOpen = false }"
          >
            <LocoNumberPlate
              :address="loco.address"
              :color="loco.meta?.roadname ? ROADNAMES.find(r => r.value === loco.meta?.roadname)?.color : undefined"
              size="md"
            />
            <span v-if="loco.name" class="roster-loco__name">{{ loco.name }}</span>
          </button>
        </v-col>
      </v-row>

      <EmptyState
        v-else
        icon="mdi-train"
        color="amber"
        title="Your roster is empty"
        description="Add locomotives to your roster, or close this and enter a DCC address to start driving."
      />
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

/* 🪧 Empty state — centered prompt */
.throttle-list-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
}

/* 🎸 Roster drawer loco — large, easy tap target */
.roster-loco {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    background 150ms ease,
    border-color 150ms ease,
    transform 150ms ease;
}
.roster-loco:hover {
  background: rgba(var(--v-theme-on-surface), 0.08);
  border-color: rgba(148, 163, 184, 0.2);
  transform: translateY(-1px);
}
.roster-loco:active {
  transform: translateY(0);
}
.roster-loco__name {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
  max-width: 104px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
