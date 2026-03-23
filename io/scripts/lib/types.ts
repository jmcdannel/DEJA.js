// 🔧 Standalone type definitions mirroring Firestore shapes
// Keeps io/ independent from @repo/modules

export interface Device {
  autoConnect?: boolean
  client?: string
  config?: Record<string, unknown>
  connection?: 'usb' | 'wifi'
  description?: string
  id: string
  isConnected?: boolean
  lastConnected?: Date
  name: string
  port?: string
  strips?: number[]
  tags?: string[]
  timestamp?: Date
  topic?: string
  type: 'dcc-ex' | 'deja-arduino' | 'deja-arduino-led' | 'deja-mqtt' | 'deja-server'
}

export interface Effect {
  device?: string
  name?: string
  pin?: number
  type: string
  state: boolean
  color?: string
  pattern?: string
  range?: string
  config?: string
  order?: number
  tags?: string[]
  id: string
}

export interface Turnout {
  color?: string
  desc?: string
  device: string
  divergent?: number
  effectId?: string
  id: string
  lastUpdated?: string
  name: string
  order?: number
  state: boolean
  straight?: number
  tags?: string[]
  timestamp?: number
  turnoutIdx?: number
  type: string
}

export interface DeviceConfig {
  device: Device
  effects: Effect[]
  turnouts: Turnout[]
}
