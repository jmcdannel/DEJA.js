// 🍓 Pico W config generator
// Generates settings.toml and config.json for CircuitPython devices

import type { PicoConfigInput } from './types'

/**
 * Generate settings.toml for Pico W (WiFi creds, MQTT broker, layout/device ID).
 * WiFi credentials are NOT stored in Firebase — passed in at generation time.
 *
 * PWM is auto-enabled when any servo turnouts are bound to this device, so
 * runtime servo commands actually drive the PCA9685 (matches esp32-wifi behavior).
 * An explicit `device.config.enablePwm` value still wins if set.
 */
export function generatePicoSettings(input: PicoConfigInput): string {
  const { device, layoutId, turnouts } = input
  const wifiSsid = input.wifiSsid ?? ''
  const wifiPassword = input.wifiPassword ?? ''
  const mqttBroker = input.mqttBroker ?? ''
  const topicId = input.topicId ?? device.topic ?? 'deja'

  const hasServoTurnouts = (turnouts ?? []).some(t => t.type === 'servo')
  const enablePwm = device.config?.enablePwm ?? hasServoTurnouts

  return `# 🍓 DEJA.js Pico W Configuration
# Generated for device: ${device.id}

CIRCUITPY_WIFI_SSID = "${wifiSsid}"
CIRCUITPY_WIFI_PASSWORD = "${wifiPassword}"

ENABLE_CONFIG = "true"
ENABLE_PWM = "${enablePwm ? 'true' : 'false'}"
ENABLE_MQTT = "true"

MQTT_BROKER = "${mqttBroker}"
LAYOUT_ID = "${layoutId}"
DEVICE_ID = "${device.id}"
TOPIC_ID = "${topicId}"
`
}

/**
 * Generate config.json for Pico W (pin → GP mapping from effects).
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
