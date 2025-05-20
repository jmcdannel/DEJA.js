import {
  PiHeadlightsFill,
  PiBellFill,
  PiFan,
  PiSunDimLight,
} from 'vue3-icons/pi'
import {
  FaBullhorn,
  FaRegStar,
  FaStar,
  FaVolumeMute,
  FaVolumeDown,
  FaVolumeUp,
  FaMicrophoneAlt,
} from 'vue3-icons/fa'
import { PiPlugsConnectedBold } from 'vue3-icons/pi'
import { TbTrack } from 'vue3-icons/tb'

import { GiBusStop } from 'vue3-icons/gi'

import { BsSignStopFill, BsWind } from 'vue3-icons/bs'

import { RiTrainWifiFill } from 'vue3-icons/ri'
const icons = [
  { name: 'light', icon: PiHeadlightsFill },
  { name: 'bell', icon: PiBellFill },
  { name: 'horn', icon: FaBullhorn },
  { name: 'wifi', icon: RiTrainWifiFill },
  { name: 'coupler', icon: PiPlugsConnectedBold },
  { name: 'fan', icon: PiFan },
  { name: 'brake', icon: BsSignStopFill },
  { name: 'station', icon: GiBusStop },
  { name: 'mute', icon: FaVolumeMute },
  { name: 'quiet', icon: FaVolumeDown },
  { name: 'sound', icon: FaVolumeUp },
  { name: 'track', icon: TbTrack },
  { name: 'air', icon: BsWind },
  { name: 'announce', icon: FaMicrophoneAlt },
  { name: 'dim', icon: PiSunDimLight },
]
export function useFunctionIcon() {
  function getIconComponent(name: string) {
    if (!name) {
      return
    }
    const icon = icons.find((icon) => icon.name === name)
    return icon ? icon.icon : RiTrainWifiFill
  }

  function getAllIcons() {
    return icons
  }

  return {
    getIconComponent,
    getAllIcons,
  }
}
export default useFunctionIcon
