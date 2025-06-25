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
  tags?: string[]
  id: string
}

export interface EffectType {
  value: string
  label: string
  icon: string
  color: string
  require?: string[]
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