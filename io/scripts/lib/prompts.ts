// 💬 Interactive CLI prompts for deploy script

import fs from 'fs-extra'
import * as path from 'path'
import { input, select, password, confirm } from '@inquirer/prompts'
import type { Device, DccExMotorShield } from '@repo/modules'
import { DCC_EX_MOTOR_SHIELD_LABELS } from '@repo/modules'
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
    'deja-esp32': '🛠️',
    'deja-esp32-wifi': '🛜',
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

export type WifiStrategy = 'enter' | 'skip'

/**
 * Ask whether to enter WiFi/MQTT creds now, or skip and hand-edit later.
 * Used by `pnpm build` when a wifi-capable device is about to be bundled.
 */
export async function promptWifiStrategy(): Promise<WifiStrategy> {
  return select({
    message: '🛜 WiFi/MQTT credentials for wifi-capable devices:',
    choices: [
      { name: '🔑 Enter credentials now (I will type them in)', value: 'enter' as const },
      { name: "📝 Skip — I'll edit the generated config file myself", value: 'skip' as const },
    ],
  })
}

export type DeployWifiStrategy = 'keep' | 'enter' | 'skip'

/**
 * Ask how to handle WiFi/MQTT creds at deploy time. When a prior bundle with
 * usable creds is found, "keep" is the default — nothing gets wiped. Use
 * `existingSsid` to show the SSID so the user can confirm what's being reused.
 */
export async function promptDeployWifiStrategy(existingSsid?: string): Promise<DeployWifiStrategy> {
  const choices = []
  if (existingSsid) {
    choices.push({
      name: `♻️  Keep existing credentials (SSID: ${existingSsid})`,
      value: 'keep' as const,
    })
  }
  choices.push(
    { name: '🔑 Enter new credentials now', value: 'enter' as const },
    { name: "📝 Skip — I'll edit the config file myself after rebuild", value: 'skip' as const },
  )
  return select({
    message: '🛜 WiFi/MQTT credentials for this deploy:',
    choices,
    default: existingSsid ? 'keep' : 'enter',
  })
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
 * Prompt to select which Arduino board FQBN to compile/upload for.
 * Defaults to Arduino Mega 2560. Custom lets the user paste any FQBN.
 */
export async function promptArduinoBoard(defaultFqbn?: string): Promise<string> {
  const CUSTOM = '__custom__'
  const choices = [
    { name: '🟢 Arduino Mega 2560 (ATmega2560) — default', value: 'arduino:avr:mega:cpu=atmega2560' },
    { name: '🔵 Arduino Uno (ATmega328P)', value: 'arduino:avr:uno' },
    { name: '🟡 Arduino Nano — new bootloader (ATmega328P)', value: 'arduino:avr:nano:cpu=atmega328' },
    { name: '🟠 Arduino Nano — old bootloader (ATmega328P)', value: 'arduino:avr:nano:cpu=atmega328old' },
    { name: '🟣 Arduino Leonardo (ATmega32u4)', value: 'arduino:avr:leonardo' },
    { name: '✏️  Custom FQBN…', value: CUSTOM },
  ]

  const selected = await select({
    message: '🧩 Select Arduino board:',
    choices,
    default: defaultFqbn || 'arduino:avr:mega:cpu=atmega2560',
  })

  if (selected === CUSTOM) {
    return input({
      message: '🧩 Enter FQBN (e.g. arduino:avr:mega:cpu=atmega2560):',
      validate: (val) => val.trim().length > 0 || 'FQBN is required',
    })
  }

  return selected
}

/**
 * Prompt for the local filesystem path to a clone of the DCC-EX
 * CommandStation-EX source. Validates the path exists and contains the
 * `CommandStation-EX.ino` entrypoint. Supports `~` expansion.
 */
export async function promptDccExSourcePath(defaultPath?: string): Promise<string> {
  const resolvedDefault =
    defaultPath || process.env.DCC_EX_SOURCE || ''

  const raw = await input({
    message: '🚂 Path to your DCC-EX CommandStation-EX checkout:',
    default: resolvedDefault || undefined,
    validate: (val) => {
      const trimmed = val.trim()
      if (!trimmed) return 'Path is required'
      const expanded = trimmed.startsWith('~')
        ? path.join(process.env.HOME || '', trimmed.slice(1))
        : path.resolve(trimmed)
      if (!fs.existsSync(expanded)) {
        return `Path does not exist: ${expanded}`
      }
      if (!fs.existsSync(path.join(expanded, 'CommandStation-EX.ino'))) {
        return 'Directory must contain CommandStation-EX.ino (expected a DCC-EX source checkout)'
      }
      return true
    },
  })

  const trimmed = raw.trim()
  return trimmed.startsWith('~')
    ? path.join(process.env.HOME || '', trimmed.slice(1))
    : path.resolve(trimmed)
}

/**
 * Prompt for which motor shield is attached to the Arduino Mega.
 */
export async function promptDccExMotorShield(
  defaultShield?: DccExMotorShield,
): Promise<DccExMotorShield> {
  return select<DccExMotorShield>({
    message: '⚡ Motor shield:',
    default: defaultShield || 'standard',
    choices: [
      {
        name: `🔵 ${DCC_EX_MOTOR_SHIELD_LABELS.standard}`,
        value: 'standard',
      },
      {
        name: `🟣 ${DCC_EX_MOTOR_SHIELD_LABELS.ex8874}`,
        value: 'ex8874',
      },
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
