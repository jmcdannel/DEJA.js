export interface AppBackgroundPrefs {
  default: string
  pages: Record<string, string>
}

export interface UserPreferences {
  backgrounds: {
    [appName: string]: AppBackgroundPrefs
  }
}
