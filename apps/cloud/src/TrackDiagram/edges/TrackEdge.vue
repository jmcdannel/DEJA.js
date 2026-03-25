<script setup lang="ts">
import { BezierEdge, Position } from '@vue-flow/core'
import type { TrackDiagramEdgeData } from '@repo/modules'
import { DEFAULT_TRACK_COLORS } from '../constants'

const props = defineProps<{
  id: string
  source: string
  target: string
  data: TrackDiagramEdgeData
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: Position
  targetPosition: Position
}>()

const edgeColor = props.data?.color || DEFAULT_TRACK_COLORS[props.data?.trackLine] || '#888'
const strokeWidth = props.data?.strokeWidth || 3
</script>
<template>
  <BezierEdge
    :id="id"
    :source="source"
    :target="target"
    :source-x="sourceX"
    :source-y="sourceY"
    :target-x="targetX"
    :target-y="targetY"
    :source-position="sourcePosition"
    :target-position="targetPosition"
    :style="{ stroke: edgeColor, strokeWidth: `${strokeWidth}px` }"
  />
</template>
