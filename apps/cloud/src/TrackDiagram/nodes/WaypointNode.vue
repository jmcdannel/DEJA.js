<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { TrackDiagramNodeData } from '@repo/modules'

const props = defineProps<{
  id: string
  data: TrackDiagramNodeData & { label: string }
}>()
</script>
<template>
  <div class="waypoint-node w-4 h-4 rounded-full border-2 border-gray-400 bg-gray-700">
    <Handle type="target" :position="Position.Left" class="!bg-gray-400 !w-2 !h-2" />
    <Handle type="source" :position="Position.Right" class="!bg-gray-400 !w-2 !h-2" />
  </div>
</template>
