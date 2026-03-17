/** The supported theme modes */
export type ThemeMode = 'light' | 'dark' | 'high-contrast'

/** Any Vuetify theme color that can be overridden */
export interface ThemeOverrides {
  background: string
  surface: string
  'surface-bright': string
  'surface-light': string
  'surface-variant': string
  'on-surface': string
  'on-surface-variant': string
  primary: string
  secondary: string
  accent: string
  error: string
  info: string
  success: string
  warning: string
  [key: string]: string
}

/** Vuetify theme variables (opacity, border, hover, kbd/code styling) */
export interface ThemeVariables {
  'border-color': string
  'border-opacity': number
  'high-emphasis-opacity': number
  'medium-emphasis-opacity': number
  'disabled-opacity': number
  'idle-opacity': number
  'hover-opacity': number
  'focus-opacity': number
  'selected-opacity': number
  'activated-opacity': number
  'pressed-opacity': number
  'dragged-opacity': number
  'theme-kbd': string
  'theme-on-kbd': string
  'theme-code': string
  'theme-on-code': string
  [key: string]: string | number
}

/** Colors that define an app's visual identity */
export interface AppThemeConfig {
  /** App's primary brand color (e.g. '#00E5FF') */
  primary: string
  /** App's secondary brand color (e.g. '#D500F9') */
  secondary: string
  /** App's accent color (e.g. '#C6FF00') */
  accent: string
  /** Per-mode overrides for any theme color */
  light?: Partial<ThemeOverrides>
  dark?: Partial<ThemeOverrides>
  'high-contrast'?: Partial<ThemeOverrides>
  /** App-specific custom colors per mode (e.g. device-connected, stat-card) */
  custom?: Partial<Record<ThemeMode, Record<string, string>>>
}
