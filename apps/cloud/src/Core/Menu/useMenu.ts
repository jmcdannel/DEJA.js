import {  useRouter } from 'vue-router'
interface MenuItem {
  color: string;
  icon: string;
  label: string;
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
      color: 'cyan',
      icon: 'mdi-fence',
      label: 'Layout',
    },
    {
      color: 'lime',
      icon: 'mdi-cpu-64-bit',
      label: 'DCC-EX',
    },
    {
      color: 'pink',
      icon: 'mdi-train',
      label: 'Roster',
    },
    {
      color: 'indigo',
      icon: 'mdi-rocket-launch',
      label: 'Effects',
    },
    {
      color: 'amber',
      icon: 'mdi-call-split',
      label: 'Turnouts',
    },
    {
      color: 'purple',
      icon: 'mdi-map',
      label: 'Routes',
    },
    {
      color: 'emerald',
      icon: 'mdi-traffic-light',
      label: 'Signals',
    },
    {
      color: 'rose',
      icon: 'mdi-console',
      label: 'Emulator',
    },
    {
      color: 'blue',
      icon: 'mdi-cog',
      label: 'Settings',
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
