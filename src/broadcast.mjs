import server from './server.mjs' // TODO: refactor to use event emitter
import mqtt from './mqtt.mjs'
import log from './utils/logger.mjs'

const ENABLE_MQTT = process.env.ENABLE_MQTT || true;
const ENABLE_WS = process.env.ENABLE_WS || true;

export const broadcast = async (data) => {
  try {
    ENABLE_MQTT && await mqtt.send(JSON.stringify(data))
    ENABLE_WS && await server.send(data)
    log.log('[BROADCAST]', ENABLE_MQTT, ENABLE_WS, data)
  } catch (err) {
    log.fatal('[DEJA.js] Error sending broadcast:', err)
  }
}

export default { broadcast }
