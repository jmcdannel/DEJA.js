import 'dotenv/config'
import os from 'node:os'
import { db, rtdb } from '@repo/firebase-config/firebase-user-node'
import type { Effect } from '@repo/modules'
import { dejaEmitter, type BroadcastMessage } from './broadcast'
import { initialize } from './modules/layout'
import { handleThrottleChange, listenToLocoChanges } from './modules/throttles'
import { handleTurnoutChange } from './modules/turnouts'
import { handleEffectChange } from './modules/effects'
import { handleSignalChange } from './modules/signals'
import { handleSensorChange } from './modules/sensors'
import { handleBlockChange } from './modules/blocks'
import { handleDccChange } from './lib/dcc'
import { handleDejaCommands, handleDejaMessages } from './lib/deja'
import { log } from './utils/logger'
import { ReconnectManager } from './utils/reconnect'
import { serial } from './lib/serial'
import { wsServer } from './lib/ws-server'
import { startDeviceConfigSync, stopDeviceConfigSync } from './modules/sync-config'

const layoutId = process.env.LAYOUT_ID || 'betatrack'

function getLocalIp(): string | undefined {
  const interfaces = os.networkInterfaces()
  return interfaces?.['en0']?.find(d => d.family === 'IPv4')?.address
    || interfaces?.['en1']?.find(d => d.family === 'IPv4')?.address
}
const serverStatusRef = rtdb.ref(`serverStatus/${layoutId}`)

// Reconnect manager for Firebase listener recovery
const firebaseReconnect = new ReconnectManager({
  label: '[FIREBASE]',
  baseDelay: 1000,
  maxDelay: 30_000,
})

// Store listeners for cleanup
// Using firebase-admin snapshot types — typed as callback return values
let dccCommandsRef: ReturnType<typeof rtdb.ref> | null = null
let dejaCommandsRef: ReturnType<typeof rtdb.ref> | null = null
let throttleUnsubscribe: (() => void) | null = null
let effectUnsubscribe: (() => void) | null = null
let turnoutUnsubscribe: (() => void) | null = null
let signalUnsubscribe: (() => void) | null = null
let testEffectUnsubscribe: (() => void) | null = null
let sensorUnsubscribe: (() => void) | null = null
let blockUnsubscribe: (() => void) | null = null
let connectivityUnsubscribe: (() => void) | null = null

/**
 * Handle a Firestore snapshot listener error.
 * Logs the error and schedules a full listener reconnection.
 */
function handleSnapshotError(collectionName: string, error: Error): void {
  log.error(`[FIREBASE] Snapshot listener error on ${collectionName}:`, error.message)
  // Schedule reconnection — this will tear down all listeners and re-establish them
  scheduleFirebaseReconnect()
}

/**
 * Schedule a full Firebase listener reconnection using exponential backoff.
 */
function scheduleFirebaseReconnect(): void {
  // Avoid scheduling multiple reconnections simultaneously
  if (firebaseReconnect.attemptCount > 0) return

  log.warn('[FIREBASE] Scheduling listener reconnection...')

  firebaseReconnect.schedule(async () => {
    try {
      await cleanup()
      await listen()
      log.success('[FIREBASE] Listeners re-established successfully')
      return true
    } catch (error) {
      log.error('[FIREBASE] Failed to re-establish listeners:', error)
      return false
    }
  })
}

/**
 * Monitor the RTDB connectivity state.
 * Firebase Admin SDK reconnects automatically, but we log transitions
 * and can take action (e.g., re-announce server presence) on reconnect.
 */
function monitorConnectivity(): void {
  const connectedRef = rtdb.ref('.info/connected')

  const callback = (snapshot: { val: () => boolean | null }): void => {
    const connected = snapshot.val()
    if (connected) {
      log.success('[FIREBASE] RTDB connection established')

      // Re-announce server presence after reconnecting
      serverStatusRef.onDisconnect().set({
        online: false,
        lastSeen: { '.sv': 'timestamp' },
      }).catch((err: Error) => {
        log.error('[FIREBASE] Failed to set onDisconnect handler:', err.message)
      })

      serverStatusRef.set({
        online: true,
        lastSeen: { '.sv': 'timestamp' },
        version: process.env.npm_package_version || 'unknown',
        ip: getLocalIp() || null,
      }).catch((err: Error) => {
        log.error('[FIREBASE] Failed to update server status:', err.message)
      })
    } else {
      log.warn('[FIREBASE] RTDB connection lost — SDK will reconnect automatically')
    }
  }

  connectedRef.on('value', callback)

  connectivityUnsubscribe = () => {
    connectedRef.off('value', callback)
  }
}

/**
 * Remove stale entries from RTDB command/log queues for the current layout.
 * Called on server startup to prevent replaying old commands.
 */
async function clearStaleLogs(): Promise<void> {
  const paths = [
    `dccLog/${layoutId}`,
    `dccCommands/${layoutId}`,
    `dejaCommands/${layoutId}`,
  ]

  for (const path of paths) {
    try {
      await rtdb.ref(path).remove()
      log.success(`[CLEANUP] Cleared stale entries from ${path}`)
    } catch (error) {
      log.error(`[CLEANUP] Failed to clear ${path}:`, error)
    }
  }
}

async function listen(): Promise<void> {
  dccCommandsRef = rtdb.ref(`dccCommands/${layoutId}`)
  dccCommandsRef.on('child_added', (data) => {
    if (data.key) {
      handleDccChange(data.val(), data.key)
    }
  })

  dejaCommandsRef = rtdb.ref(`dejaCommands/${layoutId}`)
  dejaCommandsRef.on('child_added', (data) => {
    if (data.key) {
      handleDejaCommands(data.val(), data.key)
    }
  })

  listenToLocoChanges()

  // Firestore snapshot listeners with error handling for automatic reconnection
  throttleUnsubscribe = db.collection(`layouts/${layoutId}/throttles`).onSnapshot(
    handleThrottleChange,
    (error) => handleSnapshotError('throttles', error)
  )
  effectUnsubscribe = db.collection(`layouts/${layoutId}/effects`).onSnapshot(
    handleEffectChange,
    (error) => handleSnapshotError('effects', error)
  )
  signalUnsubscribe = db.collection(`layouts/${layoutId}/signals`).onSnapshot(
    handleSignalChange,
    (error) => handleSnapshotError('signals', error)
  )
  turnoutUnsubscribe = db.collection(`layouts/${layoutId}/turnouts`).onSnapshot(
    handleTurnoutChange,
    (error) => handleSnapshotError('turnouts', error)
  )
  sensorUnsubscribe = db.collection(`layouts/${layoutId}/sensors`).onSnapshot(
    handleSensorChange,
    (error) => handleSnapshotError('sensors', error)
  )
  blockUnsubscribe = db.collection(`layouts/${layoutId}/blocks`).onSnapshot(
    handleBlockChange,
    (error) => handleSnapshotError('blocks', error)
  )

  // Monitor test effects for sound testing
  testEffectUnsubscribe = db.collection('testEffects').onSnapshot(
    handleTestEffectChange,
    (error) => handleSnapshotError('testEffects', error)
  )

  // Start syncing device configs (Arduino serial, etc)
  startDeviceConfigSync()
}

async function resetThrottles(): Promise<void> {
  log.complete('reset throttles', layoutId)

  const throttlesSnapshot = await db.collection('layouts').doc(layoutId).collection('throttles').get()
  throttlesSnapshot.docs.map((doc) => {
    serial.disconnect(doc.data().port)
    doc.ref.set({
      ...doc.data(),
      direction: false,
      speed: 0,
    }, { merge: true })
  })
}

async function resetDevices(): Promise<void> {

  const devicesSnapshot = await db.collection('layouts').doc(layoutId).collection('devices').get()
  devicesSnapshot.docs.map((doc) => {

    doc.ref.set({
      ...doc.data(),
      client: null,
      isConnected: false,
      lastConnected: null,
    }, { merge: true })
  })
  log.complete('reset devices', layoutId)
}

async function reset(): Promise<void> {
  await resetDevices()
  await resetThrottles()
}

async function cleanup(): Promise<void> {
  try {
    // Remove Firebase Realtime Database listeners
    if (dccCommandsRef) {
      dccCommandsRef.off()
      dccCommandsRef = null
    }
    if (dejaCommandsRef) {
      dejaCommandsRef.off()
      dejaCommandsRef = null
    }

    // Unsubscribe from Firestore listeners
    if (throttleUnsubscribe) {
      throttleUnsubscribe()
      throttleUnsubscribe = null
    }
    if (effectUnsubscribe) {
      effectUnsubscribe()
      effectUnsubscribe = null
    }
    if (signalUnsubscribe) {
      signalUnsubscribe()
      signalUnsubscribe = null
    }
    if (turnoutUnsubscribe) {
      turnoutUnsubscribe()
      turnoutUnsubscribe = null
    }
    if (testEffectUnsubscribe) {
      testEffectUnsubscribe()
      testEffectUnsubscribe = null
    }
    if (sensorUnsubscribe) {
      sensorUnsubscribe()
      sensorUnsubscribe = null
    }
    if (blockUnsubscribe) {
      blockUnsubscribe()
      blockUnsubscribe = null
    }

    // Stop syncing device configs
    stopDeviceConfigSync()

    log.info('Firebase listeners cleaned up')
  } catch (error) {
    log.error('Error cleaning up Firebase listeners:', error)
  }
}

// Handle test effect changes (for sound testing from cloud app)
async function handleTestEffectChange(snapshot: FirebaseFirestore.QuerySnapshot): Promise<void> {
  try {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === 'added') {
        const testEffect = change.doc.data()
        log.info('Test effect added:', testEffect)

        // Handle the test effect
        if (testEffect.type === 'sound') {
          try {
            const { handleEffect } = await import('./modules/effects.js')
            await handleEffect(testEffect as Effect)
            log.success('Test sound effect executed:', testEffect.name)
          } catch (error) {
            log.error('Error executing test sound effect:', error)
          }
        }
      }
    })
  } catch (error) {
    log.error('Error handling test effect change:', error)
  }
}

/** Handler for broadcast events — forwards messages to Firebase via handleDejaMessages. */
const handleCloudBroadcast = (data: BroadcastMessage): void => {
  handleDejaMessages(data)
}

export async function connect(): Promise<boolean> {
  try {
    log.start('Connecting to DejaCloud', layoutId)
    await clearStaleLogs()
    await listen()
    await initialize()

    // Monitor RTDB connectivity for automatic presence re-announcement
    monitorConnectivity()

    // Subscribe to broadcast events so messages are persisted to Firebase
    dejaEmitter.onBroadcast(handleCloudBroadcast)

    // Set up presence tracking
    await serverStatusRef.onDisconnect().set({
      online: false,
      lastSeen: {
        '.sv': 'timestamp'
      }
    })

    // Set online
    await serverStatusRef.set({
      online: true,
      lastSeen: {
        '.sv': 'timestamp'
      },
      version: process.env.npm_package_version || 'unknown',
      ip: getLocalIp() || null,
    })

    log.success('Connected to DejaCloud', layoutId)
    return true
  } catch (error) {
    log.error('Error in connect:', error)
    return false
  }
}

export async function disconnect(): Promise<void> {
  try {
    log.start('Disconnecting from DejaCloud', layoutId)

    // Stop reconnection attempts
    firebaseReconnect.stop()

    // Stop connectivity monitoring
    if (connectivityUnsubscribe) {
      connectivityUnsubscribe()
      connectivityUnsubscribe = null
    }

    // Unsubscribe from broadcast events
    dejaEmitter.offBroadcast(handleCloudBroadcast)

    // Clean up Firebase listeners
    await cleanup()

    // Close WebSocket server if enabled
    if (process.env.ENABLE_WS === 'true' || process.env.ENABLE_WS === undefined) {
      log.info('Closing WebSocket server...')
      await wsServer.disconnect()
    }

    await reset()

    // Disconnect all serial ports
    log.info('Disconnecting all serial ports...')
    serial.disconnectAll()

    // Cancel the onDisconnect and mark offline immediately
    await serverStatusRef.onDisconnect().cancel()
    await serverStatusRef.set({
      online: false,
      lastSeen: {
        '.sv': 'timestamp'
      }
    })

    log.success('Disconnected from DejaCloud', layoutId)
  } catch (error) {
    log.error('Error in disconnect:', error)
  }
}

export const dejaCloud = {
  connect,
  disconnect,
  listen,
}

export default dejaCloud
