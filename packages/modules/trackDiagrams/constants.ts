export const trackDiagramType = {
  value: 'trackDiagram',
  label: 'Track Diagram',
  icon: 'mdi-map-marker-path',
  color: 'indigo',
} as const

export const NODE_TYPES = {
  STATION: 'station',
  TURNOUT: 'turnout',
  WAYPOINT: 'waypoint',
} as const

export const DEFAULT_VIEWBOX = { width: 920, height: 480 }

export const DEFAULT_TRACK_COLORS: Record<string, string> = {
  Mainline: 'rgb(242,94,13)',
  Yard: 'rgb(143,217,38)',
  Storage: 'rgb(228,13,242)',
}
