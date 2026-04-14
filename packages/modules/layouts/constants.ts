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
  'deja-mqtt-diy',
  'deja-esp32-wifi',
]

/** Check whether a device type uses WiFi/MQTT (and therefore needs WiFi creds + MQTT broker config). */
export function isWifiDeviceType(type: string | undefined): boolean {
  return WIFI_DEVICE_TYPES.includes(type as Device['type'])
}

/**
 * 🔎 Resolve the display metadata (icon, color, label, image) for a given
 * device. Centralized so the connect card, server panel, advanced config,
 * device picker chip, and device picker grid all stay visually consistent.
 *
 * Falls back to a neutral grey helper icon when the device type isn't found
 * (e.g. during migration / unknown stored value).
 */
export function getDeviceTypeMeta(device: { type?: string } | null | undefined) {
  const fallback = {
    value: '',
    label: 'Unknown device',
    icon: 'mdi-help-circle-outline',
    color: 'grey',
    image: undefined as string | undefined,
  }
  if (!device?.type) return fallback
  const match = deviceTypes.find((d) => d.value === device.type)
  if (!match) return { ...fallback, value: device.type, label: device.type }
  return {
    value: match.value,
    label: match.label,
    icon: match.icon,
    color: match.color,
    image: (match as { image?: string }).image,
  }
}

// 📛 Display catalog for every supported device type. The `value` is the
// stable internal id that lives in Firestore and the server switch
// statements; the `label` is what users see in pickers, cards, and the
// devices page.
//
// ⚠️ One historical quirk: the `deja-mqtt` id was originally assigned to the
// Pico W (the only MQTT device that existed at the time). Rather than
// migrating every Firestore device doc, we keep that id for the Pico W and
// introduce a new `deja-mqtt-diy` id for the generic DIY MQTT device users
// can bring to the layout following the documented command protocol. The id
// is arbitrary — users see the label, which is what matters.
export const deviceTypes = [
  {
    value: 'dcc-ex',
    label: 'EX-CommandStation',
    icon: 'mdi-memory',
    image: '/dcc-ex/android-chrome-192x192.png',
    color: 'yellow',
  },
  {
    value: 'deja-arduino',
    label: 'DEJA Arduino Mega USB',
    icon: 'mdi-usb',
    color: 'lime',
  },
  {
    value: 'deja-esp32',
    label: 'DEJA Arduino ESP32 USB',
    icon: 'mdi-chip',
    color: 'orange',
  },
  {
    value: 'deja-esp32-wifi',
    label: 'DEJA Arduino ESP32 WIFI',
    icon: 'mdi-chip',
    color: 'cyan',
  },
  {
    value: 'deja-mqtt',
    label: 'DEJA Pico W WIFI',
    icon: 'mdi-raspberry-pi',
    color: 'blue',
  },
  {
    value: 'deja-arduino-led',
    label: 'DEJA LED',
    icon: 'mdi-led-strip',
    color: 'teal',
  },
  {
    value: 'deja-mqtt-diy',
    label: 'DEJA MQTT',
    icon: 'mdi-broadcast',
    color: 'indigo',
  },
  {
    value: 'deja-server',
    label: 'deja-server',
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
