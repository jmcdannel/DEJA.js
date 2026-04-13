import type { Device, LayoutDefaultSound } from './types'

/** Device types that use Arduino-family firmware (compile via arduino-cli or PlatformIO). */
export const ARDUINO_FAMILY_TYPES: Device['type'][] = [
  'deja-arduino',
  'deja-arduino-led',
  'deja-esp32',
  'deja-esp32-wifi',
]

/** Check whether a device type uses Arduino-family firmware. */
export function isArduinoFamilyType(type: string | undefined): boolean {
  return ARDUINO_FAMILY_TYPES.includes(type as Device['type'])
}

/** 📡 Device types that connect over WiFi/MQTT instead of USB serial. */
export const WIFI_DEVICE_TYPES: Device['type'][] = [
  'deja-mqtt',
  'deja-esp32-wifi',
]

/** Check whether a device type uses WiFi/MQTT (and therefore needs WiFi creds + MQTT broker config). */
export function isWifiDeviceType(type: string | undefined): boolean {
  return WIFI_DEVICE_TYPES.includes(type as Device['type'])
}

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
    label: 'DEJA Arduino (MEGA)',
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
    value: 'deja-esp32',
    label: 'DEJA ESP32',
    icon: 'mdi-chip',
    color: 'orange',
  },
  {
    value: 'deja-esp32-wifi',
    label: 'DEJA ESP32 WiFi',
    icon: 'mdi-chip',
    color: 'cyan',
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
    icon: 'mdi-console',
    color: 'purple',
  },
]

export const defaultLayoutSounds: LayoutDefaultSound[] = [
  { effectId: 'deja-server-sound-default-horn', label: 'Horn', icon: 'mdi-bullhorn' },
  { effectId: 'bell', label: 'Bell', icon: 'mdi-bell' },
  { effectId: 'coupler', label: 'Coupler', icon: 'mdi-link-variant' },
  { effectId: 'wheel-squeal', label: 'Wheel Squeal', icon: 'mdi-sine-wave' },
]
