#!/usr/bin/env tsx
// 🚀 Interactive deploy script for DEJA.js IO devices
// Usage: pnpm deploy (interactive) or pnpm deploy -- --layout <id> --device <id>

import * as path from 'path'
import * as dotenv from 'dotenv'

// Load env vars from root and local .env
dotenv.config({ path: path.resolve(process.cwd(), '../.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

import { getDeviceConfig, listDevices } from './lib/firebase.js'
import {
  isExcludedDeviceType,
  resolveBoardConfig,
  resolveBoardConfigByFqbn,
  resolvePlatform,
  writeDeviceBundle,
} from './lib/bundle.js'
import { findArduinoBoards, findCircuitPyMount } from './lib/detect.js'
import { compileAndUpload } from './lib/deploy-arduino.js'
import { copyToCircuitPy } from './lib/deploy-pico.js'
import {
  promptLayoutId,
  promptDeviceSelection,
  promptWifiCredentials,
  promptDeployMethod,
  promptSerialPort,
  promptArduinoBoard,
} from './lib/prompts.js'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const boardOverride = getArg(args, '--board')

function getArg(argList: string[], flag: string): string | undefined {
  const idx = argList.indexOf(flag)
  return idx !== -1 && idx + 1 < argList.length ? argList[idx + 1] : undefined
}

async function deploy() {
  console.log('')
  console.log('🚂 DEJA.js IO Deploy')
  console.log('━━━━━━━━━━━━━━━━━━━━')
  console.log('')

  // 1. Get layout ID
  const layoutIdArg = getArg(args, '--layout')
  const layoutId = layoutIdArg || (await promptLayoutId())

  // 2. Get device selection
  const deviceIdArg = getArg(args, '--device')
  let deviceId: string

  if (deviceIdArg) {
    deviceId = deviceIdArg
  } else {
    console.log('')
    console.log('🔥 Fetching devices...')
    const devices = await listDevices(layoutId)
    if (devices.length === 0) {
      console.error(`❌ No devices found in layout "${layoutId}"`)
      process.exit(1)
    }
    const selected = await promptDeviceSelection(devices)
    deviceId = selected.id
  }

  // 3. Fetch device config from Firebase
  console.log('')
  console.log(`🔥 Fetching config for "${deviceId}"...`)
  const config = await getDeviceConfig(layoutId, deviceId)
  const { device, effects, turnouts, locos, sensors, signals } = config

  console.log(`   📟 Type: ${device.type}`)
  console.log(`   ⚡ Effects: ${effects.length}`)
  console.log(`   🔀 Turnouts: ${turnouts.length}`)
  if (sensors) console.log(`   📡 Sensors: ${sensors.length}`)
  if (signals) console.log(`   🚦 Signals: ${signals.length}`)

  // Reject device types that have their own firmware source
  if (isExcludedDeviceType(device.type)) {
    console.error(
      `❌ "${device.type}" devices have their own firmware source and cannot be deployed from this tool.`
    )
    process.exit(1)
  }

  const platform = resolvePlatform(device.type)
  if (!platform) {
    console.error(`❌ Unsupported device type: "${device.type}"`)
    process.exit(1)
  }
  const isArduino = platform === 'arduino'
  const isPicoW = platform === 'pico'

  // 4. Pico W: prompt for WiFi credentials
  let wifiSsid = ''
  let wifiPassword = ''
  let mqttBroker = ''

  if (isPicoW) {
    console.log('')
    const wifi = await promptWifiCredentials()
    wifiSsid = wifi.ssid
    wifiPassword = wifi.password
    mqttBroker = wifi.broker
  }

  // 5. Build firmware package (shared with `pnpm build` via lib/bundle.ts)
  console.log('')
  const { outDir, sketchDir, relativeDir } = await writeDeviceBundle({
    layoutId,
    device,
    effects,
    turnouts,
    locos,
    sensors,
    signals,
    wifiSsid,
    wifiPassword,
    mqttBroker,
  })
  console.log(`📦 Built ${isArduino ? 'Arduino' : 'Pico W'} package → ${relativeDir}/`)

  // 6. Prompt for deploy method
  console.log('')
  const method = await promptDeployMethod(isArduino ? 'arduino' : 'pico')

  if (method === 'build-only') {
    console.log('')
    console.log(`✅ Done! Firmware package is at: ${relativeDir}/`)
    return
  }

  // 7. Deploy
  if (dryRun) {
    console.log('')
    console.log('🏜️  Dry run — skipping actual deployment')
    console.log(`   Would deploy ${relativeDir}/ to device`)
    return
  }

  if (isArduino) {
    const boards = findArduinoBoards()
    const port = await promptSerialPort(boards)
    const defaultBoardConfig = resolveBoardConfig(device.type) ?? {
      fqbn: 'arduino:avr:mega:cpu=atmega2560',
      pioPlatform: 'atmelavr',
      pioBoard: 'megaatmega2560',
      needsCpp17: false,
    }
    const fqbnOverride = boardOverride || (!resolveBoardConfig(device.type) ? await promptArduinoBoard() : undefined)
    // 🎯 When --board is passed, look up the full config by FQBN so flags like
    // needsCpp17 and uploadSpeed apply — spreading defaultBoardConfig alone loses them.
    const boardConfig = fqbnOverride
      ? resolveBoardConfigByFqbn(fqbnOverride) ?? { ...defaultBoardConfig, fqbn: fqbnOverride }
      : defaultBoardConfig
    console.log('')
    await compileAndUpload({
      sketchPath: sketchDir,
      port,
      boardConfig,
    })
  } else if (isPicoW) {
    const mount = findCircuitPyMount()
    console.log('')
    await copyToCircuitPy(outDir, mount || undefined)
  }

  console.log('')
  console.log('🚂 All aboard! Device is ready to go. 🎉')
}

deploy().catch(err => {
  console.error('💥 Deploy failed:', err.message || err)
  process.exit(1)
})
