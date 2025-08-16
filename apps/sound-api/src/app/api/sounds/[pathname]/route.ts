import { head } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { pathname: string } }
) {
  try {
    const { pathname } = params
    
    // Use the official Vercel Blob SDK to get file metadata
    const blob = await head(decodeURIComponent(pathname))

    if (!blob) {
      return NextResponse.json(
        { error: 'Sound file not found' },
        { status: 404 }
      )
    }

    const sound = {
      name: extractFileName(blob.pathname),
      url: blob.url,
      size: blob.size,
      uploadedAt: blob.uploadedAt?.toISOString() || new Date().toISOString(),
      contentType: (blob as any).contentType || 'audio/mpeg',
      pathname: blob.pathname,
    }

    return NextResponse.json({ sound })
  } catch (error) {
    console.error('Error getting sound file info:', error)
    return NextResponse.json(
      { error: 'Failed to get sound file info' },
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
