import { readFile, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { AssetManifest } from './types.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const MANIFEST_PATH = join(__dirname, '..', 'blob-assets-manifest.json')

export async function loadManifest(): Promise<AssetManifest> {
  try {
    const data = await readFile(MANIFEST_PATH, 'utf-8')
    return JSON.parse(data)
  } catch {
    return { version: '1', updatedAt: new Date().toISOString(), assets: {} }
  }
}

export async function saveManifest(manifest: AssetManifest): Promise<void> {
  manifest.updatedAt = new Date().toISOString()
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n')
}
