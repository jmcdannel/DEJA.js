import 'dotenv/config'
import { db, rtdb } from '@repo/firebase-config/firebase-admin-node'
import { initialize } from './modules/layout'
import { handleThrottleChange, listenToLocoChanges } from './modules/throttles'
import { handleTurnoutChange } from './modules/turnouts'
import { handleEffectChange } from './modules/effects'
import { handleSignalChange } from './modules/signals'
// import { handleSensorChange } from './modules/sensors'
import { handleDccChange } from './lib/dcc'
import { handleDejaCommands } from './lib/deja'
import { log } from './utils/logger'
import { serial } from './lib/serial'
import { wsServer } from './lib/ws-server'

const layoutId = process.env.LAYOUT_ID || 'betatrack'

// Store listeners for cleanup
let dccCommandsRef: any = null
let dejaCommandsRef: any = null
let throttleUnsubscribe: (() => void) | null = null
let effectUnsubscribe: (() => void) | null = null
let turnoutUnsubscribe: (() => void) | null = null
let signalUnsubscribe: (() => void) | null = null
let testEffectUnsubscribe: (() => void) | null = null

async function listen(): Promise<void> {
  dccCommandsRef = rtdb.ref(`dccCommands/${layoutId}`)
  dccCommandsRef.on('child_added', (data: any) => {
    // log.log('listen.dccCommands', data.key, data.val())
    if (data.key) {
      handleDccChange(data.val(), data.key)
    }
  })

  dejaCommandsRef = rtdb.ref(`dejaCommands/${layoutId}`)
  dejaCommandsRef.on('child_added', (data: any) => {
    // log.log('listen.dejaCommands', data.key, data.val())
    if (data.key) {
      handleDejaCommands(data.val(), data.key)
    }
  })

  listenToLocoChanges()

  throttleUnsubscribe = db.collection(`layouts/${layoutId}/throttles`).onSnapshot(handleThrottleChange)
  effectUnsubscribe = db.collection(`layouts/${layoutId}/effects`).onSnapshot(handleEffectChange)
  signalUnsubscribe = db.collection(`layouts/${layoutId}/signals`).onSnapshot(handleSignalChange)
  turnoutUnsubscribe = db.collection(`layouts/${layoutId}/turnouts`).onSnapshot(handleTurnoutChange)
  // db.collection(`layouts/${layoutId}/sensors`).onSnapshot(handleSensorChange)
  
  // Monitor test effects for sound testing
  testEffectUnsubscribe = db.collection('testEffects').onSnapshot(handleTestEffectChange)
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
    
    log.info('Firebase listeners cleaned up')
  } catch (error) {
    log.error('Error cleaning up Firebase listeners:', error)
  }
}

// Handle test effect changes (for sound testing from cloud app)
async function handleTestEffectChange(snapshot: any): Promise<void> {
  try {
    snapshot.docChanges().forEach(async (change: any) => {
      if (change.type === 'added') {
        const testEffect = change.doc.data()
        log.info('Test effect added:', testEffect)
        
        // Handle the test effect
        if (testEffect.type === 'sound') {
          try {
            const { handleEffect } = await import('./modules/effects.js')
            await handleEffect(testEffect)
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

export async function connect(): Promise<boolean> {
  try {
    log.start('Connecting to DejaCloud', layoutId)
    // await reset()
    await listen()
    await initialize()
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
