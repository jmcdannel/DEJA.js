// import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { log } from './utils/logger.js'
import { reset, load } from './modules/layout.js'
import { listen } from './listeners.js'
// import { db } from '@repo/firebase-config/firebase-node'

const layoutId = process.env.LAYOUT_ID

// export async function handleBroadcastActions(data) {
//   try {
//     log.log('dejaClound.broadcast.send', data)
//     const { action, payload } = data
//     switch (action) {
//       case 'portList':
//         await updateDoc(
//           doc(db, 'layouts', layoutId),
//           { ports: payload },
//           { merge: true }
//         )
//         break
//       case 'status':
//       case 'getStatus':
//         if (payload.isConnected) {
//           await updateDoc(
//             doc(db, 'layouts', layoutId),
//             {
//               'dccEx.lastConnected': serverTimestamp(),
//               'dccEx.client': 'dejaJS',
//               pong: serverTimestamp(),
//               timestamp: serverTimestamp(),
//             },
//             { merge: true }
//           )
//         } else {
//           await updateDoc(
//             doc(db, 'layouts', layoutId),
//             {
//               'dccEx.lastConnected': null,
//               'dccEx.client': 'dejaJS',
//               pong: serverTimestamp(),
//               timestamp: serverTimestamp(),
//             },
//             { merge: true }
//           )
//         }
//         break
//       case 'connected':
//         log.log('dejaClound.connected!!', data)
//         if (payload.device === 'dccex') {
//           await updateDoc(
//             doc(db, 'layouts', layoutId),
//             {
//               'dccEx.lastConnected': serverTimestamp(),
//               'dccEx.client': 'dejaJS',
//             },
//             { merge: true }
//           )
//         }
//         await updateDoc(
//           doc(db, `layouts/${layoutId}/devices`, payload.device),
//           {
//             isConnected: true,
//             lastConnected: serverTimestamp(),
//             client: 'dejaJS',
//             port: payload.path,
//           },
//           { merge: true }
//         )
//         break
//       default:
//       //noop
//       // log.warn('Unknown action in `send`', action, payload)
//     }
//   } catch (err) {
//     log.fatal('Error handling message:', err)
//   }
// }

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars -- This function is deprecated and the exact type is no longer relevant
export async function handleBroadcastActions(): Promise<void> {
  log.warn('Deprecated: handleBroadcastActions is no longer used')
  // This function is deprecated and no longer used.
  // It was previously used to handle broadcast actions,
  // but has been replaced by more specific functions.
  // Keeping it here for reference, but it does nothing now.
  // Consider removing this in the future.
}

export async function connect(): Promise<boolean> {
  try {
    log.start('Connecting to DejaCloud', layoutId)
    await reset()
    await load()
    await listen()
    log.success('Connected to DejaCloud', layoutId)
    return true
  } catch (error) {
    log.error('Error in connect:', error)
    return false
  }
}

export const dejaCloud = {
  connect,
  handleBroadcastActions,
  listen,
}

export default dejaCloud
