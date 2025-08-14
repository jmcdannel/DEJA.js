// Sound Store Service
// Manages local sound effects and imports from the sounds package

export interface StoredSound {
  id: string
  name: string
  category: string
  filePath: string  // Used by server (relative path)
  webUrl?: string   // Used by browser (blob URL or web-accessible URL)
  blobUrl?: string  // Vercel Blob Store URL
  duration?: number
  tags: string[]
  source: 'local' | 'imported'
  importedAt: string
  metadata?: {
    description?: string
    license?: string
    attribution?: string
  }
}

export interface SoundImportResult {
  success: boolean
  imported: StoredSound[]
  skipped: string[]
  errors: string[]
  total: number
}

class SoundStoreService {
  private sounds: Map<string, StoredSound> = new Map()

  constructor() {
    this.loadFromStorage()
  }

  // Load sounds from package store only
  private loadFromStorage(): void {
    try {
      // Only load from package store file - no localStorage
      this.loadFromPackageStore()
    } catch (error) {
      console.error('Failed to load sound store:', error)
      this.sounds = new Map()
    }
  }

  // Load sounds from package store file
  private async loadFromPackageStore(): Promise<void> {
    try {
      console.log('🔍 SoundStore: Attempting to load from package store...')
      
      // Try to fetch the sound store from the packages/sounds directory
      // This will give us the actual sounds with real blob URLs
      const response = await fetch('/packages/sounds/sound-store.json')
      console.log('🔍 SoundStore: Fetch response status:', response.status, response.ok)
      
      if (response.ok) {
        const packageStore = await response.json()
        console.log('🔍 SoundStore: Package store loaded, entries:', Object.keys(packageStore).length)
        
        // Load all sounds from the package store
        for (const [filePath, soundData] of Object.entries(packageStore)) {
          const sound = soundData as StoredSound
          
          // Use the actual blob URL from Vercel Blob Store for browser playback
          const webUrl = sound.blobUrl || sound.webUrl || `/sounds/${sound.filePath}`
          console.log('🔍 SoundStore: Processing sound:', sound.name, 'blobUrl:', sound.blobUrl, 'webUrl:', webUrl)
          
          // Create enhanced sound object with webUrl
          const enhancedSound: StoredSound = {
            ...sound,
            webUrl,
            // Ensure filePath is preserved for server compatibility
            filePath: sound.filePath
          }
          
          this.sounds.set(sound.id, enhancedSound)
          console.log('🔍 SoundStore: Added sound:', sound.name)
        }
        
        console.log(`✅ SoundStore: Loaded ${Object.keys(packageStore).length} sounds from package store with actual blob URLs`)
        console.log('🔍 SoundStore: Total sounds in store:', this.sounds.size)
      } else {
        console.log('⚠️ SoundStore: Package store fetch failed with status:', response.status)
        // No fallback - only sounds from blob store are supported
        console.log('⚠️ SoundStore: No sounds loaded - only blob store sounds are supported')
      }
    } catch (error) {
      // Package store not available - no fallback
      console.log('⚠️ SoundStore: Package store not available - no sounds loaded')
      console.log('⚠️ SoundStore: Only sounds from blob store are supported')
    }
  }





  // Get all stored sounds
  getAllSounds(): StoredSound[] {
    const sounds = Array.from(this.sounds.values())
    console.log('🔍 SoundStore: getAllSounds called, returning', sounds.length, 'sounds')
    if (sounds.length > 0) {
      console.log('🔍 SoundStore: First sound example:', {
        name: sounds[0].name,
        webUrl: sounds[0].webUrl,
        filePath: sounds[0].filePath
      })
    }
    return sounds
  }

  // Get sounds by category
  getSoundsByCategory(category: string): StoredSound[] {
    return this.getAllSounds().filter(sound => sound.category === category)
  }

  // Get sound by ID
  getSoundById(id: string): StoredSound | undefined {
    return this.sounds.get(id)
  }

  // Search sounds
  searchSounds(query: string, category?: string): StoredSound[] {
    const allSounds = this.getAllSounds()
    let results = allSounds.filter(sound => 
      sound.name.toLowerCase().includes(query.toLowerCase()) ||
      sound.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )
    
    if (category) {
      results = results.filter(sound => sound.category === category)
    }
    
    return results
  }

  // Add a new sound to the store
  addSound(sound: Omit<StoredSound, 'id' | 'importedAt'>): StoredSound {
    const id = `sound-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Construct web URL for browser playback if not provided
            const webUrl = sound.blobUrl || sound.webUrl || `/sounds/${sound.filePath}`
    
    const newSound: StoredSound = {
      ...sound,
      id,
      importedAt: new Date().toISOString(),
      webUrl
    }
    
    this.sounds.set(id, newSound)
    return newSound
  }

  // Update an existing sound
  updateSound(id: string, updates: Partial<StoredSound>): StoredSound | null {
    const sound = this.sounds.get(id)
    if (!sound) return null
    
    const updatedSound = { ...sound, ...updates }
    this.sounds.set(id, updatedSound)
    return updatedSound
  }

  // Remove a sound from the store
  removeSound(id: string): boolean {
      const removed = this.sounds.delete(id)
  return removed
  }

  // Clear all sounds
  async clearAllSounds(): Promise<void> {
    this.sounds.clear()
    console.log('🧹 SoundStore: Cleared all sounds')
  }

  // Get store statistics
  getStats(): {
    total: number
    byCategory: Record<string, number>
    bySource: Record<string, number>
  } {
    const allSounds = this.getAllSounds()
    const byCategory: Record<string, number> = {}
    const bySource: Record<string, number> = {}
    
    allSounds.forEach(sound => {
      byCategory[sound.category] = (byCategory[sound.category] || 0) + 1
      bySource[sound.source] = (bySource[sound.source] || 0) + 1
    })
    
    return {
      total: allSounds.length,
      byCategory,
      bySource
    }
  }

  // Export store data
  exportStore(): string {
    const data = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      sounds: this.getAllSounds()
    }
    return JSON.stringify(data, null, 2)
  }

  // Import store data
  importStore(data: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const parsed = JSON.parse(data)
      const errors: string[] = []
      let imported = 0
      
      if (parsed.sounds && Array.isArray(parsed.sounds)) {
        parsed.sounds.forEach((sound: any) => {
          try {
            if (sound.id && sound.name && sound.category) {
              this.addSound({
                name: sound.name,
                category: sound.category,
                filePath: sound.filePath,
                duration: sound.duration,
                tags: sound.tags || [],
                source: sound.source || 'imported',
                metadata: sound.metadata
              })
              imported++
            } else {
              errors.push(`Invalid sound data: ${sound.name || 'unknown'}`)
            }
          } catch (error) {
            errors.push(`Failed to import sound: ${sound.name || 'unknown'}`)
          }
        })
      }
      
      return { success: true, imported, errors }
    } catch (error) {
      return { success: false, imported: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] }
    }
  }
}

// Export singleton instance
export const soundStoreService = new SoundStoreService()
