<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { TrackDiagramNodeData } from '@repo/modules'

const props = defineProps<{
  id: string
  data: TrackDiagramNodeData & { label: string }
}>()
</script>
<template>
  <div class="station-node rounded-lg border-2 border-green-500 bg-green-900/60 px-3 py-2 text-white text-xs font-bold min-w-[80px] text-center">
    <div>{{ data.label || 'Station' }}</div>
    <div v-if="data.routePointId" class="text-green-300 text-[10px]">{{ data.routePointId }}</div>
    <Handle type="target" :position="Position.Left" class="!bg-green-400" />
    <Handle type="source" :position="Position.Right" class="!bg-green-400" />
  </div>
</template>
