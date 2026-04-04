import { describe, it, expect } from 'vitest'
import { generatePicoSettings, generatePicoConfig } from '../pico-config'
import type { PicoConfigInput } from '../types'
import type { Device } from '../../layouts/types'
import type { Effect } from '../../effects/types'

function makeDevice(overrides: Partial<Device> = {}): Device {
  return {
    id: 'test-pico',
    name: 'Test Pico',
    type: 'deja-mqtt',
    topic: 'deja',
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

function makeInput(overrides: Partial<PicoConfigInput> = {}): PicoConfigInput {
  return {
    device: makeDevice(),
    effects: [],
    turnouts: [],
    layoutId: 'test-layout',
    ...overrides,
  }
}

describe('generatePicoSettings', () => {
  it('generates settings.toml with device ID and layout ID', () => {
    const result = generatePicoSettings(makeInput({ layoutId: 'my-layout' }))
    expect(result).toContain('DEVICE_ID = "test-pico"')
    expect(result).toContain('LAYOUT_ID = "my-layout"')
  })

  it('includes WiFi credentials when provided', () => {
    const result = generatePicoSettings(
      makeInput({ wifiSsid: 'MyNetwork', wifiPassword: 's3cret' })
    )
    expect(result).toContain('CIRCUITPY_WIFI_SSID = "MyNetwork"')
    expect(result).toContain('CIRCUITPY_WIFI_PASSWORD = "s3cret"')
  })

  it('defaults WiFi credentials to empty strings', () => {
    const result = generatePicoSettings(makeInput())
    expect(result).toContain('CIRCUITPY_WIFI_SSID = ""')
    expect(result).toContain('CIRCUITPY_WIFI_PASSWORD = ""')
  })

  it('includes MQTT broker when provided', () => {
    const result = generatePicoSettings(makeInput({ mqttBroker: '192.168.1.100' }))
    expect(result).toContain('MQTT_BROKER = "192.168.1.100"')
  })

  it('uses device.topic for TOPIC_ID, falls back to topicId input', () => {
    const result = generatePicoSettings(
      makeInput({ device: makeDevice({ topic: 'custom-topic' }) })
    )
    expect(result).toContain('TOPIC_ID = "custom-topic"')
  })

  it('uses topicId input when device has no topic', () => {
    const result = generatePicoSettings(
      makeInput({
        device: makeDevice({ topic: undefined }),
        topicId: 'fallback-topic',
      })
    )
    expect(result).toContain('TOPIC_ID = "fallback-topic"')
  })

  it('reads enablePwm from device.config', () => {
    const result = generatePicoSettings(
      makeInput({ device: makeDevice({ config: { enablePwm: true } }) })
    )
    expect(result).toContain('ENABLE_PWM = "true"')
  })
})

describe('generatePicoConfig', () => {
  it('generates JSON with pin-to-GPIO mappings from effects', () => {
    const input = makeInput({
      effects: [
        makeEffect({ pin: 8 }),
        makeEffect({ id: 'e2', pin: 9 }),
      ],
    })
    const result = generatePicoConfig(input)
    const parsed = JSON.parse(result)
    expect(parsed.pins).toEqual({ '8': 'GP8', '9': 'GP9' })
  })

  it('skips effects without pins', () => {
    const input = makeInput({
      effects: [
        makeEffect({ pin: 5 }),
        makeEffect({ id: 'e2' }),
      ],
    })
    const result = generatePicoConfig(input)
    const parsed = JSON.parse(result)
    expect(parsed.pins).toEqual({ '5': 'GP5' })
  })

  it('returns empty pins object when no effects have pins', () => {
    const result = generatePicoConfig(makeInput())
    const parsed = JSON.parse(result)
    expect(parsed.pins).toEqual({})
  })
})
