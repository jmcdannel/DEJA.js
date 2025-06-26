import { execSync } from 'child_process'
import { copyFileSync } from 'fs'
import { join } from 'path'

function restartMosquitto() {
  try {
    // Copy config file
    const sourcePath = join(process.cwd(), 'mosquitto.conf')
    const targetPath = '/opt/homebrew/etc/mosquitto/mosquitto.conf'
    // copyFileSync(sourcePath, targetPath)

    // Restart service
    execSync('brew services restart mosquitto', { stdio: 'inherit' })
    console.log('✅ Mosquitto restarted successfully')
  } catch (error) {
    console.error('❌ Failed to restart Mosquitto:', error)
    process.exit(1)
  }
}

restartMosquitto()