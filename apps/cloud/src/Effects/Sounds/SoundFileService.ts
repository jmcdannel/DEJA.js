import { createLogger } from '@repo/utils'

const log = createLogger('SoundFileService')

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
  private apiBaseUrl: string

  constructor() {
    // Use the cloud app's own sound API at /api/sounds (Vercel Function)
    // Falls back to VITE_API_BASE_URL env var for custom deployments
    const viteUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_BASE_URL : undefined
    const nodeUrl = typeof process !== 'undefined' ? process.env.VITE_API_BASE_URL : undefined
    this.apiBaseUrl = viteUrl || nodeUrl || '/api'
    log.debug('SoundFileService initialized with API URL:', this.apiBaseUrl)
  }

  async listSoundFiles(): Promise<SoundFile[]> {
    try {
      // Call the Next.js API endpoint
      const response = await fetch(`${this.apiBaseUrl}/sounds`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data.sounds || []
    } catch (error) {
      log.error('Error listing sound files:', error)
      throw new Error('Failed to load sound files')
    }
  }

  async getSoundFileInfo(pathname: string): Promise<SoundFile | null> {
    try {
      // Call the Next.js API endpoint for specific file info
      const response = await fetch(`${this.apiBaseUrl}/sounds/${encodeURIComponent(pathname)}`)
      
      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.sound
    } catch (error) {
      log.error('Error getting sound file info:', error)
      return null
    }
  }

  // Method to set a different API base URL (useful for switching between dev and production)
  setApiBaseUrl(url: string): void {
    this.apiBaseUrl = url
    log.debug('SoundFileService API URL updated to:', this.apiBaseUrl)
  }

  // Method to get current API base URL
  getApiBaseUrl(): string {
    return this.apiBaseUrl
  }
}

// Export a singleton instance
export const soundFileService = new SoundFileService()
