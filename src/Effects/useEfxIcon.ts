import { BsStars, BsBoombox } from 'vue3-icons/bs'
import {
  FaBullhorn,
  FaTrafficLight,
  FaFrog,
  FaVolumeMute,
  FaVolumeDown,
  FaVolumeUp,
  FaMicrophoneAlt,
} from 'vue3-icons/fa'
import { GiBusStop, GiStreetLight } from 'vue3-icons/gi'
import {
  PiPower,
  PiHeadlightsFill,
  PiBellFill,
  PiFan,
  PiSunDimLight,
} from 'vue3-icons/pi'
import { SiRelay } from 'vue3-icons/si'
import { TbTrack, TbBrightnessDownFilled } from 'vue3-icons/tb'

import { BsSignStopFill, BsWind } from 'vue3-icons/bs'

import { RiTrainWifiFill } from 'vue3-icons/ri'

const DEFAULT_ICON = RiTrainWifiFill

const icons = [
  { name: 'light', icon: PiHeadlightsFill },
  { name: 'led', icon: TbBrightnessDownFilled },
  { name: 'streetlight', icon: GiStreetLight },
  { name: 'relay', icon: SiRelay },
  { name: 'frog', icon: FaFrog },
  { name: 'power', icon: PiPower },
  { name: 'pin', icon: PiSunDimLight },
  { name: 'sound', icon: BsBoombox },
  { name: 'signal', icon: FaTrafficLight },
  { name: 'magic', icon: BsStars },
]
export function useEfxIcon() {
  console.log('useEfxIcon')
  function getIconComponent(name: string) {
    if (!name) {
      return
    }
    const icon = icons.find((icon) => icon.name === name)
    return icon ? icon.icon : DEFAULT_ICON
  }

  function getAllIcons() {
    return icons
  }

  return {
    getIconComponent,
    getAllIcons,
  }
}
export default useEfxIcon
