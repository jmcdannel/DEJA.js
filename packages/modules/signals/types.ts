import type { Timestamp } from 'firebase/firestore'

export type SignalAspect = 'red' | 'yellow' | 'green' | null

export interface Signal {
  id: string
  name: string
  device?: string
  red?: number
  yellow?: number
  green?: number
  aspect?: SignalAspect
  commonAnode?: boolean
  description?: string
  tags?: string[]
  timestamp?: Timestamp | null
}

export type SignalInput = Omit<Signal, 'id'>
