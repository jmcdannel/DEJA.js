import type { Loco } from '@repo/modules/locos'

export interface Throttle {
  id?: number
  address: number
  direction: boolean
  speed: number
  timesstamp: number
}

export interface ConsistSettingsProps {
  locos: Loco[]
  loco: Loco
}
