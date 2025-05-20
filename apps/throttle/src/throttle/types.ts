// types.ts

export interface ConsistLoco {
  address: number
  direction: boolean
  trim: number
}
export interface Loco {
  address: number
  consist: ConsistLoco[]
  functions: LocoFunction[]
}
export interface LocoFunction {
  id: number
  label: string
  icon: string | null | undefined
  isFavorite: boolean | undefined
}

export interface ConsistProps {
  address: number
}

export interface ConsistSettingsProps {
  locos: Loco[]
  loco: Loco
}
