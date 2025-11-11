import type { LayoutDefaultSound } from './types'

export const deviceTypes = [
  {
    value: 'dcc-ex',
    label: 'DCC-EX CommandStation',
    icon: 'mdi-memory',
    image: '/dcc-ex/android-chrome-192x192.png',
    color: 'yellow',
  },
  {
    value: 'deja-arduino',
    label: 'DJEA Adrduino (MEGA)',
    icon: 'mdi-usb',
    color: 'lime',
  },
  {
    value: 'deja-arduino-led',
    label: 'DEJA LED Arduino',
    icon: 'mdi-led-strip',
    color: 'teal',
  },
  {
    value: 'deja-mqtt',
    label: 'DEJA MQTT (Pico W)',
    icon: 'mdi-wifi',
    color: 'blue',
  },
  {
    value: 'deja-server',
    label: 'DEJA Server',
    icon: 'mdi-server',
    color: 'purple',
  },
]

export const defaultLayoutSounds: LayoutDefaultSound[] = [
  { effectId: 'deja-server-sound-default-horn', label: 'Horn', icon: 'mdi-bullhorn' },
  { effectId: 'bell', label: 'Bell', icon: 'mdi-bell' },
  { effectId: 'coupler', label: 'Coupler', icon: 'mdi-link-variant' },
  { effectId: 'wheel-squeal', label: 'Wheel Squeal', icon: 'mdi-sine-wave' },
]
