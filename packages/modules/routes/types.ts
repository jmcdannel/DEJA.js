import type { MacroItem } from '../effects/types'

export interface RouteTurnoutConfig extends Pick<MacroItem, 'id' | 'name' | 'device' | 'state' | 'type' | 'direction'> {}

export interface Route {
  id: string
  name: string
  point1?: string
  point2?: string
  color?: string
  tags?: string[]
  turnouts?: RouteTurnoutConfig[]
  order?: number
  description?: string
}

export type RouteInput = Omit<Route, 'id'>

export interface RoutesPreferences {
  sortBy: string[]
}
