import { db, rtdb } from '@repo/firebase-config/firebase-admin-node'
import { initialize } from './modules/layout'
import { handleThrottleChange } from './modules/throttles'
import { handleTurnoutChange } from './modules/turnouts'
import { handleEffectChange } from './modules/effects'
import { handleSensorChange } from './modules/sensors'
import { handleDccChange } from './lib/dcc'
import { handleDejaCommands } from './lib/deja'
import { log } from './utils/logger'

const layoutId = process.env.LAYOUT_ID || 'betatrack'

async function listen(): Promise<void> {
  const dccCommandsRef = rtdb.ref(`dccCommands/${layoutId}`)
  dccCommandsRef.on('child_added', (data) => {
    // log.log('listen.dccCommands', data.key, data.val())
    handleDccChange(data.val())
  })

  const dejaCommandsRef = rtdb.ref(`dejaCommands/${layoutId}`)
  dejaCommandsRef.on('child_added', (data) => {
    // log.log('listen.dejaCommands', data.key, data.val())
    handleDejaCommands(data.val())
  })

  
  db.collection(`layouts/${layoutId}/throttles`).onSnapshot(handleThrottleChange)
  db.collection(`layouts/${layoutId}/effects`).onSnapshot(handleEffectChange)
  db.collection(`layouts/${layoutId}/turnouts`).onSnapshot(handleTurnoutChange)
  // db.collection(`layouts/${layoutId}/sensors`).onSnapshot(handleSensorChange)

}

async function resetThrottles(): Promise<void> {
  log.complete('reset throttles', layoutId)
  
  const throttlesSnapshot = await db.collection('layouts').doc(layoutId).collection('throttles').get()
  throttlesSnapshot.docs.map((doc) => {
    doc.ref.set({
      ...doc.data(),
      speed: 0,
      direction: false,
    }, { merge: true })
  })
}

async function resetDevices(): Promise<void> {
  log.complete('reset devices', layoutId)

  const devicesSnapshot = await db.collection('layouts').doc(layoutId).collection('devices').get()
  devicesSnapshot.docs.map((doc) => {
    doc.ref.set({
      ...doc.data(),
      client: null,
      isConnected: false,
      lastConnected: null,
    }, { merge: true })
  })
}

async function reset(): Promise<void> {
  await resetDevices()
  await resetThrottles()
}

export async function connect(): Promise<boolean> {
  try {
    log.start('Connecting to DejaCloud', layoutId)
    await reset()
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
    await reset()
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
