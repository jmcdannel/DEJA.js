import { SerialPort } from 'serialport'
import {
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { ref, set, remove } from 'firebase/database'
import { getDb, getRtdb } from './firebase-client'
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
    const db = getDb()
    switch (action) {
      case 'portList':
        setDoc(
          doc(db, `layouts/${layoutId}`),
          { ports: payload },
          { merge: true },
        )
        set(ref(getRtdb(), `portList/${layoutId}`), payload)
        break
      case 'status':
      case 'getStatus':
        if (payload.isConnected) {
          setDoc(
            doc(db, `layouts/${layoutId}`),
            {
              isConnected: payload.isConnected,
              client: 'dejaJS',
              timestamp: serverTimestamp(),
            },
            { merge: true },
          )
        } else {
          setDoc(
            doc(db, `layouts/${layoutId}`),
            {
              isConnected: false,
              client: 'dejaJS',
              timestamp: serverTimestamp(),
            },
            { merge: true },
          )
        }
        break
      case 'connected':
        log.success('dejaClound.connected!!', data)
        if (payload.device === 'dccex') {
          setDoc(
            doc(db, `layouts/${layoutId}`),
            {
              'dccEx.isConnected': true,
              'dccEx.lastConnected': serverTimestamp(),
              'dccEx.client': 'dejaJS',
            },
            { merge: true },
          )
        }
        setDoc(
          doc(db, `layouts/${layoutId}/devices/${payload.device}`),
          {
            client: 'dejaJS',
            isConnected: true,
            timestamp: serverTimestamp(),
          },
          { merge: true },
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
  snapshot: any, key: string | null
): Promise<void> {
  try {
    console.log(snapshot)
    const { action, payload } = snapshot
    switch (action) {
      case 'connect':
        await layout.connectDevice(JSON.parse(payload))
        break
      case 'disconnect': {
        const parsed = JSON.parse(payload)
        const deviceId = parsed.deviceId ?? parsed.device
        if (!deviceId) {
          log.warn('disconnect: missing deviceId')
          break
        }
        log.start(`Disconnecting device: ${deviceId}`)
        await layout.disconnectDevice(deviceId)
        log.success(`Device disconnected: ${deviceId}`)
        break
      }
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
    if (key) {
      remove(ref(getRtdb(), `dejaCommands/${layoutId}/${key}`))
    }
  }
}

export const deja = {
  handleDejaCommands,
  handleDejaMessages
}

export default deja
