import type { Timestamp } from 'firebase/firestore'

export interface TrackDiagramNodeData {
  turnoutId?: string
  routePointId?: string
  trackLine?: string
  color?: string
}

export interface TrackDiagramNode {
  id: string
  type: 'station' | 'turnout' | 'waypoint'
  label: string
  position: { x: number; y: number }
  rotation: number
  data: TrackDiagramNodeData
}

export interface TrackDiagramEdgeData {
  trackLine: string
  color: string
  strokeWidth: number
  pathType: 'straight' | 'curve'
}

export interface TrackDiagramEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  data: TrackDiagramEdgeData
}

export interface TrackDiagram {
  id: string
  name: string
  layoutId: string
  nodes: TrackDiagramNode[]
  edges: TrackDiagramEdge[]
  viewBox: { width: number; height: number }
  svgUrl?: string
  cssUrl?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export type TrackDiagramInput = Omit<TrackDiagram, 'id'>
