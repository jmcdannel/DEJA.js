import { readFile, readdir, stat } from 'fs/promises'
import { join, extname, basename } from 'path'
import { put } from '@vercel/blob'
import type { AssetEntry } from './types.js'

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ico': 'image/x-icon',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
}

function getContentType(filePath: string): string {
  const ext = extname(filePath).toLowerCase()
  return MIME_TYPES[ext] ?? 'application/octet-stream'
}

export async function uploadAsset(
  filePath: string,
  blobPrefix: string,
  category: string,
): Promise<AssetEntry> {
  const buffer = await readFile(filePath)
  const filename = basename(filePath)
  const blobPath = `${blobPrefix}${filename}`
  const contentType = getContentType(filePath)

  console.log(
    `  Uploading ${filename} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`,
  )

  const result = await put(blobPath, buffer, {
    access: 'public',
    addRandomSuffix: false,
    contentType,
  })

  return {
    originalPath: filePath,
    blobUrl: result.url,
    blobPathname: result.pathname,
    contentType,
    size: buffer.length,
    category,
    uploadedAt: new Date().toISOString(),
  }
}

export async function uploadDirectory(
  dirPath: string,
  blobPrefix: string,
  category: string,
  options: { extensions?: string[] } = {},
): Promise<AssetEntry[]> {
  const entries = await readdir(dirPath, { withFileTypes: true })
  const results: AssetEntry[] = []

  for (const entry of entries) {
    if (!entry.isFile()) continue

    const ext = extname(entry.name).toLowerCase()
    if (options.extensions && !options.extensions.includes(ext)) continue

    const fullPath = join(dirPath, entry.name)
    const fileStat = await stat(fullPath)
    if (fileStat.size === 0) continue

    const result = await uploadAsset(fullPath, blobPrefix, category)
    results.push(result)
  }

  return results
}
