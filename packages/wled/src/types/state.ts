/** Mirrors WLED JSON API /json/state response */
export interface WledState {
  on: boolean
  bri: number
  transition: number
  seg: WledSegment[]
}

/** Mirrors a single WLED segment object */
export interface WledSegment {
  id: number
  start: number
  stop: number
  col: [number, number, number][]
  fx: number
  pal: number
  sx: number
  ix: number
  bri: number
  on: boolean
  rev: boolean
  mi: boolean
}

/** Mirrors WLED JSON API /json/info response */
export interface WledInfo {
  ver: string
  name: string
  leds: {
    count: number
    rgbw: boolean
    fps: number
    maxseg: number
  }
  mac: string
  ip: string
  wifi: { signal: number; channel: number }
  fxcount: number
  palcount: number
  arch: string
  freeheap: number
  uptime: number
}
