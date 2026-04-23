export interface AppBackgroundPrefs {
  default: string
  pages: Record<string, string>
}

export type ThrottleVariant = 'buttons' | 'slider' | 'dashboard'
export type TileVariant = 'default' | 'dashboard'
export type SpeedDisplayType = 'dial' | 'digital'

export type ConductorRightPanel = 'turnouts' | 'effects' | 'signals' | 'devices' | 'routes'

export interface ThrottleSettings {
  variant: ThrottleVariant
  tileVariant?: TileVariant
  speedDisplayType: SpeedDisplayType
  showFunctions: boolean
  showSpeedometer: boolean
  showConsist: boolean
  rightPanel?: ConductorRightPanel
}

export interface UserPreferences {
  backgrounds: {
    [appName: string]: AppBackgroundPrefs
  }
  throttleSettings?: ThrottleSettings
}
