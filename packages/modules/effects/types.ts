export interface Effect {
  device?: string
  name?: string
  pin?: number
  on?: any[]
  off?: any[]
  type: string
  state: boolean
  color?: string
  pattern?: string
  point1?: string
  point2?: string
  range?: string
  config?: string
  sound?: string
  soundBlobUrl?: string
  tags?: string[]
  allowGuest?: boolean
  // For 'signal' effect type: references to child effects by ID (optional)
  red?: string
  yellow?: string
  green?: string
  id: string
}

export interface EffectType {
  value: string
  label: string
  icon: string
  color: string
  require?: string[]
  defaultDevice?: string
}

export interface MacroItem {
  device?: string
  direction?: boolean | string
  name?: string
  type?: string
  speed?: number
  state?: boolean
  id?: string | number
}