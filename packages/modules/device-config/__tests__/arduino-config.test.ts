import { describe, it, expect } from 'vitest'
import { generateArduinoConfig } from '../arduino-config'
import type { ArduinoConfigInput } from '../types'
import type { Device } from '../../layouts/types'
import type { Effect } from '../../effects/types'
import type { Turnout } from '../../turnouts/types'

function makeDevice(overrides: Partial<Device> = {}): Device {
  return {
    id: 'test-mega',
    name: 'Test Mega',
    type: 'deja-arduino',
    ...overrides,
  }
}

function makeEffect(overrides: Partial<Effect> = {}): Effect {
  return {
    id: 'effect-1',
    type: 'led',
    state: false,
    ...overrides,
  }
}

function makeTurnout(overrides: Partial<Turnout> = {}): Turnout {
  return {
    id: 'turnout-1',
    name: 'Turnout 1',
    device: 'test-mega',
    type: 'servo',
    state: false,
    ...overrides,
  }
}

describe('generateArduinoConfig', () => {
  it('generates config with device ID', () => {
    const input: ArduinoConfigInput = {
      device: makeDevice({ id: 'my-mega-2560' }),
      effects: [],
      turnouts: [],
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain('#define DEVICE_ID "my-mega-2560"')
  })

  it('generates OUTPINS from effects with pins', () => {
    const input: ArduinoConfigInput = {
      device: makeDevice(),
      effects: [
        makeEffect({ pin: 22 }),
        makeEffect({ id: 'e2', pin: 23 }),
        makeEffect({ id: 'e3' }),
      ],
      turnouts: [],
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain('int OUTPINS[] = { 22, 23 };')
    expect(result).toContain('#define ENABLE_OUTPUTS true')
  })

  it('generates empty OUTPINS when no effects have pins', () => {
    const input: ArduinoConfigInput = {
      device: makeDevice(),
      effects: [makeEffect()],
      turnouts: [],
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain('int OUTPINS[] = {};')
    expect(result).toContain('#define ENABLE_OUTPUTS false')
  })

  it('generates TurnoutPulser array from kato turnouts with straight/divergent', () => {
    const input: ArduinoConfigInput = {
      device: makeDevice(),
      effects: [],
      turnouts: [
        makeTurnout({ type: 'kato', straight: 150, divergent: 600 }),
        makeTurnout({ id: 't2', name: 'T2', type: 'kato', straight: 200, divergent: 500 }),
      ],
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain('TurnoutPulser turnouts[] = { TurnoutPulser(150, 600), TurnoutPulser(200, 500) };')
    expect(result).toContain('#define ENABLE_TURNOUTS true')
  })

  it('excludes non-kato turnouts from TurnoutPulser array', () => {
    // servo/tortise/dcc turnouts use straight/divergent for different purposes
    // (e.g. servo min/max positions) and must not end up in TurnoutPulser[]
    const input: ArduinoConfigInput = {
      device: makeDevice(),
      effects: [],
      turnouts: [
        makeTurnout({ id: 's1', type: 'servo', straight: 150, divergent: 600 }),
        makeTurnout({ id: 't1', type: 'tortise', straight: 0, divergent: 1 }),
        makeTurnout({ id: 'd1', type: 'dcc', straight: 1, divergent: 0 }),
        makeTurnout({ id: 'k1', type: 'kato', straight: 42, divergent: 43 }),
      ],
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain('TurnoutPulser turnouts[] = { TurnoutPulser(42, 43) };')
    expect(result).not.toContain('TurnoutPulser(150, 600)')
    expect(result).not.toContain('TurnoutPulser(0, 1)')
    expect(result).not.toContain('TurnoutPulser(1, 0)')
  })

  it('sorts kato TurnoutPulser entries by turnoutIdx so array position matches index', () => {
    // TurnoutPulser[i] on the device is addressed by its array index, so Firestore
    // insertion order must not decide the final order — turnoutIdx must.
    const input: ArduinoConfigInput = {
      device: makeDevice(),
      effects: [],
      turnouts: [
        makeTurnout({ id: 'c', type: 'kato', straight: 30, divergent: 31, turnoutIdx: 3 }),
        makeTurnout({ id: 'a', type: 'kato', straight: 10, divergent: 11, turnoutIdx: 1 }),
        makeTurnout({ id: 'b', type: 'kato', straight: 20, divergent: 21, turnoutIdx: 2 }),
      ],
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain(
      'TurnoutPulser turnouts[] = { TurnoutPulser(10, 11), TurnoutPulser(20, 21), TurnoutPulser(30, 31) };'
    )
  })

  it('places kato turnouts without a turnoutIdx after those that have one', () => {
    const input: ArduinoConfigInput = {
      device: makeDevice(),
      effects: [],
      turnouts: [
        makeTurnout({ id: 'x', type: 'kato', straight: 99, divergent: 98 }),
        makeTurnout({ id: 'a', type: 'kato', straight: 10, divergent: 11, turnoutIdx: 1 }),
        makeTurnout({ id: 'b', type: 'kato', straight: 20, divergent: 21, turnoutIdx: 2 }),
      ],
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain(
      'TurnoutPulser turnouts[] = { TurnoutPulser(10, 11), TurnoutPulser(20, 21), TurnoutPulser(99, 98) };'
    )
  })

  it('produces empty TurnoutPulser array when only servo turnouts are present', () => {
    const input: ArduinoConfigInput = {
      device: makeDevice(),
      effects: [],
      turnouts: [
        makeTurnout({ type: 'servo', straight: 150, divergent: 600 }),
      ],
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain('TurnoutPulser turnouts[] = {};')
    // ENABLE_TURNOUTS reflects any turnout on the device (kato or servo), not just TurnoutPulser entries
    expect(result).toContain('#define ENABLE_TURNOUTS true')
  })

  it('auto-enables PWM when any servo turnout exists on the device', () => {
    const input: ArduinoConfigInput = {
      device: makeDevice(),
      effects: [],
      turnouts: [
        makeTurnout({ type: 'kato', straight: 22, divergent: 23 }),
        makeTurnout({ id: 's1', type: 'servo' }),
      ],
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain('#define ENABLE_PWM true')
  })

  it('leaves PWM disabled when no servo turnouts are present', () => {
    const input: ArduinoConfigInput = {
      device: makeDevice(),
      effects: [],
      turnouts: [makeTurnout({ type: 'kato', straight: 22, divergent: 23 })],
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain('#define ENABLE_PWM false')
  })

  it('honors explicit enablePwm override even without servo turnouts', () => {
    const input: ArduinoConfigInput = {
      device: makeDevice(),
      effects: [],
      turnouts: [],
      enablePwm: true,
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain('#define ENABLE_PWM true')
  })

  it('sets ENABLE_TURNOUTS true for servo-only devices even though TurnoutPulser[] is empty', () => {
    const input: ArduinoConfigInput = {
      device: makeDevice(),
      effects: [],
      turnouts: [makeTurnout({ type: 'servo' })],
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain('#define ENABLE_TURNOUTS true')
    expect(result).toContain('TurnoutPulser turnouts[] = {};')
  })

  it('sets enable flags from explicit inputs', () => {
    const input: ArduinoConfigInput = {
      device: makeDevice(),
      effects: [],
      turnouts: [],
      enablePwm: true,
      enableSensors: true,
      sensorPins: ['A0', 'A1'],
      enableSignals: true,
      signalPins: [30, 31],
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain('#define ENABLE_PWM true')
    expect(result).toContain('#define ENABLE_SENSORS true')
    expect(result).toContain('int SENSORPINS[] = { A0, A1 };')
    expect(result).toContain('#define ENABLE_SIGNALS true')
    expect(result).toContain('int SIGNALPINS[] = { 30, 31 };')
  })

  it('includes servo calibration constants', () => {
    const input: ArduinoConfigInput = {
      device: makeDevice(),
      effects: [],
      turnouts: [],
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain('#define SERVOMIN 150')
    expect(result).toContain('#define SERVOMAX 600')
    expect(result).toContain('#define SERVO_FREQ 50')
    expect(result).toContain('#define SERVO_COUNT 16')
  })

  it('includes TurnoutPulser.h header', () => {
    const result = generateArduinoConfig({
      device: makeDevice(),
      effects: [],
      turnouts: [],
    })
    expect(result).toContain('#include <TurnoutPulser.h>')
  })

  it('emits baked-in defaults when device has no advanced config', () => {
    const result = generateArduinoConfig({
      device: makeDevice(),
      effects: [],
      turnouts: [],
    })
    expect(result).toContain('#define BAUD_RATE 115200')
    expect(result).toContain('#define PWM_OSCILLATOR_FREQ 27000000L')
    expect(result).toContain('#define PCA9685_ADDRESS 0x40')
    expect(result).toContain('#define SENSOR_DEBOUNCE_MS 500')
    expect(result).not.toContain('#define PCA9685_SDA_PIN')
  })

  it('honors advanced config overrides', () => {
    const result = generateArduinoConfig({
      device: makeDevice({
        config: {
          arduino: {
            baudRate: 57600,
            servoMin: 125,
            servoMax: 575,
            servoFreq: 60,
            pwmOscillatorFreq: 25_000_000,
            pca9685Address: 0x41,
            sensorDebounceMs: 250,
          },
        },
      }),
      effects: [],
      turnouts: [],
    })
    expect(result).toContain('#define BAUD_RATE 57600')
    expect(result).toContain('#define SERVOMIN 125')
    expect(result).toContain('#define SERVOMAX 575')
    expect(result).toContain('#define SERVO_FREQ 60')
    expect(result).toContain('#define PWM_OSCILLATOR_FREQ 25000000L')
    expect(result).toContain('#define PCA9685_ADDRESS 0x41')
    expect(result).toContain('#define SENSOR_DEBOUNCE_MS 250')
  })

  it('emits custom PCA9685 I²C pins only when both SDA and SCL are set', () => {
    const both = generateArduinoConfig({
      device: makeDevice({
        config: { arduino: { pca9685SdaPin: 21, pca9685SclPin: 22 } },
      }),
      effects: [],
      turnouts: [],
    })
    expect(both).toContain('#define PCA9685_SDA_PIN 21')
    expect(both).toContain('#define PCA9685_SCL_PIN 22')

    const onlySda = generateArduinoConfig({
      device: makeDevice({ config: { arduino: { pca9685SdaPin: 21 } } }),
      effects: [],
      turnouts: [],
    })
    expect(onlySda).not.toContain('#define PCA9685_SDA_PIN')
  })
})
