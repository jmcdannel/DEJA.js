// 🔍 Device and mount detection utilities

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Find CIRCUITPY mount point for Pico W
 * Returns the mount path or null if not found
 */
export function findCircuitPyMount(): string | null {
  const candidates =
    process.platform === 'darwin'
      ? ['/Volumes/CIRCUITPY']
      : [
          // Linux common mount points
          ...getLinuxMounts('CIRCUITPY'),
          '/media/CIRCUITPY',
          '/mnt/CIRCUITPY',
        ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }

  return null
}

/** Scan /media/<user>/ for CIRCUITPY on Linux */
function getLinuxMounts(name: string): string[] {
  const mediaPath = '/media'
  try {
    const users = fs.readdirSync(mediaPath)
    return users.map(user => path.join(mediaPath, user, name))
  } catch {
    return []
  }
}

/**
 * Check if arduino-cli is installed
 */
export function isArduinoCliInstalled(): boolean {
  try {
    execSync('which arduino-cli', { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

const ESP32_BOARD_URL = 'https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json'

/**
 * Auto-install arduino-cli if not present.
 * Returns true if arduino-cli is available after this call.
 */
export async function ensureArduinoCli(): Promise<boolean> {
  if (isArduinoCliInstalled()) return true

  console.log('📦 arduino-cli not found. Installing...')

  try {
    if (process.platform === 'darwin') {
      try {
        execSync('which brew', { stdio: 'pipe' })
        console.log('   Using Homebrew...')
        execSync('brew install arduino-cli', { stdio: 'inherit' })
      } catch {
        console.log('   Using install script...')
        execSync('curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh', {
          stdio: 'inherit',
          cwd: '/usr/local/bin',
        })
      }
    } else {
      console.log('   Using install script...')
      execSync('curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=/usr/local/bin sh', {
        stdio: 'inherit',
      })
    }

    if (isArduinoCliInstalled()) {
      console.log('📦 Installing Arduino AVR core...')
      execSync('arduino-cli core install arduino:avr', { stdio: 'inherit' })
      console.log('✅ arduino-cli installed successfully!')
      return true
    }
  } catch {
    console.error('❌ Failed to install arduino-cli automatically.')
    console.error('')
    console.error('📦 Install manually:')
    console.error('   macOS:  brew install arduino-cli')
    console.error('   Linux:  curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh')
    console.error('   Docs:   https://arduino.github.io/arduino-cli/latest/installation/')
  }

  return false
}

/**
 * Ensure the ESP32 board manager URL is registered and the core is installed.
 * No-op if the core is already present.
 */
export function ensureEsp32Core(): void {
  if (!isArduinoCliInstalled()) return

  try {
    const output = execSync('arduino-cli core list --format json', { stdio: 'pipe', encoding: 'utf-8' })
    const cores = JSON.parse(output)
    const hasEsp32 = (Array.isArray(cores) ? cores : []).some(
      (c: { id?: string }) => c.id === 'esp32:esp32'
    )
    if (hasEsp32) return
  } catch {
    // Can't check — try installing anyway
  }

  console.log('📦 Installing ESP32 board support...')
  try {
    execSync(`arduino-cli config set board_manager.additional_urls ${ESP32_BOARD_URL}`, { stdio: 'pipe' })
    execSync('arduino-cli core update-index', { stdio: 'inherit' })
    execSync('arduino-cli core install esp32:esp32', { stdio: 'inherit' })
    console.log('✅ ESP32 core installed!')
  } catch {
    console.error('❌ Failed to install ESP32 core. Install manually:')
    console.error(`   arduino-cli config set board_manager.additional_urls ${ESP32_BOARD_URL}`)
    console.error('   arduino-cli core update-index')
    console.error('   arduino-cli core install esp32:esp32')
  }
}

/**
 * Ensure required Arduino libraries are installed. Installs any missing ones.
 */
export function ensureArduinoLibs(requiredLibs: string[]): void {
  if (requiredLibs.length === 0) return
  if (!isArduinoCliInstalled()) return

  let installed = new Set<string>()
  try {
    const output = execSync('arduino-cli lib list --format json', {
      stdio: 'pipe',
      encoding: 'utf-8',
    })
    const data = JSON.parse(output)
    const libs = data.installed_libraries || data || []
    installed = new Set(
      (Array.isArray(libs) ? libs : [])
        .map((l: { library?: { name?: string } }) => l.library?.name)
        .filter((name: string | undefined): name is string => Boolean(name))
    )
  } catch {
    // If listing fails, attempt to install everything — arduino-cli is a no-op if already present
  }

  const missing = requiredLibs.filter(name => !installed.has(name))
  if (missing.length === 0) return

  console.log(`📚 Installing missing Arduino libraries: ${missing.join(', ')}`)
  for (const lib of missing) {
    try {
      execSync(`arduino-cli lib install "${lib}"`, { stdio: 'pipe', encoding: 'utf-8' })
      console.log(`   ✅ ${lib}`)
    } catch (err) {
      const stderr = (err as { stderr?: Buffer | string })?.stderr?.toString() || ''
      if (stderr.includes('already exists')) {
        // 📦 Library is on disk from a prior install — treat as success
        console.log(`   ✅ ${lib} (already installed)`)
        continue
      }
      console.error(`❌ Failed to install Arduino library: ${lib}`)
      if (stderr) console.error(stderr)
      process.exit(1)
    }
  }
}

export interface ArduinoBoard {
  port: string
  boardName: string
  fqbn: string
}

/**
 * Find connected Arduino boards via arduino-cli
 * Returns list of detected boards or empty array
 */
export function findArduinoBoards(): ArduinoBoard[] {
  if (!isArduinoCliInstalled()) return []

  try {
    const output = execSync('arduino-cli board list --format json', {
      stdio: 'pipe',
      encoding: 'utf-8',
    })
    const data = JSON.parse(output)
    const boards: ArduinoBoard[] = []

    // arduino-cli returns detected_ports array
    const ports = data.detected_ports || data || []
    for (const entry of Array.isArray(ports) ? ports : []) {
      const port = entry.port?.address
      if (!port) continue
      const matchingBoards = entry.matching_boards || []
      if (matchingBoards.length > 0) {
        boards.push({
          port,
          boardName: matchingBoards[0].name || 'Unknown',
          fqbn: matchingBoards[0].fqbn || '',
        })
        continue
      }
      // 🔌 Boards without USB VID/PID (Nano clones, CH340) don't self-identify.
      // Include them if they look like a USB serial port so the user can still pick them.
      const protocolLabel: string = entry.port?.protocol_label || ''
      const hasUsbProps = Boolean(entry.port?.properties?.vid)
      if (protocolLabel.toLowerCase().includes('usb') || hasUsbProps) {
        boards.push({ port, boardName: 'Unknown (USB serial)', fqbn: '' })
      }
    }

    return boards
  } catch {
    return []
  }
}
