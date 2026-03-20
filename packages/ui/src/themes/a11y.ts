/**
 * 🎨 Accessibility color utilities powered by color2k.
 *
 * Provides WCAG contrast checking and automatic color adjustment
 * to ensure all theme colors meet accessibility guidelines.
 */
import { getContrast, darken, lighten, toHex, hasBadContrast } from 'color2k'

/** WCAG 2.1 minimum contrast ratios */
export const WCAG = {
  /** Normal text (< 18pt or < 14pt bold) */
  AA: 4.5,
  /** Large text (≥ 18pt or ≥ 14pt bold) */
  AA_LARGE: 3,
  /** Enhanced contrast for normal text */
  AAA: 7,
  /** Enhanced contrast for large text */
  AAA_LARGE: 4.5,
  /** Non-text elements (icons, borders, UI controls) */
  UI: 3,
} as const

export type WcagLevel = keyof typeof WCAG

/**
 * Check if a foreground/background pair meets a WCAG contrast level.
 */
export function meetsContrast(fg: string, bg: string, level: WcagLevel = 'AA'): boolean {
  return getContrast(fg, bg) >= WCAG[level]
}

/**
 * Get a detailed contrast report for a color pair.
 */
export function contrastReport(fg: string, bg: string) {
  const ratio = getContrast(fg, bg)
  return {
    ratio: Math.round(ratio * 100) / 100,
    aa: ratio >= WCAG.AA,
    aaLarge: ratio >= WCAG.AA_LARGE,
    aaa: ratio >= WCAG.AAA,
    aaaLarge: ratio >= WCAG.AAA_LARGE,
    ui: ratio >= WCAG.UI,
  }
}

/**
 * 🔧 Adjust a color to meet a minimum contrast ratio against a background.
 *
 * Iteratively darkens or lightens the color until the target ratio is met.
 * On light backgrounds, colors are darkened. On dark backgrounds, lightened.
 *
 * @param color - The color to adjust
 * @param background - The background it will be displayed on
 * @param targetRatio - Minimum contrast ratio (default: WCAG AA = 4.5)
 * @param maxIterations - Safety limit for the adjustment loop
 * @returns The adjusted color as a hex string
 */
export function ensureContrast(
  color: string,
  background: string,
  targetRatio: number = WCAG.AA,
  maxIterations: number = 30,
): string {
  let current = color
  const ratio = getContrast(current, background)

  if (ratio >= targetRatio) return toHex(current)

  // Determine direction: darken on light bg, lighten on dark bg
  const bgIsLight = getContrast(background, '#000000') > getContrast(background, '#FFFFFF')
  const adjust = bgIsLight ? darken : lighten
  const step = 0.03

  for (let i = 0; i < maxIterations; i++) {
    current = adjust(current, step)
    if (getContrast(current, background) >= targetRatio) break
  }

  return toHex(current)
}

/**
 * 🔧 Ensure a color meets contrast for UI elements (3:1 ratio).
 * Useful for borders, icons, and non-text decorative elements.
 */
export function ensureUIContrast(color: string, background: string): string {
  return ensureContrast(color, background, WCAG.UI)
}

/**
 * Check if a color has bad contrast against a background at a given standard.
 * Wraps color2k's hasBadContrast with our WCAG level mapping.
 */
export function isBadContrast(
  color: string,
  background: string,
  level: 'decorative' | 'readable' | 'aa' | 'aaa' = 'aa',
): boolean {
  return hasBadContrast(color, level, background)
}

/**
 * 🎯 Batch-adjust a record of colors to meet contrast against a background.
 * Returns a new record with all colors adjusted.
 */
export function ensureAllContrast(
  colors: Record<string, string>,
  background: string,
  targetRatio: number = WCAG.AA,
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(colors)) {
    result[key] = ensureContrast(value, background, targetRatio)
  }
  return result
}
