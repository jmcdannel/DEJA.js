import type { Timestamp } from 'firebase/firestore'

export type SensorType = 'digital' | 'analog' | 'dcc-ex'
export type SensorInputType = 'ir' | 'current' | 'reed' | 'optical' | 'pressure' | 'custom'

export interface Sensor {
  id: string
  name: string
  device?: string
  pin?: number
  index: number
  type: SensorType
  inputType?: SensorInputType
  state: boolean
  enabled: boolean
  blockId?: string
  effectId?: string
  automationId?: string
  debounceMs?: number
  cooldownMs?: number
  maxRetries?: number
  retryWindowMs?: number
  invertState?: boolean
  pullup?: boolean
  analogValue?: number
  analogThreshold?: number
  description?: string
  order?: number
  tags?: string[]
  timestamp?: Timestamp | null
}

export type SensorInput = Omit<Sensor, 'id'>

export interface Block {
  id: string
  name: string
  sensorIds: string[]
  signalIds?: string[]
  color?: string
  occupied: boolean
  description?: string
  tags?: string[]
  position?: { x: number; y: number }
  size?: { width: number; height: number }
  rotation?: number
  connections?: string[]
  timestamp?: Timestamp | null
}

export type BlockInput = Omit<Block, 'id'>

export interface SensorAutomation {
  id: string
  name: string
  sensorId: string
  triggerOn: 'activate' | 'deactivate' | 'both'
  actions: SensorAction[]
  enabled: boolean
  delay?: number
  description?: string
  timestamp?: Timestamp | null
}

export type SensorAutomationInput = Omit<SensorAutomation, 'id'>

export interface SensorAction {
  type: 'effect' | 'turnout' | 'signal' | 'route' | 'macro' | 'throttle'
  id: string
  state?: boolean
  speed?: number
  direction?: boolean
  aspect?: 'red' | 'yellow' | 'green'
}
