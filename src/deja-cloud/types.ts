export interface Device {
  id: string
  autoConnect?: boolean
  client?: string
  connection?: string
  isConnected?: boolean
  lastConnected?: number
  port?: string
  type: string
}
