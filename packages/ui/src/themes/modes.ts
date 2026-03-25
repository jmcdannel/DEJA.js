import type { ThemeMode, ThemeVariables } from './types'

/** Definition for a single theme mode */
export interface ThemeModeDefinition {
  /** Vuetify dark flag */
  dark: boolean
  /** CSS classes to add to <html> when this mode is active */
  htmlClasses: string[]
  /** Base background/surface colors for this mode */
  backgrounds: {
    background: string
    surface: string
    'surface-bright': string
    'surface-light': string
    'surface-variant': string
  }
  /** Vuetify variables for this mode */
  variables: ThemeVariables
  /** How to transform identity colors for this mode */
  colorTransform?: (color: string) => string
}

/** Ordered list of theme modes — determines cycle order in useThemeSwitcher */
export const THEME_MODES: ThemeMode[] = ['light', 'dark', 'high-contrast']

/** Mode definitions — the source of truth for all theme behavior */
export const THEME_MODE_DEFINITIONS: Record<ThemeMode, ThemeModeDefinition> = {
  light: {
    dark: false,
    htmlClasses: [],
    backgrounds: {
      background: '#F0F4F8',
      surface: '#FFFFFF',
      'surface-bright': '#FFFFFF',
      'surface-light': '#F0F4F8',
      'surface-variant': '#DAE1EA',
    },
    variables: {
      'border-color': '#000000',
      'border-opacity': 0.15,
      'high-emphasis-opacity': 0.92,
      'medium-emphasis-opacity': 0.68,
      'disabled-opacity': 0.42,
      'idle-opacity': 0.06,
      'hover-opacity': 0.06,
      'focus-opacity': 0.14,
      'selected-opacity': 0.10,
      'activated-opacity': 0.14,
      'pressed-opacity': 0.14,
      'dragged-opacity': 0.10,
      'theme-kbd': '#1E293B',
      'theme-on-kbd': '#FFFFFF',
      'theme-code': '#EEF2F6',
      'theme-on-code': '#1E293B',
    },
  },
  dark: {
    dark: true,
    htmlClasses: ['dark'],
    backgrounds: {
      background: '#0B1120',
      surface: '#111827',
      'surface-bright': '#1F2937',
      'surface-light': '#374151',
      'surface-variant': '#374151',
    },
    variables: {
      'border-color': '#FFFFFF',
      'border-opacity': 0.12,
      'high-emphasis-opacity': 0.87,
      'medium-emphasis-opacity': 0.60,
      'disabled-opacity': 0.38,
      'idle-opacity': 0.04,
      'hover-opacity': 0.04,
      'focus-opacity': 0.12,
      'selected-opacity': 0.08,
      'activated-opacity': 0.12,
      'pressed-opacity': 0.12,
      'dragged-opacity': 0.08,
      'theme-kbd': '#212529',
      'theme-on-kbd': '#FFFFFF',
      'theme-code': '#F5F5F5',
      'theme-on-code': '#000000',
    },
  },
  'high-contrast': {
    dark: true,
    htmlClasses: ['dark', 'high-contrast'],
    backgrounds: {
      background: '#000000',
      surface: '#000000',
      'surface-bright': '#1A1A1A',
      'surface-light': '#0D0D0D',
      'surface-variant': '#0D0D0D',
    },
    variables: {
      'border-color': '#FFFFFF',
      'border-opacity': 0.6,
      'high-emphasis-opacity': 1,
      'medium-emphasis-opacity': 0.9,
      'disabled-opacity': 0.5,
      'idle-opacity': 0.2,
      'hover-opacity': 0.12,
      'focus-opacity': 0.2,
      'selected-opacity': 0.16,
      'activated-opacity': 0.2,
      'pressed-opacity': 0.2,
      'dragged-opacity': 0.16,
      'theme-kbd': '#000000',
      'theme-on-kbd': '#FFFFFF',
      'theme-code': '#0D0D0D',
      'theme-on-code': '#FFFFFF',
    },
  },
}
