import server from './src/server.mjs'
import mqtt from './src/mqtt.mjs'
import dejaCloud from './src/dejaCloud.mjs'
import log from './src/utils/logger.mjs'

const ENABLE_MQTT = process.env.ENABLE_MQTT === 'true' || false
const ENABLE_WS = process.env.ENABLE_WS === 'true' || true
const ENABLE_DEJACLOUD = process.env.ENABLE_DEJACLOUD === 'true' || false

async function main() {
  try {
    log.start('Running', '[MAIN]', ENABLE_MQTT, ENABLE_WS, ENABLE_DEJACLOUD)
    ENABLE_MQTT && (await mqtt.connect())
    ENABLE_DEJACLOUD && (await dejaCloud.connect())
    ENABLE_WS && (await server.connect())
  } catch (err) {
    log.fatal(err)
  }
}

await main()
