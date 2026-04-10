// 📦 Shared device-bundle builder used by both `build.ts` and `deploy.ts`.
// Any changes to the firmware output layout should go here so the two stay in sync.
//
// Output layout: dist/<layoutId>/<platform>/<deviceId>/
//   arduino → deja-arduino.ino + config.h
//   pico    → code.py + lib/ + config.json + settings.toml

import fs from 'fs-extra'
import * as path from 'path'
import {
  generateArduinoConfig,
  generatePicoConfig,
  generatePicoSettings,
  type Device,
  type Effect,
  type Turnout,
} from '@repo/modules'

export type Platform = 'arduino' | 'pico' | 'esp32'

export interface WriteBundleOptions {
  layoutId: string
  device: Device
  effects: Effect[]
  turnouts: Turnout[]
  /** Optional Pico W overrides (deploy-time prompts). Defaults come from env. */
  wifiSsid?: string
  wifiPassword?: string
  mqttBroker?: string
  /** Root of the io package — defaults to process.cwd() (i.e. `io/`). */
  rootDir?: string
}

export interface WriteBundleResult {
  platform: Platform
  /** Device bundle root: dist/<layoutId>/<platform>/<deviceId>/ */
  outDir: string
  /**
   * Directory containing the actual entrypoint source file.
   * - arduino: `<outDir>/deja-arduino/` (Arduino IDE requires a sketch folder matching the .ino name)
   * - pico:    equals `<outDir>` (code.py sits at the root)
   */
  sketchDir: string
  relativeDir: string
}

/** Name of the Arduino sketch folder (must match the .ino filename without extension). */
const ARDUINO_SKETCH_NAME = 'deja-arduino'

/**
 * Device types intentionally excluded from the io/ build because they ship
 * with their own firmware sources (dcc-ex uses DCC-EX's upstream sketch;
 * deja-arduino-led has a separate LED-specific codebase).
 */
const EXCLUDED_DEVICE_TYPES = new Set<string>(['dcc-ex', 'deja-arduino-led'])

/** True if this device type is intentionally skipped (has its own source). */
export function isExcludedDeviceType(deviceType: string): boolean {
  return EXCLUDED_DEVICE_TYPES.has(deviceType)
}

/** Map a Firebase device type to a firmware platform, or null if unsupported. */
export function resolvePlatform(deviceType: string): Platform | null {
  if (deviceType === 'deja-arduino') return 'arduino'
  if (deviceType === 'deja-mqtt') return 'pico'
  // 🪧 Future: map an ESP32 device type here → 'esp32'
  return null
}

/**
 * Write a firmware bundle to `dist/<layoutId>/<platform>/<deviceId>/`.
 * Throws if the device type is unsupported or the platform has no builder yet.
 */
export async function writeDeviceBundle(options: WriteBundleOptions): Promise<WriteBundleResult> {
  const { layoutId, device, effects, turnouts, wifiSsid, wifiPassword, mqttBroker } = options
  const rootDir = options.rootDir ?? process.cwd()

  const platform = resolvePlatform(device.type)
  if (!platform) {
    throw new Error(
      `Unknown device type "${device.type}" for device "${device.id}" — expected Arduino or Pico W`
    )
  }

  const relativeDir = path.join('dist', layoutId, platform, device.id)
  const outDir = path.join(rootDir, relativeDir)
  let sketchDir = outDir
  await fs.emptyDir(outDir)

  if (platform === 'arduino') {
    // Arduino IDE requires the .ino to live inside a folder matching its name,
    // so nest the sketch one level deeper: <outDir>/deja-arduino/deja-arduino.ino
    sketchDir = path.join(outDir, ARDUINO_SKETCH_NAME)
    await fs.copy(path.join(rootDir, 'src/deja-arduino'), sketchDir)
    const configH = generateArduinoConfig({ device, effects, turnouts })
    await fs.writeFile(path.join(sketchDir, 'config.h'), configH)

    console.log(`✅ arduino "${device.id}" → ${relativeDir}/${ARDUINO_SKETCH_NAME}/`)
    console.log(`   📄 ${ARDUINO_SKETCH_NAME}.ino + config.h (${effects.length} effects, ${turnouts.length} turnouts)`)
  } else if (platform === 'pico') {
    await fs.copy(path.join(rootDir, 'src/deja-pico-w'), outDir)

    const configJson = generatePicoConfig({ device, effects, turnouts, layoutId })
    await fs.writeFile(path.join(outDir, 'config.json'), configJson)

    const resolvedBroker =
      mqttBroker || process.env.MQTT_BROKER || process.env.VITE_MQTT_BROKER || ''
    const settingsToml = generatePicoSettings({
      device,
      effects,
      turnouts,
      layoutId,
      wifiSsid,
      wifiPassword,
      mqttBroker: resolvedBroker,
    })
    await fs.writeFile(path.join(outDir, 'settings.toml'), settingsToml)

    console.log(`✅ pico "${device.id}" → ${relativeDir}/`)
    console.log(`   📄 config.json (${effects.length} effects)`)
    if (wifiSsid) {
      console.log(`   📄 settings.toml (WiFi: ${wifiSsid})`)
    } else {
      console.log(`   📄 settings.toml (WiFi creds empty — edit before deploying)`)
    }
  } else {
    // 🪧 esp32 support not yet implemented
    throw new Error(`Platform "${platform}" build is not yet implemented`)
  }

  return { platform, outDir, sketchDir, relativeDir }
}
