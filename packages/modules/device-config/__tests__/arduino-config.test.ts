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

  it('generates TurnoutPulser array from turnouts with straight/divergent', () => {
    const input: ArduinoConfigInput = {
      device: makeDevice(),
      effects: [],
      turnouts: [
        makeTurnout({ straight: 150, divergent: 600 }),
        makeTurnout({ id: 't2', name: 'T2', straight: 200, divergent: 500 }),
      ],
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain('TurnoutPulser turnouts[] = { TurnoutPulser(150, 600), TurnoutPulser(200, 500) };')
    expect(result).toContain('#define ENABLE_TURNOUTS true')
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
})
