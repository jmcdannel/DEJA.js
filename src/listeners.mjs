import log from './utils/logger.mjs'
import {
  collection,
  deleteDoc,
  onSnapshot,
  query,
  limit,
  orderBy,
} from 'firebase/firestore'
import { ref, onChildAdded } from 'firebase/database'
import { db, rtdb } from './firebase.mjs'
import { handleTurnoutChange, handleTurnout } from './turnouts.mjs'
import { handleEffectChange, handleEffect, handleMacro } from './effects.mjs'
import { handleDccChange } from './dcc.mjs'
import { connectDevice } from './layout.mjs'
import { handleThrottleChange } from './throttles.mjs'

const layoutId = process.env.LAYOUT_ID

async function handleDejaCommands(snapshot) {
  try {
    log.note('handleDejaCommands')
    snapshot.docChanges().forEach(async (change) => {
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

export async function listen() {
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
      orderBy('timestamp', 'desc'),
      limit(10)
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
}

export default {
  listen,
}
