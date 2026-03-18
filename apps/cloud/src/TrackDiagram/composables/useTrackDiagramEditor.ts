import { ref } from 'vue'
import type { ToolMode } from '../types'
import { GRID_SIZE } from '../constants'

const toolMode = ref<ToolMode>('select')
const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)
const gridSnap = ref(true)
const gridSize = ref(GRID_SIZE)
const isDirty = ref(false)

export const useTrackDiagramEditor = () => {
  function setToolMode(mode: ToolMode) {
    toolMode.value = mode
  }

  function selectNode(id: string | null) {
    selectedNodeId.value = id
    selectedEdgeId.value = null
  }

  function selectEdge(id: string | null) {
    selectedEdgeId.value = id
    selectedNodeId.value = null
  }

  function snapToGrid(value: number): number {
    if (!gridSnap.value) return value
    return Math.round(value / gridSize.value) * gridSize.value
  }

  function markDirty() {
    isDirty.value = true
  }

  function markClean() {
    isDirty.value = false
  }

  return {
    toolMode,
    selectedNodeId,
    selectedEdgeId,
    gridSnap,
    gridSize,
    isDirty,
    setToolMode,
    selectNode,
    selectEdge,
    snapToGrid,
    markDirty,
    markClean,
  }
}
