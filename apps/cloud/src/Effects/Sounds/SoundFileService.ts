import { head, list } from '@vercel/blob'

export interface SoundFile {
  name: string
  url: string
  duration?: number
  size?: number
  uploadedAt?: string
  contentType?: string
  pathname?: string
}

export class SoundFileService {
  private storeName: string

  constructor() {
    this.storeName = 'bbc-sounds'
  }

  async listSoundFiles(): Promise<SoundFile[]> {
    try {
      // Use the official Vercel Blob SDK to list files
      const { blobs } = await list({
        limit: 100, // Adjust limit as needed
        prefix: '', // List all files, or use a prefix to filter by folder
        token: import.meta.env.VITE_VERCEL_BLOB_TOKEN,
      })

      return blobs.map((blob) => ({
        name: this.extractFileName(blob.pathname),
        url: blob.url,
        size: blob.size,
        uploadedAt: blob.uploadedAt?.toISOString() || new Date().toISOString(),
        contentType: (blob as any).contentType || 'audio/mpeg',
        pathname: blob.pathname,
      }))
    } catch (error) {
      console.error('Error listing sound files:', error)
      throw new Error('Failed to load sound files')
    }
  }

  async getSoundFileInfo(pathname: string): Promise<SoundFile | null> {
    try {
      // Use the official Vercel Blob SDK to get file metadata
      const blob = await head(pathname, {
        token: import.meta.env.VITE_VERCEL_BLOB_TOKEN,
      })

      if (!blob) {
        return null
      }

      return {
        name: this.extractFileName(blob.pathname),
        url: blob.url,
        size: blob.size,
        uploadedAt: blob.uploadedAt?.toISOString() || new Date().toISOString(),
        contentType: (blob as any).contentType || 'audio/mpeg',
        pathname: blob.pathname,
      }
    } catch (error) {
      console.error('Error getting sound file info:', error)
      return null
    }
  }

  private extractFileName(pathname: string): string {
    // Extract filename from pathname and make it human-readable
    const filename = pathname.split('/').pop() || ''
    return filename
      .replace(/\.(mp3|wav|ogg|m4a|flac|aac)$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  // Method to set a different store name if needed
  setStoreName(storeName: string): void {
    this.storeName = storeName
  }

  // Method to get current store name
  getStoreName(): string {
    return this.storeName
  }
}

// Export a singleton instance
export const soundFileService = new SoundFileService()
