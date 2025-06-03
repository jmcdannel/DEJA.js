import { SerialPort } from 'serialport'
import { type DataSnapshot, ref, remove } from 'firebase/database'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, rtdb } from '@repo/firebase-config/firebase-node'
import type { BroadcastMessage } from '../broadcast'
import { layout } from '../modules/layout'
import { broadcast } from '../broadcast'
import { log } from '../utils/logger'

const layoutId = process.env.LAYOUT_ID

const listPorts = async (): Promise<void> => {
  const availablePorts = await SerialPort.list()
  const payload = availablePorts.map((port) => port.path)
  await broadcast({ action: 'portList', payload })
  log.star('[DEJA] List ports', payload)
}

const getStatus = async (): Promise<void> => {
  // check if any device is connected
  const payload = layout.devices()
  broadcast({
    action: 'status',
    payload,
  })
}
export async function handleDejaMessages(
  data: string | BroadcastMessage
): Promise<void> {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch (err) {
      log.fatal('Error parsing deja message:', err, data)
      return
    }
  }

  if (!data || typeof data !== 'object' || !data.action) {
    log.warn('Invalid deja message:', data)
    return
  }

  if (!layoutId) {
    log.fatal('LAYOUT_ID environment variable is not set')
    return
  }
  try {
    const { action, payload } = data
    switch (action) {
      case 'portList':
        await setDoc(
          doc(db, 'layouts', layoutId),
          { ports: payload },
          { merge: true }
        )
        break
      case 'status':
      case 'getStatus':
        if (payload.isConnected) {
          await setDoc(
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
          await setDoc(
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
        log.success('dejaClound.connected!!', data)
        if (payload.device === 'dccex') {
          await setDoc(
            doc(db, 'layouts', layoutId),
            {
              'dccEx.lastConnected': serverTimestamp(),
              'dccEx.client': 'dejaJS',
            },
            { merge: true }
          )
        }
        await setDoc(
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
    log.fatal('Error handling deja message:', err, data)
  }
}

export async function handleDejaCommands(
  snapshot: DataSnapshot
): Promise<void> {
  try {
    const { action, payload } = snapshot.val()
    switch (action) {
      case 'connect':
        await layout.connectDevice(JSON.parse(payload))
        break
      case 'listPorts':
        await listPorts()
        break
      case 'getStatus':
      case 'status':
      case 'ping':
        await getStatus()
        break
      default:
        //noop
        log.warn('Unknown action in `deja handleMessage`', action, payload)
    }
  } catch (err) {
    log.fatal('Error handling deja command:', err)
  } finally {
    if (snapshot.key) {
      remove(ref(rtdb, `dejaCommands/${layoutId}/${snapshot.key}`))
    }
  }
}

export const deja = {
  handleDejaCommands,
}

export default deja
