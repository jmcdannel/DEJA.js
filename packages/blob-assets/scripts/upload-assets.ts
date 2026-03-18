#!/usr/bin/env node
// Asset Upload Script for Vercel Blob
// Run with: pnpm --filter=@repo/blob-assets upload-assets -- --category <cat> --dir <path>

import { resolve, relative } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { uploadDirectory } from '../src/upload.js'
import { loadManifest, saveManifest } from '../src/manifest.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN environment variable not set')
  console.log('Set it with: export BLOB_READ_WRITE_TOKEN=your_token')
  console.log('Or add it to the .env file at the workspace root')
  process.exit(1)
}

// Parse CLI arguments
const args = process.argv.slice(2)
function getArg(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`)
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined
}

const category = getArg('category')
const dir = getArg('dir')
const extensionsArg = getArg('extensions')

if (!category || !dir) {
  console.error('Usage: upload-assets --category <category> --dir <path> [--extensions .png,.jpg,.mp4]')
  console.error('')
  console.error('Categories: tour, backgrounds, screenshots, docs')
  console.error('Extensions: comma-separated list (default: .png,.jpg,.jpeg,.svg,.mp4,.wav,.mp3)')
  process.exit(1)
}

// Narrow types after validation
const resolvedCategory: string = category
const resolvedDirArg: string = dir

const extensions = extensionsArg
  ? extensionsArg.split(',').map((e) => (e.startsWith('.') ? e : `.${e}`))
  : ['.png', '.jpg', '.jpeg', '.svg', '.mp4', '.wav', '.mp3']

const resolvedDir = resolve(resolvedDirArg)
const repoRoot = resolve(__dirname, '..', '..', '..')

async function main() {
  console.log(`Uploading assets from: ${resolvedDir}`)
  console.log(`Category: ${resolvedCategory}`)
  console.log(`Blob prefix: ${resolvedCategory}/`)
  console.log(`Extensions: ${extensions.join(', ')}`)
  console.log('')

  const manifest = await loadManifest()

  // Check which files are already uploaded
  const existingPaths = new Set(
    Object.values(manifest.assets).map((a) => a.blobPathname),
  )

  const results = await uploadDirectory(resolvedDir, `${resolvedCategory}/`, resolvedCategory, {
    extensions,
  })

  let newCount = 0
  let skippedCount = 0

  for (const entry of results) {
    if (existingPaths.has(entry.blobPathname)) {
      console.log(`  Skipped (already uploaded): ${entry.blobPathname}`)
      skippedCount++
      continue
    }

    // Store using repo-relative path as key
    const relPath = relative(repoRoot, entry.originalPath)
    manifest.assets[relPath] = { ...entry, originalPath: relPath }
    newCount++
  }

  await saveManifest(manifest)

  console.log('')
  console.log(`Done! ${newCount} uploaded, ${skippedCount} skipped`)
  console.log(`Manifest saved to packages/blob-assets/blob-assets-manifest.json`)
}

main().catch((error) => {
  console.error('Upload failed:', error)
  process.exit(1)
})
