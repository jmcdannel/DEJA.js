// 🔧 Arduino config.h generator
// Generates a complete config.h from device, effects, and turnout data

import type { ArduinoAdvancedConfig } from '../layouts/types'
import type { ArduinoConfigInput } from './types'

/**
 * 📐 Defaults baked into the stock `deja-arduino` firmware. Any override in
 * `device.config.arduino` wins; missing fields fall back here, so untouched
 * devices keep producing byte-identical config.h output.
 */
export const ARDUINO_CONFIG_DEFAULTS = {
  baudRate: 115_200,
  servoMin: 150,
  servoMax: 600,
  minPulseWidth: 650,
  maxPulseWidth: 2350,
  usMin: 600,
  usMax: 2400,
  servoFreq: 50,
  servoCount: 16,
  pwmOscillatorFreq: 27_000_000,
  pca9685Address: 0x40,
  sensorDebounceMs: 500,
} as const

/**
 * 🔗 Merge a device's saved Arduino advanced config over the defaults.
 * Shared between the Arduino and ESP32 WiFi generators so both variants honor
 * the same user-editable tuning values.
 */
export function resolveArduinoConfig(adv: ArduinoAdvancedConfig | undefined) {
  const a = adv ?? {}
  return {
    baudRate: a.baudRate ?? ARDUINO_CONFIG_DEFAULTS.baudRate,
    servoMin: a.servoMin ?? ARDUINO_CONFIG_DEFAULTS.servoMin,
    servoMax: a.servoMax ?? ARDUINO_CONFIG_DEFAULTS.servoMax,
    minPulseWidth: a.minPulseWidth ?? ARDUINO_CONFIG_DEFAULTS.minPulseWidth,
    maxPulseWidth: a.maxPulseWidth ?? ARDUINO_CONFIG_DEFAULTS.maxPulseWidth,
    usMin: a.usMin ?? ARDUINO_CONFIG_DEFAULTS.usMin,
    usMax: a.usMax ?? ARDUINO_CONFIG_DEFAULTS.usMax,
    servoFreq: a.servoFreq ?? ARDUINO_CONFIG_DEFAULTS.servoFreq,
    servoCount: a.servoCount ?? ARDUINO_CONFIG_DEFAULTS.servoCount,
    pwmOscillatorFreq: a.pwmOscillatorFreq ?? ARDUINO_CONFIG_DEFAULTS.pwmOscillatorFreq,
    pca9685Address: a.pca9685Address ?? ARDUINO_CONFIG_DEFAULTS.pca9685Address,
    sensorDebounceMs: a.sensorDebounceMs ?? ARDUINO_CONFIG_DEFAULTS.sensorDebounceMs,
    pca9685SdaPin: a.pca9685SdaPin,
    pca9685SclPin: a.pca9685SclPin,
  }
}

export function generateArduinoConfig(input: ArduinoConfigInput): string {
  const { device, effects, turnouts } = input

  const outPins = effects
    .filter(e => e.pin !== undefined && e.pin !== null)
    .map(e => e.pin!)

  // TurnoutPulser is only for kato-type turnouts (solenoid-based with a pulse pin pair).
  // Servo/tortise/dcc turnouts use entirely different hardware and must not appear here.
  // 🔢 Sort by turnoutIdx so the array position on the device matches the configured index.
  // Turnouts without a turnoutIdx fall to the end in their original relative order.
  const turnoutPulsers = turnouts
    .filter(t => t.type === 'kato' && t.straight !== undefined && t.divergent !== undefined)
    .slice()
    .sort((a, b) => {
      const ai = a.turnoutIdx ?? Number.POSITIVE_INFINITY
      const bi = b.turnoutIdx ?? Number.POSITIVE_INFINITY
      return ai - bi
    })
    .map(t => `TurnoutPulser(${t.straight}, ${t.divergent})`)

  const sensorPins = input.sensorPins ?? []
  const signalPins = input.signalPins ?? []

  // 🚦 Enable-flag logic — each flag maps to a specific hardware subsystem on the Arduino firmware:
  //
  //   ENABLE_OUTPUTS — pinMode(OUTPUT) on OUTPINS[]; true when any effect has a pin assigned.
  //   ENABLE_SIGNALS — pinMode(OUTPUT) on SIGNALPINS[]; true when any signal pins configured.
  //   ENABLE_SENSORS — pinMode(INPUT)  on SENSORPINS[]; true when any sensor pins configured.
  //   ENABLE_TURNOUTS — informational summary (not gated in firmware #if); true for any turnout
  //                    on this device, regardless of type (kato, servo, tortise, dcc).
  //   ENABLE_PWM     — initializes the PCA9685 servo driver and gates handleServo(); must be
  //                    true whenever a servo turnout is present. An explicit input.enablePwm
  //                    still wins (can be forced true for non-turnout PWM use cases).
  const hasServoTurnouts = turnouts.some(t => t.type === 'servo')
  const hasOutputs = outPins.length > 0
  const hasTurnouts = turnouts.length > 0
  const hasSensors = sensorPins.length > 0
  const hasSignals = signalPins.length > 0
  const enablePwm = input.enablePwm ?? hasServoTurnouts

  // 🛠️ Merge user overrides over defaults. `ArduinoAdvancedConfig` fields are
  // intentionally all-optional so a device with no saved config produces the
  // stock values and a byte-identical header.
  const cfg = resolveArduinoConfig(device.config?.arduino)

  // 🧭 Custom PCA9685 I²C pins (optional). Only emitted when both SDA and SCL
  // are set — leaves the firmware on the board default (Wire.begin()) otherwise.
  // The `.ino` guards the `Wire.begin(SDA, SCL)` 2-arg signature behind an
  // ESP32/RP2040 compile check so classic AVR boards still compile.
  const hasCustomI2cPins =
    typeof cfg.pca9685SdaPin === 'number' && typeof cfg.pca9685SclPin === 'number'

  const pca9685PinDefines = hasCustomI2cPins
    ? `#define PCA9685_SDA_PIN ${cfg.pca9685SdaPin}
#define PCA9685_SCL_PIN ${cfg.pca9685SclPin}
`
    : ''

  return `#include <TurnoutPulser.h>

#define DEVICE_ID "${device.id}"
#define ENABLE_PWM ${enablePwm}
#define ENABLE_OUTPUTS ${hasOutputs}
#define ENABLE_SIGNALS ${hasSignals}
#define ENABLE_TURNOUTS ${hasTurnouts}
#define ENABLE_SENSORS ${hasSensors}

#define BAUD_RATE ${cfg.baudRate}

#define SERVOMIN ${cfg.servoMin} // This is the 'minimum' pulse length count (out of 4096)
#define SERVOMAX ${cfg.servoMax} // This is the 'maximum' pulse length count (out of 4096)
#define MIN_PULSE_WIDTH ${cfg.minPulseWidth}
#define MAX_PULSE_WIDTH ${cfg.maxPulseWidth}
#define USMIN ${cfg.usMin}     // This is the rounded 'minimum' microsecond length based on the minimum pulse of 150
#define USMAX ${cfg.usMax}    // This is the rounded 'maximum' microsecond length based on the maximum pulse of 600
#define SERVO_FREQ ${cfg.servoFreq} // Analog servos run at ~50 Hz updates
#define SERVO_COUNT ${cfg.servoCount}
#define PWM_OSCILLATOR_FREQ ${cfg.pwmOscillatorFreq}L
#define PCA9685_ADDRESS 0x${cfg.pca9685Address.toString(16).toUpperCase()}
${pca9685PinDefines}#define SENSOR_DEBOUNCE_MS ${cfg.sensorDebounceMs}

int OUTPINS[] = {${outPins.length > 0 ? ' ' + outPins.join(', ') + ' ' : ''}};
int SIGNALPINS[] = {${signalPins.length > 0 ? ' ' + signalPins.join(', ') + ' ' : ''}};
int SENSORPINS[] = {${sensorPins.length > 0 ? ' ' + sensorPins.join(', ') + ' ' : ''}};

TurnoutPulser turnouts[] = {${turnoutPulsers.length > 0 ? ' ' + turnoutPulsers.join(', ') + ' ' : ''}};
`
}
