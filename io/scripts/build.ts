// 🔧 Enhanced build script for IO firmware
//
// Usage:
//   pnpm build                                # build every device in every layout I own
//   pnpm build -- --email you@example.com     # override the owner email
//   pnpm build -- --layout <id>               # build every device in one layout
//   pnpm build -- --layout <id> --device <id> # build a single device
//   pnpm build -- --copy-only                 # legacy: plain src/ → dist/ copy
//
// The per-device bundle layout lives in `./lib/bundle.ts` — shared with deploy.ts.
// Owner email resolution order:  --email flag → DEJA_OWNER_EMAIL → VITE_DEMO_EMAIL

import fs from 'fs-extra'
import * as path from 'path'
import { isExcludedDeviceType, resolvePlatform, writeDeviceBundle } from './lib/bundle.js'

async function build() {
  const args = process.argv.slice(2)

  if (args.includes('--copy-only')) {
    await buildDefault()
    return
  }

  const layoutId = getArg(args, '--layout')
  const deviceId = getArg(args, '--device')
  const emailOverride = getArg(args, '--email')

  if (layoutId && deviceId) {
    await buildForDevice(layoutId, deviceId)
  } else if (layoutId) {
    await buildForLayout(layoutId)
  } else if (deviceId) {
    console.error('❌ --device requires --layout')
    process.exit(1)
  } else {
    await buildForOwner(emailOverride)
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
async function buildForOwner(emailOverride?: string) {
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
    const { built, skipped } = await buildLayoutDevices(layout.id)
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
async function buildForLayout(layoutId: string) {
  await loadEnv()
  const { built, skipped } = await buildLayoutDevices(layoutId, { exitIfEmpty: true })
  console.log('')
  console.log(
    `✅ Built ${built} device(s) into dist/${layoutId}/` + (skipped ? ` (${skipped} skipped)` : '')
  )
}

/** Build a single device. */
async function buildForDevice(layoutId: string, deviceId: string) {
  await loadEnv()
  const { getDeviceConfig } = await import('./lib/firebase.js')

  console.log(`🔥 Fetching config for device "${deviceId}" in layout "${layoutId}"...`)
  const { device, effects, turnouts, locos } = await getDeviceConfig(layoutId, deviceId)

  await writeDeviceBundle({ layoutId, device, effects, turnouts, locos })
}

/**
 * Fetch every device in a layout and write its bundle.
 * Shared between `buildForLayout` (single-layout mode) and `buildForOwner` (multi-layout mode).
 */
async function buildLayoutDevices(
  layoutId: string,
  opts: { exitIfEmpty?: boolean } = {}
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
    await writeDeviceBundle({
      layoutId,
      device: config.device,
      effects: config.effects,
      turnouts: config.turnouts,
      locos: config.locos,
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
