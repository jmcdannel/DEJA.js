import {
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  where,
  type DocumentData,
} from 'firebase/firestore'
import { ref, onChildAdded } from 'firebase/database'
import { db, rtdb } from '@repo/firebase-config/firebase-node'
import { initialize } from './modules/layout'
import { handleThrottleChange } from './modules/throttles'
import { handleTurnoutChange } from './modules/turnouts'
import { handleEffectChange } from './modules/effects'
import { handleSensorChange } from './modules/sensors'
import { handleDccChange } from './lib/dcc'
import { handleDejaCommands } from './lib/deja'
import { log } from './utils/logger'

const layoutId = process.env.LAYOUT_ID

async function listen(): Promise<void> {
  const dccCommandsRef = ref(rtdb, `dccCommands/${layoutId}`)
  onChildAdded(dccCommandsRef, (data) => {
    // log.log('listen.dccCommands', data.key, data.val())
    handleDccChange(data)
  })

  const dejaCommandsRef = ref(rtdb, `dejaCommands/${layoutId}`)
  onChildAdded(dejaCommandsRef, (data) => {
    // log.log('listen.dejaCommands', data.key, data.val())
    handleDejaCommands(data)
  })

  onSnapshot(
    query(
      collection(db, `layouts/${layoutId}/throttles`),
      orderBy('timestamp', 'desc')
    ),
    handleThrottleChange
  )
  onSnapshot(
    query(
      collection(db, `layouts/${layoutId}/effects`),
      orderBy('timestamp', 'desc')
    ),
    handleEffectChange
  )
  onSnapshot(
    query(
      collection(db, `layouts/${layoutId}/turnouts`),
      orderBy('timestamp', 'desc')
    ),
    handleTurnoutChange
  )

  onSnapshot(
    query(
      collection(db, `layouts/${layoutId}/sensors`),
      where('enabled', '==', true)
    ),
    handleSensorChange
  )
}

async function resetThrottles(): Promise<void> {
  log.complete('reset throttles', layoutId)
  const querySnapshot = await getDocs(
    collection(db, `layouts/${layoutId}/throttles`)
  )
  querySnapshot.forEach((d: DocumentData) => {
    setDoc(d.ref, {
      ...d.data(),
      speed: 0,
      direction: false,
    }),
      { merge: true }
  })
}

async function resetDevices(): Promise<void> {
  const querySnapshot = await getDocs(
    collection(db, `layouts/${layoutId}/devices`)
  )
  querySnapshot.forEach((d: DocumentData) => {
    setDoc(d.ref, {
      ...d.data(),
      client: null,
      isConnected: false,
      lastConnected: null,
    }),
      { merge: true }
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
  log.start('Disconnecting from DejaCloud', layoutId)
  await reset()
}

export const dejaCloud = {
  connect,
  disconnect,
  listen,
}

export default dejaCloud
