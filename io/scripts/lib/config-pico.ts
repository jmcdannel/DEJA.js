// 🍓 Pico W config generator
// Generates settings.toml and config.json for CircuitPython devices

import type { DeviceConfig } from './types.js'

export interface PicoConfigInput extends DeviceConfig {
  wifiSsid?: string
  wifiPassword?: string
  mqttBroker?: string
  topicId?: string
  layoutId: string
}

/**
 * Generate settings.toml for Pico W (WiFi creds, MQTT broker, layout/device ID)
 * WiFi credentials are NOT stored in Firebase — passed in at generation time
 */
export function generatePicoSettings(input: PicoConfigInput): string {
  const { device, layoutId } = input
  const wifiSsid = input.wifiSsid ?? ''
  const wifiPassword = input.wifiPassword ?? ''
  const mqttBroker = input.mqttBroker ?? ''
  const topicId = input.topicId ?? device.topic ?? 'deja'

  return `# 🍓 DEJA.js Pico W Configuration
# Generated for device: ${device.id}

CIRCUITPY_WIFI_SSID = "${wifiSsid}"
CIRCUITPY_WIFI_PASSWORD = "${wifiPassword}"

ENABLE_CONFIG = "true"
ENABLE_PWM = "${device.config?.enablePwm === true ? 'true' : 'false'}"
ENABLE_MQTT = "true"

MQTT_BROKER = "${mqttBroker}"
LAYOUT_ID = "${layoutId}"
DEVICE_ID = "${device.id}"
TOPIC_ID = "${topicId}"
`
}

/**
 * Generate config.json for Pico W (pin → GP mapping from effects)
 */
export function generatePicoConfig(input: PicoConfigInput): string {
  const { effects } = input

  const pins: Record<string, string> = {}
  for (const effect of effects) {
    if (effect.pin !== undefined && effect.pin !== null) {
      pins[String(effect.pin)] = `GP${effect.pin}`
    }
  }

  return JSON.stringify({ pins }, null, 2) + '\n'
}
