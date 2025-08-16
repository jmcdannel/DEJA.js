import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Use the official Vercel Blob SDK to list files
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

    return NextResponse.json({ sounds })
  } catch (error) {
    console.error('Error listing sound files:', error)
    return NextResponse.json(
      { error: 'Failed to load sound files' },
      { status: 500 }
    )
  }
}

function extractFileName(pathname: string): string {
  const filename = pathname.split('/').pop() || ''
  return filename
    .replace(/\.(mp3|wav|ogg|m4a|flac|aac)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}
