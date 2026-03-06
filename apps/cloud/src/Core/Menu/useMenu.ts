import {  useRouter } from 'vue-router'
import type { MenuItem } from '@repo/ui/src/Menu/types'


export function useMenu() {
  const router = useRouter()
  const menuConfig: MenuItem[] = [
    // {
    //   label: 'Dashboard',
    //   icon: 'mdi-view-dashboard',
    //   color: 'violet',
    // },
    {
      color: 'cyan',
      icon: 'mdi-fence',
      label: 'Layout',
      name: 'layout',
    },
    {
      color: 'lime',
      icon: 'mdi-cpu-64-bit',
      label: 'DCC-EX',
      name: 'dcc-ex',
    },
    {
      color: 'pink',
      icon: 'mdi-train',
      label: 'Roster',
      name: 'roster',
    },
    {
      color: 'indigo',
      icon: 'mdi-rocket-launch',
      label: 'Effects',
      name: 'effects',
    },
    {
      color: 'amber',
      icon: 'mdi-call-split',
      label: 'Turnouts',
      name: 'turnouts',
    },
    {
      color: 'purple',
      icon: 'mdi-map',
      label: 'Routes',
      name: 'routes',
    },
    {
      color: 'emerald',
      icon: 'mdi-traffic-light',
      label: 'Signals',
      name: 'signals',
    },
    {
      color: 'rose',
      icon: 'mdi-console',
      label: 'Emulator',
      name: 'emulator',
    },
    {
      color: 'blue',
      icon: 'mdi-cog',
      label: 'Settings',
      name: 'settings',
    },
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
