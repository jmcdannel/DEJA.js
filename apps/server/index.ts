import 'dotenv/config'
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 0.2,
})

import { wsServer } from './src/lib/ws-server.js'
import { dejaMqtt as mqtt } from './src/lib/mqtt.js'
import { dejaCloud } from './src/dejaCloud.js'
import { serial } from './src/lib/serial.js'
import { stopAllSounds } from './src/lib/sound.js'
import { audioCacheService } from './src/lib/AudioCacheService.js'

import { log } from './src/utils/logger.js'
import { validateSubscription, startPeriodicRecheck, stopPeriodicRecheck, readConfig, SubscriptionError } from './src/lib/subscription.js'
import type { DejaConfig } from './src/lib/subscription.js'
import { getServerConfig } from './src/lib/server-config.js'
import type { ServerConfig } from './src/lib/server-config.js'
import { markServerStarted } from './src/lib/onboarding.js'

let serverConfig: ServerConfig

const SHUTDOWN_TIMEOUT_MS = 10_000

/** Prevent multiple shutdown attempts from running concurrently. */
let isShuttingDown = false

async function main(): Promise<void> {
  try {
    log.start('Running', '[MAIN]')

    // --- Subscription gate (before any subsystem starts) ---
    let config: DejaConfig
    try {
      await validateSubscription()
      config = await readConfig()
      startPeriodicRecheck(config.uid)
    } catch (error) {
      if (error instanceof SubscriptionError) {
        log.fatal(`[SUBSCRIPTION] ${error.message}`)
        process.exit(1)
      }
      throw error
    }

    // Load server config from ~/.deja/config.json (with env var fallback).
    // This also bridges values into process.env for module-level reads.
    serverConfig = await getServerConfig()

    log.note('MQTT', serverConfig.mqtt.enabled ? `ON (${serverConfig.mqtt.broker}:${serverConfig.mqtt.port})` : 'OFF')
    log.note('WebSocket', serverConfig.ws.enabled ? `ON (port ${serverConfig.ws.port})` : 'OFF')
    log.note('DEJA Cloud', serverConfig.cloud.enabled ? 'ON' : 'OFF')

    if (serverConfig.cloud.enabled) {
      try {
        await dejaCloud.connect()
        log.start('DEJA Cloud connected')
      } catch (err) {
        log.error('DEJA Cloud connection failed:', err)
      }
    }

    if (serverConfig.mqtt.enabled) {
      try {
        await mqtt.connect()
        log.start('MQTT initialized')
      } catch (err) {
        log.error('MQTT connection failed:', err)
        log.note('To disable MQTT, set ENABLE_MQTT=false in your .env file')
      }
    }

    if (serverConfig.ws.enabled) {
      try {
        await wsServer.connect()
        log.start('WebSocket server started')
      } catch (err) {
        log.error('WebSocket server failed:', err)
      }
    }

    // Mark onboarding serverStarted (write-once, non-blocking)
    try {
      await markServerStarted(config.uid)
    } catch (err) {
      log.warn('Failed to mark server as started:', err)
    }

    log.start('DEJA.js Server is running!')

  } catch (err) {
    log.fatal('Fatal error in main:', err)
  }
}

/**
 * Graceful shutdown sequence.
 *
 * Order of operations:
 *  1. Stop accepting new WebSocket connections & notify connected clients
 *  2. Unsubscribe Firebase Firestore / RTDB listeners (dejaCloud)
 *  3. Disconnect MQTT client
 *  4. Stop sound playback & clear audio cache
 *  5. Disconnect all serial ports
 *  6. Force-exit after SHUTDOWN_TIMEOUT_MS if cleanup hangs
 */
async function shutdown(): Promise<void> {
  if (isShuttingDown) {
    log.warn('[SHUTDOWN] Shutdown already in progress, ignoring duplicate signal')
    return
  }
  isShuttingDown = true

  log.start('[SHUTDOWN] Graceful shutdown initiated...')

  // Set a hard timeout so the process exits even if cleanup hangs
  const forceExitTimer = setTimeout(() => {
    log.error(`[SHUTDOWN] Shutdown timed out after ${SHUTDOWN_TIMEOUT_MS}ms — forcing exit`)
    process.exit(1)
  }, SHUTDOWN_TIMEOUT_MS)
  // Allow the process to exit naturally if everything finishes before the timer fires
  forceExitTimer.unref()

  try {
    // 0. Stop subscription re-check timer
    stopPeriodicRecheck()

    // 1. WebSocket server — close all client connections with a proper close message
    if (serverConfig?.ws.enabled && wsServer.isConnected()) {
      log.info('[SHUTDOWN] Closing WebSocket server and all client connections...')
      await wsServer.disconnect()
      log.success('[SHUTDOWN] WebSocket server closed')
    }

    // 2. Firebase listeners (Firestore snapshots + RTDB child_added)
    if (serverConfig?.cloud.enabled) {
      log.info('[SHUTDOWN] Disconnecting from DEJA Cloud (Firebase listeners)...')
      await dejaCloud.disconnect()
      log.success('[SHUTDOWN] DEJA Cloud disconnected')
    }

    // 3. MQTT client
    if (serverConfig?.mqtt.enabled) {
      log.info('[SHUTDOWN] Disconnecting MQTT client...')
      mqtt.disconnect()
      log.success('[SHUTDOWN] MQTT client disconnected')
    }

    // 4. Sound playback & audio cache
    log.info('[SHUTDOWN] Stopping sound playback...')
    await stopAllSounds()
    log.success('[SHUTDOWN] Sound playback stopped')

    log.info('[SHUTDOWN] Clearing audio cache...')
    await audioCacheService.clearCache()
    log.success('[SHUTDOWN] Audio cache cleared')

    // 5. Serial ports
    log.info('[SHUTDOWN] Disconnecting all serial ports...')
    serial.disconnectAll()
    log.success('[SHUTDOWN] Serial ports disconnected')

    log.success('[SHUTDOWN] DEJA.js Server shutdown complete')
    clearTimeout(forceExitTimer)
    process.exit(0)
  } catch (error) {
    log.error('[SHUTDOWN] Error during shutdown:', error)
    clearTimeout(forceExitTimer)
    process.exit(1)
  }
}

process.on('SIGINT', shutdown) // Handles CTRL+C
process.on('SIGTERM', shutdown) // Handles termination signals (pm2, Docker, etc.)

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  log.fatal('Uncaught Exception:', err)
  process.exit(1)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log.fatal('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

main().catch((err) => {
  log.fatal('Failed to start server:', err)
  process.exit(1)
})
