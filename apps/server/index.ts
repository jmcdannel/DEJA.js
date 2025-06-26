import { wsServer } from './src/lib/ws-server.js'
import { dejaMqtt as mqtt } from './src/lib/mqtt.js'
import { dejaCloud, disconnect } from './src/dejaCloud.js'
import { log } from './src/utils/logger.js'

const ENABLE_MQTT = process.env.ENABLE_MQTT === 'true' || false
const ENABLE_WS = process.env.ENABLE_WS === 'true' || true
const ENABLE_DEJACLOUD = process.env.ENABLE_DEJACLOUD === 'true' || false

async function main(): Promise<void> {
  try {
    log.start('Running', '[MAIN]', ENABLE_MQTT, ENABLE_WS, ENABLE_DEJACLOUD)
    if (ENABLE_DEJACLOUD) await dejaCloud.connect()
    // if (ENABLE_MQTT) await mqtt.connect()
    if (ENABLE_WS) await wsServer.connect()
  } catch (err) {
    log.fatal(err)
  }
}

process.on('SIGINT', disconnect) // Handles CTRL+C
process.on('SIGTERM', disconnect) // Handles kill command
process.on('uncaughtException', async (error) => {
  log.fatal('Uncaught Exception:', error)
  await disconnect()
})
process.on('unhandledRejection', async (reason, promise) => {
  log.fatal('Unhandled Rejection at:', promise, 'reason:', reason)
  try {
    await disconnect()
  } catch (error) {
    log.error('Error in cleanup:', error)
  } finally {
    process.exit(1) // Exit the process with an error code
  }
})

await main()
