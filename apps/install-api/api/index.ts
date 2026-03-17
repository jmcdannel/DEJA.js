import type { VercelRequest, VercelResponse } from '@vercel/node'
import { put, list, head } from '@vercel/blob'

const RELEASES_PREFIX = 'releases'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req
  const parsedUrl = new URL(url || '/', `http://${req.headers.host}`)
  const path = parsedUrl.pathname

  try {
    // GET / — serve install script (optionally with ?uid=...&layout=... to skip prompts)
    if (method === 'GET' && (path === '/' || path === '/api')) {
      const params = parsedUrl.searchParams
      const uid = params.get('uid') || ''
      const layoutId = params.get('layout') || ''
      const script = await generateInstallScript(uid, layoutId)
      res.setHeader('Content-Type', 'text/plain')
      res.setHeader('Cache-Control', 'no-cache')
      return res.status(200).send(script)
    }

    // GET /health
    if (method === 'GET' && path.endsWith('/health')) {
      return res.json({ status: 'ok' })
    }

    // GET /releases/latest/:filename
    const latestMatch = path.match(/\/releases\/latest\/(.+)/)
    if (method === 'GET' && latestMatch) {
      const filename = latestMatch[1]
      const version = await getLatestVersion()
      if (!version) return res.status(404).json({ error: 'No releases found' })

      const blobUrl = await getReleaseUrl(version, filename)
      if (!blobUrl) return res.status(404).json({ error: 'File not found' })

      return res.redirect(302, blobUrl)
    }

    // GET /releases/:version/:filename
    const versionMatch = path.match(/\/releases\/([^/]+)\/([^/]+)$/)
    if (method === 'GET' && versionMatch && versionMatch[2] !== 'upload') {
      const [, version, filename] = versionMatch
      const blobUrl = await getReleaseUrl(version, filename)
      if (!blobUrl) return res.status(404).json({ error: 'File not found' })

      return res.redirect(302, blobUrl)
    }

    // POST /releases/:version/upload
    const uploadMatch = path.match(/\/releases\/([^/]+)\/upload/)
    if (method === 'POST' && uploadMatch) {
      const authHeader = req.headers.authorization
      if (authHeader !== `Bearer ${process.env.UPLOAD_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const version = uploadMatch[1]
      const filename = req.headers['x-filename'] as string
      if (!filename) return res.status(400).json({ error: 'x-filename header required' })

      const contentType = (req.headers['content-type'] as string) || 'application/octet-stream'
      const blobPath = `${RELEASES_PREFIX}/${version}/${filename}`

      const blob = await put(blobPath, req, {
        access: 'public',
        contentType,
        addRandomSuffix: false,
      })

      return res.json({ ok: true, url: blob.url })
    }

    return res.status(404).json({ error: 'Not found' })
  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function generateInstallScript(uid: string, layoutId: string): Promise<string> {
  // Fetch install.sh from blob storage (uploaded alongside release assets)
  const blobUrl = await getReleaseUrl(await getLatestVersion() || '', 'install.sh')

  let script: string
  if (blobUrl) {
    const resp = await fetch(blobUrl)
    script = await resp.text()
  } else {
    return '#!/bin/bash\necho "Error: No install script found. No releases have been published yet."\nexit 1'
  }

  const replacements: Record<string, string> = {
    '__FIREBASE_API_KEY__': process.env.FIREBASE_API_KEY ?? '',
    '__FIREBASE_AUTH_DOMAIN__': process.env.FIREBASE_AUTH_DOMAIN ?? '',
    '__FIREBASE_PROJECT_ID__': process.env.FIREBASE_PROJECT_ID ?? '',
    '__FIREBASE_DATABASE_URL__': process.env.FIREBASE_DATABASE_URL ?? '',
    '__FIREBASE_STORAGE_BUCKET__': process.env.FIREBASE_STORAGE_BUCKET ?? '',
    '__FIREBASE_MESSAGING_SENDER_ID__': process.env.FIREBASE_MESSAGING_SENDER_ID ?? '',
    '__FIREBASE_APP_ID__': process.env.FIREBASE_APP_ID ?? '',
    '__FIREBASE_CLIENT_EMAIL__': process.env.FIREBASE_CLIENT_EMAIL ?? '',
    '__FIREBASE_PRIVATE_KEY__': process.env.FIREBASE_PRIVATE_KEY ?? '',
  }

  for (const [placeholder, value] of Object.entries(replacements)) {
    script = script.replaceAll(placeholder, value)
  }

  // If uid/layoutId provided via query params, prepend env vars so the script
  // skips the interactive prompts in link_account()
  if (uid || layoutId) {
    const envLines: string[] = []
    if (uid) envLines.push(`DEJA_UID="${uid}"`)
    if (layoutId) envLines.push(`DEJA_LAYOUT_ID="${layoutId}"`)
    // Insert after the shebang line
    const shebangEnd = script.indexOf('\n')
    script = script.slice(0, shebangEnd + 1) + envLines.join('\n') + '\n' + script.slice(shebangEnd + 1)
  }

  return script
}

async function getLatestVersion(): Promise<string | null> {
  const { blobs } = await list({ prefix: `${RELEASES_PREFIX}/`, limit: 1000 })
  const versions = new Set<string>()
  for (const blob of blobs) {
    const parts = blob.pathname.split('/')
    if (parts.length >= 3) versions.add(parts[1])
  }
  if (versions.size === 0) return null
  const sorted = [...versions].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
  return sorted[0]
}

async function getReleaseUrl(version: string, filename: string): Promise<string | null> {
  const blobPath = `${RELEASES_PREFIX}/${version}/${filename}`
  try {
    const blob = await head(blobPath)
    return blob.url
  } catch {
    return null
  }
}
