import 'dotenv/config'
import os from 'node:os'
import {
  collection,
  getDocs,
  onSnapshot,
  setDoc,
  type DocumentData,
  type QuerySnapshot,
} from 'firebase/firestore'
import {
  ref,
  set,
  remove,
  onChildAdded,
  onValue,
  onDisconnect,
  serverTimestamp as rtdbServerTimestamp,
  type DataSnapshot,
} from 'firebase/database'
import { getDb, getRtdb } from './lib/firebase-client'
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

// Lazy server status ref — must be created after firebase-client is initialized
function serverStatusRef() {
  return ref(getRtdb(), `serverStatus/${layoutId}`)
}

// Reconnect manager for Firebase listener recovery
const firebaseReconnect = new ReconnectManager({
  label: '[FIREBASE]',
  baseDelay: 1000,
  maxDelay: 30_000,
})

// Store listeners for cleanup — Client SDK returns plain unsubscribe functions
let dccCommandsUnsubscribe: (() => void) | null = null
let dejaCommandsUnsubscribe: (() => void) | null = null
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
 * Firebase Client SDK reconnects automatically, but we log transitions
 * and can take action (e.g., re-announce server presence) on reconnect.
 */
function monitorConnectivity(): void {
  const connectedRef = ref(getRtdb(), '.info/connected')

  const callback = (snapshot: DataSnapshot): void => {
    const connected = snapshot.val()
    if (connected) {
      log.success('[FIREBASE] RTDB connection established')

      // Re-announce server presence after reconnecting
      onDisconnect(serverStatusRef()).set({
        online: false,
        lastSeen: rtdbServerTimestamp(),
      }).catch((err: Error) => {
        log.error('[FIREBASE] Failed to set onDisconnect handler:', err.message)
      })

      set(serverStatusRef(), {
        online: true,
        lastSeen: rtdbServerTimestamp(),
        version: process.env.npm_package_version || 'unknown',
        ip: getLocalIp() || null,
      }).catch((err: Error) => {
        log.error('[FIREBASE] Failed to update server status:', err.message)
      })
    } else {
      log.warn('[FIREBASE] RTDB connection lost — SDK will reconnect automatically')
    }
  }

  connectivityUnsubscribe = onValue(connectedRef, callback)
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
      await remove(ref(getRtdb(), path))
      log.success(`[CLEANUP] Cleared stale entries from ${path}`)
    } catch (error) {
      log.error(`[CLEANUP] Failed to clear ${path}:`, error)
    }
  }
}

async function listen(): Promise<void> {
  const rtdbInst = getRtdb()
  const dbInst = getDb()

  dccCommandsUnsubscribe = onChildAdded(
    ref(rtdbInst, `dccCommands/${layoutId}`),
    (data) => {
      if (data.key) {
        handleDccChange(data.val(), data.key)
      }
    },
  )

  dejaCommandsUnsubscribe = onChildAdded(
    ref(rtdbInst, `dejaCommands/${layoutId}`),
    (data) => {
      if (data.key) {
        handleDejaCommands(data.val(), data.key)
      }
    },
  )

  listenToLocoChanges()

  // Firestore snapshot listeners with error handling for automatic reconnection
  throttleUnsubscribe = onSnapshot(
    collection(dbInst, `layouts/${layoutId}/throttles`),
    handleThrottleChange,
    (error) => handleSnapshotError('throttles', error),
  )
  effectUnsubscribe = onSnapshot(
    collection(dbInst, `layouts/${layoutId}/effects`),
    handleEffectChange,
    (error) => handleSnapshotError('effects', error),
  )
  signalUnsubscribe = onSnapshot(
    collection(dbInst, `layouts/${layoutId}/signals`),
    handleSignalChange,
    (error) => handleSnapshotError('signals', error),
  )
  turnoutUnsubscribe = onSnapshot(
    collection(dbInst, `layouts/${layoutId}/turnouts`),
    handleTurnoutChange,
    (error) => handleSnapshotError('turnouts', error),
  )
  sensorUnsubscribe = onSnapshot(
    collection(dbInst, `layouts/${layoutId}/sensors`),
    handleSensorChange,
    (error) => handleSnapshotError('sensors', error),
  )
  blockUnsubscribe = onSnapshot(
    collection(dbInst, `layouts/${layoutId}/blocks`),
    handleBlockChange,
    (error) => handleSnapshotError('blocks', error),
  )

  // Monitor test effects for sound testing
  testEffectUnsubscribe = onSnapshot(
    collection(dbInst, 'testEffects'),
    handleTestEffectChange,
    (error) => handleSnapshotError('testEffects', error),
  )

  // Start syncing device configs (Arduino serial, etc)
  startDeviceConfigSync()
}

async function resetThrottles(): Promise<void> {
  log.complete('reset throttles', layoutId)

  const throttlesSnapshot = await getDocs(
    collection(getDb(), `layouts/${layoutId}/throttles`),
  )
  throttlesSnapshot.docs.map((d) => {
    serial.disconnect(d.data().port)
    setDoc(d.ref, {
      ...d.data(),
      direction: false,
      speed: 0,
    }, { merge: true })
  })
}

async function resetDevices(): Promise<void> {
  const devicesSnapshot = await getDocs(
    collection(getDb(), `layouts/${layoutId}/devices`),
  )
  devicesSnapshot.docs.map((d) => {
    setDoc(d.ref, {
      ...d.data(),
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
    if (dccCommandsUnsubscribe) {
      dccCommandsUnsubscribe()
      dccCommandsUnsubscribe = null
    }
    if (dejaCommandsUnsubscribe) {
      dejaCommandsUnsubscribe()
      dejaCommandsUnsubscribe = null
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
async function handleTestEffectChange(snapshot: QuerySnapshot<DocumentData>): Promise<void> {
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
    await onDisconnect(serverStatusRef()).set({
      online: false,
      lastSeen: rtdbServerTimestamp(),
    })

    // Set online
    await set(serverStatusRef(), {
      online: true,
      lastSeen: rtdbServerTimestamp(),
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
    await onDisconnect(serverStatusRef()).cancel()
    await set(serverStatusRef(), {
      online: false,
      lastSeen: rtdbServerTimestamp(),
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
