// 🔧 Enhanced build script for IO firmware
//
// Usage:
//   pnpm build                                # build every device in every layout I own
//   pnpm build -- --email you@example.com     # override the owner email
//   pnpm build -- --layout <id>               # build every device in one layout
//   pnpm build -- --layout <id> --device <id> # build a single device
//   pnpm build -- --copy-only                 # legacy: plain src/ → dist/ copy
//
// WiFi / MQTT credentials for wifi-capable devices (deja-esp32-wifi, deja-mqtt):
//   By default, the build prompts once when the first wifi device is encountered
//   and reuses the same credentials for the rest of the build. To bake creds in
//   non-interactively (CI, scripting) or skip the prompt entirely, use:
//     --wifi-ssid <ssid>      # SSID (also enables non-interactive mode)
//     --wifi-password <pwd>   # Password (omit if network is open)
//     --mqtt-broker <host>    # MQTT broker host/IP
//     --no-wifi-prompt        # Skip the prompt — emit empty creds and warn
//
// DCC-EX CommandStation builds (dcc-ex devices):
//   The first time a dcc-ex device is encountered, build prompts once for the
//   path to your local CommandStation-EX checkout and your motor shield type.
//   To skip the prompt (CI / scripting), pass:
//     --dcc-ex-source <path>  # absolute path to CommandStation-EX checkout
//     --dcc-ex-shield <val>   # 'standard' or 'ex8874'
//   Or set DCC_EX_SOURCE / DCC_EX_MOTOR_SHIELD env vars. Only Arduino Mega
//   + Standard Motor Shield or EX-MotorShield8874 are supported.
//
// The per-device bundle layout lives in `./lib/bundle.ts` — shared with deploy.ts.
// Owner email resolution order:  --email flag → DEJA_OWNER_EMAIL → VITE_DEMO_EMAIL

import fs from 'fs-extra'
import * as path from 'path'
import type { DccExMotorShield } from '@repo/modules'
import { isExcludedDeviceType, isWifiDevice, resolvePlatform, writeDeviceBundle } from './lib/bundle.js'
import {
  promptDccExMotorShield,
  promptDccExSourcePath,
  promptWifiCredentials,
  promptWifiStrategy,
} from './lib/prompts.js'

interface WifiCreds {
  ssid: string
  password: string
  broker: string
}

interface DccExSettings {
  sourcePath: string
  motorShield: DccExMotorShield
}

type DccExResolver = () => Promise<DccExSettings | null>

/**
 * Lazy DCC-EX resolver: first time a dcc-ex device is about to be built, this
 * prompts for the CommandStation-EX source path and motor shield (or pulls
 * them from flags/env) and caches the answer for any other dcc-ex devices in
 * the same build session. Returns `null` when nothing is resolvable (e.g.
 * non-interactive with no flags), and the bundle writer will throw with a
 * clear error so the user knows what to fix.
 */
function createDccExResolver(
  flagSource: string | undefined,
  flagShield: DccExMotorShield | undefined,
  options: { skipPrompt: boolean },
): DccExResolver {
  let cached: DccExSettings | null | undefined

  return async () => {
    if (cached !== undefined) return cached

    const envSource = flagSource || process.env.DCC_EX_SOURCE || ''
    const envShield = flagShield || parseMotorShield(process.env.DCC_EX_MOTOR_SHIELD)

    if (envSource && envShield) {
      cached = { sourcePath: envSource, motorShield: envShield }
      return cached
    }

    if (options.skipPrompt || !process.stdin.isTTY) {
      cached = null
      return null
    }

    console.log('')
    console.log('🚂 DCC-EX build settings')
    const sourcePath = envSource || (await promptDccExSourcePath())
    const motorShield = envShield || (await promptDccExMotorShield())
    cached = { sourcePath, motorShield }
    return cached
  }
}

function parseMotorShield(val: string | undefined): DccExMotorShield | undefined {
  return val === 'standard' || val === 'ex8874' ? val : undefined
}

/**
 * Lazy WiFi-cred resolver: the first time a wifi-capable device is about to be
 * built, this prompts the user (enter now vs. skip) and caches the answer for
 * all subsequent wifi devices in the same build session. Returns `null` when
 * the user chose to skip or no prompt is possible.
 */
type WifiResolver = () => Promise<WifiCreds | null>

function createWifiResolver(
  flagCreds: Partial<WifiCreds>,
  options: { skipPrompt: boolean },
): WifiResolver {
  let cached: WifiCreds | null | undefined

  return async () => {
    if (cached !== undefined) return cached

    // Flags take precedence — skip the prompt entirely.
    if (flagCreds.ssid) {
      cached = {
        ssid: flagCreds.ssid,
        password: flagCreds.password ?? '',
        broker:
          flagCreds.broker ?? process.env.MQTT_BROKER ?? process.env.VITE_MQTT_BROKER ?? '',
      }
      return cached
    }

    // Explicit --no-wifi-prompt, or non-TTY (CI) — skip silently.
    if (options.skipPrompt || !process.stdin.isTTY) {
      cached = null
      return null
    }

    console.log('')
    const strategy = await promptWifiStrategy()
    if (strategy === 'skip') {
      cached = null
      return null
    }

    const creds = await promptWifiCredentials()
    cached = creds
    return cached
  }
}

async function build() {
  const args = process.argv.slice(2)

  if (args.includes('--copy-only')) {
    await buildDefault()
    return
  }

  const layoutId = getArg(args, '--layout')
  const deviceId = getArg(args, '--device')
  const emailOverride = getArg(args, '--email')

  const wifiResolver = createWifiResolver(
    {
      ssid: getArg(args, '--wifi-ssid'),
      password: getArg(args, '--wifi-password'),
      broker: getArg(args, '--mqtt-broker'),
    },
    { skipPrompt: args.includes('--no-wifi-prompt') },
  )

  const dccExResolver = createDccExResolver(
    getArg(args, '--dcc-ex-source'),
    parseMotorShield(getArg(args, '--dcc-ex-shield')),
    { skipPrompt: args.includes('--no-dcc-ex-prompt') },
  )

  if (layoutId && deviceId) {
    await buildForDevice(layoutId, deviceId, wifiResolver, dccExResolver)
  } else if (layoutId) {
    await buildForLayout(layoutId, wifiResolver, dccExResolver)
  } else if (deviceId) {
    console.error('❌ --device requires --layout')
    process.exit(1)
  } else {
    await buildForOwner(emailOverride, wifiResolver, dccExResolver)
  }
}

function getArg(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag)
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined
}

/** Legacy behavior: plain copy from src/ → dist/ (no Firebase). */
async function buildDefault() {
  await fs.ensureDir('dist')
  await fs.copy('./src/', './dist/')
  console.log('✅ Build completed! Files copied from src/ to dist/')
}

/**
 * Build every layout owned by the caller.
 * Email source: --email flag → DEJA_OWNER_EMAIL → VITE_DEMO_EMAIL.
 */
async function buildForOwner(
  emailOverride: string | undefined,
  wifiResolver: WifiResolver,
  dccExResolver: DccExResolver,
) {
  await loadEnv()

  const ownerEmail =
    emailOverride || process.env.DEJA_OWNER_EMAIL || process.env.VITE_DEMO_EMAIL

  if (!ownerEmail) {
    console.error('❌ No owner email configured.')
    console.error('   Pass --email <email>, or set DEJA_OWNER_EMAIL (or VITE_DEMO_EMAIL) in .env')
    process.exit(1)
  }

  const { listLayoutsByOwner } = await import('./lib/firebase.js')

  console.log(`🔥 Finding layouts owned by "${ownerEmail}"...`)
  const layouts = await listLayoutsByOwner(ownerEmail)
  if (layouts.length === 0) {
    console.error(`❌ No layouts found for owner "${ownerEmail}"`)
    process.exit(1)
  }

  console.log(`📚 Found ${layouts.length} layout(s): ${layouts.map(l => l.id).join(', ')}`)
  console.log('')

  let totalBuilt = 0
  let totalSkipped = 0
  for (const layout of layouts) {
    console.log(`━━━ ${layout.name || layout.id} (${layout.id}) ━━━`)
    const { built, skipped } = await buildLayoutDevices(layout.id, {}, wifiResolver, dccExResolver)
    totalBuilt += built
    totalSkipped += skipped
    console.log('')
  }

  console.log(
    `✅ Built ${totalBuilt} device(s) across ${layouts.length} layout(s)` +
      (totalSkipped ? ` (${totalSkipped} skipped)` : '')
  )
}

/** Build every device in a single layout. */
async function buildForLayout(
  layoutId: string,
  wifiResolver: WifiResolver,
  dccExResolver: DccExResolver,
) {
  await loadEnv()
  const { built, skipped } = await buildLayoutDevices(
    layoutId,
    { exitIfEmpty: true },
    wifiResolver,
    dccExResolver,
  )
  console.log('')
  console.log(
    `✅ Built ${built} device(s) into dist/${layoutId}/` + (skipped ? ` (${skipped} skipped)` : '')
  )
}

/** Build a single device. */
async function buildForDevice(
  layoutId: string,
  deviceId: string,
  wifiResolver: WifiResolver,
  dccExResolver: DccExResolver,
) {
  await loadEnv()
  const { getDeviceConfig } = await import('./lib/firebase.js')

  console.log(`🔥 Fetching config for device "${deviceId}" in layout "${layoutId}"...`)
  const { device, effects, turnouts, locos, sensors, signals } = await getDeviceConfig(layoutId, deviceId)

  const wifi = isWifiDevice(device.type) ? await wifiResolver() : null
  const dccEx = device.type === 'dcc-ex' ? await dccExResolver() : null
  await writeDeviceBundle({
    layoutId,
    device,
    effects,
    turnouts,
    locos,
    sensors,
    signals,
    wifiSsid: wifi?.ssid,
    wifiPassword: wifi?.password,
    mqttBroker: wifi?.broker,
    dccExSourcePath: dccEx?.sourcePath,
    dccExMotorShield: dccEx?.motorShield,
  })
}

/**
 * Fetch every device in a layout and write its bundle.
 * Shared between `buildForLayout` (single-layout mode) and `buildForOwner` (multi-layout mode).
 */
async function buildLayoutDevices(
  layoutId: string,
  opts: { exitIfEmpty?: boolean } = {},
  wifiResolver: WifiResolver,
  dccExResolver: DccExResolver,
): Promise<{ built: number; skipped: number }> {
  const { getDeviceConfig, listDevices } = await import('./lib/firebase.js')

  const devices = await listDevices(layoutId)
  if (devices.length === 0) {
    const msg = `⚠️  No devices found in layout "${layoutId}"`
    if (opts.exitIfEmpty) {
      console.error(`❌ ${msg.slice(3)}`)
      process.exit(1)
    }
    console.warn(msg)
    return { built: 0, skipped: 0 }
  }

  let built = 0
  let skipped = 0
  for (const device of devices) {
    if (isExcludedDeviceType(device.type)) {
      console.log(`   ↷  Skipping "${device.id}" (${device.type} — has own firmware source)`)
      skipped++
      continue
    }
    if (!resolvePlatform(device.type)) {
      console.warn(`⚠️  Skipping "${device.id}" — unsupported device type "${device.type}"`)
      skipped++
      continue
    }
    const config = await getDeviceConfig(layoutId, device.id)
    const wifi = isWifiDevice(config.device.type) ? await wifiResolver() : null
    const dccEx = config.device.type === 'dcc-ex' ? await dccExResolver() : null
    await writeDeviceBundle({
      layoutId,
      device: config.device,
      effects: config.effects,
      turnouts: config.turnouts,
      locos: config.locos,
      sensors: config.sensors,
      signals: config.signals,
      wifiSsid: wifi?.ssid,
      wifiPassword: wifi?.password,
      mqttBroker: wifi?.broker,
      dccExSourcePath: dccEx?.sourcePath,
      dccExMotorShield: dccEx?.motorShield,
    })
    built++
  }

  return { built, skipped }
}

/** Load env vars from root and local .env for Firebase access. */
async function loadEnv() {
  const dotenv = await import('dotenv')
  dotenv.config({ path: path.resolve(process.cwd(), '../.env') })
  dotenv.config({ path: path.resolve(process.cwd(), '.env') })
}

build().catch(err => {
  console.error('💥 Build failed:', err)
  process.exit(1)
})
