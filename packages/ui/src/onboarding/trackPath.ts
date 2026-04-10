export interface OnboardingStep {
  label: string
  status: 'completed' | 'active' | 'pending'
}

export interface StationCoord {
  x: number
  y: number
  labelY: number      // Y position for the label text
  labelAnchor: 'top' | 'bottom'  // Whether label goes above or below the track
}

/** The winding SVG path d attribute for the track */
export const TRACK_PATH_D =
  'M 60,140 C 120,140 140,60 220,60 C 300,60 320,140 400,140 C 480,140 500,60 580,60 C 660,60 680,140 760,140 C 810,140 840,100 840,80'

/** Station positions on the SVG canvas */
export const STATION_COORDS: StationCoord[] = [
  { x: 60, y: 140, labelY: 185, labelAnchor: 'bottom' },
  { x: 220, y: 60, labelY: 16, labelAnchor: 'top' },
  { x: 400, y: 140, labelY: 185, labelAnchor: 'bottom' },
  { x: 580, y: 60, labelY: 16, labelAnchor: 'top' },
  { x: 840, y: 80, labelY: 36, labelAnchor: 'top' },
]

/** Colors for each step status */
export const STATUS_COLORS: Record<OnboardingStep['status'], string> = {
  completed: '#4ade80',
  active: '#7dd3fc',
  pending: '#a855f7',
}

/** SVG viewBox for the component */
export const VIEWBOX = '0 -20 900 270'
