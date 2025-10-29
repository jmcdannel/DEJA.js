import 'dotenv/config'
import { wsServer } from './src/lib/ws-server.js'
import { dejaMqtt as mqtt } from './src/lib/mqtt.js'
import { dejaCloud } from './src/dejaCloud.js'

import { log } from './src/utils/logger.js'

const ENABLE_MQTT = process.env.ENABLE_MQTT === 'true' || false
const ENABLE_WS = process.env.ENABLE_WS === 'true' || true
const ENABLE_DEJACLOUD = process.env.ENABLE_DEJACLOUD === 'true' || false

async function main(): Promise<void> {
  try {
    log.start('Running', '[MAIN]')
    log.note('ENABLE_MQTT', ENABLE_MQTT)
    log.note('ENABLE_WS', ENABLE_WS)
    log.note('ENABLE_DEJACLOUD', ENABLE_DEJACLOUD)
    
    if (ENABLE_DEJACLOUD) {
      try {
        await dejaCloud.connect()
        log.start('✅ DEJA Cloud connected')
      } catch (err) {
        log.error('❌ DEJA Cloud connection failed:', err)
      }
    }
    
    if (ENABLE_MQTT) {
      try {
        await mqtt.connect()
        log.start('✅ MQTT initialized')
      } catch (err) {
        log.error('❌ MQTT connection failed:', err)
        log.note('💡 To disable MQTT, set ENABLE_MQTT=false in your .env file')
      }
    }
    
    if (ENABLE_WS) {
      try {
        await wsServer.connect()
        log.start('✅ WebSocket server started')
      } catch (err) {
        log.error('❌ WebSocket server failed:', err)
      }
    }
    

    
    log.start('🚀 DEJA.js Server is running!')
    
  } catch (err) {
    log.fatal('Fatal error in main:', err)
  }
}

async function disconnect(): Promise<void> {
  try {
    log.start('Shutting down DEJA.js Server...')
    
    // Disconnect from DEJA Cloud
    await dejaCloud.disconnect()
    
    log.success('✅ DEJA.js Server shutdown complete')
    process.exit(0)
  } catch (error) {
    log.error('❌ Error during shutdown:', error)
    process.exit(1)
  }
}

process.on('SIGINT', disconnect) // Handles CTRL+C
process.on('SIGTERM', disconnect) // Handles termination signals

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  log.fatal('Uncaught Exception:', err)
  process.exit(1)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log.fatal('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

main().catch((err) => {
  log.fatal('Failed to start server:', err)
  process.exit(1)
})
