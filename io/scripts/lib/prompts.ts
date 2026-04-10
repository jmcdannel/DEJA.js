// 💬 Interactive CLI prompts for deploy script

import { input, select, password, confirm } from '@inquirer/prompts'
import type { Device } from '@repo/modules'
import type { ArduinoBoard } from './detect.js'

/**
 * Prompt for layout ID (defaults to LAYOUT_ID from env)
 */
export async function promptLayoutId(): Promise<string> {
  const defaultLayout = process.env.LAYOUT_ID || ''
  return input({
    message: '🗺️  Layout ID:',
    default: defaultLayout || undefined,
    validate: (val) => val.trim().length > 0 || 'Layout ID is required',
  })
}

/**
 * Prompt user to select a device from a list
 */
export async function promptDeviceSelection(devices: Device[]): Promise<Device> {
  const typeIcons: Record<string, string> = {
    'dcc-ex': '🖥️',
    'deja-arduino': '🔧',
    'deja-arduino-led': '💡',
    'deja-mqtt': '🍓',
    'deja-server': '🌐',
  }

  const selected = await select({
    message: '📟 Select a device:',
    choices: devices.map(d => ({
      name: `${typeIcons[d.type] || '❓'} ${d.id} (${d.type})`,
      value: d.id,
    })),
  })

  return devices.find(d => d.id === selected)!
}

/**
 * Prompt for WiFi credentials (Pico W only)
 */
export async function promptWifiCredentials(): Promise<{
  ssid: string
  password: string
  broker: string
}> {
  const defaultSsid = process.env.WIFI_SSID || ''
  const defaultBroker = process.env.MQTT_BROKER || process.env.VITE_MQTT_BROKER || ''

  const ssid = await input({
    message: '📶 WiFi SSID:',
    default: defaultSsid || undefined,
    validate: (val) => val.trim().length > 0 || 'WiFi SSID is required',
  })

  const pwd = await password({
    message: '🔒 WiFi Password:',
  })

  const broker = await input({
    message: '🌐 MQTT Broker IP:',
    default: defaultBroker || undefined,
    validate: (val) => val.trim().length > 0 || 'MQTT broker IP is required',
  })

  return { ssid, password: pwd, broker }
}

export type DeployMethod = 'deploy' | 'build-only'

/**
 * Prompt for deploy method
 */
export async function promptDeployMethod(deviceType: 'arduino' | 'pico'): Promise<DeployMethod> {
  const deployLabel =
    deviceType === 'arduino'
      ? '⬆️  Compile & Upload (requires arduino-cli)'
      : '🍓 Copy to CIRCUITPY drive'

  return select({
    message: '🚀 What would you like to do?',
    choices: [
      { name: deployLabel, value: 'deploy' as const },
      { name: '📦 Just build (output to dist/)', value: 'build-only' as const },
    ],
  })
}

/**
 * Prompt to select a serial port from detected Arduino boards
 */
export async function promptSerialPort(boards: ArduinoBoard[]): Promise<string> {
  if (boards.length === 0) {
    console.error('❌ No Arduino boards detected.')
    console.error('   Make sure the board is connected via USB.')
    process.exit(1)
  }

  if (boards.length === 1) {
    const board = boards[0]
    const useIt = await confirm({
      message: `🔌 Found ${board.boardName} on ${board.port}. Use this?`,
      default: true,
    })
    if (useIt) return board.port
  }

  return select({
    message: '🔌 Select serial port:',
    choices: boards.map(b => ({
      name: `${b.port} — ${b.boardName}`,
      value: b.port,
    })),
  })
}
