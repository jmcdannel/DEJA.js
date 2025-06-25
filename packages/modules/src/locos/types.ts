// types.ts

export interface ConsistLoco {
  address: number
  direction: boolean
  trim: number
}
export interface Loco {
  address: number
  name: string
  consist?: ConsistLoco[]
  functions?: LocoFunction[]
  id: string
  meta?: {
    color?: string
    roadname?: string
  }
}
export interface Throttle {
  id?: number
  address: number
  direction: boolean
  speed: number
  timesstamp: number
}

export interface LocoFunction {
  id: number
  label: string
  icon: string | null | undefined
  isFavorite: boolean | undefined
}

export interface ConsistSettingsProps {
  locos: Loco[]
  loco: Loco
}

export interface RoadName {
  value: string
  label: string
  color: string
}

export interface LocoThrottle {
  address: number
  loco: Loco
  throttle: Throttle
}