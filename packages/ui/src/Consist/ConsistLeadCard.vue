<script setup lang="ts">
import type { Loco } from '@repo/modules/locos'

defineProps<{
  loco: Loco
}>()
</script>

<template>
  <div
    class="flex items-center gap-3 rounded-xl p-3"
    style="background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.2)"
  >
    <span class="text-lg" style="color: #c4b5fd">◀</span>
    <v-avatar color="#7c3aed" size="40">
      <span class="text-white font-bold text-sm">{{ loco.address }}</span>
    </v-avatar>
    <div class="flex-1 min-w-0">
      <div class="text-sm font-semibold text-slate-200 truncate">{{ loco.name }}</div>
      <div class="text-xs" style="color: #7c3aed">Lead Locomotive</div>
    </div>
  </div>
</template>
