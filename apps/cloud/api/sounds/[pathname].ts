import type { VercelRequest, VercelResponse } from '@vercel/node'
import { head, del } from '@vercel/blob'
import { verifyFirebaseAuth } from '../lib/verifyFirebaseAuth'

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
  const { pathname } = req.query
  if (!pathname || typeof pathname !== 'string') {
    return res.status(400).json({ error: 'Pathname is required' })
  }

  const decodedPathname = decodeURIComponent(pathname)

  if (req.method === 'GET') {
    try {
      const blob = await head(decodedPathname)

      if (!blob) {
        return res.status(404).json({ error: 'Sound file not found' })
      }

      const sound = {
        name: extractFileName(blob.pathname),
        url: blob.url,
        size: blob.size,
        uploadedAt:
          blob.uploadedAt?.toISOString() || new Date().toISOString(),
        contentType:
          'contentType' in blob ? String(blob.contentType) : 'audio/mpeg',
        pathname: blob.pathname,
      }

      return res.status(200).json({ sound })
    } catch (error) {
      console.error('Error getting sound file info:', error)
      return res.status(500).json({ error: 'Failed to get sound file info' })
    }
  }

  if (req.method === 'DELETE') {
    const auth = await verifyFirebaseAuth(req)
    if (!auth.valid) {
      return res.status(auth.status!).json({ error: auth.message })
    }

    try {
      await del(decodedPathname)
      return res.status(200).json({ deleted: true, pathname: decodedPathname })
    } catch (error) {
      console.error('Error deleting sound file:', error)
      return res.status(500).json({ error: 'Failed to delete sound file' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
