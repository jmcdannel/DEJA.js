// Sound Store Service
// Manages local sound effects and imports from the sounds package

export interface StoredSound {
  id: string
  name: string
  category: string
  filePath: string
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
  private storeKey = 'deja-sound-store'
  private sounds: Map<string, StoredSound> = new Map()

  constructor() {
    this.loadFromStorage()
  }

  // Load sounds from localStorage
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storeKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        this.sounds = new Map(Object.entries(parsed))
      }
    } catch (error) {
      console.error('Failed to load sound store:', error)
      this.sounds = new Map()
    }
  }

  // Save sounds to localStorage
  private saveToStorage(): void {
    try {
      const obj = Object.fromEntries(this.sounds)
      localStorage.setItem(this.storeKey, JSON.stringify(obj))
    } catch (error) {
      console.error('Failed to save sound store:', error)
    }
  }

  // Get all stored sounds
  getAllSounds(): StoredSound[] {
    return Array.from(this.sounds.values())
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
    const newSound: StoredSound = {
      ...sound,
      id,
      importedAt: new Date().toISOString()
    }
    
    this.sounds.set(id, newSound)
    this.saveToStorage()
    return newSound
  }

  // Update an existing sound
  updateSound(id: string, updates: Partial<StoredSound>): StoredSound | null {
    const sound = this.sounds.get(id)
    if (!sound) return null
    
    const updatedSound = { ...sound, ...updates }
    this.sounds.set(id, updatedSound)
    this.saveToStorage()
    return updatedSound
  }

  // Remove a sound from the store
  removeSound(id: string): boolean {
    const removed = this.sounds.delete(id)
    if (removed) {
      this.saveToStorage()
    }
    return removed
  }

  // Clear all sounds
  clearAllSounds(): void {
    this.sounds.clear()
    this.saveToStorage()
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

// Export types
export type { StoredSound, SoundImportResult }
