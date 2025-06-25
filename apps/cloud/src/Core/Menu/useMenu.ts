import {  useRouter } from 'vue-router'
interface MenuItem {
  label: string;
  icon: string;
  color: string;
}

export function useMenu() {
  const router = useRouter()
  const menuConfig: MenuItem[] = [
    // {
    //   label: 'Dashboard',
    //   icon: 'mdi-view-dashboard',
    //   color: 'violet',
    // },
    {
      label: 'Layout',
      icon: 'mdi-fence',
      color: 'cyan',
    },
    {
      label: 'DCC-EX',
      icon: 'mdi-cpu-64-bit',
      color: 'lime',
    },
    {
      label: 'Roster',
      icon: 'mdi-train',
      color: 'pink',
    },
    {
      label: 'Effects',
      icon: 'mdi-rocket-launch',
      color: 'indigo',
    },
    {
      label: 'Turnouts',
      icon: 'mdi-call-split',
      color: 'amber',
    },
    {
      label: 'Routes',
      icon: 'mdi-map',
      color: 'purple',
    },
    {
      label: 'Signals',
      icon: 'mdi-traffic-light',
      color: 'emerald',
    },
    {
      label: 'Emulator',
      icon: 'mdi-console',
      color: 'rose',
    },
    {
      label: 'Settings',
      icon: 'mdi-cog',
      color: 'blue',
    },
  ]

  function handleMenu(item:MenuItem) {
    router.push({ name: item.label })
  }

  function getMenuItem(label: string) {
    return menuConfig.find((item) => item.label === label)
  }

  return {
    menu: menuConfig,
    getMenuItem,
    handleMenu,
    currentItem: router.currentRoute.value.name,
  }
}

export default useMenu
