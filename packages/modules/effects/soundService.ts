import type { SoundAsset } from '@repo/sounds'
import { SoundPathResolver, getSoundById, getSoundsByCategory as getSharedSoundsByCategory } from '@repo/sounds'

export interface SoundEffect {
  id: string
  name: string
  category: SoundCategory
  url: string
  duration: number
  tags: string[]
  source: 'local' | 'freesound' | 'zapsplat' | 'bbc' | 'custom'
  license: string
  attribution?: string
  assetId?: string // Reference to shared sound asset
}

export type SoundCategory = 
  | 'train' 
  | 'station' 
  | 'city' 
  | 'nature' 
  | 'ambient' 
  | 'mechanical' 
  | 'transport' 
  | 'industrial'

export interface SoundLibrary {
  name: string
  baseUrl: string
  apiKey?: string
  searchEndpoint: string
  categories: SoundCategory[]
  license: string
  attribution?: string
}

// BBC Sound Effects Library integration
export const BBC_SOUND_LIBRARY: SoundLibrary = {
  name: 'BBC Sound Effects Library',
  baseUrl: 'https://sound-effects.bbcrewind.co.uk',
  searchEndpoint: 'https://sound-effects.bbcrewind.co.uk/search',
  categories: ['train', 'station', 'city', 'nature', 'ambient', 'mechanical', 'transport', 'industrial'],
  license: 'BBC RemArc Licence',
  attribution: 'BBC Sound Effects Library'
}

// FreeSound.org integration
export const FREESOUND_LIBRARY: SoundLibrary = {
  name: 'FreeSound',
  baseUrl: 'https://freesound.org',
  searchEndpoint: 'https://freesound.org/apiv2/search/text/',
  apiKey: undefined, // Will be set via environment variables in server-side code
  categories: ['train', 'station', 'city', 'nature', 'ambient', 'mechanical', 'transport', 'industrial'],
  license: 'Creative Commons',
  attribution: 'FreeSound.org'
}

// Zapsplat integration
export const ZAPSPLAT_LIBRARY: SoundLibrary = {
  name: 'Zapsplat',
  baseUrl: 'https://www.zapsplat.com',
  searchEndpoint: 'https://www.zapsplat.com/api/search',
  apiKey: undefined, // Will be set via environment variables in server-side code
  categories: ['train', 'station', 'city', 'nature', 'ambient', 'mechanical', 'transport', 'industrial'],
  license: 'Zapsplat License',
  attribution: 'Zapsplat'
}

// Curated sound collections for common railroad scenarios
export const CURATED_SOUNDS: SoundEffect[] = [
  // Train Sounds - Using shared sounds package
  {
    id: 'train-wheels-ringing',
    name: 'Train Wheels Ringing Around Bend',
    category: 'train',
    url: '@train-wheels-ringing', // Use asset ID format for shared sounds
    duration: 6300,
    tags: ['wheels', 'bend', 'ringing', 'locomotive', 'modern'],
    source: 'local',
    license: 'Royalty Free',
    assetId: 'train-wheels-ringing'
  },
  {
    id: 'bbc-trains',
    name: 'BBC Trains',
    category: 'train',
    url: '@bbc-trains', // Use asset ID format for shared sounds
    duration: 5000,
    tags: ['bbc', 'diesel', 'locomotive', 'modern'],
    source: 'local',
    license: 'Royalty Free',
    assetId: 'bbc-trains'
  },
  
  // Placeholder sounds for future implementation
  {
    id: 'steam-whistle',
    name: 'Steam Locomotive Whistle',
    category: 'train',
    url: '@steam-whistle', // Use asset ID format for shared sounds
    duration: 3000,
    tags: ['steam', 'whistle', 'locomotive', 'classic'],
    source: 'local',
    license: 'Royalty Free'
  },
  {
    id: 'wheel-squeal',
    name: 'Train Wheel Squeal',
    category: 'train',
    url: '@wheel-squeal', // Use asset ID format for shared sounds
    duration: 1500,
    tags: ['wheels', 'squeal', 'friction', 'curve'],
    source: 'local',
    license: 'Royalty Free'
  },
  {
    id: 'steam-chuff',
    name: 'Steam Engine Chuff',
    category: 'train',
    url: '@steam-chuff', // Use asset ID format for shared sounds
    duration: 800,
    tags: ['steam', 'chuff', 'engine', 'rhythm'],
    source: 'local',
    license: 'Royalty Free'
  },
  
  // Station Sounds
  {
    id: 'station-announcement',
    name: 'Station Announcement',
    category: 'station',
    url: '@station-announcement', // Use asset ID format for shared sounds
    duration: 5000,
    tags: ['announcement', 'public', 'station', 'voice'],
    source: 'local',
    license: 'Royalty Free'
  },
  {
    id: 'ticket-machine',
    name: 'Ticket Machine',
    category: 'station',
    url: '@ticket-machine', // Use asset ID format for shared sounds
    duration: 2000,
    tags: ['ticket', 'machine', 'electronic', 'beep'],
    source: 'local',
    license: 'Royalty Free'
  },
  
  // City Sounds
  {
    id: 'city-traffic',
    name: 'City Traffic',
    category: 'city',
    url: '@city-traffic', // Use asset ID format for shared sounds
    duration: 10000,
    tags: ['traffic', 'city', 'ambient', 'urban'],
    source: 'local',
    license: 'Royalty Free'
  },
  {
    id: 'pedestrian-crossing',
    name: 'Pedestrian Crossing',
    category: 'city',
    url: '@pedestrian-crossing', // Use asset ID format for shared sounds
    duration: 1500,
    tags: ['crossing', 'pedestrian', 'signal', 'beep'],
    source: 'local',
    license: 'Royalty Free'
  },
  
  // Nature Sounds
  {
    id: 'birds-chirping',
    name: 'Birds Chirping',
    category: 'nature',
    url: '@birds-chirping', // Use asset ID format for shared sounds
    duration: 8000,
    tags: ['birds', 'nature', 'ambient', 'peaceful'],
    source: 'local',
    license: 'Royalty Free'
  },
  {
    id: 'wind-through-trees',
    name: 'Wind Through Trees',
    category: 'nature',
    url: '@wind-through-trees', // Use asset ID format for shared sounds
    duration: 12000,
    tags: ['wind', 'trees', 'nature', 'ambient'],
    source: 'local',
    license: 'Royalty Free'
  }
]

export class SoundEffectsService {
  private sounds: Map<string, SoundEffect> = new Map()
  private libraries: Map<string, SoundLibrary> = new Map()

  constructor() {
    this.initializeSounds()
    this.initializeLibraries()
  }

  private initializeSounds() {
    CURATED_SOUNDS.forEach(sound => {
      this.sounds.set(sound.id, sound)
    })
  }

  private initializeLibraries() {
    this.libraries.set('bbc', BBC_SOUND_LIBRARY)
    this.libraries.set('freesound', FREESOUND_LIBRARY)
    this.libraries.set('zapsplat', ZAPSPLAT_LIBRARY)
  }

  // Get all available sounds
  getAllSounds(): SoundEffect[] {
    return Array.from(this.sounds.values())
  }

  // Get sounds by category
  getSoundsByCategory(category: SoundCategory): SoundEffect[] {
    return this.getAllSounds().filter(sound => sound.category === category)
  }

  // Get sounds by tags
  getSoundsByTags(tags: string[]): SoundEffect[] {
    return this.getAllSounds().filter(sound => 
      tags.some(tag => sound.tags.includes(tag))
    )
  }

  // Search sounds by name or tags
  searchSounds(query: string): SoundEffect[] {
    const lowerQuery = query.toLowerCase()
    return this.getAllSounds().filter(sound => 
      sound.name.toLowerCase().includes(lowerQuery) ||
      sound.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  // Get sound by ID
  getSoundById(id: string): SoundEffect | undefined {
    return this.sounds.get(id)
  }

  // Add custom sound
  addCustomSound(sound: SoundEffect): void {
    this.sounds.set(sound.id, sound)
  }

  // Get available libraries
  getLibraries(): SoundLibrary[] {
    return Array.from(this.libraries.values())
  }

  // Search external library (placeholder for future implementation)
  async searchExternalLibrary(libraryId: string, query: string, category?: SoundCategory): Promise<SoundEffect[]> {
    const library = this.libraries.get(libraryId)
    if (!library) {
      throw new Error(`Library ${libraryId} not found`)
    }

    // This would integrate with actual API calls to external libraries
    // For now, return empty array
    console.log(`Searching ${library.name} for: ${query} in category: ${category}`)
    return []
  }

  // Get recommended sounds for railroad layout
  getRailroadRecommendations(): SoundEffect[] {
    return this.getAllSounds().filter(sound => 
      ['train', 'station', 'city', 'nature'].includes(sound.category)
    )
  }

  // Get shared sound asset by ID
  getSharedSoundAsset(assetId: string): SoundAsset | undefined {
    return getSoundById(assetId)
  }

  // Get all shared sound assets
  getAllSharedSoundAssets(): SoundAsset[] {
    return getSharedSoundsByCategory('train').concat(
      getSharedSoundsByCategory('city'),
      getSharedSoundsByCategory('nature'),
      getSharedSoundsByCategory('station')
    )
  }

  // Get web URL for a sound effect (for cloud/throttle apps)
  getWebUrl(soundEffect: SoundEffect, baseUrl: string = '/sounds/'): string {
    if (soundEffect.assetId) {
      const sharedAsset = this.getSharedSoundAsset(soundEffect.assetId)
      if (sharedAsset) {
        return SoundPathResolver.getWebUrl(sharedAsset.path, baseUrl)
      }
    }
    // If it's an asset ID format (@sound-id), convert to web URL
    if (soundEffect.url.startsWith('@')) {
      const assetId = soundEffect.url.substring(1)
      const sharedAsset = this.getSharedSoundAsset(assetId)
      if (sharedAsset) {
        return SoundPathResolver.getWebUrl(sharedAsset.path, baseUrl)
      }
    }
    return soundEffect.url
  }

  // Get server path for a sound effect (for server apps)
  async getServerPath(soundEffect: SoundEffect): Promise<string> {
    if (soundEffect.assetId) {
      const sharedAsset = this.getSharedSoundAsset(soundEffect.assetId)
      if (sharedAsset) {
        return await SoundPathResolver.getServerPath(sharedAsset.path)
      }
    }
    // If it's an asset ID format (@sound-id), convert to server path
    if (soundEffect.url.startsWith('@')) {
      const assetId = soundEffect.url.substring(1)
      const sharedAsset = this.getSharedSoundAsset(assetId)
      if (sharedAsset) {
        return await SoundPathResolver.getServerPath(sharedAsset.path)
      }
    }
    return soundEffect.url
  }

  // Get the appropriate URL for the current context
  // This method automatically determines whether to return a web URL or server path
  async getContextualUrl(soundEffect: SoundEffect, context: 'web' | 'server', baseUrl?: string): Promise<string> {
    if (context === 'web') {
      return this.getWebUrl(soundEffect, baseUrl)
    } else {
      return await this.getServerPath(soundEffect)
    }
  }

  // Check if a sound URL is an asset ID reference
  isAssetIdReference(url: string): boolean {
    return url.startsWith('@')
  }

  // Extract asset ID from a URL
  extractAssetId(url: string): string | null {
    if (url.startsWith('@')) {
      return url.substring(1)
    }
    return null
  }
}

// Export singleton instance
export const soundEffectsService = new SoundEffectsService()
