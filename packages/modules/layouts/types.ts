export interface Tag {
  color?: string
  icon?: string
  id: string
  name: string
}

export interface LayoutDefaultSound {
  effectId: string
  label: string
  icon: string
}
export interface Layout {
  approved?: boolean
  author?: string
  createdAt?: Date
  description?: string
  defaultSounds?: LayoutDefaultSound[]
  devices?: string[]
  effects?: string[]
  id: string
  image?: string
  isArchived?: boolean
  isDefault?: boolean
  isFavorite?: boolean
  isPublic?: boolean
  locos?: string[]
  meta?: Record<string, unknown>
  name: string
  owner?: string
  routes?: string[]
  scripts?: string[]
  sensors?: string[]
  tags?: Tag[]
  thumbnail?: string
  turnouts?: string[]
  updatedAt?: Date
  version?: string
  dccEx?: {
    power?: boolean
    trackA?: string
    trackB?: string
    LCD2?: string
    LCD3?: string
    client?: string
    isConnected?: boolean
    lastConnected?: Date
  }
  throttleConnection?: {
    type: 'deja-server' | 'withrottle'
    host?: string
    port?: number
  }
}

export interface ServerStatus {
  online: boolean
  lastSeen: Date | number
  version?: string
}

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
  tags?: Tag[]
  timestamp?: Date
  topic?: string
  type: 'dcc-ex' | 'deja-arduino' | 'deja-arduino-led' | 'deja-mqtt'
}

export interface DeviceType {
  value: string
  label: string
  icon: string
}

export interface Sensor {
  deviceId: string
  effectId?: string
  enabled: boolean
  id: string
  index: number
  state: boolean
}
