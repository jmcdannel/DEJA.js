/** A WLED device registered in DEJA.js */
export interface WledDevice {
  id: string
  type: 'wled'
  name: string
  connection: 'wifi'
  host: string
  port: number
  isConnected: boolean
}

/** Default WebSocket port for WLED (standard HTTP port) */
export const WLED_DEFAULT_PORT = 80
