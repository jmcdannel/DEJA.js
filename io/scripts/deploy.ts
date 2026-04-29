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
  isArduinoCompilable,
  isExcludedDeviceType,
  readExistingWifiCreds,
  resolveBoardConfig,
  resolveBoardConfigByFqbn,
  resolvePlatform,
  writeDeviceBundle,
} from './lib/bundle.js'
import { findArduinoBoards, findCircuitPyMount, ensureArduinoCli } from './lib/detect.js'
import { compileAndUpload } from './lib/deploy-arduino.js'
import { copyToCircuitPy } from './lib/deploy-pico.js'
import type { DccExMotorShield } from '@repo/modules'
import {
  promptDccExMotorShield,
  promptDccExSourcePath,
  promptLayoutId,
  promptDeviceSelection,
  promptDeployWifiStrategy,
  promptDeployMethod,
  promptSerialPort,
  promptArduinoBoard,
  promptWifiCredentials,
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
  const isEsp32Wifi = device.type === 'deja-esp32-wifi'
  const isDccEx = device.type === 'dcc-ex'
  // Both plain Arduino and DCC-EX ride the arduino-cli compile+upload path.
  const useArduinoDeploy = isArduinoCompilable(device.type)

  // 4. Pico W and deja-esp32-wifi: resolve WiFi credentials.
  //    Precedence: CLI flags > env vars > existing bundle > interactive prompt.
  //    This lets `pnpm deploy` preserve settings.toml / config.h edits made
  //    after a previous build without re-typing SSID/password every time.
  let wifiSsid = ''
  let wifiPassword = ''
  let mqttBroker = ''

  if (isPicoW || isEsp32Wifi) {
    // Flag overrides take priority — scripted deploys bypass the prompt.
    const flagSsid = getArg(args, '--wifi-ssid') || process.env.WIFI_SSID || ''
    const flagPwd = getArg(args, '--wifi-password') || process.env.WIFI_PASSWORD || ''
    const flagBroker =
      getArg(args, '--mqtt-broker') ||
      process.env.MQTT_BROKER ||
      process.env.VITE_MQTT_BROKER ||
      ''

    if (flagSsid) {
      wifiSsid = flagSsid
      wifiPassword = flagPwd
      mqttBroker = flagBroker
    } else {
      // Read any existing creds from a previous build so "keep" is an option.
      const existing = await readExistingWifiCreds(layoutId, device)
      const noPrompt = args.includes('--no-wifi-prompt')
      const interactive = !noPrompt && process.stdin.isTTY

      if (!interactive) {
        // Non-interactive: silently preserve existing creds if we found them,
        // otherwise fall back to env vars (flagBroker) or empty.
        if (existing) {
          wifiSsid = existing.ssid
          wifiPassword = existing.password
          mqttBroker = existing.broker || flagBroker
          console.log('')
          console.log(`♻️  Reusing existing WiFi creds from prior build (SSID: ${existing.ssid})`)
        } else {
          wifiSsid = ''
          wifiPassword = ''
          mqttBroker = flagBroker
          console.log('')
          console.log('⚠️  No WiFi credentials found. Run `pnpm build` first or pass')
          console.log('   --wifi-ssid / --wifi-password / --mqtt-broker to this command.')
        }
      } else {
        console.log('')
        const strategy = await promptDeployWifiStrategy(existing?.ssid)
        if (strategy === 'keep' && existing) {
          wifiSsid = existing.ssid
          wifiPassword = existing.password
          mqttBroker = existing.broker
        } else if (strategy === 'enter') {
          const wifi = await promptWifiCredentials()
          wifiSsid = wifi.ssid
          wifiPassword = wifi.password
          mqttBroker = wifi.broker
        }
        // 'skip' → leave all three empty; bundle writer prints the edit path.
      }
    }
  }

  // 4b. DCC-EX: resolve path to local CommandStation-EX source + motor shield.
  //     Precedence: CLI flags > env vars > interactive prompt.
  let dccExSourcePath: string | undefined
  let dccExMotorShield: DccExMotorShield | undefined

  if (isDccEx) {
    const flagSource = getArg(args, '--dcc-ex-source') || process.env.DCC_EX_SOURCE || ''
    const flagShieldRaw =
      getArg(args, '--dcc-ex-shield') || process.env.DCC_EX_MOTOR_SHIELD || ''
    const flagShield =
      flagShieldRaw === 'standard' || flagShieldRaw === 'ex8874'
        ? (flagShieldRaw as DccExMotorShield)
        : undefined

    if (flagSource && flagShield) {
      dccExSourcePath = flagSource
      dccExMotorShield = flagShield
    } else if (!process.stdin.isTTY) {
      console.error('❌ DCC-EX deploy requires --dcc-ex-source and --dcc-ex-shield in non-interactive mode.')
      console.error('   Or set DCC_EX_SOURCE and DCC_EX_MOTOR_SHIELD env vars.')
      process.exit(1)
    } else {
      console.log('')
      console.log('🚂 DCC-EX build settings')
      dccExSourcePath = flagSource || (await promptDccExSourcePath())
      dccExMotorShield = flagShield || (await promptDccExMotorShield())
    }
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
    dccExSourcePath,
    dccExMotorShield,
  })
  const platformLabel = isDccEx
    ? 'DCC-EX'
    : isEsp32Wifi
      ? 'ESP32 WiFi'
      : isArduino
        ? 'Arduino'
        : 'Pico W'
  console.log(`📦 Built ${platformLabel} package → ${relativeDir}/`)

  // 6. Prompt for deploy method
  console.log('')
  const method = await promptDeployMethod(useArduinoDeploy ? 'arduino' : 'pico')

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

  if (useArduinoDeploy) {
    await ensureArduinoCli()
    const boards = findArduinoBoards()
    const port = await promptSerialPort(boards)
    const defaultBoardConfig = resolveBoardConfig(device.type) ?? {
      fqbn: 'arduino:avr:mega:cpu=atmega2560',
      pioPlatform: 'atmelavr',
      pioBoard: 'megaatmega2560',
      needsCpp17: false,
    }
    // 🚂 For DCC-EX, we lock to Mega + motor shield. No board picker.
    const fqbnOverride = isDccEx
      ? undefined
      : boardOverride || (!resolveBoardConfig(device.type) ? await promptArduinoBoard() : undefined)
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
