import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { MenuItem } from '@repo/ui/src/Menu/types'
import { useFeatureFlags } from '@repo/modules'


export function useMenu() {
  const router = useRouter()
  const { isEnabled } = useFeatureFlags()

  const menuConfig: MenuItem[] = [
    // Dashboard commented out — leave as-is
    // { label: 'Dashboard', icon: 'mdi-view-dashboard', color: 'violet' },

    // Modules
    { color: 'pink',    icon: 'mdi-train',           label: 'Roster',         name: 'roster',         section: 'modules' },
    { color: 'amber',   icon: 'mdi-call-split',      label: 'Turnouts',       name: 'turnouts',       section: 'modules' },
    { color: 'purple',  icon: 'mdi-map',             label: 'Routes',         name: 'routes',         section: 'modules', feature: 'routes' },
    { color: 'indigo',  icon: 'mdi-rocket-launch',   label: 'Effects',        name: 'effects',        section: 'modules' },
    { color: 'emerald', icon: 'mdi-traffic-light',   label: 'Signals',        name: 'signals',        section: 'modules' },
    { color: 'sky',     icon: 'mdi-volume-high',     label: 'Sounds',         name: 'sounds',         section: 'modules', feature: 'sounds' },
    { color: 'violet',  icon: 'mdi-map-marker-path', label: 'Track Diagrams', name: 'track-diagrams', section: 'modules', feature: 'trackDiagrams' },

    // Hardware
    { color: 'teal',    icon: 'mdi-access-point',    label: 'Sensors',        name: 'sensors',        section: 'hardware', feature: 'sensors' },
    { color: 'cyan',    icon: 'mdi-developer-board', label: 'Devices',        name: 'devices',        section: 'hardware' },
    { color: 'yellow',  icon: 'mdi-lightning-bolt',   label: 'Power Districts', name: 'power-districts', section: 'hardware', feature: 'powerDistricts' },
    { color: 'lime',    icon: 'mdi-cpu-64-bit',      label: 'DCC-EX',         name: 'dcc-ex',         section: 'hardware' },

    // System
    { color: 'cyan',    icon: 'mdi-lan-connect',     label: 'Connect',        name: 'connect',        section: 'system' },
    { color: 'blue',    icon: 'mdi-cog',             label: 'Settings',       name: 'settings',       section: 'system' },
  ]

  // 🚩 All items visible — gated items show with badge in nav drawer
  const menu = computed(() =>
    menuConfig.map(item => ({
      ...item,
      gated: item.feature ? !isEnabled(item.feature) : false,
    }))
  )

  function handleMenu(item: MenuItem) {
    router.push({ name: item.label })
  }

  function getMenuItem(label: string) {
    return menuConfig.find((item) => item.label === label)
  }

  return {
    getMenuItem,
    handleMenu,
    menu,
  }
}

export default useMenu
