#!/usr/bin/env node

/**
 * Screenshot Capture Script
 *
 * Captures desktop + mobile screenshots of all DEJA.js app views.
 * Uses Playwright headless browser with test account login.
 *
 * Usage:
 *   node scripts/capture-screenshots.mjs [app] [--layout layoutId]
 *
 * Examples:
 *   node scripts/capture-screenshots.mjs              # all apps
 *   node scripts/capture-screenshots.mjs throttle     # throttle only
 *   node scripts/capture-screenshots.mjs monitor      # monitor only
 *   node scripts/capture-screenshots.mjs --layout demo # use demo layout
 */

import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCRIPT_ROOT = resolve(__dirname, '..')

const SCREENSHOT_DIR = resolve(SCRIPT_ROOT, 'apps/dejajs-www/public/screenshots')

// --- Config ---

const DEFAULT_LAYOUT = 'betatrack'
const TEST_EMAIL = 'claude-screenshots@dejajs.test'
const TEST_PASSWORD = 'DejaScreenshots2026!'

const DESKTOP = { width: 1280, height: 800 }
const MOBILE = { width: 375, height: 812 }

const APPS = {
  throttle: {
    filter: 'deja-throttle',
    port: 3041,
    views: [
      { route: '/', name: 'home' },
      { route: '/throttles', name: 'throttle-list' },
      { route: '/turnouts', name: 'turnouts' },
      { route: '/routes', name: 'routes' },
      { route: '/effects', name: 'effects' },
      { route: '/signals', name: 'signals' },
      { route: '/conductor', name: 'conductor' },
      { route: '/locos', name: 'roster' },
      { route: '/connect', name: 'connect' },
      { route: '/settings', name: 'settings' },
      { route: '/programming', name: 'programming' },
      // throttle detail handled separately (dynamic address)
    ],
  },
  cloud: {
    filter: 'deja-cloud',
    port: 3011,
    views: [
      // List views
      { route: '/', name: 'dashboard' },
      { route: '/locos', name: 'roster' },
      { route: '/turnouts', name: 'turnouts' },
      { route: '/routes', name: 'routes' },
      { route: '/effects', name: 'effects' },
      { route: '/signals', name: 'signals' },
      { route: '/sensors', name: 'sensors' },
      { route: '/sounds', name: 'sounds' },
      { route: '/dccex', name: 'dccex' },
      { route: '/devices', name: 'devices' },
      { route: '/settings', name: 'settings' },
      // Add views
      { route: '/locos/new', name: 'roster-add' },
      { route: '/turnouts/new', name: 'turnouts-add' },
      { route: '/routes/new', name: 'routes-add' },
      { route: '/effects/new', name: 'effects-add' },
      { route: '/signals/new', name: 'signals-add' },
      { route: '/sensors/new', name: 'sensors-add' },
      // Edit views handled separately (dynamic IDs)
    ],
    editViews: [
      { listRoute: '/locos', linkPrefix: '/locos/', name: 'roster-edit' },
      { listRoute: '/turnouts', linkPrefix: '/turnouts/', name: 'turnouts-edit' },
      { listRoute: '/routes', linkPrefix: '/routes/', name: 'routes-edit' },
      { listRoute: '/effects', linkPrefix: '/effects/', name: 'effects-edit' },
      { listRoute: '/signals', linkPrefix: '/signals/', name: 'signals-edit' },
    ],
  },
  monitor: {
    filter: 'deja-monitor',
    port: 3021,
    views: [
      { route: '/', name: 'dashboard', seedMock: true },
    ],
  },
}

// --- Helpers ---

function parseArgs() {
  const args = process.argv.slice(2)
  let appFilter = null
  let layout = DEFAULT_LAYOUT
  let cwd = SCRIPT_ROOT

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--layout' && args[i + 1]) {
      layout = args[++i]
    } else if (args[i] === '--cwd' && args[i + 1]) {
      cwd = resolve(args[++i])
    } else if (!args[i].startsWith('-')) {
      appFilter = args[i]
    }
  }

  return { appFilter, layout, cwd }
}

function startDevServer(filter, port, cwd) {
  return new Promise((resolve, reject) => {
    const proc = spawn(`pnpm --filter ${filter} dev`, [], {
      cwd,
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
    })

    let actualPort = port
    let resolved = false
    const timeout = setTimeout(() => {
      if (!resolved) reject(new Error(`Server ${filter} timed out`))
    }, 60000)

    function checkOutput(data) {
      const line = data.toString()
      // Vite outputs "Local: http://localhost:PORT/" to stdout or stderr
      const portMatch = line.match(/localhost:(\d+)/)
      if (portMatch && !resolved) {
        actualPort = parseInt(portMatch[1])
        resolved = true
        clearTimeout(timeout)
        resolve({ proc, port: actualPort })
      }
    }

    proc.stdout.on('data', checkOutput)
    proc.stderr.on('data', checkOutput)

    proc.on('error', (err) => {
      clearTimeout(timeout)
      if (!resolved) reject(err)
    })

    proc.on('exit', (code) => {
      if (!resolved) {
        clearTimeout(timeout)
        reject(new Error(`Server ${filter} exited with code ${code}`))
      }
    })
  })
}

async function waitForServer(port, maxRetries = 20) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`http://localhost:${port}`)
      if (response.ok || response.status === 304) return true
    } catch {
      // not ready yet
    }
    await sleep(500)
  }
  throw new Error(`Server on port ${port} not ready after ${maxRetries} retries`)
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function login(page, port) {
  // Collect console errors for debugging
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto(`http://localhost:${port}`)
  await page.waitForLoadState('networkidle').catch(() => {})
  await sleep(2000)

  // Check if the app actually mounted
  const appHtml = await page.evaluate(() => document.querySelector('#app')?.innerHTML?.length || 0)
  if (appHtml === 0) {
    console.error('  ✗ App failed to mount! Console errors:')
    for (const err of errors.slice(0, 5)) {
      console.error(`    ${err.substring(0, 120)}`)
    }
    throw new Error('App failed to mount — check .env Firebase config')
  }

  // Check if login form is visible
  const emailField = page.getByRole('textbox', { name: /email/i }).first()
  const isLoginVisible = await emailField.isVisible().catch(() => false)

  if (isLoginVisible) {
    console.log('  Logging in with test account...')
    await emailField.fill(TEST_EMAIL)
    await page.getByRole('textbox', { name: /password/i }).first().fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /sign in/i }).first().click()
    await sleep(3000)
    console.log('  Logged in.')
  } else {
    console.log('  Already authenticated (DEV_AUTO_LOGIN).')
  }
}

async function captureView(page, port, appName, viewName, route) {
  const baseUrl = `http://localhost:${port}`

  // Use Vue Router for client-side navigation (preserves auth)
  if (page.url().startsWith(baseUrl)) {
    await page.evaluate((r) => {
      const app = document.querySelector('#app')?.__vue_app__
      if (app) {
        app.config.globalProperties.$router.push(r)
      } else {
        window.location.href = r
      }
    }, route)
  } else {
    await page.goto(`${baseUrl}${route}`)
  }

  await sleep(2500)
  await page.waitForLoadState('domcontentloaded').catch(() => {})

  // Desktop
  await page.setViewportSize(DESKTOP)
  await sleep(400)
  const desktopPath = resolve(SCREENSHOT_DIR, `${appName}_desktop_${viewName}.png`)
  await page.screenshot({ path: desktopPath, type: 'png' })

  // Mobile
  await page.setViewportSize(MOBILE)
  await sleep(400)
  const mobilePath = resolve(SCREENSHOT_DIR, `${appName}_mobile_${viewName}.png`)
  await page.screenshot({ path: mobilePath, type: 'png' })

  console.log(`  ✓ ${appName}/${viewName} (desktop + mobile)`)
  return 2 // 2 screenshots
}

async function captureThrottleDetail(page, port) {
  const baseUrl = `http://localhost:${port}`

  // Navigate to throttle list to find a loco address
  await page.evaluate(() => {
    document.querySelector('#app').__vue_app__.config.globalProperties.$router.push('/locos')
  })
  await sleep(2500)

  // Scrape loco addresses from links
  const addresses = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href^="/throttle/"]'))
      .map((a) => parseInt(a.getAttribute('href').split('/').pop()))
      .filter((n) => !isNaN(n))
  })

  if (addresses.length === 0) {
    console.log('  ⚠ No locos found — skipping throttle detail view')
    return 0
  }

  // Pick first address !== 3, fallback to 3
  const address = addresses.find((a) => a !== 3) || addresses[0]
  console.log(`  Using loco address ${address} for throttle detail`)

  return captureView(page, port, 'throttle', 'throttle', `/throttle/${address}`)
}

async function captureCloudEditViews(page, port, editViews) {
  let count = 0

  for (const view of editViews) {
    // Navigate to list view to find first item
    await page.evaluate((r) => {
      document.querySelector('#app').__vue_app__.config.globalProperties.$router.push(r)
    }, view.listRoute)
    await sleep(2500)

    // Scrape first item link
    const href = await page.evaluate((prefix) => {
      const link = document.querySelector(`a[href^="${prefix}"]`)
      return link ? link.getAttribute('href') : null
    }, view.linkPrefix)

    if (!href) {
      console.log(`  ⚠ No items found for ${view.name} — skipping`)
      continue
    }

    count += await captureView(page, port, 'cloud', view.name, href)
  }

  return count
}

async function seedMonitorMocks(page) {
  console.log('  Seeding monitor mock data...')
  await sleep(3000) // Wait for onMounted
  const result = await page.evaluate(() => {
    if (window.__DEJA_MOCK__) {
      window.__DEJA_MOCK__.seedAll()
      return 'seeded'
    }
    return 'not found'
  })

  if (result === 'not found') {
    console.log('  ⚠ window.__DEJA_MOCK__ not found — mock data not seeded')
  } else {
    console.log('  ✓ Mock data seeded')
  }
  await sleep(1000)
}

// --- Main ---

async function captureApp(browser, appName, appConfig, layout, cwd) {
  console.log(`\n📸 Starting ${appName} (port ${appConfig.port})...`)

  // Start dev server
  let server
  try {
    server = await startDevServer(appConfig.filter, appConfig.port, cwd)
    console.log(`  Server running on port ${server.port}`)
  } catch (err) {
    console.error(`  ✗ Failed to start ${appName}: ${err.message}`)
    return 0
  }

  await waitForServer(server.port)

  const context = await browser.newContext()
  const page = await context.newPage()
  let totalScreenshots = 0

  try {
    // Set layout in localStorage before navigating
    await context.addInitScript((layoutId) => {
      localStorage.setItem('@DEJA/layoutId', layoutId)
    }, layout)

    // Login
    await login(page, server.port)

    // Seed monitor mocks if needed
    if (appName === 'monitor') {
      await page.goto(`http://localhost:${server.port}/`)
      await seedMonitorMocks(page)
    }

    // Dismiss any dismissible alerts/banners
    const closeBtn = page.getByRole('button', { name: 'Close' })
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click()
      await sleep(300)
    }

    // Capture static views
    for (const view of appConfig.views) {
      if (view.seedMock && appName === 'monitor') {
        // Monitor dashboard: already seeded, just capture from current state
        await page.setViewportSize(DESKTOP)
        await sleep(400)
        await page.screenshot({
          path: resolve(SCREENSHOT_DIR, `${appName}_desktop_${view.name}.png`),
          type: 'png',
        })
        await page.setViewportSize(MOBILE)
        await sleep(400)
        await page.screenshot({
          path: resolve(SCREENSHOT_DIR, `${appName}_mobile_${view.name}.png`),
          type: 'png',
        })
        console.log(`  ✓ ${appName}/${view.name} (desktop + mobile)`)
        totalScreenshots += 2
      } else {
        totalScreenshots += await captureView(page, server.port, appName, view.name, view.route)
      }
    }

    // Capture dynamic views
    if (appName === 'throttle') {
      totalScreenshots += await captureThrottleDetail(page, server.port)
    }

    if (appName === 'cloud' && appConfig.editViews) {
      totalScreenshots += await captureCloudEditViews(page, server.port, appConfig.editViews)
    }
  } catch (err) {
    console.error(`  ✗ Error capturing ${appName}: ${err.message}`)
  } finally {
    await page.close()
    await context.close()
    server.proc.kill('SIGTERM')
    await sleep(1000)
  }

  return totalScreenshots
}

async function main() {
  const { appFilter, layout, cwd } = parseArgs()
  const ROOT = cwd

  console.log('🎯 DEJA.js Screenshot Capture')
  console.log(`   Repo: ${ROOT}`)
  console.log(`   Layout: ${layout}`)
  console.log(`   Apps: ${appFilter || 'all'}`)
  console.log(`   Output: ${SCREENSHOT_DIR}`)

  // Ensure output directory exists
  mkdirSync(SCREENSHOT_DIR, { recursive: true })


  const browser = await chromium.launch({ headless: true })
  let totalScreenshots = 0

  try {
    const appsToCapture = appFilter
      ? { [appFilter]: APPS[appFilter] }
      : APPS

    for (const [name, config] of Object.entries(appsToCapture)) {
      if (!config) {
        console.error(`Unknown app: ${name}`)
        continue
      }
      totalScreenshots += await captureApp(browser, name, config, layout, ROOT)
    }
  } finally {
    await browser.close()
  }

  console.log(`\n✅ Done! ${totalScreenshots} screenshots captured.`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
