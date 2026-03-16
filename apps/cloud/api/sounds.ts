import type { VercelRequest, VercelResponse } from '@vercel/node'
import { list } from '@vercel/blob'

function extractFileName(pathname: string): string {
  const filename = pathname.split('/').pop() || ''
  return filename
    .replace(/\.(mp3|wav|ogg|m4a|flac|aac)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { blobs } = await list({ limit: 100, prefix: '' })

    const sounds = blobs.map((blob) => ({
      name: extractFileName(blob.pathname),
      url: blob.url,
      size: blob.size,
      uploadedAt: blob.uploadedAt?.toISOString() || new Date().toISOString(),
      contentType:
        'contentType' in blob ? String(blob.contentType) : 'audio/mpeg',
      pathname: blob.pathname,
    }))

    return res.status(200).json({ sounds })
  } catch (error) {
    console.error('Error listing sounds:', error)
    return res.status(500).json({ error: 'Failed to load sounds' })
  }
}
