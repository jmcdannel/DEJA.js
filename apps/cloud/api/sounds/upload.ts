import type { VercelRequest, VercelResponse } from '@vercel/node'
import { put } from '@vercel/blob'
import { verifyFirebaseAuth } from '../lib/verifyFirebaseAuth'

const ALLOWED_CONTENT_TYPES = new Set([
  'audio/mpeg',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/flac',
  'audio/aac',
])

// Disable body parsing to receive raw file data
export const config = {
  api: { bodyParser: false },
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await verifyFirebaseAuth(req)
  if (!auth.valid) {
    return res.status(auth.status!).json({ error: auth.message })
  }

  const filename = req.headers['x-filename'] as string | undefined
  if (!filename) {
    return res.status(400).json({ error: 'x-filename header is required' })
  }

  const contentType = req.headers['content-type'] || 'audio/mpeg'
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return res.status(400).json({
      error: `Unsupported content type: ${contentType}. Allowed: ${[...ALLOWED_CONTENT_TYPES].join(', ')}`,
    })
  }

  try {
    // Read request body as buffer
    const chunks: Buffer[] = []
    for await (const chunk of req) {
      chunks.push(Buffer.from(chunk))
    }
    const buffer = Buffer.concat(chunks)

    if (buffer.length === 0) {
      return res.status(400).json({ error: 'Empty file body' })
    }

    const blobPathname = `sounds/${filename}`
    const blob = await put(blobPathname, buffer, {
      access: 'public',
      contentType,
    })

    const name = filename
      .replace(/\.(mp3|wav|ogg|m4a|flac|aac)$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())

    return res.status(201).json({
      sound: {
        name,
        url: blob.url,
        size: buffer.length,
        uploadedAt: new Date().toISOString(),
        contentType,
        pathname: blob.pathname,
      },
    })
  } catch (error) {
    console.error('Error uploading sound file:', error)
    return res.status(500).json({ error: 'Failed to upload sound file' })
  }
}
