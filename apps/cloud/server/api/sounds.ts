import express from 'express'
import { list, head } from '@vercel/blob'

const router = express.Router()

// List all sound files
router.get('/', async (req, res) => {
  try {
    const { blobs } = await list({
      limit: 100,
      prefix: '',
    })

    const sounds = blobs.map((blob) => ({
      name: extractFileName(blob.pathname),
      url: blob.url,
      size: blob.size,
      uploadedAt: blob.uploadedAt?.toISOString() || new Date().toISOString(),
      contentType: (blob as any).contentType || 'audio/mpeg',
      pathname: blob.pathname,
    }))

    res.json({ sounds })
  } catch (error) {
    console.error('Error listing sounds:', error)
    res.status(500).json({ error: 'Failed to load sounds' })
  }
})

// Get specific sound file info
router.get('/:pathname(*)', async (req, res) => {
  try {
    const { pathname } = req.params
    
    const blob = await head(decodeURIComponent(pathname))

    if (!blob) {
      return res.status(404).json({ error: 'Sound file not found' })
    }

    const sound = {
      name: extractFileName(blob.pathname),
      url: blob.url,
      size: blob.size,
      uploadedAt: blob.uploadedAt?.toISOString() || new Date().toISOString(),
      contentType: (blob as any).contentType || 'audio/mpeg',
      pathname: blob.pathname,
    }

    res.json({ sound })
  } catch (error) {
    console.error('Error getting sound file info:', error)
    res.status(500).json({ error: 'Failed to get sound file info' })
  }
})

function extractFileName(pathname: string): string {
  const filename = pathname.split('/').pop() || ''
  return filename
    .replace(/\.(mp3|wav|ogg|m4a|flac|aac)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

export default router
