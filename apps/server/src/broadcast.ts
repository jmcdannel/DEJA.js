import { wsServer } from './lib/ws-server' // TODO: refactor to use event emitter
import { dejaMqtt } from './lib/mqtt'
import { handleDejaMessages } from './lib/deja'
import { log } from './utils/logger'

export interface BroadcastMessage {
  action: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is a generic payload type
  payload: any
}

const ENABLE_MQTT = process.env.ENABLE_MQTT === 'true' || false
const ENABLE_WS = process.env.ENABLE_WS === 'true' || true
const ENABLE_DEJACLOUD = process.env.ENABLE_DEJACLOUD === 'true' || false

async function dejaSend(data: string | BroadcastMessage): Promise<void> {
  await handleDejaMessages(data)
}

export const broadcast = (data: string | BroadcastMessage): void => {
  try {
    log.fav('[DEJA.js] Broadcasting message:', data, ENABLE_MQTT, ENABLE_WS, ENABLE_DEJACLOUD)
    if (ENABLE_MQTT) {
      dejaMqtt.send(JSON.stringify(data))
    }
    if (ENABLE_WS) {
      wsServer.send(typeof data === 'string' ? JSON.parse(data) : data)
    }
    if (ENABLE_DEJACLOUD) {
      dejaSend(data)
    }
    // log.log('[broadcast]', data)
  } catch (err) {
    log.fatal('[DEJA.js] Error sending broadcast:', err, data, typeof data)
  }
}

export default { broadcast }
