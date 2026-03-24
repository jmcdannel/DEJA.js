<script setup lang="ts">
import { ref } from 'vue'
import { type ConsistLoco, type Loco, useLocos } from '@repo/modules/locos'
import { createLogger } from '@repo/utils'
import ConsistLeadCard from './ConsistLeadCard.vue'
import ConsistLocoCard from './ConsistLocoCard.vue'
import ConsistLocoPicker from './ConsistLocoPicker.vue'

const log = createLogger('ConsistEditor')

const props = defineProps<{
  loco: Loco
}>()

defineEmits<{
  close: []
}>()

const { getLocos, updateConsist } = useLocos()
const locos = getLocos()

const expandedAddress = ref<number | null>(null)
const showPicker = ref(false)

function toggleExpand(address: number) {
  expandedAddress.value = expandedAddress.value === address ? null : address
}

async function handleFlip(cloco: ConsistLoco) {
  if (!props.loco.id) return
  const newConsist = (props.loco.consist || []).map(l =>
    l.address === cloco.address ? { ...l, direction: !l.direction } : l
  )
  log.debug('handleFlip', newConsist)
  await updateConsist(props.loco.id, newConsist)
}

async function handleTrim(cloco: ConsistLoco, delta: number) {
  if (!props.loco.id) return
  const newConsist = (props.loco.consist || []).map(l =>
    l.address === cloco.address ? { ...l, trim: l.trim + delta } : l
  )
  log.debug('handleTrim', newConsist)
  await updateConsist(props.loco.id, newConsist)
}

async function handleRemove(cloco: ConsistLoco) {
  if (!props.loco.id) return
  const newConsist = (props.loco.consist || []).filter(l => l.address !== cloco.address)
  log.debug('handleRemove', newConsist)
  await updateConsist(props.loco.id, newConsist)
  if (expandedAddress.value === cloco.address) {
    expandedAddress.value = null
  }
}

async function handleAddLoco(address: number, direction: boolean) {
  if (!props.loco.id) return
  const newLoco: ConsistLoco = { address, direction, trim: 0 }
  const newConsist = [...(props.loco.consist || []), newLoco]
  log.debug('handleAddLoco', newConsist)
  await updateConsist(props.loco.id, newConsist)
  showPicker.value = false
}

// Helper to get the direction-aware color for the consist bar badges
function badgeBg(cloco: ConsistLoco): string {
  return cloco.direction ? 'rgba(5,150,105,0.3)' : 'rgba(220,38,38,0.3)'
}
function badgeColor(cloco: ConsistLoco): string {
  return cloco.direction ? '#059669' : '#dc2626'
}
function arrowColor(cloco: ConsistLoco): string {
  return cloco.direction ? '#6ee7b7' : '#fca5a5'
}
</script>

<template>
  <!-- Main editor (when picker is closed) -->
  <v-card v-if="!showPicker" class="bg-[#1e1b2e] h-full">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-purple-500/20">
      <div>
        <h3 class="text-base font-semibold text-slate-200">EZ Consist</h3>
        <span class="text-[11px] opacity-60" style="color: #7c3aed">Software-based consisting by DEJA.js</span>
      </div>
      <v-btn icon="mdi-close" variant="text" size="small" @click="$emit('close')" />
    </div>

    <!-- Consist visualization bar -->
    <div class="flex items-center gap-1.5 px-4 py-3" style="background: rgba(0,0,0,0.3)">
      <!-- Lead badge -->
      <div
        class="flex items-center gap-1 rounded-full py-1 pl-2.5 pr-1.5"
        style="background: rgba(124,58,237,0.3)"
      >
        <span class="text-xs" style="color: #c4b5fd">◀</span>
        <div
          class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
          style="background: #7c3aed"
        >{{ loco.address }}</div>
      </div>
      <!-- Member badges -->
      <div
        v-for="cloco in loco.consist"
        :key="cloco.address"
        class="flex items-center gap-1 rounded-full py-1"
        :class="cloco.direction ? 'pl-2.5 pr-1.5' : 'pl-1.5 pr-2.5'"
        :style="{ background: badgeBg(cloco) }"
      >
        <span v-if="cloco.direction" class="text-xs" :style="{ color: arrowColor(cloco) }">◀</span>
        <div
          class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold text-white"
          :style="{ background: badgeColor(cloco) }"
        >{{ cloco.address }}</div>
        <span v-if="!cloco.direction" class="text-xs" :style="{ color: arrowColor(cloco) }">▶</span>
      </div>
    </div>

    <!-- Loco card list -->
    <div class="p-4 flex flex-col gap-2 overflow-y-auto">
      <!-- Lead card -->
      <ConsistLeadCard v-if="loco.consist?.length" :loco="loco" />

      <!-- Member cards -->
      <ConsistLocoCard
        v-for="cloco in loco.consist"
        :key="cloco.address"
        :cloco="cloco"
        :expanded="expandedAddress === cloco.address"
        @toggle-expand="toggleExpand(cloco.address)"
        @flip="handleFlip"
        @trim="handleTrim"
        @remove="handleRemove"
      />

      <!-- Add button -->
      <button
        class="w-full mt-1 py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
        style="background: rgba(139,92,246,0.15); border: 1px dashed rgba(139,92,246,0.4); color: #a78bfa"
        @click="showPicker = true"
      >
        <span class="text-lg">+</span> Add Locomotive
      </button>
    </div>
  </v-card>

  <!-- Picker (replaces editor content when open) -->
  <ConsistLocoPicker
    v-else
    :locos="(locos as Loco[])"
    :loco="loco"
    @add="handleAddLoco"
    @close="showPicker = false"
  />
</template>
