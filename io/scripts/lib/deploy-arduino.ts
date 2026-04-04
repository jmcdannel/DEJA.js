// 🔧 Arduino compile & upload via arduino-cli

import { execSync } from 'child_process'
import { ensureArduinoCli } from './detect.js'

const DEFAULT_BOARD = 'arduino:avr:mega:cpu=atmega2560'

export interface ArduinoDeployOptions {
  sketchPath: string
  port: string
  board?: string
}

/**
 * Compile and upload Arduino sketch via arduino-cli
 */
export async function compileAndUpload(options: ArduinoDeployOptions): Promise<void> {
  const { sketchPath, port, board = DEFAULT_BOARD } = options

  const available = await ensureArduinoCli()
  if (!available) {
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
