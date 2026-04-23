/** RGB color object — Firestore-safe (no nested arrays) */
export interface RgbColor {
  r: number
  g: number
  b: number
}

/** Convert RgbColor to [r, g, b] tuple for WLED JSON API */
export function rgbToTuple(c: RgbColor): [number, number, number] {
  return [c.r, c.g, c.b]
}

/** Convert [r, g, b] tuple to RgbColor */
export function tupleToRgb(t: [number, number, number]): RgbColor {
  return { r: t[0], g: t[1], b: t[2] }
}

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
  colors: RgbColor[]
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
    colors: [{ r: 255, g: 0, b: 128 }, { r: 0, g: 0, b: 0 }, { r: 0, g: 0, b: 0 }],
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
