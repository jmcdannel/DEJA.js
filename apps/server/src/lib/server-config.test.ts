import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock subscription module before importing server-config
vi.mock('./subscription.js', () => ({
  readConfig: vi.fn(),
}))

// Mock logger
vi.mock('../utils/logger.js', () => ({
  log: { info: vi.fn(), warn: vi.fn() },
}))

import { getServerConfig, resetServerConfig } from './server-config.js'
import { readConfig } from './subscription.js'

const mockedReadConfig = vi.mocked(readConfig)

describe('getServerConfig', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    resetServerConfig()
    vi.clearAllMocks()
    // Clear relevant env vars
    delete process.env.LAYOUT_ID
    delete process.env.ENABLE_MQTT
    delete process.env.MQTT_BROKER
    delete process.env.VITE_MQTT_BROKER
    delete process.env.MQTT_PORT
    delete process.env.VITE_MQTT_PORT
    delete process.env.ENABLE_WS
    delete process.env.VITE_WS_PORT
    delete process.env.WS_ID
    delete process.env.VITE_WS_ID
    delete process.env.ENABLE_DEJACLOUD
    delete process.env.AUDIO_CACHE_SIZE_MB
    delete process.env.AUDIO_CACHE_DIR
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('returns defaults when no config file and no env vars', async () => {
    mockedReadConfig.mockRejectedValue(new Error('not found'))
    const config = await getServerConfig()
    expect(config.layoutId).toBe('betatrack')
    expect(config.mqtt).toEqual({ enabled: false, broker: 'mqtt://localhost', port: 1883 })
    expect(config.ws).toEqual({ enabled: true, port: 8082, id: 'DEJA.js' })
    expect(config.cloud).toEqual({ enabled: false })
    expect(config.audio).toEqual({ cacheSizeMb: 200, cacheDir: 'temp-sounds-cache' })
  })

  it('reads from config.json when available', async () => {
    mockedReadConfig.mockResolvedValue({
      uid: 'user-1',
      layoutId: 'my-layout',
      mqtt: { enabled: true, broker: 'mqtt://pi.local', port: 1884 },
      ws: { enabled: true, port: 9090, id: 'MyServer' },
      cloud: { enabled: true },
      audio: { cacheSizeMb: 500, cacheDir: '/tmp/audio' },
    })
    const config = await getServerConfig()
    expect(config.layoutId).toBe('my-layout')
    expect(config.mqtt.broker).toBe('mqtt://pi.local')
    expect(config.mqtt.port).toBe(1884)
    expect(config.ws.port).toBe(9090)
    expect(config.ws.id).toBe('MyServer')
    expect(config.audio.cacheSizeMb).toBe(500)
  })

  it('falls back to env vars when config.json fields are missing', async () => {
    mockedReadConfig.mockResolvedValue({
      uid: 'user-1',
      layoutId: 'from-config',
    })
    process.env.MQTT_BROKER = 'mqtt://env-broker'
    process.env.ENABLE_MQTT = 'true'
    const config = await getServerConfig()
    expect(config.layoutId).toBe('from-config')
    expect(config.mqtt.enabled).toBe(true)
    expect(config.mqtt.broker).toBe('mqtt://env-broker')
  })

  it('supports legacy VITE_ prefixed env vars as fallback', async () => {
    mockedReadConfig.mockRejectedValue(new Error('not found'))
    process.env.VITE_MQTT_BROKER = 'mqtt://legacy'
    process.env.VITE_MQTT_PORT = '1885'
    process.env.VITE_WS_ID = 'LegacyServer'
    const config = await getServerConfig()
    expect(config.mqtt.broker).toBe('mqtt://legacy')
    expect(config.mqtt.port).toBe(1885)
    expect(config.ws.id).toBe('LegacyServer')
  })

  it('bridges config values to process.env', async () => {
    mockedReadConfig.mockResolvedValue({
      uid: 'user-1',
      layoutId: 'bridged-layout',
      mqtt: { enabled: true, broker: 'mqtt://bridged', port: 1900 },
      ws: { port: 9999, id: 'BridgedServer' },
    })
    await getServerConfig()
    expect(process.env.LAYOUT_ID).toBe('bridged-layout')
    expect(process.env.MQTT_BROKER).toBe('mqtt://bridged')
    expect(process.env.MQTT_PORT).toBe('1900')
    expect(process.env.VITE_WS_PORT).toBe('9999')
    expect(process.env.WS_ID).toBe('BridgedServer')
  })

  it('caches the config on subsequent calls', async () => {
    mockedReadConfig.mockResolvedValue({ uid: 'u', layoutId: 'cached' })
    const first = await getServerConfig()
    const second = await getServerConfig()
    expect(first).toBe(second)
    expect(mockedReadConfig).toHaveBeenCalledTimes(1)
  })
})
