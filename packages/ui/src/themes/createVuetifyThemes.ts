import type { ThemeDefinition } from 'vuetify'
import type { AppThemeConfig, ThemeMode } from './types'
import { THEME_MODES, THEME_MODE_DEFINITIONS } from './modes'
import { ensureContrast, WCAG } from './a11y'

/**
 * Semantic colors per mode.
 *
 * 🔑 Light mode uses darker variants that meet WCAG AA (4.5:1) on white.
 * Dark mode keeps the vivid neons that pop on dark backgrounds.
 * High-contrast uses pure, maximally saturated colors on black.
 */
const SEMANTIC_COLORS: Record<ThemeMode, Record<string, string>> = {
  light: {
    error: '#C62828',
    info: '#1565C0',
    success: '#2E7D32',
    warning: '#BF360C',
  },
  dark: {
    error: '#FF1744',
    info: '#2979FF',
    success: '#00E676',
    warning: '#FF9100',
  },
  'high-contrast': {
    error: '#FF0000',
    info: '#00BFFF',
    success: '#00FF00',
    warning: '#FFD600',
  },
}

/**
 * Generate all registered Vuetify themes from an app's identity colors.
 *
 * ✨ Automatically adjusts colors to meet WCAG AA contrast ratios:
 * - Light mode: identity + semantic colors are darkened to be readable on white
 * - High-contrast mode: identity colors are replaced with pure white
 *   (user-defined custom colors are preserved as-is)
 *
 * @param config - The app's identity colors and optional per-mode overrides
 * @returns Record<ThemeMode, ThemeDefinition> — one theme per registered mode
 */
export function createVuetifyThemes(
  config: AppThemeConfig
): Record<string, ThemeDefinition> {
  const themes: Record<string, ThemeDefinition> = {}

  for (const mode of THEME_MODES) {
    const modeDef = THEME_MODE_DEFINITIONS[mode]
    const modeOverrides = config[mode] ?? {}
    const customColors = config.custom?.[mode] ?? {}
    const semantics = SEMANTIC_COLORS[mode]
    const bg = modeDef.backgrounds.background
    const surface = modeDef.backgrounds.surface

    let primary: string
    let secondary: string
    let accent: string

    if (mode === 'high-contrast') {
      // ⬛⬜ High-contrast: strip identity colors to pure white.
      // Only user-chosen custom colors retain color.
      primary = '#FFFFFF'
      secondary = '#FFFFFF'
      accent = '#FFFFFF'
    } else {
      // Apply color transform if defined, then ensure contrast
      primary = modeDef.colorTransform
        ? modeDef.colorTransform(config.primary)
        : config.primary
      secondary = modeDef.colorTransform
        ? modeDef.colorTransform(config.secondary)
        : config.secondary
      accent = modeDef.colorTransform
        ? modeDef.colorTransform(config.accent)
        : config.accent

      if (!modeDef.dark) {
        // 🌞 Light mode: ensure identity colors are readable on the surface
        primary = ensureContrast(modeOverrides.primary ?? primary, surface, WCAG.AA_LARGE)
        secondary = ensureContrast(modeOverrides.secondary ?? secondary, surface, WCAG.AA_LARGE)
        accent = ensureContrast(modeOverrides.accent ?? accent, surface, WCAG.AA_LARGE)
      }
    }

    // Build on-surface-variant per mode
    const onSurfaceVariant = mode === 'high-contrast'
      ? '#FFFFFF'
      : modeDef.dark
        ? '#E2E8F0'
        : '#334155'

    themes[mode] = {
      dark: modeDef.dark,
      colors: {
        // 1. Base backgrounds/surfaces from mode definition
        ...modeDef.backgrounds,
        // 2. On-surface defaults
        'on-surface-variant': onSurfaceVariant,
        // 3. Identity colors (adjusted for contrast)
        primary,
        secondary,
        accent,
        // 4. Semantic colors (already tuned per mode)
        ...semantics,
        // 5. Per-mode overrides from app config (identity overrides already folded in for light)
        ...(modeDef.dark ? modeOverrides : omitKeys(modeOverrides, ['primary', 'secondary', 'accent'])),
        // 6. Custom colors for this mode (preserved as-is — user controls these)
        ...customColors,
      },
      variables: {
        ...modeDef.variables,
      },
    }
  }

  return themes
}

/** Remove specific keys from an object (shallow) */
function omitKeys<T extends Record<string, unknown>>(
  obj: T,
  keys: string[],
): Partial<T> {
  const result = { ...obj }
  for (const key of keys) {
    delete result[key as keyof T]
  }
  return result
}
