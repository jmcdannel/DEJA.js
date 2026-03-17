export type ToolMode = 'select' | 'station' | 'turnout' | 'waypoint' | 'edge'

export interface EditorState {
  toolMode: ToolMode
  selectedNodeId: string | null
  selectedEdgeId: string | null
  gridSnap: boolean
  gridSize: number
}
