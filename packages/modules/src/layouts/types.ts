export interface ITag {
  color?: string
  icon?: string
  id: string
  name: string
}
export interface ILayout {
  author?: string
  createdAt?: Date
  description?: string
  devices?: string[]
  effects?: string[]
  id: string
  image?: string
  isArchived?: boolean
  isDefault?: boolean
  isFavorite?: boolean
  isPublic?: boolean
  locos?: string[]
  meta?: Record<string, any>
  name: string
  routes?: string[]
  scripts?: string[]
  sensors?: string[]
  tags?: ITag[]
  thumbnail?: string
  turnouts?: string[]
  updatedAt?: Date
  version?: string
}

export interface IDevice {
  autoConnect?: boolean
  client?: string
  config?: Record<string, any>
  connection?: string
  description?: string
  id: string
  isConnected?: boolean
  lastConnected?: Date
  name: string
  port?: string
  strips?: number[]
  tags?: ITag[]
  timestamp?: Date
  topic?: string
  type: string
}

export interface ISensor {
  deviceId: string
  effectId?: string
  enabled: boolean
  id: string
  index: number
  state: boolean
}