export interface AppBackgroundPrefs {
  default: string
  pages: Record<string, string>
}

export type ThrottleVariant = 'buttons' | 'slider' | 'dashboard'

export interface ThrottleSettings {
  variant: ThrottleVariant
  showFunctions: boolean
  showSpeedometer: boolean
  showConsist: boolean
}

export type ConductorRightPanel = 'turnouts' | 'effects' | 'signals' | 'devices' | 'routes'

export interface ConductorSettings {
  variant: ThrottleVariant
  rightPanel: ConductorRightPanel
}

export interface UserPreferences {
  backgrounds: {
    [appName: string]: AppBackgroundPrefs
  }
  throttleSettings?: ThrottleSettings
  conductorSettings?: ConductorSettings
}
