import {
  BsFillLightningChargeFill,
  BsUsbSymbol,
  BsCloud,
  BsColumnsGap,
  BsFillHouseGearFill,
  BsCloudFill,
  BsBezier2,
  BsBoxes,
  BsCpu,
  BsUsbPlug,
  BsUsbPlugFill,
  BsFillMapFill,
  BsFan,
  BsFillGearFill,
  BsFillRocketTakeoffFill,
  BsFillTrainFreightFrontFill,
  BsCompass,
  BsFillStoplightsFill,
  BsSignpost2,
  BsFillSignpostSplitFill,
  BsCupHotFill,
} from 'vue3-icons/bs'

export function useMenu() {
  const menuConfig = [
    {
      label: 'Dashboard',
      icon: BsColumnsGap,
      color: 'violet',
    },
    {
      label: 'Layout',
      icon: BsFillHouseGearFill,
      color: 'cyan',
    },
    {
      label: 'DCC-EX',
      icon: BsCpu,
      color: 'lime',
    },
    {
      label: 'Roster',
      icon: BsFillTrainFreightFrontFill,
      color: 'pink',
    },
    {
      label: 'Effects',
      icon: BsFillRocketTakeoffFill,
      color: 'indigo',
    },
    {
      label: 'Turnouts',
      icon: BsBezier2,
      color: 'amber',
    },
    {
      label: 'Routes',
      icon: BsFillMapFill,
      color: 'purple',
    },
    {
      label: 'Signals',
      icon: BsFillStoplightsFill,
      color: 'emerald',
    },
    {
      label: 'Emulator',
      icon: BsCupHotFill,
      color: 'rose',
    },
    {
      label: 'Settings',
      icon: BsFillGearFill,
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
