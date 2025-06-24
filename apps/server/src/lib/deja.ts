import { SerialPort } from 'serialport'
import { FieldValue } from 'firebase-admin/firestore'
import { db, rtdb } from '@repo/firebase-config/firebase-admin-node'
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
        db.collection('layouts').doc(layoutId)
          .set({ ports: payload }, { merge: true })
        break
      case 'status':
      case 'getStatus':
        if (payload.isConnected) {
          db.collection('layouts').doc(layoutId)
            .set({
              isConnected: payload.isConnected,
              client: 'dejaJS',
              timestamp: FieldValue.serverTimestamp(),
            }, { merge: true })
        } else {
          db.collection('layouts').doc(layoutId)
            .set({
              isConnected: false,
              client: 'dejaJS',
              timestamp: FieldValue.serverTimestamp(),
            }, { merge: true })
        }
        break
      case 'connected':
        log.success('dejaClound.connected!!', data)
        if (payload.device === 'dccex') {
          db.collection('layouts').doc(layoutId)
            .set({
              'dccEx.isConnected': true,
              'dccEx.lastConnected': FieldValue.serverTimestamp(),
              'dccEx.client': 'dejaJS',
            }, { merge: true })
        }
        db.collection('layouts').doc(layoutId).collection('devices').doc(payload.device)
          .set({
            client: 'dejaJS',
            isConnected: true,
            timestamp: FieldValue.serverTimestamp(),
          }, { merge: true })
          
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
  snapshot
): Promise<void> {
  try {
    console.log(snapshot)
    const { action, payload } = snapshot
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
      rtdb.ref(`dejaCommands/${layoutId}/${snapshot.key}`).remove()
    }
  }
}

export const deja = {
  handleDejaCommands,
  handleDejaMessages
}

export default deja
