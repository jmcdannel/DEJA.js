import type { ThemeDefinition } from 'vuetify'
import type { AppThemeConfig, ThemeMode } from './types'
import { THEME_MODES, THEME_MODE_DEFINITIONS } from './modes'

/** Shared semantic colors — adjusted per mode */
const SEMANTIC_COLORS: Record<ThemeMode, Record<string, string>> = {
  light: {
    error: '#FF1744',
    info: '#2979FF',
    success: '#00E676',
    warning: '#FF9100',
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
    warning: '#FFA500',
  },
}

/**
 * Generate all registered Vuetify themes from an app's identity colors.
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

    // Apply color transform if defined (e.g. high-contrast saturates)
    const primary = modeDef.colorTransform
      ? modeDef.colorTransform(config.primary)
      : config.primary
    const secondary = modeDef.colorTransform
      ? modeDef.colorTransform(config.secondary)
      : config.secondary
    const accent = modeDef.colorTransform
      ? modeDef.colorTransform(config.accent)
      : config.accent

    themes[mode] = {
      dark: modeDef.dark,
      colors: {
        // 1. Base backgrounds/surfaces from mode definition
        ...modeDef.backgrounds,
        // 2. On-surface defaults
        'on-surface-variant': mode === 'high-contrast' ? '#FFFFFF' : modeDef.dark ? '#E2E8F0' : '#334155',
        // 3. Identity colors
        primary,
        secondary,
        accent,
        // 4. Semantic colors (adjusted per mode)
        ...semantics,
        // 5. Per-mode overrides from app config
        ...modeOverrides,
        // 6. Custom colors for this mode
        ...customColors,
      },
      variables: {
        ...modeDef.variables,
      },
    }
  }

  return themes
}
