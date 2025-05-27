import {
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  limit,
  orderBy,
  serverTimestamp,
  setDoc,
  where,
  type DocumentData,
} from 'firebase/firestore'
import { ref, onChildAdded } from 'firebase/database'
import { db, rtdb } from '@repo/firebase-config/firebase-node'
import { handleTurnoutChange, handleTurnout } from './modules/turnouts.js'
import { handleEffectChange, handleEffect, handleMacro } from './modules/effects.js'
import { handleDccChange } from './dcc.js'
import { log } from './utils/logger.js'
import { connectDevice } from './modules/layout.js'
import { handleThrottleChange } from './modules/throttles.js'

const layoutId = process.env.LAYOUT_ID

async function handleDejaCommands(snapshot: DocumentData): Promise<void> {
  try {
    log.note('handleDejaCommands')
    snapshot.docChanges().forEach(async (change: DocumentData) => {
      if (change.type === 'added') {
        const { action, payload } = change.doc.data()
        log.log('handleDejaCommands: ', action, payload)
        // dcc.handleMessage(JSON.stringify({ action, payload }))
        switch (action) {
          case 'connect':
            await connectDevice(payload)
            break
          case 'effects':
            await handleEffect(payload)
            break
          case 'macro':
            await handleMacro(payload)
            break
          case 'turnouts':
            await handleTurnout(payload)
            break
          default:
            //noop
            log.warn('Unknown action in `deja.handleMessage`', action, payload)
        }
      }
      // delete deja command document
      await deleteDoc(change.doc.ref)
    })
  } catch (err) {
    log.fatal('Error handling deja command:', err)
  }
}

async function handleSensorChange(snapshot: DocumentData): Promise<void> {
  snapshot.docChanges().forEach(async (change: DocumentData) => {
    const sensor = change.doc.data()
    if (change.type === 'modified') {
      log.log('Sensor modified', sensor.effectId, Boolean(sensor.state))
      await setDoc(
        doc(db, `layouts/${layoutId}/effects`, sensor.effectId),
        {
          state: Boolean(!sensor.state),
          timestamp: serverTimestamp(),
        },
        { merge: true }
      )
    }
  })
}

export async function listen(): Promise<void> {
  log.start('Listen for dccCommands', layoutId)

  const dccCommandsRef = ref(rtdb, `dccCommands/${layoutId}`)
  onChildAdded(dccCommandsRef, (data) => {
    log.log('listen.dccCommands', data.key, data.val())
    handleDccChange(data)
  })
  // onSnapshot(
  //   query(
  //     collection(db, `layouts/${layoutId}/dccCommands`),
  //     orderBy('timestamp', 'desc'),
  //     limit(10)
  //   ),
  //   handleDccChange
  // )
  onSnapshot(
    query(
      collection(db, `layouts/${layoutId}/dejaCommands`),
      orderBy('timestamp', 'desc'),
      limit(10)
    ),
    handleDejaCommands
  )
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

export default {
  listen,
}
