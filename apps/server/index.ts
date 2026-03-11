import 'dotenv/config'
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
})

import { wsServer } from './src/lib/ws-server.js'
import { dejaMqtt as mqtt } from './src/lib/mqtt.js'
import { dejaCloud } from './src/dejaCloud.js'
import { serial } from './src/lib/serial.js'
import { stopAllSounds } from './src/lib/sound.js'
import { audioCacheService } from './src/lib/AudioCacheService.js'

import { log } from './src/utils/logger.js'

const ENABLE_MQTT = process.env.ENABLE_MQTT === 'true' || false
const ENABLE_WS = process.env.ENABLE_WS === 'true' || true
const ENABLE_DEJACLOUD = process.env.ENABLE_DEJACLOUD === 'true' || false

const SHUTDOWN_TIMEOUT_MS = 10_000

/** Prevent multiple shutdown attempts from running concurrently. */
let isShuttingDown = false

async function main(): Promise<void> {
  try {
    log.start('Running', '[MAIN]')
    log.note('ENABLE_MQTT', ENABLE_MQTT)
    log.note('ENABLE_WS', ENABLE_WS)
    log.note('ENABLE_DEJACLOUD', ENABLE_DEJACLOUD)

    if (ENABLE_DEJACLOUD) {
      try {
        await dejaCloud.connect()
        log.start('DEJA Cloud connected')
      } catch (err) {
        log.error('DEJA Cloud connection failed:', err)
      }
    }

    if (ENABLE_MQTT) {
      try {
        await mqtt.connect()
        log.start('MQTT initialized')
      } catch (err) {
        log.error('MQTT connection failed:', err)
        log.note('To disable MQTT, set ENABLE_MQTT=false in your .env file')
      }
    }

    if (ENABLE_WS) {
      try {
        await wsServer.connect()
        log.start('WebSocket server started')
      } catch (err) {
        log.error('WebSocket server failed:', err)
      }
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
    // 1. WebSocket server — close all client connections with a proper close message
    if (ENABLE_WS && wsServer.isConnected()) {
      log.info('[SHUTDOWN] Closing WebSocket server and all client connections...')
      await wsServer.disconnect()
      log.success('[SHUTDOWN] WebSocket server closed')
    }

    // 2. Firebase listeners (Firestore snapshots + RTDB child_added)
    if (ENABLE_DEJACLOUD) {
      log.info('[SHUTDOWN] Disconnecting from DEJA Cloud (Firebase listeners)...')
      await dejaCloud.disconnect()
      log.success('[SHUTDOWN] DEJA Cloud disconnected')
    }

    // 3. MQTT client
    if (ENABLE_MQTT) {
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
