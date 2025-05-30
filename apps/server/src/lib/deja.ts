import { SerialPort } from 'serialport'
import { type DataSnapshot, ref, remove } from 'firebase/database'
import { rtdb } from '@repo/firebase-config/firebase-node'
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

export async function handleDejaCommands(
  snapshot: DataSnapshot
): Promise<void> {
  try {
    log.note('deja')
    const { action, payload } = snapshot.val()
    switch (action) {
      case 'connect':
        await layout.connectDevice(payload)
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
