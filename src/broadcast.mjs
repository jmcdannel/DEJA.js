import server from './server.mjs' // TODO: refactor to use event emitter
import mqtt from './mqtt.mjs'
import dejaCloud from './dejaCloud.mjs'
import log from './utils/logger.mjs'

const ENABLE_MQTT = process.env.ENABLE_MQTT === 'true' || false
const ENABLE_WS = process.env.ENABLE_WS === 'true' || true
const ENABLE_DEJACLOUD = process.env.ENABLE_DEJACLOUD === 'true' || false

export const broadcast = async (data) => {
  try {
    ENABLE_MQTT && (await mqtt.send(JSON.stringify(data)))
    ENABLE_WS && (await server.send(data))
    ENABLE_DEJACLOUD && (await dejaCloud.send(data))
  } catch (err) {
    log.fatal('[DEJA.js] Error sending broadcast:', err)
  }
}

export default { broadcast }
