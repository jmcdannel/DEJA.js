import 'dotenv/config'
import { execSync } from 'child_process'
import { join } from 'path'
import { log } from '../utils/logger.js'
import { startMosquitto } from './start-mqtt.js'

function isMosquittoRunning(): boolean {
  try {
    // Check if Mosquitto is running as a service
    const result = execSync('brew services list | grep mosquitto | grep started', { 
      stdio: 'pipe',
      encoding: 'utf8'
    })
    return result.includes('started')
  } catch (error) {
    return false
  }
}

function isPortAvailable(port: number): boolean {
  try {
    // Check if port is in use
    execSync(`lsof -i :${port}`, { stdio: 'pipe' })
    return false // Port is in use
  } catch (error) {
    return true // Port is available
  }
}

function startMosquittoService(): void {
  try {
    log.note('Starting Mosquitto as a system service...')
    
    // Start the service
    // execSync('brew services start mosquitto', { stdio: 'inherit' })
    startMosquitto()
    
    // Wait a moment for it to start
    setTimeout(() => {
      if (isMosquittoRunning()) {
        log.start('✅ Mosquitto service started successfully')
      } else {
        log.error('❌ Failed to start Mosquitto service')
      }
    }, 2000)
    
  } catch (error) {
    log.error('❌ Failed to start Mosquitto service:', error)
  }
}

function startMosquittoManually(): void {
  try {
    log.note('Starting Mosquitto manually...')
    
    // Copy config file to system location if it doesn't exist
    const sourcePath = join(process.cwd(), 'mosquitto.conf')
    const targetPath = '/opt/homebrew/etc/mosquitto/mosquitto.conf'
    
    try {
      execSync(`sudo cp ${sourcePath} ${targetPath}`, { stdio: 'inherit' })
      log.note('✅ Mosquitto config copied to system location')
    } catch (copyError) {
      log.note('⚠️  Could not copy config to system location, using local config')
    }
    
    // Start Mosquitto in background
    execSync(`mosquitto -c ${sourcePath} -d`, { stdio: 'inherit' })
    log.start('✅ Mosquitto started manually in background')
    
  } catch (error) {
    log.error('❌ Failed to start Mosquitto manually:', error)
  }
}

function main(): void {
  const enableMqtt = process.env.ENABLE_MQTT === 'true'
  
  if (!enableMqtt) {
    log.note('MQTT is disabled, skipping Mosquitto startup')
    return
  }
  
  log.note('🔍 Checking MQTT broker status...')
  
  // Check if Mosquitto is already running
  if (isMosquittoRunning()) {
    log.start('✅ Mosquitto service is already running')
    return
  }
  
  // Check if port 1883 is available
  if (!isPortAvailable(1883)) {
    log.error('❌ Port 1883 is already in use. Another MQTT broker may be running.')
    log.note('💡 You can either:')
    log.note('   1. Stop the existing MQTT broker')
    log.note('   2. Change the port in your .env file')
    log.note('   3. Disable MQTT by setting ENABLE_MQTT=false')
    return
  }
  
  log.note('🚀 Mosquitto not running, starting it now...')
  
  // Try to start as a service first
  try {
    startMosquittoService()
  } catch (error) {
    log.note('⚠️  Service start failed, trying manual start...')
    startMosquittoManually()
  }
}

// Run the check
main()
