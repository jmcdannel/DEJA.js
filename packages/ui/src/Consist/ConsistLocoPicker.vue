<script setup lang="ts">
import { ref, computed } from 'vue'
import { ROADNAMES, type Loco } from '@repo/modules/locos'

const props = defineProps<{
  locos: Loco[]
  loco: Loco
}>()

defineEmits<{
  add: [address: number, direction: boolean]
  close: []
}>()

const search = ref('')

function getRoadnameColor(roadname: string | undefined): string {
  if (!roadname) return '#ec4899'
  return ROADNAMES.find(rn => rn.value === roadname)?.color || '#ec4899'
}

function getRoadnameLabel(roadname: string | undefined): string {
  if (!roadname) return 'Unknown'
  return ROADNAMES.find(rn => rn.value === roadname)?.label || roadname
}

function isInConsist(address: number): boolean {
  if (address === props.loco.address) return true
  return !!props.loco.consist?.some(c => c.address === address)
}

function isLead(address: number): boolean {
  return address === props.loco.address
}

const filteredLocos = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return props.locos
  return props.locos.filter(l =>
    l.address.toString().includes(q) ||
    l.name.toLowerCase().includes(q) ||
    (l.meta?.roadname?.toLowerCase().includes(q) ?? false)
  )
})
</script>

<template>
  <v-card class="bg-[#1e1b2e] h-full">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-purple-500/20">
      <h3 class="text-base font-semibold text-slate-200">Add to Consist</h3>
      <v-btn icon="mdi-close" variant="text" size="small" @click="$emit('close')" />
    </div>

    <!-- Search -->
    <div class="px-4 pt-3 pb-2">
      <v-text-field
        v-model="search"
        placeholder="Search by name, address, or road..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        class="text-sm"
      />
    </div>

    <!-- Loco list -->
    <div class="px-4 pb-4 flex flex-col gap-1.5 overflow-y-auto max-h-[60vh]">
      <div
        v-for="aloco in filteredLocos"
        :key="aloco.address"
        class="flex items-center gap-2.5 py-2.5 px-3 rounded-lg"
        :class="isInConsist(aloco.address) ? 'opacity-35' : ''"
        :style="{
          background: isInConsist(aloco.address) ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${isInConsist(aloco.address) ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)'}`,
        }"
      >
        <v-avatar
          :color="aloco.meta?.color || getRoadnameColor(aloco.meta?.roadname)"
          size="36"
        >
          <span class="text-white text-xs font-bold">{{ aloco.address }}</span>
        </v-avatar>
        <div class="flex-1 min-w-0">
          <div class="text-[13px] font-semibold text-slate-200 truncate">{{ aloco.name }}</div>
          <div class="text-[11px] text-gray-400" v-if="isInConsist(aloco.address)">
            {{ isLead(aloco.address) ? 'In consist (lead)' : 'Already in consist' }}
          </div>
          <div class="text-[11px] text-gray-400" v-else>
            {{ getRoadnameLabel(aloco.meta?.roadname) }}
          </div>
        </div>
        <div v-if="!isInConsist(aloco.address)" class="flex gap-1">
          <button
            class="h-9 px-2.5 rounded-lg flex items-center gap-1 text-xs font-semibold"
            style="background: rgba(5,150,105,0.2); border: 1px solid rgba(5,150,105,0.3); color: #34d399"
            @click="$emit('add', aloco.address, true)"
          >◀ Fwd</button>
          <button
            class="h-9 px-2.5 rounded-lg flex items-center gap-1 text-xs font-semibold"
            style="background: rgba(220,38,38,0.15); border: 1px solid rgba(220,38,38,0.25); color: #f87171"
            @click="$emit('add', aloco.address, false)"
          >Rev ▶</button>
        </div>
      </div>

      <!-- Empty search results -->
      <div v-if="filteredLocos.length === 0" class="text-center py-8 text-gray-500 text-sm">
        No locomotives match "{{ search }}"
      </div>
    </div>
  </v-card>
</template>
