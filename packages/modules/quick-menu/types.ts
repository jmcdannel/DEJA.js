export interface QuickMenuItem {
  id: string
  label: string
  icon: string
  color: string
  routeName: string
  section: 'operate' | 'configure' | 'system'
}

export type QuickMenuPanel = 'throttles' | 'cloud' | null
