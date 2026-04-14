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
  generateDccExAutomation,
  generateDccExConfig,
  generateEsp32WifiConfig,
  generatePicoConfig,
  generatePicoSettings,
  getCliDeployCommands,
  type DccExMotorShield,
  type Device,
  type Effect,
  type Loco,
  type Sensor,
  type Signal,
  type Turnout,
} from '@repo/modules'

export type Platform = 'arduino' | 'pico' | 'dcc-ex'

/** Arduino library dependencies shared between platformio.ini generation and arduino-cli install. */
export const ARDUINO_LIB_DEPS = [
  { name: 'Adafruit PWM Servo Driver Library', pioSpec: 'adafruit/Adafruit PWM Servo Driver Library@^3.0.3' },
  { name: 'ArduinoJson', pioSpec: 'bblanchon/ArduinoJson@^7.4.3' },
  { name: 'TurnoutPulser', pioSpec: 'madleech/TurnoutPulser@^1.0.1' },
  // 🛜 MQTT client for deja-esp32-wifi (harmless for Mega/ESP32 serial builds — unused = not linked)
  { name: 'PubSubClient', pioSpec: 'knolleary/PubSubClient@^2.8' },
]

export interface BoardConfig {
  fqbn: string
  pioPlatform: string
  pioBoard: string
  needsCpp17: boolean
  uploadSpeed?: number
}

const BOARD_CONFIGS: Record<string, BoardConfig> = {
  'deja-arduino': {
    fqbn: 'arduino:avr:mega:cpu=atmega2560',
    pioPlatform: 'atmelavr',
    pioBoard: 'megaatmega2560',
    needsCpp17: false,
  },
  'deja-esp32': {
    fqbn: 'esp32:esp32:esp32',
    pioPlatform: 'espressif32@6.7.0',
    pioBoard: 'esp32dev',
    needsCpp17: true,
    uploadSpeed: 460800,
  },
  'deja-esp32-wifi': {
    fqbn: 'esp32:esp32:esp32',
    pioPlatform: 'espressif32@6.7.0',
    pioBoard: 'esp32dev',
    needsCpp17: true,
    uploadSpeed: 460800,
  },
  // 🚂 DCC-EX on Arduino Mega — only combo we support out of the box.
  'dcc-ex': {
    fqbn: 'arduino:avr:mega:cpu=atmega2560',
    pioPlatform: 'atmelavr',
    pioBoard: 'megaatmega2560',
    needsCpp17: false,
  },
}

/** Resolve the board config for a device type, or undefined if not an Arduino-family device. */
export function resolveBoardConfig(deviceType: string): BoardConfig | undefined {
  return BOARD_CONFIGS[deviceType]
}

/** Resolve a full board config from a raw FQBN, so `--board` overrides pick up flags like C++17. */
export function resolveBoardConfigByFqbn(fqbn: string): BoardConfig | undefined {
  return Object.values(BOARD_CONFIGS).find(c => c.fqbn === fqbn)
}

export interface WriteBundleOptions {
  layoutId: string
  device: Device
  effects: Effect[]
  turnouts: Turnout[]
  /** Layout-wide loco roster — populated by firebase.ts only for dcc-ex devices. */
  locos?: Loco[]
  /** Device-bound sensors — only fetched for Arduino-family devices. */
  sensors?: Sensor[]
  /** Device-bound signals — only fetched for Arduino-family devices. */
  signals?: Signal[]
  /** Optional Pico W overrides (deploy-time prompts). Defaults come from env. */
  wifiSsid?: string
  wifiPassword?: string
  mqttBroker?: string
  /**
   * Absolute path to a local DCC-EX CommandStation-EX checkout. Required when
   * bundling a `dcc-ex` device — the entire source tree is copied into the
   * dist so arduino-cli can compile it with our generated config.h/myAutomation.h
   * on top.
   */
  dccExSourcePath?: string
  /** Motor shield choice for DCC-EX builds. Defaults to 'standard'. */
  dccExMotorShield?: DccExMotorShield
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
/** Name of the deja-esp32-wifi sketch folder (must match the .ino filename without extension). */
const ARDUINO_ESP32_WIFI_SKETCH_NAME = 'deja-esp32-wifi'
/** Upstream DCC-EX sketch folder name — must match CommandStation-EX.ino. */
const DCC_EX_SKETCH_NAME = 'CommandStation-EX'

/**
 * Device types intentionally excluded from the io/ build.
 * `deja-arduino-led` has its own LED-specific firmware codebase and is not
 * built by this tool. (`dcc-ex` is NOT excluded — it now produces a
 * `myAutomation.h` config file instead of being skipped entirely.)
 */
const EXCLUDED_DEVICE_TYPES = new Set<string>(['deja-arduino-led'])

/** True if this device type is intentionally skipped (has its own source). */
export function isExcludedDeviceType(deviceType: string): boolean {
  return EXCLUDED_DEVICE_TYPES.has(deviceType)
}

/** Map a Firebase device type to a firmware platform, or null if unsupported. */
export function resolvePlatform(deviceType: string): Platform | null {
  if (
    deviceType === 'deja-arduino' ||
    deviceType === 'deja-esp32' ||
    deviceType === 'deja-esp32-wifi'
  )
    return 'arduino'
  if (deviceType === 'deja-mqtt') return 'pico'
  if (deviceType === 'dcc-ex') return 'dcc-ex'
  return null
}

/** True if this device type needs WiFi/MQTT credentials baked into its bundle. */
export function isWifiDevice(deviceType: string): boolean {
  return deviceType === 'deja-esp32-wifi' || deviceType === 'deja-mqtt'
}

/** True if this device type compiles with arduino-cli (shares the Arduino deploy path). */
export function isArduinoCompilable(deviceType: string): boolean {
  return (
    deviceType === 'deja-arduino' ||
    deviceType === 'deja-esp32' ||
    deviceType === 'deja-esp32-wifi' ||
    deviceType === 'dcc-ex'
  )
}

export interface ExistingWifiCreds {
  ssid: string
  password: string
  broker: string
}

/**
 * Try to read WiFi/MQTT creds out of an already-built bundle so that a
 * subsequent deploy can preserve user edits without re-prompting. Returns
 * `null` if nothing usable was found (file missing, or SSID is blank).
 *
 * The parsing is intentionally loose — it matches the shapes emitted by
 * `generatePicoSettings` / `generateEsp32WifiConfig`, plus any hand-edited
 * values using the same key names.
 */
export async function readExistingWifiCreds(
  layoutId: string,
  device: Device,
  rootDir: string = process.cwd(),
): Promise<ExistingWifiCreds | null> {
  const platform = resolvePlatform(device.type)
  if (!platform) return null

  const outDir = path.join(rootDir, 'dist', layoutId, platform, device.id)

  if (device.type === 'deja-mqtt') {
    const tomlPath = path.join(outDir, 'settings.toml')
    if (!(await fs.pathExists(tomlPath))) return null
    const raw = await fs.readFile(tomlPath, 'utf8')
    const creds: ExistingWifiCreds = {
      ssid: matchTomlString(raw, 'CIRCUITPY_WIFI_SSID'),
      password: matchTomlString(raw, 'CIRCUITPY_WIFI_PASSWORD'),
      broker: matchTomlString(raw, 'MQTT_BROKER'),
    }
    return creds.ssid ? creds : null
  }

  if (device.type === 'deja-esp32-wifi') {
    const configPath = path.join(outDir, ARDUINO_ESP32_WIFI_SKETCH_NAME, 'config.h')
    if (!(await fs.pathExists(configPath))) return null
    const raw = await fs.readFile(configPath, 'utf8')
    const creds: ExistingWifiCreds = {
      ssid: matchCDefineString(raw, 'WIFI_SSID'),
      password: matchCDefineString(raw, 'WIFI_PASSWORD'),
      broker: matchCDefineString(raw, 'MQTT_BROKER'),
    }
    return creds.ssid ? creds : null
  }

  return null
}

/** Extract `KEY = "value"` from TOML text. Returns empty string when missing. */
function matchTomlString(text: string, key: string): string {
  const re = new RegExp(`^\\s*${key}\\s*=\\s*"([^"]*)"`, 'm')
  return text.match(re)?.[1] ?? ''
}

/** Extract `#define KEY "value"` from C header text. Returns empty when missing. */
function matchCDefineString(text: string, key: string): string {
  const re = new RegExp(`^\\s*#define\\s+${key}\\s+"([^"]*)"`, 'm')
  return text.match(re)?.[1] ?? ''
}

/** Generate cross-platform deployment files for Arduino bundles. */
async function generateArduinoCrossPlatformFiles(
  outDir: string,
  deviceId: string,
  deviceType: string,
  layoutId: string,
  effects: Effect[],
  turnouts: Turnout[],
  sketchName: string = ARDUINO_SKETCH_NAME
): Promise<void> {
  const libDeps = ARDUINO_LIB_DEPS.map(l => `    ${l.pioSpec}`).join('\n')
  const boardConfig = resolveBoardConfig(deviceType)
  const defaultEnv = boardConfig?.pioBoard ?? 'megaatmega2560'
  // 🎯 deja-esp32-wifi only targets esp32dev — don't bother emitting the AVR env.
  const isEsp32Wifi = sketchName === ARDUINO_ESP32_WIFI_SKETCH_NAME

  const envBlocks = isEsp32Wifi
    ? `[env:esp32dev]
platform = espressif32@6.7.0
board = esp32dev
build_flags = -std=c++17
upload_speed = 460800
`
    : `[env:megaatmega2560]
platform = atmelavr
board = megaatmega2560

[env:esp32dev]
platform = espressif32@6.7.0
board = esp32dev
build_flags = -std=c++17
upload_speed = 460800
`

  // 📋 platformio.ini — multi-board with shared lib_deps
  const platformioIni = `; PlatformIO Project Configuration File
; Cross-platform deployment: PlatformIO, Arduino CLI, Arduino IDE
; Generated by io/scripts/build.ts for device: ${deviceId}
; https://docs.platformio.org/page/projectconf.html

[platformio]
default_envs = ${defaultEnv}
src_dir = ${sketchName}
include_dir = ${sketchName}

[env]
framework = arduino
lib_deps =
${libDeps}
monitor_speed = 115200
monitor_echo = yes

${envBlocks}`

  await fs.writeFile(path.join(outDir, 'platformio.ini'), platformioIni)

  // 🎯 .arduino-cli.yaml
  const arduinoCliYaml = `board_manager:
  additional_urls:
    - https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
    - https://arduino.esp8266.com/stable/package_esp8266com_index.json
    - https://adafruit.github.io/arduino-board-index/package_adafruit_index.json

directories:
  data: ~/.arduino15
  downloads: ~/.arduino15/staging
  user: ./

library:
  enable_unsafe_install: false

logging:
  file: ""
  format: text
  level: info

metrics:
  addr: :9090
  enabled: true

sketch:
  always_export_binaries: false

updater:
  enable_notification: true
`

  await fs.writeFile(path.join(outDir, '.arduino-cli.yaml'), arduinoCliYaml)

  // 🙈 .gitignore
  const gitignore = `# Build outputs
.pio/
build/
*.o
*.a
*.elf
*.hex
*.bin

# IDE
.vscode/.browse.c_cpp.db*
.vscode/c_cpp_properties.json
.vscode/launch.json
.vscode/ipch
.DS_Store
*.swp
*.swo
*~

# PlatformIO
.platformio/
.pioenvs/
.piolibdeps/

# Arduino IDE
*.ino.cpp
*.ino.c
*.ino.h

# Generated config (keep template, but ignore user edits)
config.h
!config.default.h
`

  await fs.writeFile(path.join(outDir, '.gitignore'), gitignore)

  // 📖 DEPLOYMENT.md — pulls CLI commands from the @repo/modules helper so this
  // template, the Cloud UI device-details panel, and the actual `pnpm run deploy`
  // pipeline all show the same FQBN / sketch folder / upload speed for each
  // device type. Without the helper this file used to hardcode the AVR Mega
  // FQBN even for esp32 devices.
  const cli = getCliDeployCommands({ deviceType, deviceId, layoutId })
  const ideBoardLine = isEsp32Wifi || deviceType === 'deja-esp32'
    ? '**Tools → Board → ESP32 Arduino → ESP32 Dev Module**'
    : '**Tools → Board → Arduino AVR Boards → Arduino Mega or Mega 2560**'
  const ideExtraLine = isEsp32Wifi || deviceType === 'deja-esp32'
    ? '6. **Tools → Upload Speed → 460800**'
    : '6. **Tools → Processor → ATmega2560 (Mega 2560)**'
  const libraryList = ARDUINO_LIB_DEPS.map(l => `   - \`${l.name}\``).join('\n')
  const libInstallLines = ARDUINO_LIB_DEPS.map(l => `arduino-cli lib install "${l.name}"`).join('\n')

  const deploymentMd = `# 🚀 ${deviceId} - Cross-Platform Deployment Guide

This firmware package is configured to deploy seamlessly across **PlatformIO**, **Arduino CLI**, and **Arduino IDE**.

Device type: \`${deviceType}\` · Sketch: \`${sketchName}\` · FQBN: \`${cli?.fqbn ?? 'unknown'}\`

Generated: ${new Date().toISOString()}
Effects: ${effects.length} | Turnouts: ${turnouts.length}

## 📁 Project Structure

\`\`\`
.
├── ${sketchName}/
│   ├── ${sketchName}.ino       # Main sketch
│   ├── config.h                 # Generated configuration
│   └── config.default.h         # Fallback defaults
├── platformio.ini               # PlatformIO config
├── .arduino-cli.yaml           # Arduino CLI config
├── .gitignore
└── lib/                        # Custom Arduino libraries (optional)
\`\`\`

## 🚀 Quick Start

> All commands below assume you have already \`cd\`d into this bundle directory.

### Option A: PlatformIO (⭐ Recommended)

\`\`\`bash
# Install
pip install platformio

# Build + upload + monitor (env: ${cli?.pioEnv ?? 'unknown'})
${cli?.platformio ?? 'platformio run --target upload'}
platformio device monitor --port /dev/cu.usbserial-*
\`\`\`

### Option B: Arduino CLI

\`\`\`bash
# Install CLI (one time)
brew install arduino-cli
arduino-cli config init --overwrite
arduino-cli update
${isEsp32Wifi || deviceType === 'deja-esp32'
  ? 'arduino-cli core install esp32:esp32'
  : 'arduino-cli core install arduino:avr'}

# Install libraries (one time)
${libInstallLines}

# Compile + upload (FQBN: ${cli?.fqbn ?? 'unknown'})
${cli?.arduinoCli ?? 'arduino-cli compile && arduino-cli upload'}
\`\`\`

### Option C: Arduino IDE

1. Open **Arduino IDE**
2. Go to **Sketch → Include Library → Manage Libraries** and install:
${libraryList}
3. **File → Open → \`${sketchName}/${sketchName}.ino\`**
4. ${ideBoardLine}
5. ${ideExtraLine}
6. **Tools → Port → \`/dev/cu.usbserial-*\`**
7. Click **Upload** button

## 📦 Generated Configuration

**Effects:** ${effects.length}
**Turnouts:** ${turnouts.length}

See \`${sketchName}/config.h\` for detailed pin mappings and feature flags.

## 🔌 Communication

${
  isEsp32Wifi
    ? `**Transport:** WiFi + MQTT
**Subscribe topic:** \`DEJA/<layoutId>/<deviceId>\` — server publishes commands here
**Publish topic:** \`DEJA/<layoutId>/<deviceId>/messages\` — device publishes sensor events here

**Command format (single object, JSON):**
\`\`\`json
{ "action": "pin", "device": "${deviceId}", "payload": { "pin": 42, "state": true } }
\`\`\``
    : `**Transport:** USB serial @ 115200 baud

**Command format (JSON array):**
\`\`\`json
[
  { "action": "pin", "payload": { "pin": 42, "state": true } },
  { "action": "servo", "payload": { "servo": 0, "value": 90, "current": 45 } },
  { "action": "turnout", "payload": { "turnout": 0, "state": true } }
]
\`\`\``
}

---

Generated by DEJA.js IO build system
`

  await fs.writeFile(path.join(outDir, 'DEPLOYMENT.md'), deploymentMd)
}

/**
 * Write a firmware bundle to \`dist/<layoutId>/<platform>/<deviceId>/\`.
 * Throws if the device type is unsupported or the platform has no builder yet.
 */
export async function writeDeviceBundle(options: WriteBundleOptions): Promise<WriteBundleResult> {
  const { layoutId, device, effects, turnouts, sensors, signals, wifiSsid, wifiPassword, mqttBroker } = options
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
    // 📡 Map device-bound sensors/signals to the pin arrays config.h expects.
    // sensorPins is string[] so Arduino analog names (A0) and raw ints both render.
    // signalPins flattens each signal's red/yellow/green into one int array.
    const sensorPins = (sensors ?? [])
      .filter(s => s.pin !== undefined && s.pin !== null)
      .map(s => String(s.pin))
    const signalPins = (signals ?? [])
      .flatMap(s => [s.red, s.yellow, s.green])
      .filter((p): p is number => typeof p === 'number')

    if (device.type === 'deja-esp32-wifi') {
      // 🛜 ESP32 WiFi+MQTT firmware variant — different sketch folder + config generator.
      sketchDir = path.join(outDir, ARDUINO_ESP32_WIFI_SKETCH_NAME)
      await fs.copy(path.join(rootDir, 'src/deja-esp32-wifi'), sketchDir)

      const resolvedBroker =
        mqttBroker || process.env.MQTT_BROKER || process.env.VITE_MQTT_BROKER || ''

      const configH = generateEsp32WifiConfig({
        device,
        effects,
        turnouts,
        sensorPins,
        signalPins,
        layoutId,
        wifiSsid,
        wifiPassword,
        mqttBroker: resolvedBroker,
        topicId: 'DEJA',
      })
      await fs.writeFile(path.join(sketchDir, 'config.h'), configH)

      await generateArduinoCrossPlatformFiles(
        outDir,
        device.id,
        device.type,
        layoutId,
        effects,
        turnouts,
        ARDUINO_ESP32_WIFI_SKETCH_NAME
      )

      console.log(`✅ esp32-wifi "${device.id}" → ${relativeDir}/${ARDUINO_ESP32_WIFI_SKETCH_NAME}/`)
      console.log(
        `   📄 ${ARDUINO_ESP32_WIFI_SKETCH_NAME}.ino + config.h (${effects.length} effects, ${turnouts.length} turnouts, ${sensorPins.length} sensors, ${signalPins.length} signal pins)`
      )
      if (wifiSsid) {
        console.log(`   📶 WiFi: ${wifiSsid}, MQTT: ${resolvedBroker || '(empty — edit before flash)'}`)
      } else {
        const configPath = path.join(relativeDir, ARDUINO_ESP32_WIFI_SKETCH_NAME, 'config.h')
        console.log(`   ⚠️  WiFi/MQTT skipped — edit before flashing:`)
        console.log(`      ${configPath}`)
        console.log(`      Fields: WIFI_SSID, WIFI_PASSWORD, MQTT_BROKER_HOST`)
      }
      console.log(`   ⚙️  platformio.ini, .arduino-cli.yaml, DEPLOYMENT.md`)
    } else {
      // Arduino IDE requires the .ino to live inside a folder matching its name,
      // so nest the sketch one level deeper: <outDir>/deja-arduino/deja-arduino.ino
      sketchDir = path.join(outDir, ARDUINO_SKETCH_NAME)
      await fs.copy(path.join(rootDir, 'src/deja-arduino'), sketchDir)

      const configH = generateArduinoConfig({
        device,
        effects,
        turnouts,
        sensorPins,
        signalPins,
      })
      await fs.writeFile(path.join(sketchDir, 'config.h'), configH)

      // Generate cross-platform deployment files
      await generateArduinoCrossPlatformFiles(outDir, device.id, device.type, layoutId, effects, turnouts)

      console.log(`✅ arduino "${device.id}" → ${relativeDir}/${ARDUINO_SKETCH_NAME}/`)
      console.log(
        `   📄 ${ARDUINO_SKETCH_NAME}.ino + config.h (${effects.length} effects, ${turnouts.length} turnouts, ${sensorPins.length} sensors, ${signalPins.length} signal pins)`
      )
      console.log(`   ⚙️  platformio.ini, .arduino-cli.yaml, DEPLOYMENT.md`)
    }
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

    const servoTurnoutCount = turnouts.filter(t => t.type === 'servo').length
    console.log(`✅ pico "${device.id}" → ${relativeDir}/`)
    console.log(
      `   📄 config.json (${effects.length} effects, ${turnouts.length} turnouts${
        servoTurnoutCount > 0 ? `, ${servoTurnoutCount} servo → PWM auto-enabled` : ''
      })`
    )
    if (wifiSsid) {
      console.log(`   📄 settings.toml (WiFi: ${wifiSsid})`)
    } else {
      const tomlPath = path.join(relativeDir, 'settings.toml')
      console.log(`   ⚠️  WiFi/MQTT skipped — edit before deploying:`)
      console.log(`      ${tomlPath}`)
      console.log(`      Fields: CIRCUITPY_WIFI_SSID, CIRCUITPY_WIFI_PASSWORD, MQTT_BROKER`)
    }
  } else if (platform === 'dcc-ex') {
    // 🚂 DCC-EX bundle: copy the user's local CommandStation-EX checkout into
    // dist, then write our generated config.h + myAutomation.h on top. The
    // resulting sketch folder is arduino-cli-compilable via the standard flow.
    if (!options.locos) {
      throw new Error(
        `dcc-ex device "${device.id}" requires locos in WriteBundleOptions — ` +
          `did io/scripts/lib/firebase.ts forget to fetch them?`
      )
    }
    if (!options.dccExSourcePath) {
      throw new Error(
        `dcc-ex device "${device.id}" requires dccExSourcePath in WriteBundleOptions — ` +
          `pass the path to your local CommandStation-EX checkout (via prompt, ` +
          `--dcc-ex-source, or DCC_EX_SOURCE env var).`
      )
    }
    if (!(await fs.pathExists(options.dccExSourcePath))) {
      throw new Error(
        `DCC-EX source path does not exist: ${options.dccExSourcePath}`
      )
    }
    const upstreamIno = path.join(options.dccExSourcePath, 'CommandStation-EX.ino')
    if (!(await fs.pathExists(upstreamIno))) {
      throw new Error(
        `DCC-EX source path is missing CommandStation-EX.ino: ${options.dccExSourcePath}`
      )
    }

    sketchDir = path.join(outDir, DCC_EX_SKETCH_NAME)

    // Copy the entire upstream checkout into our sketch folder, skipping
    // VCS metadata and build artifacts so fs.copy stays fast.
    await fs.copy(options.dccExSourcePath, sketchDir, {
      filter: (src: string) => {
        const name = path.basename(src)
        if (name === '.git') return false
        if (name === 'node_modules') return false
        if (name === '.vscode') return false
        if (name === 'build') return false
        return true
      },
    })

    const motorShield: DccExMotorShield = options.dccExMotorShield ?? 'standard'
    const configH = generateDccExConfig({ device, layoutId, motorShield })
    await fs.writeFile(path.join(sketchDir, 'config.h'), configH)

    const automationH = generateDccExAutomation({
      device,
      layoutId,
      locos: options.locos,
    })
    await fs.writeFile(path.join(sketchDir, 'myAutomation.h'), automationH)

    const rosterCount = (automationH.match(/^ROSTER\(/gm) || []).length
    console.log(`✅ dcc-ex "${device.id}" → ${relativeDir}/${DCC_EX_SKETCH_NAME}/`)
    console.log(`   📄 config.h (motor shield: ${motorShield})`)
    console.log(`   📄 myAutomation.h (${rosterCount} ROSTER entries)`)
    console.log(`   📂 Upstream source copied from: ${options.dccExSourcePath}`)
  } else {
    throw new Error(`Platform "${platform}" build is not yet implemented for device "${device.id}"`)
  }

  return { platform, outDir, sketchDir, relativeDir }
}
