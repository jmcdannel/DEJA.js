import { put, list, head } from '@vercel/blob'

const RELEASES_PREFIX = 'releases'

export async function uploadRelease(
  version: string,
  filename: string,
  data: Uint8Array | ReadableStream,
  contentType: string
): Promise<string> {
  const path = `${RELEASES_PREFIX}/${version}/${filename}`
  const blob = await put(path, data, {
    access: 'public',
    contentType,
    addRandomSuffix: false,
  })
  return blob.url
}

export async function getLatestVersion(): Promise<string | null> {
  const { blobs } = await list({ prefix: `${RELEASES_PREFIX}/`, limit: 1000 })

  const versions = new Set<string>()
  for (const blob of blobs) {
    // Path: releases/v1.2.3/deja-server.tar.gz
    const parts = blob.pathname.split('/')
    if (parts.length >= 3) {
      versions.add(parts[1])
    }
  }

  if (versions.size === 0) return null

  // Sort semver-ish (good enough for v-prefixed tags)
  const sorted = [...versions].sort((a, b) =>
    b.localeCompare(a, undefined, { numeric: true })
  )
  return sorted[0]
}

export async function getReleaseUrl(
  version: string,
  filename: string
): Promise<string | null> {
  const path = `${RELEASES_PREFIX}/${version}/${filename}`
  try {
    const blob = await head(path)
    return blob.url
  } catch {
    return null
  }
}
