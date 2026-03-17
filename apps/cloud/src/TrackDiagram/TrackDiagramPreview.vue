<script setup lang="ts">
import { computed } from 'vue'
import { generateSvg } from './composables/useTrackDiagramSvg'

const props = defineProps<{
  nodes: Array<{ id: string; type: string; position: { x: number; y: number }; data: Record<string, unknown> }>
  edges: Array<{ id: string; source: string; target: string; sourceHandle?: string; targetHandle?: string; data: { trackLine: string; color: string; strokeWidth: number; pathType: string } }>
  viewBox: { width: number; height: number }
}>()

const svgHtml = computed(() => generateSvg(props.nodes, props.edges, props.viewBox))
</script>
<template>
  <div class="h-full w-full flex flex-col">
    <div class="text-xs text-gray-500 p-1 flex items-center gap-2">
      <v-icon icon="mdi-eye" size="14" /> SVG Preview
    </div>
    <div class="flex-1 overflow-auto bg-black" v-html="svgHtml" />
  </div>
</template>
