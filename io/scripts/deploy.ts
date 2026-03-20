#!/usr/bin/env tsx
// 🚀 Interactive deploy script for DEJA.js IO devices
// Usage: pnpm deploy (interactive) or pnpm deploy -- --layout <id> --device <id>

import * as path from 'path'
import * as dotenv from 'dotenv'

// Load env vars from root and local .env
dotenv.config({ path: path.resolve(process.cwd(), '../.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

import { getDeviceConfig, listDevices } from './lib/firebase.js'
import { generateArduinoConfig } from './lib/config-arduino.js'
import { generatePicoSettings, generatePicoConfig } from './lib/config-pico.js'
import { findArduinoBoards, findCircuitPyMount } from './lib/detect.js'
import { compileAndUpload } from './lib/deploy-arduino.js'
import { copyToCircuitPy } from './lib/deploy-pico.js'
import {
  promptLayoutId,
  promptDeviceSelection,
  promptWifiCredentials,
  promptDeployMethod,
  promptSerialPort,
} from './lib/prompts.js'
import * as fs from 'fs-extra'

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
  const { device, effects, turnouts } = config

  const isArduino = ['dcc-ex', 'deja-arduino', 'deja-arduino-led'].includes(device.type)
  const isPicoW = device.type === 'deja-mqtt'

  console.log(`   📟 Type: ${device.type}`)
  console.log(`   ⚡ Effects: ${effects.length}`)
  console.log(`   🔀 Turnouts: ${turnouts.length}`)

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

  // 5. Build firmware package
  const outDir = path.resolve('dist', deviceId)
  await fs.ensureDir(outDir)

  if (isArduino) {
    await fs.copy('./src/deja-arduino/', outDir)
    const configH = generateArduinoConfig({ device, effects, turnouts })
    await fs.writeFile(path.join(outDir, 'config.h'), configH)
    console.log('')
    console.log(`📦 Built Arduino package → dist/${deviceId}/`)
  } else if (isPicoW) {
    await fs.copy('./src/deja-pico-w/', outDir)
    const configJson = generatePicoConfig({ device, effects, turnouts, layoutId })
    await fs.writeFile(path.join(outDir, 'config.json'), configJson)
    const settingsToml = generatePicoSettings({
      device,
      effects,
      turnouts,
      layoutId,
      wifiSsid,
      wifiPassword,
      mqttBroker,
    })
    await fs.writeFile(path.join(outDir, 'settings.toml'), settingsToml)
    console.log('')
    console.log(`📦 Built Pico W package → dist/${deviceId}/`)
  } else {
    console.error(`❌ Unsupported device type: "${device.type}"`)
    process.exit(1)
  }

  // 6. Prompt for deploy method
  console.log('')
  const method = await promptDeployMethod(isArduino ? 'arduino' : 'pico')

  if (method === 'build-only') {
    console.log('')
    console.log(`✅ Done! Firmware package is at: dist/${deviceId}/`)
    return
  }

  // 7. Deploy
  if (dryRun) {
    console.log('')
    console.log('🏜️  Dry run — skipping actual deployment')
    console.log(`   Would deploy dist/${deviceId}/ to device`)
    return
  }

  if (isArduino) {
    const boards = findArduinoBoards()
    const port = await promptSerialPort(boards)
    const board = boardOverride || 'arduino:avr:mega:cpu=atmega2560'
    console.log('')
    compileAndUpload({
      sketchPath: outDir,
      port,
      board,
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
