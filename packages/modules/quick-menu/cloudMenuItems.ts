import type { QuickMenuItem } from './types'

export const CLOUD_MENU_ITEMS: QuickMenuItem[] = [
  // Operate
  { id: 'locos', label: 'Locos', icon: 'mdi-train', color: 'pink', routeName: 'roster', section: 'operate' },
  { id: 'effects', label: 'Effects', icon: 'mdi-rocket-launch', color: 'indigo', routeName: 'effects', section: 'operate' },
  { id: 'routes', label: 'Routes', icon: 'mdi-map', color: 'purple', routeName: 'routes', section: 'operate' },
  { id: 'turnouts', label: 'Turnouts', icon: 'mdi-call-split', color: 'amber', routeName: 'turnouts', section: 'operate' },
  { id: 'signals', label: 'Signals', icon: 'mdi-traffic-light', color: 'emerald', routeName: 'signals', section: 'operate' },
  // Configure
  { id: 'connections', label: 'Connect', icon: 'mdi-server-network', color: 'teal', routeName: 'connect', section: 'configure' },
  { id: 'programming', label: 'Program', icon: 'mdi-chip', color: 'orange', routeName: 'programming', section: 'configure' },
  // System
  { id: 'settings', label: 'Settings', icon: 'mdi-cog', color: 'blue', routeName: 'settings', section: 'system' },
]
