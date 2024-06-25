import server from './src/server.mjs'
import mqtt from './src/mqtt.mjs'
import log from './src/utils/logger.mjs'

const ENABLE_MQTT = process.env.ENABLE_MQTT || true
const ENABLE_WS = process.env.ENABLE_WS || true

async function main() {
  try {
    log.start('Running', '[MAIN]')
    ENABLE_MQTT && (await mqtt.connect())
    ENABLE_WS && (await server.connect())
  } catch (err) {
    log.fatal(err)
  }
}

await main()
