export interface Tag {
  color?: string
  icon?: string
  id: string
  name: string
}

export interface LayoutDefaultSound {
  effectId: string
  label: string
  icon: string
}
export interface Layout {
  approved?: boolean
  author?: string
  createdAt?: Date
  description?: string
  defaultSounds?: LayoutDefaultSound[]
  devices?: string[]
  effects?: string[]
  id: string
  image?: string
  isArchived?: boolean
  isDefault?: boolean
  isFavorite?: boolean
  isPublic?: boolean
  locos?: string[]
  meta?: Record<string, unknown>
  name: string
  owner?: string
  routes?: string[]
  scripts?: string[]
  sensors?: string[]
  blocks?: string[]
  tags?: Tag[]
  thumbnail?: string
  turnouts?: string[]
  updatedAt?: Date
  version?: string
  dccEx?: {
    power?: boolean
    trackA?: string
    trackB?: string
    LCD2?: string
    LCD3?: string
    client?: string
    isConnected?: boolean
    lastConnected?: Date
  }
  throttleConnection?: {
    type: 'deja-server' | 'withrottle'
    host?: string
    port?: number
  }
}

export interface ServerStatus {
  online: boolean
  lastSeen: Date | number
  version?: string
  ip?: string | null
}

/**
 * 🛠️ Advanced Arduino-family firmware tuning that users can override via the
 * device details "Advanced Configuration" panel. Every field is optional —
 * missing fields fall back to the defaults baked into the firmware/generator,
 * so untouched devices produce byte-identical config.h output.
 *
 * Values here flow into `packages/modules/device-config/arduino-config.ts` at
 * generation time and land in the emitted `config.h` as `#define`s consumed by
 * `io/src/deja-arduino/deja-arduino.ino`.
 */
export interface ArduinoAdvancedConfig {
  // Serial
  /** `Serial.begin(BAUD_RATE)` — default 115200 */
  baudRate?: number

  // Servo pulse range (PCA9685 ticks, 0–4095)
  /** `SERVOMIN` — default 150 */
  servoMin?: number
  /** `SERVOMAX` — default 600 */
  servoMax?: number

  // Servo pulse width (microseconds) — used by getPulseWidth() angle mapping
  /** `MIN_PULSE_WIDTH` — default 650 */
  minPulseWidth?: number
  /** `MAX_PULSE_WIDTH` — default 2350 */
  maxPulseWidth?: number

  // Rounded microsecond min/max — kept for parity with upstream Adafruit example
  /** `USMIN` — default 600 */
  usMin?: number
  /** `USMAX` — default 2400 */
  usMax?: number

  /** `SERVO_FREQ` Hz — default 50 (analog servos) */
  servoFreq?: number
  /** `SERVO_COUNT` — default 16 (PCA9685 channel count) */
  servoCount?: number

  /** `pwm.setOscillatorFrequency()` — default 27_000_000 */
  pwmOscillatorFreq?: number

  // PCA9685 I²C overrides
  /** Custom I²C SDA pin — only honored on ESP32/RP2040 boards */
  pca9685SdaPin?: number
  /** Custom I²C SCL pin — only honored on ESP32/RP2040 boards */
  pca9685SclPin?: number
  /** PCA9685 address on the I²C bus — default 0x40 */
  pca9685Address?: number

  // Sensors
  /** Debounce window in ms for digital sensor reads — default 500 */
  sensorDebounceMs?: number
}

/**
 * 🔧 Per-device, user-editable configuration that persists to Firestore.
 * Extends `Record<string, unknown>` so old flat fields (e.g. `enablePwm` used
 * by Pico W) keep working while we gradually migrate to typed sub-sections.
 */
export interface DeviceConfig extends Record<string, unknown> {
  /** Arduino-family tuning — see ArduinoAdvancedConfig */
  arduino?: ArduinoAdvancedConfig
  /** @deprecated — Pico W flat flag; keep for backward compat */
  enablePwm?: boolean
}

export interface Device {
  autoConnect?: boolean
  client?: string
  config?: DeviceConfig
  connection?: 'usb' | 'wifi'
  description?: string
  id: string
  isConnected?: boolean
  lastConnected?: Date
  maxOutputs?: number
  name: string
  port?: string
  strips?: number[]
  tags?: Tag[]
  timestamp?: Date
  topic?: string
  trackOutputs?: Record<string, import('@repo/dccex').TrackOutput>
  type:
    | 'dcc-ex'
    | 'deja-arduino'
    | 'deja-arduino-led'
    | 'deja-esp32'
    | 'deja-esp32-wifi'
    // 🪪 `deja-mqtt` holds the Pico W id for backward compat (see comment in
    // constants.ts); `deja-mqtt-diy` is the new generic DIY MQTT type.
    | 'deja-mqtt'
    | 'deja-mqtt-diy'
    | 'deja-server'
    | 'wled'
  order?: number
}

export interface DeviceType {
  value: string
  label: string
  icon: string
  color?: string
  image?: string
}

/** @deprecated Use Sensor from sensors/types instead */
export interface LayoutSensor {
  automationId?: string
  blockId?: string
  cooldownMs?: number
  debounceMs?: number
  deviceId: string
  effectId?: string
  enabled: boolean
  id: string
  index: number
  invertState?: boolean
  maxRetries?: number
  pin?: number
  pullup?: boolean
  retryWindowMs?: number
  state: boolean
  type?: string
}
