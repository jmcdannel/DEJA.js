import {  useRouter } from 'vue-router'
import type { MenuItem } from '@repo/ui/src/Menu/types'


export function useMenu() {
  const router = useRouter()
  const menuConfig: MenuItem[] = [
    // Dashboard commented out — leave as-is
    // { label: 'Dashboard', icon: 'mdi-view-dashboard', color: 'violet' },

    // Modules
    { color: 'pink',    icon: 'mdi-train',           label: 'Roster',   name: 'roster',   section: 'modules' },
    { color: 'amber',   icon: 'mdi-call-split',      label: 'Turnouts', name: 'turnouts', section: 'modules' },
    { color: 'purple',  icon: 'mdi-map',             label: 'Routes',   name: 'routes',   section: 'modules' },
    { color: 'indigo',  icon: 'mdi-rocket-launch',   label: 'Effects',  name: 'effects',  section: 'modules' },
    { color: 'emerald', icon: 'mdi-traffic-light',   label: 'Signals',  name: 'signals',  section: 'modules' },
    { color: 'sky',     icon: 'mdi-volume-high',     label: 'Sounds',   name: 'sounds',   section: 'modules' },

    // Hardware
    { color: 'teal',    icon: 'mdi-access-point',    label: 'Sensors',  name: 'sensors',  section: 'hardware' },
    { color: 'cyan',    icon: 'mdi-developer-board', label: 'Devices',  name: 'devices',  section: 'hardware' },
    { color: 'lime',    icon: 'mdi-cpu-64-bit',      label: 'DCC-EX',   name: 'dcc-ex',   section: 'hardware' },

    // System
    { color: 'blue',    icon: 'mdi-cog',             label: 'Settings', name: 'settings', section: 'system' },
    { color: 'rose',    icon: 'mdi-console',         label: 'Emulator', name: 'emulator', section: 'system' },
  ]

  function handleMenu(item:MenuItem) {
    router.push({ name: item.label })
  }

  function getMenuItem(label: string) {
    return menuConfig.find((item) => item.label === label)
  }

  return {
    getMenuItem,
    handleMenu,
    menu: menuConfig,
  }
}

export default useMenu
