import 'dotenv/config'
import { execSync } from 'child_process'
// import { copyFileSync } from 'fs'
import { join } from 'path'
import { log } from '../utils/logger.js'

export function startMosquitto(): void {
  try {
    // Copy config file
    const sourcePath = join(process.cwd(), 'mosquitto.conf')
    // const targetPath = '/opt/homebrew/etc/mosquitto/mosquitto.conf'
    // copyFileSync(sourcePath, targetPath)

    // start service
    execSync(`mosquitto -c ${sourcePath} &`, { stdio: 'inherit' })
    log.start('✅ Mosquitto started successfully')
    log.log('MQTT broker:', process.env.MQTT_BROKER || process.env.VITE_MQTT_BROKER || 'mqtt://localhost')
    log.log('MQTT port:', process.env.MQTT_PORT || process.env.VITE_MQTT_PORT || '1883')
    log.log('MQTT config file:', sourcePath)
    
  } catch (error) {
    log.error('❌ Failed to restart Mosquitto:', error)
    process.exit(1)
  }
}

if (process.env.ENABLE_MQTT === 'true') {
  startMosquitto()
} else {
  // return success if MQTT is not enabled
  log.warn('MQTT is not enabled, skipping Mosquitto restart')
  process.exit(0)
}