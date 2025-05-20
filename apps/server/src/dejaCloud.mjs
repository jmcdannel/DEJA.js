import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import log from './utils/logger.mjs'
import { wipe, reset, load } from './layout.mjs'
import { listen } from './listeners.mjs'
import { db } from './firebase.mjs'

const layoutId = process.env.LAYOUT_ID

export async function handleBroadcastActions(data) {
  try {
    log.log('dejaClound.broadcast.send', data)
    const { action, payload } = data
    switch (action) {
      case 'portList':
        await updateDoc(
          doc(db, 'layouts', layoutId),
          { ports: payload },
          { merge: true }
        )
        break
      case 'status':
      case 'getStatus':
        if (payload.isConnected) {
          await updateDoc(
            doc(db, 'layouts', layoutId),
            {
              'dccEx.lastConnected': serverTimestamp(),
              'dccEx.client': 'dejaJS',
              pong: serverTimestamp(),
              timestamp: serverTimestamp(),
            },
            { merge: true }
          )
        } else {
          await updateDoc(
            doc(db, 'layouts', layoutId),
            {
              'dccEx.lastConnected': null,
              'dccEx.client': 'dejaJS',
              pong: serverTimestamp(),
              timestamp: serverTimestamp(),
            },
            { merge: true }
          )
        }
        break
      case 'connected':
        log.log('dejaClound.connected!!', data)
        if (payload.device === 'dccex') {
          await updateDoc(
            doc(db, 'layouts', layoutId),
            {
              'dccEx.lastConnected': serverTimestamp(),
              'dccEx.client': 'dejaJS',
            },
            { merge: true }
          )
        }
        await updateDoc(
          doc(db, `layouts/${layoutId}/devices`, payload.device),
          {
            isConnected: true,
            lastConnected: serverTimestamp(),
            client: 'dejaJS',
            port: payload.path,
          },
          { merge: true }
        )
        break
      default:
      //noop
      // log.warn('Unknown action in `send`', action, payload)
    }
  } catch (err) {
    log.fatal('Error handling message:', err)
  }
}

export async function connect() {
  try {
    log.start('Connecting to DejaCloud', layoutId)
    await wipe()
    await reset()
    await load()
    await listen()
    log.success('Connected to DejaCloud', layoutId)
    return true
  } catch (error) {
    log.error('Error in connect:', error)
  }
}

export default {
  listen,
  connect,
  handleBroadcastActions,
}
