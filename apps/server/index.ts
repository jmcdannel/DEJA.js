import { wsServer } from './src/ws-server.js'
import { dejaMqtt as mqtt } from './src/mqtt.js'
import { dejaCloud } from './src/dejaCloud.js'
import { log } from './src/utils/logger.js'

const ENABLE_MQTT = process.env.ENABLE_MQTT === 'true' || false
const ENABLE_WS = process.env.ENABLE_WS === 'true' || true
const ENABLE_DEJACLOUD = process.env.ENABLE_DEJACLOUD === 'true' || false

async function main(): Promise<void> {
  try {
    log.start('Running', '[MAIN]', ENABLE_MQTT, ENABLE_WS, ENABLE_DEJACLOUD)
    if (ENABLE_DEJACLOUD) await dejaCloud.connect()
    if (ENABLE_MQTT) await mqtt.connect()
    if (ENABLE_WS) await wsServer.connect()
  } catch (err) {
    log.fatal(err)
  }
}

await main()
