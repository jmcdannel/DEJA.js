// 🔧 Arduino compile & upload via arduino-cli

import { execSync } from 'child_process'
import { isArduinoCliInstalled } from './detect.js'

const DEFAULT_BOARD = 'arduino:avr:mega:cpu=atmega2560'

export interface ArduinoDeployOptions {
  sketchPath: string
  port: string
  board?: string
}

/**
 * Compile and upload Arduino sketch via arduino-cli
 */
export function compileAndUpload(options: ArduinoDeployOptions): void {
  const { sketchPath, port, board = DEFAULT_BOARD } = options

  if (!isArduinoCliInstalled()) {
    console.error('❌ arduino-cli is not installed.')
    console.error('')
    console.error('📦 Install it:')
    console.error('   macOS:  brew install arduino-cli')
    console.error('   Linux:  curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh')
    console.error('   Docs:   https://arduino.github.io/arduino-cli/latest/installation/')
    console.error('')
    console.error('After installing, run:')
    console.error('   arduino-cli core install arduino:avr')
    process.exit(1)
  }

  console.log(`🔨 Compiling sketch at ${sketchPath}...`)
  console.log(`   Board: ${board}`)
  console.log(`   Port:  ${port}`)
  console.log('')

  try {
    execSync(`arduino-cli compile --fqbn ${board} "${sketchPath}"`, {
      stdio: 'inherit',
    })
    console.log('')
    console.log('✅ Compilation successful!')
  } catch {
    console.error('❌ Compilation failed. Check errors above.')
    process.exit(1)
  }

  console.log('')
  console.log(`⬆️ Uploading to ${port}...`)

  try {
    execSync(`arduino-cli upload --fqbn ${board} --port ${port} "${sketchPath}"`, {
      stdio: 'inherit',
    })
    console.log('')
    console.log('✅ Upload successful! 🎉')
  } catch {
    console.error('❌ Upload failed. Check connection and port.')
    process.exit(1)
  }
}
