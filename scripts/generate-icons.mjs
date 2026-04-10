#!/usr/bin/env node
/**
 * Generate app icons and Logo component assets from the DEJA.js brand system.
 *
 * Sources of truth:
 *   - assets/deja-{app}-logo.svg  — hand-authored combined logo (DEJA.js track/D + app MDI glyph)
 *   - Material Design Icons CDN   — for the standalone "icon only" glyph variant
 *
 * Outputs:
 *   1. Each Vue app's public/ dir (throttle, cloud, monitor, tour):
 *        favicon.svg (combined logo)
 *        favicon.ico (16/32/48 rasterized from combined logo, black background)
 *        icon-192.png, icon-512.png                  (black background)
 *        icon-192-maskable.png, icon-512-maskable.png (black background + safe zone)
 *        apple-touch-icon.png                          (black background)
 *
 *   2. @repo/ui Logo component assets:
 *        packages/ui/src/assets/logos/{app}.svg      (combined logo)
 *        packages/ui/src/assets/icons/{app}.png      (MDI glyph only, 256px, brand color bg)
 *        packages/ui/src/assets/icons/index.ts       (regenerated URL map)
 *
 *   3. Styleguide reference copies:
 *        .claude/guides/icon-assets/{app}/*          (all rasters + both SVGs)
 *
 * io + server have no public/ dir — they only get the ui + styleguide outputs.
 *
 * PWA/favicon backgrounds are solid black (#000) per brand guideline.
 * Logo component icons use the app's brand color as background.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

/** @type {Array<{name:string, mdi:string, color:string, publicDir?:string}>} */
const APPS = [
  { name: 'io', mdi: 'memory', color: '#8D00FF' },
  { name: 'throttle', mdi: 'controller', color: '#43F20D', publicDir: 'apps/throttle/public' },
  { name: 'cloud', mdi: 'cloud', color: '#E40DF2', publicDir: 'apps/cloud/public' },
  { name: 'monitor', mdi: 'monitor-dashboard', color: '#1A32E6', publicDir: 'apps/monitor/public' },
  { name: 'tour', mdi: 'account-tie-hat', color: '#F2B40D', publicDir: 'apps/tour/public' },
  { name: 'server', mdi: 'console', color: '#FF0700' },
]

const BLACK_BG = { r: 0, g: 0, b: 0, alpha: 1 }
const STYLEGUIDE_ASSETS = join(ROOT, '.claude/guides/icon-assets')
const UI_LOGOS = join(ROOT, 'packages/ui/src/assets/logos')
const UI_ICONS = join(ROOT, 'packages/ui/src/assets/icons')

async function writeFileEnsured(filePath, data) {
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, data)
}

async function fetchMdiPath(iconName) {
  const url = `https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/${iconName}.svg`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`)
  const svg = await res.text()
  const match = svg.match(/<path[^>]*\bd="([^"]+)"/)
  if (!match) throw new Error(`no <path d="..."> in ${iconName}.svg`)
  return match[1]
}

/**
 * Build a square SVG with a solid-colored background and a white MDI icon glyph.
 * The MDI path uses viewBox 0 0 24 24; we scale it to `iconScale * size` and center it.
 */
function composeGlyphSvg({ size, color, mdiPath, iconScale = 0.6, rounded = false }) {
  const iconSize = size * iconScale
  const offset = (size - iconSize) / 2
  const scale = iconSize / 24
  const radius = rounded ? size * 0.22 : 0
  const bg = rounded
    ? `<rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${color}"/>`
    : `<rect width="${size}" height="${size}" fill="${color}"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bg}
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    <path d="${mdiPath}" fill="#ffffff"/>
  </g>
</svg>`
}

/**
 * Rasterize an SVG buffer to a square PNG with a background fill. Optionally add
 * padding so the logo survives a platform mask (maskable PWA icons).
 */
async function svgToPng(svgBuffer, size, { padding = 0, background = BLACK_BG } = {}) {
  if (padding === 0) {
    return sharp(svgBuffer, { density: 384 })
      .resize(size, size, { fit: 'contain', background })
      .flatten({ background })
      .png()
      .toBuffer()
  }
  const inner = Math.round(size * (1 - padding * 2))
  const pad = Math.round((size - inner) / 2)
  const innerPng = await sharp(svgBuffer, { density: 384 })
    .resize(inner, inner, { fit: 'contain', background })
    .flatten({ background })
    .png()
    .toBuffer()
  return sharp(innerPng)
    .extend({
      top: pad,
      bottom: size - inner - pad,
      left: pad,
      right: size - inner - pad,
      background,
    })
    .png()
    .toBuffer()
}

async function generateForApp(app) {
  // Source 1: hand-authored combined logo
  const combinedSvgPath = join(ROOT, `assets/deja-${app.name}-logo.svg`)
  const combinedSvg = await readFile(combinedSvgPath)

  // Source 2: MDI glyph → synthesized "icon only" SVG on brand color background
  const mdiPath = await fetchMdiPath(app.mdi)
  const glyphSvg = composeGlyphSvg({ size: 512, color: app.color, mdiPath, iconScale: 0.6 })
  console.log(`✓ ${app.name}: loaded combined logo + fetched mdi/${app.mdi}`)

  // ─── PWA + favicon rasters (black background) ──────────────────────────────
  const [png16, png32, png48, png180, png192, png512, pngMask192, pngMask512] = await Promise.all([
    svgToPng(combinedSvg, 16),
    svgToPng(combinedSvg, 32),
    svgToPng(combinedSvg, 48),
    svgToPng(combinedSvg, 180),
    svgToPng(combinedSvg, 192),
    svgToPng(combinedSvg, 512),
    svgToPng(combinedSvg, 192, { padding: 0.1 }),
    svgToPng(combinedSvg, 512, { padding: 0.1 }),
  ])
  const ico = await pngToIco([png16, png32, png48])

  // ─── Logo component assets (brand-color background for the glyph icon) ─────
  const iconPng256 = await svgToPng(Buffer.from(glyphSvg), 256, {
    background: BLACK_BG, // black outside the svg canvas is irrelevant since the svg fills it
  })

  // ─── Write outputs ─────────────────────────────────────────────────────────
  // 1. App public dirs (Vue apps only)
  if (app.publicDir) {
    const pubDir = join(ROOT, app.publicDir)
    await writeFileEnsured(join(pubDir, 'favicon.svg'), combinedSvg)
    await writeFileEnsured(join(pubDir, 'favicon.ico'), ico)
    await writeFileEnsured(join(pubDir, 'icon-192.png'), png192)
    await writeFileEnsured(join(pubDir, 'icon-512.png'), png512)
    await writeFileEnsured(join(pubDir, 'icon-192-maskable.png'), pngMask192)
    await writeFileEnsured(join(pubDir, 'icon-512-maskable.png'), pngMask512)
    await writeFileEnsured(join(pubDir, 'apple-touch-icon.png'), png180)
  }

  // 2. @repo/ui Logo component assets
  await writeFileEnsured(join(UI_LOGOS, `${app.name}.svg`), combinedSvg)
  await writeFileEnsured(join(UI_ICONS, `${app.name}.png`), iconPng256)

  // 3. Styleguide reference copy
  const sgDir = join(STYLEGUIDE_ASSETS, app.name)
  await writeFileEnsured(join(sgDir, 'combined.svg'), combinedSvg)
  await writeFileEnsured(join(sgDir, 'glyph.svg'), glyphSvg)
  await writeFileEnsured(join(sgDir, 'favicon.ico'), ico)
  await writeFileEnsured(join(sgDir, 'icon-192.png'), png192)
  await writeFileEnsured(join(sgDir, 'icon-512.png'), png512)
  await writeFileEnsured(join(sgDir, 'icon-192-maskable.png'), pngMask192)
  await writeFileEnsured(join(sgDir, 'icon-512-maskable.png'), pngMask512)
  await writeFileEnsured(join(sgDir, 'apple-touch-icon.png'), png180)
  await writeFileEnsured(join(sgDir, 'glyph-256.png'), iconPng256)

  console.log(`  → ${app.name}: public✓ ui-logos✓ ui-icons✓ styleguide✓`)
}

async function writeIconsIndex() {
  const lines = [
    '// AUTO-GENERATED by scripts/generate-icons.mjs — do not edit by hand',
    '',
    'export const appIcons = {',
    ...APPS.map(
      (a) => `  ${a.name}: new URL('./${a.name}.png', import.meta.url).href,`
    ),
    `  deja: new URL('./deja.png', import.meta.url).href,`,
    '} as const',
    '',
    'export const appLogos = {',
    ...APPS.map(
      (a) => `  ${a.name}: new URL('../logos/${a.name}.svg', import.meta.url).href,`
    ),
    '} as const',
    '',
    'export const appColors = {',
    ...APPS.map((a) => `  ${a.name}: '${a.color}',`),
    '} as const',
    '',
    'export type AppIconName = keyof typeof appIcons',
    'export type AppLogoName = keyof typeof appLogos',
    '',
  ]
  await writeFileEnsured(join(UI_ICONS, 'index.ts'), lines.join('\n'))
  console.log('✓ wrote packages/ui/src/assets/icons/index.ts')
}

async function main() {
  for (const app of APPS) {
    await generateForApp(app)
  }
  await writeIconsIndex()
  console.log('\nAll icons + Logo component assets generated.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
