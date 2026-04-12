// 🔧 Arduino compile & upload via arduino-cli

import { execSync } from 'child_process'
import { ensureArduinoCli, ensureArduinoLibs, ensureEsp32Core } from './detect.js'
import { ARDUINO_LIB_DEPS, type BoardConfig } from './bundle.js'

export interface ArduinoDeployOptions {
  sketchPath: string
  port: string
  boardConfig: BoardConfig
}

/**
 * Compile and upload Arduino sketch via arduino-cli.
 * Automatically installs the correct core and libraries for the target board.
 */
export async function compileAndUpload(options: ArduinoDeployOptions): Promise<void> {
  const { sketchPath, port, boardConfig } = options
  const { fqbn, needsCpp17 } = boardConfig

  const available = await ensureArduinoCli()
  if (!available) {
    process.exit(1)
  }

  if (fqbn.startsWith('esp32:')) {
    ensureEsp32Core()
  }

  ensureArduinoLibs(ARDUINO_LIB_DEPS.map(l => l.name))

  console.log(`🔨 Compiling sketch at ${sketchPath}...`)
  console.log(`   Board: ${fqbn}`)
  console.log(`   Port:  ${port}`)
  console.log('')

  const cppFlags = needsCpp17 ? ' --build-property "compiler.cpp.extra_flags=-std=c++17"' : ''

  try {
    execSync(`arduino-cli compile --fqbn ${fqbn}${cppFlags} "${sketchPath}"`, {
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
    execSync(`arduino-cli upload --fqbn ${fqbn} --port ${port} "${sketchPath}"`, {
      stdio: 'inherit',
    })
    console.log('')
    console.log('✅ Upload successful! 🎉')
  } catch {
    console.error('❌ Upload failed. Check connection and port.')
    process.exit(1)
  }
}
