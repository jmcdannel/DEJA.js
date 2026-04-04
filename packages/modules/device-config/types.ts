// 🔧 Input types for device config generators

import type { Device } from '../layouts/types'
import type { Effect } from '../effects/types'
import type { Turnout } from '../turnouts/types'

/**
 * Base input for all config generators — a device with its associated effects and turnouts.
 * This is what you get back from a Firestore query for a specific device.
 */
export interface DeviceConfigInput {
  device: Device
  effects: Effect[]
  turnouts: Turnout[]
}

/**
 * Arduino config.h generator input.
 * Extends base with optional hardware feature flags.
 */
export interface ArduinoConfigInput extends DeviceConfigInput {
  enablePwm?: boolean
  enableSignals?: boolean
  enableSensors?: boolean
  sensorPins?: string[]
  signalPins?: number[]
}

/**
 * Pico W settings.toml + config.json generator input.
 * Extends base with WiFi/MQTT connection details.
 */
export interface PicoConfigInput extends DeviceConfigInput {
  wifiSsid?: string
  wifiPassword?: string
  mqttBroker?: string
  topicId?: string
  layoutId: string
}
