// 🔧 Enhanced build script for IO firmware
// Without flags: copies src/ → dist/ (original behavior)
// With --layout + --device: fetches from Firebase, generates device-specific config

import * as fs from 'fs-extra'
import * as path from 'path'

async function build() {
  const args = process.argv.slice(2)
  const layoutId = getArg(args, '--layout')
  const deviceId = getArg(args, '--device')

  if (layoutId && deviceId) {
    await buildForDevice(layoutId, deviceId)
  } else if (layoutId || deviceId) {
    console.error('❌ Both --layout and --device are required for device-specific builds')
    process.exit(1)
  } else {
    await buildDefault()
  }
}

function getArg(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag)
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined
}

/** Original behavior: copy src/ → dist/ */
async function buildDefault() {
  await fs.ensureDir('dist')
  await fs.copy('./src/', './dist/')
  console.log('✅ Build completed! Files copied from src/ to dist/')
}

/** Device-specific build: fetch from Firebase, generate configs */
async function buildForDevice(layoutId: string, deviceId: string) {
  // Load env vars for Firebase
  const dotenv = await import('dotenv')
  dotenv.config({ path: path.resolve(process.cwd(), '../.env') })
  dotenv.config({ path: path.resolve(process.cwd(), '.env') })

  const { getDeviceConfig } = await import('./lib/firebase.js')
  const { generateArduinoConfig } = await import('./lib/config-arduino.js')
  const { generatePicoSettings, generatePicoConfig } = await import('./lib/config-pico.js')

  console.log(`🔥 Fetching config for device "${deviceId}" in layout "${layoutId}"...`)
  const config = await getDeviceConfig(layoutId, deviceId)
  const { device, effects, turnouts } = config

  const isArduino = ['dcc-ex', 'deja-arduino', 'deja-arduino-led'].includes(device.type)
  const isPicoW = device.type === 'deja-mqtt'

  const outDir = path.join('dist', deviceId)
  await fs.ensureDir(outDir)

  if (isArduino) {
    // Copy Arduino firmware source
    await fs.copy('./src/deja-arduino/', outDir)
    // Generate config.h from Firebase data
    const configH = generateArduinoConfig({ device, effects, turnouts })
    await fs.writeFile(path.join(outDir, 'config.h'), configH)
    // Keep the default as reference
    await fs.copy('./src/deja-arduino/config.default.h', path.join(outDir, 'config.default.h'))

    console.log(`✅ Arduino build for "${deviceId}" → dist/${deviceId}/`)
    console.log(`   📄 config.h generated (${effects.length} effects, ${turnouts.length} turnouts)`)
  } else if (isPicoW) {
    // Copy Pico W firmware source
    await fs.copy('./src/deja-pico-w/', outDir)

    // Generate config.json from Firebase effects
    const configJson = generatePicoConfig({ device, effects, turnouts, layoutId })
    await fs.writeFile(path.join(outDir, 'config.json'), configJson)

    // Generate settings.toml (WiFi creds left empty — filled at deploy time or manually)
    const mqttBroker = process.env.MQTT_BROKER || process.env.VITE_MQTT_BROKER || ''
    const settingsToml = generatePicoSettings({
      device,
      effects,
      turnouts,
      layoutId,
      mqttBroker,
    })
    await fs.writeFile(path.join(outDir, 'settings.toml'), settingsToml)

    console.log(`✅ Pico W build for "${deviceId}" → dist/${deviceId}/`)
    console.log(`   📄 config.json generated (${effects.length} effects)`)
    console.log(`   📄 settings.toml generated (WiFi creds empty — edit before deploying)`)
  } else {
    console.error(`❌ Unknown device type: "${device.type}" — expected Arduino or Pico W`)
    process.exit(1)
  }
}

build().catch(err => {
  console.error('💥 Build failed:', err)
  process.exit(1)
})
