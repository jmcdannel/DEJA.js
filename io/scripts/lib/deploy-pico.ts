// 🍓 Pico W deployment — copy files to CIRCUITPY drive

import * as fs from 'fs-extra'
import { findCircuitPyMount } from './detect.js'

/**
 * Copy firmware files to CIRCUITPY mount
 */
export async function copyToCircuitPy(sourcePath: string, mountPath?: string): Promise<void> {
  const mount = mountPath || findCircuitPyMount()

  if (!mount) {
    console.error('❌ CIRCUITPY drive not found.')
    console.error('')
    console.error('🍓 To connect your Pico W:')
    console.error('   1. Hold the BOOTSEL button on the Pico W')
    console.error('   2. Connect via USB while holding the button')
    console.error('   3. Release after the drive appears')
    console.error('')
    if (process.platform === 'darwin') {
      console.error('   Expected mount: /Volumes/CIRCUITPY')
    } else {
      console.error('   Expected mount: /media/<user>/CIRCUITPY')
    }
    console.error('')
    console.error('   If CircuitPython is not installed, see:')
    console.error('   https://circuitpython.org/board/raspberry_pi_pico_w/')
    process.exit(1)
  }

  console.log(`🍓 Copying files to ${mount}...`)

  try {
    await fs.copy(sourcePath, mount, { overwrite: true })
    console.log('✅ Files copied successfully! 🎉')
    console.log('   The Pico W will restart automatically.')
  } catch (err) {
    console.error('❌ Failed to copy files:', err)
    process.exit(1)
  }
}
