/** Stored on Effect.wled — the full WLED animation configuration */
export interface WledEffectConfig {
  brightness: number
  transition: number
  segments: WledSegmentConfig[]
}

/** Configuration for a single WLED segment (stored in Firestore) */
export interface WledSegmentConfig {
  start: number
  stop: number
  effectId: number
  effectName: string
  paletteId: number
  paletteName: string
  colors: [number, number, number][]
  speed: number
  intensity: number
  brightness: number
  on: boolean
  reverse: boolean
  mirror: boolean
}

/** Creates a default segment config */
export function createDefaultSegmentConfig(
  start = 0,
  stop = 30
): WledSegmentConfig {
  return {
    start,
    stop,
    effectId: 0,
    effectName: 'Solid',
    paletteId: 0,
    paletteName: 'Default',
    colors: [[255, 0, 128], [0, 0, 0], [0, 0, 0]],
    speed: 128,
    intensity: 128,
    brightness: 255,
    on: true,
    reverse: false,
    mirror: false,
  }
}

/** Creates a default WLED effect config */
export function createDefaultWledConfig(): WledEffectConfig {
  return {
    brightness: 128,
    transition: 7,
    segments: [createDefaultSegmentConfig()],
  }
}
