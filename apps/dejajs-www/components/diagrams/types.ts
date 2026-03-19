export type AppId = 'throttle' | 'cloud' | 'monitor' | 'tour'
export type DeviceId = 'dccex' | 'arduino' | 'pico-w' | 'mqtt-generic'

export interface DiagramConfig {
  id: string
  label: string
  apps: AppId[]
  server: boolean
  devices: DeviceId[]
  track: boolean
  mqtt: boolean
}

export interface NodeDef {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
  sublabel?: string
  color: string
  logoSrc?: string   // PNG image path (public/)
  iconPath?: string  // MDI SVG path string (24×24 viewBox)
  layer: 1 | 2 | 3 | 4
  /** Render as a tiny icon-circle with no rect and no label (for peripheral indicators) */
  mini?: boolean
}

export type ConnectionType = 'websocket' | 'usb' | 'mqtt' | 'dcc' | 'wifi' | 'peripheral'

export interface ConnectionDef {
  id: string
  fromId: string
  toId: string
  label: string
  color: string
  type: ConnectionType
  showLabel: boolean
  iconPath?: string  // MDI icon path shown on the arrow label
}

export interface AreaDef {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
  color: string
  /** SVG polygon points string — if set, renders as <polygon> instead of <rect> */
  points?: string
  /** Override the Y anchor for the rotated side label (useful for L-shapes) */
  labelAnchorY?: number
}

export interface DiagramLayout {
  nodes: NodeDef[]
  connections: ConnectionDef[]
  areas: AreaDef[]
  viewBox: string
  width: number
  height: number
}
