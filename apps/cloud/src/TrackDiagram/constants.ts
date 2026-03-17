import { DEFAULT_TRACK_COLORS } from '@repo/modules'

export const GRID_SIZE = 20
export const NODE_WIDTH = 120
export const NODE_HEIGHT = 40
export const TURNOUT_WIDTH = 80
export const TURNOUT_HEIGHT = 60

export const TOOL_OPTIONS = [
  { mode: 'select' as const, icon: 'mdi-cursor-default', label: 'Select' },
  { mode: 'station' as const, icon: 'mdi-map-marker', label: 'Station' },
  { mode: 'turnout' as const, icon: 'mdi-call-split', label: 'Turnout' },
  { mode: 'waypoint' as const, icon: 'mdi-circle-small', label: 'Waypoint' },
] as const

export { DEFAULT_TRACK_COLORS }
