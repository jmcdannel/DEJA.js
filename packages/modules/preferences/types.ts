export interface AppBackgroundPrefs {
  default: string
  pages: Record<string, string>
}

export type ThrottleVariant = 'buttons' | 'slider' | 'protothrottle'

export interface ThrottleSettings {
  variant: ThrottleVariant
  showFunctions: boolean
  showSpeedometer: boolean
  showConsist: boolean
}

export interface UserPreferences {
  backgrounds: {
    [appName: string]: AppBackgroundPrefs
  }
  throttleSettings?: ThrottleSettings
}
