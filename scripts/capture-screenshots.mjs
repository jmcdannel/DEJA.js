#!/usr/bin/env node
/**
 * Capture screenshots for DEJA.js docs
 * Usage: node scripts/capture-screenshots.mjs [app] [--views view1,view2]
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pw = require('/Users/jmcdannel/TTT/worktrees/doc-split/node_modules/.pnpm/playwright@1.58.2/node_modules/playwright');
const chromium = pw.chromium;
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, '../apps/dejajs-www/public/screenshots');
const LAYOUT_ID = 'betatrack';

const APPS = {
  throttle: {
    port: 3041,
    views: [
      { route: '/', name: 'home' },
      { route: '/locos', name: 'roster' },
      { route: '/settings', name: 'settings' },
      { route: '/connect', name: 'connect' },
    ]
  },
  cloud: {
    port: 5174,
    views: [
      { route: '/', name: 'dashboard' },
      { route: '/settings', name: 'settings' },
    ]
  },
  monitor: {
    port: 3021,
    views: [
      { route: '/', name: 'dashboard' },
      { route: '/settings', name: 'settings' },
    ]
  },
  tour: {
    port: 3031,
    views: [
      { route: '/welcome', name: 'welcome' },
      { route: '/sections', name: 'sections' },
      { route: '/effects', name: 'effects' },
      { route: '/area/tamarack-station', name: 'area-detail' },
      { route: '/media', name: 'media' },
    ]
  }
};

async function captureApp(browser, appName, appConfig) {
  const baseUrl = `http://localhost:${appConfig.port}`;
  const results = [];

  for (const view of appConfig.views) {
    const filename = `${appName}_desktop_${view.name}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);

    try {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
      });
      const page = await context.newPage();

      // Set localStorage before navigating
      await page.addInitScript((layoutId) => {
        localStorage.setItem('@DEJA/layoutId', layoutId);
      }, LAYOUT_ID);

      const url = `${baseUrl}${view.route}`;
      console.log(`  📸 ${appName}${view.route} → ${filename}`);

      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000); // Wait for Vue to render

      await page.screenshot({ path: filepath, type: 'png' });
      results.push({ filename, status: 'ok' });

      await context.close();
    } catch (err) {
      console.error(`  ❌ Failed: ${filename} — ${err.message}`);
      results.push({ filename, status: 'error', error: err.message });
    }
  }

  return results;
}

async function main() {
  const appFilter = process.argv[2] || 'all';

  console.log('🚀 Starting screenshot capture...\n');

  const browser = await chromium.launch({ headless: true });
  const allResults = [];

  for (const [appName, appConfig] of Object.entries(APPS)) {
    if (appFilter !== 'all' && appFilter !== appName) continue;

    console.log(`\n🎯 ${appName.toUpperCase()} (port ${appConfig.port})`);

    try {
      // Check if server is running
      const response = await fetch(`http://localhost:${appConfig.port}`, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch {
      console.log(`  ⚠️  Server not running on port ${appConfig.port}, skipping...`);
      continue;
    }

    const results = await captureApp(browser, appName, appConfig);
    allResults.push(...results);
  }

  await browser.close();

  console.log('\n📊 Results:');
  const ok = allResults.filter(r => r.status === 'ok');
  const errors = allResults.filter(r => r.status === 'error');
  console.log(`  ✅ ${ok.length} captured`);
  if (errors.length) console.log(`  ❌ ${errors.length} failed`);
  ok.forEach(r => console.log(`    ${r.filename}`));
}

main().catch(console.error);
