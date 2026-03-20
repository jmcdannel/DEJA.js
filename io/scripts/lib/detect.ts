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
      const matchingBoards = entry.matching_boards || []
      if (port && matchingBoards.length > 0) {
        boards.push({
          port,
          boardName: matchingBoards[0].name || 'Unknown',
          fqbn: matchingBoards[0].fqbn || '',
        })
      }
    }

    return boards
  } catch {
    return []
  }
}
