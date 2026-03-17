<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

import type { TrackDiagram, TrackDiagramNode, TrackDiagramEdge } from '@repo/modules'
import { useTrackDiagrams } from '@repo/modules/trackDiagrams/useTrackDiagrams'
import { createLogger } from '@repo/utils'

import { generateSvg } from './composables/useTrackDiagramSvg'
import { generateCss } from './composables/useTrackDiagramCss'
import { useTrackDiagramStorage } from './composables/useTrackDiagramStorage'
import { useTrackDiagramEditor } from './composables/useTrackDiagramEditor'
import TrackDiagramToolbar from './TrackDiagramToolbar.vue'
import TrackDiagramProperties from './TrackDiagramProperties.vue'
import TrackDiagramPreview from './TrackDiagramPreview.vue'
import StationNode from './nodes/StationNode.vue'
import TurnoutNode from './nodes/TurnoutNode.vue'
import WaypointNode from './nodes/WaypointNode.vue'
import TrackEdge from './edges/TrackEdge.vue'
import { DEFAULT_TRACK_COLORS, GRID_SIZE } from './constants'

const log = createLogger('TrackDiagramEditor')

const props = defineProps<{ diagram: TrackDiagram }>()
const { setTrackDiagram } = useTrackDiagrams()
const { toolMode, selectedNodeId, selectedEdgeId, selectNode, selectEdge, snapToGrid, isDirty, markDirty, markClean } = useTrackDiagramEditor()

const { uploadSvg, uploadCss } = useTrackDiagramStorage()
const saving = ref(false)
const exporting = ref(false)
const showPreview = ref(false)
const nodeCounter = ref(props.diagram.nodes.length)

// Convert diagram data to VueFlow format
const nodes = ref(props.diagram.nodes.map((n) => ({
  id: n.id,
  type: n.type,
  position: n.position,
  data: { ...n.data, label: n.label, rotation: n.rotation },
})))

const edges = ref(props.diagram.edges.map((e) => ({
  id: e.id,
  source: e.source,
  target: e.target,
  sourceHandle: e.sourceHandle,
  targetHandle: e.targetHandle,
  type: 'track',
  data: e.data,
})))

const selectedNode = computed(() => {
  if (!selectedNodeId.value) return null
  const vfNode = nodes.value.find((n) => n.id === selectedNodeId.value)
  if (!vfNode) return null
  return {
    id: vfNode.id,
    type: vfNode.type as TrackDiagramNode['type'],
    label: vfNode.data.label,
    position: vfNode.position,
    rotation: vfNode.data.rotation || 0,
    data: vfNode.data,
  } as TrackDiagramNode
})

const selectedEdge = computed(() => {
  if (!selectedEdgeId.value) return null
  const vfEdge = edges.value.find((e) => e.id === selectedEdgeId.value)
  if (!vfEdge) return null
  return {
    id: vfEdge.id,
    source: vfEdge.source,
    target: vfEdge.target,
    sourceHandle: vfEdge.sourceHandle,
    targetHandle: vfEdge.targetHandle,
    data: vfEdge.data,
  } as TrackDiagramEdge
})

function onNodeClick({ node }: { node: { id: string } }) {
  selectNode(node.id)
}

function onEdgeClick({ edge }: { edge: { id: string } }) {
  selectEdge(edge.id)
}

function onPaneClick() {
  if (toolMode.value !== 'select') {
    addNode(toolMode.value as 'station' | 'turnout' | 'waypoint')
  } else {
    selectNode(null)
    selectEdge(null)
  }
}

function addNode(type: 'station' | 'turnout' | 'waypoint') {
  nodeCounter.value++
  const id = `${type}-${nodeCounter.value}`
  const defaultLabel = type === 'station' ? `Station ${nodeCounter.value}` : type === 'turnout' ? `T${nodeCounter.value}` : `WP${nodeCounter.value}`
  const trackLine = Object.keys(DEFAULT_TRACK_COLORS)[0]

  nodes.value.push({
    id,
    type,
    position: { x: snapToGrid(200 + nodeCounter.value * 30), y: snapToGrid(200 + nodeCounter.value * 20) },
    data: { label: defaultLabel, rotation: 0, trackLine },
  })
  markDirty()
  selectNode(id)
}

function onConnect(connection: { source: string; target: string; sourceHandle?: string; targetHandle?: string }) {
  const id = `edge-${connection.source}-${connection.target}`
  const trackLine = Object.keys(DEFAULT_TRACK_COLORS)[0]
  edges.value.push({
    id,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    type: 'track',
    data: { trackLine, color: DEFAULT_TRACK_COLORS[trackLine], strokeWidth: 3, pathType: 'curve' as const },
  })
  markDirty()
}

function handleNodeUpdate(updates: Partial<TrackDiagramNode>) {
  if (!selectedNodeId.value) return
  const idx = nodes.value.findIndex((n) => n.id === selectedNodeId.value)
  if (idx === -1) return
  const node = nodes.value[idx]
  nodes.value[idx] = {
    ...node,
    data: { ...node.data, ...updates.data, label: updates.label ?? node.data.label, rotation: updates.rotation ?? node.data.rotation },
  }
  markDirty()
}

function handleEdgeUpdate(updates: Partial<TrackDiagramEdge>) {
  if (!selectedEdgeId.value) return
  const idx = edges.value.findIndex((e) => e.id === selectedEdgeId.value)
  if (idx === -1) return
  edges.value[idx] = { ...edges.value[idx], data: { ...edges.value[idx].data, ...updates.data } }
  markDirty()
}

async function handleSave() {
  saving.value = true
  const diagramNodes: TrackDiagramNode[] = nodes.value.map((n) => ({
    id: n.id,
    type: n.type as TrackDiagramNode['type'],
    label: n.data.label || '',
    position: n.position,
    rotation: n.data.rotation || 0,
    data: {
      turnoutId: n.data.turnoutId,
      routePointId: n.data.routePointId,
      trackLine: n.data.trackLine,
      color: n.data.color,
    },
  }))
  const diagramEdges: TrackDiagramEdge[] = edges.value.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
    data: e.data,
  }))
  await setTrackDiagram(props.diagram.id, {
    ...props.diagram,
    nodes: diagramNodes,
    edges: diagramEdges,
  })
  markClean()
  saving.value = false
}

async function handleExport() {
  exporting.value = true
  const svg = generateSvg(nodes.value, edges.value, props.diagram.viewBox)
  const css = generateCss(nodes.value.map((n) => ({ type: n.type, data: n.data as { turnoutId?: string; routePointId?: string } })))

  const svgUrl = await uploadSvg(props.diagram.id, svg)
  const cssUrl = await uploadCss(props.diagram.id, css)

  if (svgUrl && cssUrl) {
    const diagramNodes: TrackDiagramNode[] = nodes.value.map((n) => ({
      id: n.id,
      type: n.type as TrackDiagramNode['type'],
      label: n.data.label || '',
      position: n.position,
      rotation: n.data.rotation || 0,
      data: {
        turnoutId: n.data.turnoutId,
        routePointId: n.data.routePointId,
        trackLine: n.data.trackLine,
        color: n.data.color,
      },
    }))
    const diagramEdges: TrackDiagramEdge[] = edges.value.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      data: e.data,
    }))
    await setTrackDiagram(props.diagram.id, {
      ...props.diagram,
      nodes: diagramNodes,
      edges: diagramEdges,
      svgUrl,
      cssUrl,
    })
    markClean()
  }
  exporting.value = false
}
</script>
<template>
  <div class="flex flex-col h-[calc(100vh-120px)]">
    <!-- Top bar -->
    <div class="flex items-center justify-between p-2 bg-gray-900 rounded-t-lg">
      <div class="flex items-center gap-2">
        <v-icon icon="mdi-map-marker-path" color="indigo" />
        <span class="text-lg font-bold">{{ diagram.name }}</span>
      </div>
      <div class="flex items-center gap-2">
        <TrackDiagramToolbar />
        <v-btn icon="mdi-eye" :variant="showPreview ? 'flat' : 'text'" color="indigo" size="small" title="Toggle Preview" @click="showPreview = !showPreview" />
        <v-btn text="Save" prepend-icon="mdi-content-save" color="indigo" :loading="saving" :disabled="!isDirty" size="small" @click="handleSave" />
        <v-btn text="Export SVG" prepend-icon="mdi-export" color="green" :loading="exporting" size="small" @click="handleExport" />
      </div>
    </div>

    <!-- Editor + Properties -->
    <div class="flex flex-1 overflow-hidden">
      <!-- VueFlow Canvas -->
      <div class="flex-1 relative">
        <VueFlow
          :nodes="nodes"
          :edges="edges"
          :node-types="{ station: StationNode, turnout: TurnoutNode, waypoint: WaypointNode }"
          :edge-types="{ track: TrackEdge }"
          :snap-to-grid="true"
          :snap-grid="[GRID_SIZE, GRID_SIZE]"
          fit-view-on-init
          @node-click="onNodeClick"
          @edge-click="onEdgeClick"
          @pane-click="onPaneClick"
          @connect="onConnect"
          @node-drag-stop="markDirty"
        >
          <Background :gap="GRID_SIZE" />
          <Controls />
          <MiniMap />
        </VueFlow>
      </div>

      <!-- Side panel -->
      <div class="w-72 p-2 bg-gray-950 overflow-y-auto border-l border-gray-800">
        <TrackDiagramProperties
          :node="selectedNode"
          :edge="selectedEdge"
          @update:node="handleNodeUpdate"
          @update:edge="handleEdgeUpdate"
        />
      </div>
    </div>

    <!-- Preview panel (toggleable) -->
    <div v-if="showPreview" class="h-64 border-t border-gray-800 bg-black">
      <TrackDiagramPreview :nodes="nodes" :edges="edges" :view-box="diagram.viewBox" />
    </div>
  </div>
</template>
