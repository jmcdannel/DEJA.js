<script setup lang="ts">
import { ref } from 'vue'
import type { Loco, ConsistLoco } from '@repo/modules/locos'
import ConsistEditor from './ConsistEditor.vue'

defineProps<{
  loco: Loco
}>()

const editorOpen = ref(false)

// Badge color helpers
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
  <!-- Badge bar -->
  <div
    class="flex items-center gap-1.5 py-2 px-3.5 rounded-2xl cursor-pointer overflow-x-auto"
    style="background: rgba(124,58,237,0.12); border: 1px solid rgba(124,58,237,0.25)"
    @click="editorOpen = true"
  >
    <!-- EZ label -->
    <span
      v-if="loco.consist?.length"
      class="text-[10px] font-semibold tracking-wide opacity-70 mr-0.5"
      style="color: #7c3aed"
    >EZ</span>
    <span
      v-else
      class="text-[11px] font-semibold tracking-wide opacity-60"
      style="color: #7c3aed"
    >EZ Consist</span>

    <!-- Lead loco badge (only when consist has members) -->
    <div
      v-if="loco.consist?.length"
      class="flex items-center gap-1 rounded-full py-1 pl-2.5 pr-1 flex-shrink-0"
      style="background: rgba(124,58,237,0.3)"
    >
      <span class="text-sm leading-none" style="color: #c4b5fd">◀</span>
      <div
        class="h-7 min-w-7 px-2 rounded-full flex items-center justify-center text-[13px] font-bold text-white tabular-nums tracking-tight"
        style="background: #7c3aed"
      >{{ loco.address }}</div>
    </div>

    <!-- Member badges -->
    <div
      v-for="cloco in loco.consist"
      :key="cloco.address"
      class="flex items-center gap-1 rounded-full py-1 flex-shrink-0"
      :class="cloco.direction ? 'pl-2.5 pr-1' : 'pl-1 pr-2.5'"
      :style="{ background: badgeBg(cloco) }"
    >
      <span v-if="cloco.direction" class="text-sm leading-none" :style="{ color: arrowColor(cloco) }">◀</span>
      <div
        class="h-7 min-w-7 px-2 rounded-full flex items-center justify-center text-[13px] font-semibold text-white tabular-nums tracking-tight"
        :style="{ background: badgeColor(cloco) }"
      >{{ cloco.address }}</div>
      <span v-if="!cloco.direction" class="text-sm leading-none" :style="{ color: arrowColor(cloco) }">▶</span>
    </div>

    <!-- Edit pencil -->
    <div
      class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] flex-shrink-0"
      :class="loco.consist?.length ? 'ml-0.5' : ''"
      style="background: rgba(139,92,246,0.3); color: #a78bfa"
    >
      <v-icon icon="mdi-pencil" size="14" />
    </div>
  </div>

  <!-- Editor dialog -->
  <v-dialog v-model="editorOpen" max-width="480" scroll-strategy="none">
    <ConsistEditor :loco="loco" @close="editorOpen = false" />
  </v-dialog>
</template>
