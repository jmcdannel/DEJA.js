// apps/server/src/lib/server-config.ts
import { readConfig } from './subscription.js'
import type { DejaConfig } from './subscription.js'
import { log } from '../utils/logger.js'

export interface ServerConfig {
  layoutId: string
  mqtt: {
    enabled: boolean
    broker: string
    port: number
  }
  ws: {
    enabled: boolean
    port: number
    id: string
  }
  cloud: {
    enabled: boolean
  }
  audio: {
    cacheSizeMb: number
    cacheDir: string
  }
}

let cachedConfig: ServerConfig | null = null

/**
 * Load server configuration from ~/.deja/config.json with process.env fallback.
 * Config.json values take priority; env vars are the dev-time fallback.
 * Result is cached — call once at startup.
 */
export async function getServerConfig(): Promise<ServerConfig> {
  if (cachedConfig) return cachedConfig

  let fileConfig: DejaConfig | null = null
  try {
    fileConfig = await readConfig()
  } catch {
    log.info('No ~/.deja/config.json found, using environment variables only')
  }

  cachedConfig = {
    layoutId: fileConfig?.layoutId
      || process.env.LAYOUT_ID
      || 'betatrack',

    mqtt: {
      enabled: fileConfig?.mqtt?.enabled
        ?? (process.env.ENABLE_MQTT === 'true'),
      broker: fileConfig?.mqtt?.broker
        || process.env.MQTT_BROKER
        || process.env.VITE_MQTT_BROKER  // legacy fallback
        || 'mqtt://localhost',
      port: fileConfig?.mqtt?.port
        ?? parseInt(process.env.MQTT_PORT || process.env.VITE_MQTT_PORT || '1883'),
    },

    ws: {
      enabled: fileConfig?.ws?.enabled
        ?? (process.env.ENABLE_WS !== 'false'),
      port: fileConfig?.ws?.port
        ?? parseInt(process.env.VITE_WS_PORT || '8082'),
      id: fileConfig?.ws?.id
        || process.env.WS_ID
        || process.env.VITE_WS_ID  // legacy fallback
        || 'DEJA.js',
    },

    cloud: {
      enabled: fileConfig?.cloud?.enabled
        ?? (process.env.ENABLE_DEJACLOUD === 'true'),
    },

    audio: {
      cacheSizeMb: fileConfig?.audio?.cacheSizeMb
        ?? parseInt(process.env.AUDIO_CACHE_SIZE_MB || '200'),
      cacheDir: fileConfig?.audio?.cacheDir
        || process.env.AUDIO_CACHE_DIR
        || 'temp-sounds-cache',
    },
  }

  // Bridge: populate process.env so module-level constants pick up config values.
  // This avoids refactoring every module to use async config access.
  process.env.LAYOUT_ID = cachedConfig.layoutId
  process.env.ENABLE_MQTT = String(cachedConfig.mqtt.enabled)
  process.env.MQTT_BROKER = cachedConfig.mqtt.broker
  process.env.MQTT_PORT = String(cachedConfig.mqtt.port)
  process.env.ENABLE_WS = String(cachedConfig.ws.enabled)
  process.env.VITE_WS_PORT = String(cachedConfig.ws.port)
  process.env.WS_ID = cachedConfig.ws.id
  process.env.ENABLE_DEJACLOUD = String(cachedConfig.cloud.enabled)
  process.env.AUDIO_CACHE_SIZE_MB = String(cachedConfig.audio.cacheSizeMb)
  process.env.AUDIO_CACHE_DIR = cachedConfig.audio.cacheDir

  log.info('Server config loaded', {
    layoutId: cachedConfig.layoutId,
    mqtt: cachedConfig.mqtt.enabled,
    ws: cachedConfig.ws.enabled,
    cloud: cachedConfig.cloud.enabled,
  })

  return cachedConfig
}

/** Reset cached config (for testing). */
export function resetServerConfig(): void {
  cachedConfig = null
}
