export function useMenu() {
  const menuConfig = [
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

  function getMenuItem(label: string) {
    return menuConfig.find((item) => item.label === label)
  }

  return {
    menu: menuConfig,
    getMenuItem,
  }
}

export default useMenu
