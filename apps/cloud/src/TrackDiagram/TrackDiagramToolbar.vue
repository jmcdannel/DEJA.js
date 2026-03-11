<script setup lang="ts">
import { useTrackDiagramEditor } from './composables/useTrackDiagramEditor'
import { TOOL_OPTIONS } from './constants'

const { toolMode, setToolMode } = useTrackDiagramEditor()
</script>
<template>
  <div class="flex gap-1 p-2 bg-gray-900 rounded-lg">
    <v-btn
      v-for="tool in TOOL_OPTIONS"
      :key="tool.mode"
      :icon="tool.icon"
      :color="toolMode === tool.mode ? 'indigo' : undefined"
      :variant="toolMode === tool.mode ? 'flat' : 'text'"
      size="small"
      :title="tool.label"
      @click="setToolMode(tool.mode)"
    />
  </div>
</template>
