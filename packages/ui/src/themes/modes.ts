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
      'surface-light': '#F8FAFC',
      'surface-variant': '#E2E8F0',
    },
    variables: {
      'border-color': '#000000',
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
      surface: '#1A1A1A',
      'surface-bright': '#333333',
      'surface-light': '#2A2A2A',
      'surface-variant': '#2A2A2A',
    },
    variables: {
      'border-color': '#FFFFFF',
      'border-opacity': 0.3,
      'high-emphasis-opacity': 1,
      'medium-emphasis-opacity': 0.8,
      'disabled-opacity': 0.5,
      'idle-opacity': 0.2,
      'hover-opacity': 0.08,
      'focus-opacity': 0.16,
      'selected-opacity': 0.12,
      'activated-opacity': 0.16,
      'pressed-opacity': 0.16,
      'dragged-opacity': 0.12,
      'theme-kbd': '#000000',
      'theme-on-kbd': '#FFFFFF',
      'theme-code': '#1A1A1A',
      'theme-on-code': '#FFFFFF',
    },
  },
}
