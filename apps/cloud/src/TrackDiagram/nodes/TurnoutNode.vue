<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { TrackDiagramNodeData } from '@repo/modules'

const props = defineProps<{
  id: string
  data: TrackDiagramNodeData & { label: string; rotation: number }
}>()
</script>
<template>
  <div class="turnout-node rounded border-2 border-amber-500 bg-amber-900/60 px-2 py-1 text-white text-xs min-w-[60px] text-center">
    <v-icon size="14" class="mr-1">mdi-call-split</v-icon>
    <span>{{ data.label || 'Turnout' }}</span>
    <div v-if="data.turnoutId" class="text-amber-300 text-[10px]">{{ data.turnoutId }}</div>
    <Handle id="input" type="target" :position="Position.Left" class="!bg-amber-400" />
    <Handle id="straight" type="source" :position="Position.Right" style="top: 30%" class="!bg-amber-400" />
    <Handle id="divergent" type="source" :position="Position.Right" style="top: 70%" class="!bg-amber-400" />
  </div>
</template>
