// 🔧 Arduino config.h generator
// Generates a complete config.h from device, effects, and turnout data

import type { ArduinoConfigInput } from './types'

export function generateArduinoConfig(input: ArduinoConfigInput): string {
  const { device, effects, turnouts } = input

  const outPins = effects
    .filter(e => e.pin !== undefined && e.pin !== null)
    .map(e => e.pin!)

  // TurnoutPulser is only for kato-type turnouts (solenoid-based with a pulse pin pair).
  // Servo/tortise/dcc turnouts use entirely different hardware and must not appear here.
  const turnoutPulsers = turnouts
    .filter(t => t.type === 'kato' && t.straight !== undefined && t.divergent !== undefined)
    .map(t => `TurnoutPulser(${t.straight}, ${t.divergent})`)

  const sensorPins = input.sensorPins ?? []
  const signalPins = input.signalPins ?? []

  const hasOutputs = outPins.length > 0
  const hasTurnouts = turnoutPulsers.length > 0
  const hasSensors = sensorPins.length > 0
  const hasSignals = signalPins.length > 0
  const enablePwm = input.enablePwm ?? false

  return `#include <TurnoutPulser.h>

#define DEVICE_ID "${device.id}"
#define ENABLE_PWM ${enablePwm}
#define ENABLE_OUTPUTS ${hasOutputs}
#define ENABLE_SIGNALS ${hasSignals}
#define ENABLE_TURNOUTS ${hasTurnouts}
#define ENABLE_SENSORS ${hasSensors}

#define SERVOMIN 150 // This is the 'minimum' pulse length count (out of 4096)
#define SERVOMAX 600 // This is the 'maximum' pulse length count (out of 4096)
#define MIN_PULSE_WIDTH 650
#define MAX_PULSE_WIDTH 2350
#define USMIN 600     // This is the rounded 'minimum' microsecond length based on the minimum pulse of 150
#define USMAX 2400    // This is the rounded 'maximum' microsecond length based on the maximum pulse of 600
#define SERVO_FREQ 50 // Analog servos run at ~50 Hz updates
#define SERVO_COUNT 16

int OUTPINS[] = {${outPins.length > 0 ? ' ' + outPins.join(', ') + ' ' : ''}};
int SIGNALPINS[] = {${signalPins.length > 0 ? ' ' + signalPins.join(', ') + ' ' : ''}};
int SENSORPINS[] = {${sensorPins.length > 0 ? ' ' + sensorPins.join(', ') + ' ' : ''}};

TurnoutPulser turnouts[] = {${turnoutPulsers.length > 0 ? ' ' + turnoutPulsers.join(', ') + ' ' : ''}};
`
}
