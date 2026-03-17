import { createLogger } from '@repo/utils'
import { getAuth } from 'firebase/auth'

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

async function getAuthToken(): Promise<string | null> {
  try {
    const user = getAuth().currentUser
    if (!user) return null
    return user.getIdToken()
  } catch {
    return null
  }
}

export class SoundFileService {
  private apiBaseUrl = '/api'

  async listSoundFiles(): Promise<SoundFile[]> {
    try {
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
      const response = await fetch(
        `${this.apiBaseUrl}/sounds/${encodeURIComponent(pathname)}`,
      )

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

  async uploadSoundFile(file: File): Promise<SoundFile> {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication required to upload sounds')
    }

    const response = await fetch(`${this.apiBaseUrl}/sounds/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': file.type || 'audio/mpeg',
        'x-filename': file.name,
      },
      body: file,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error(error.error || `Upload failed: ${response.status}`)
    }

    const data = await response.json()
    return data.sound
  }

  async deleteSoundFile(pathname: string): Promise<void> {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication required to delete sounds')
    }

    const response = await fetch(
      `${this.apiBaseUrl}/sounds/${encodeURIComponent(pathname)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Delete failed' }))
      throw new Error(error.error || `Delete failed: ${response.status}`)
    }
  }
}

// Export a singleton instance
export const soundFileService = new SoundFileService()
