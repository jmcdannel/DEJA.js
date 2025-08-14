// Environment detection
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node
const isBrowser = typeof window !== 'undefined'

// Conditional imports for Node.js modules
let join: (path: string, ...paths: string[]) => string
let dirname: (path: string) => string

if (isNode) {
  // For Node.js environment, we'll handle imports in the methods that need them
  join = (...paths: string[]) => paths.join('/').replace(/\/+/g, '/')
  dirname = (path: string) => path.split('/').slice(0, -1).join('/') || '.'
} else {
  // Browser environment - provide fallback implementations
  join = (...paths: string[]) => paths.join('/').replace(/\/+/g, '/')
  dirname = (path: string) => path.split('/').slice(0, -1).join('/') || '.'
}

// Get the package directory for resolving asset paths (Node.js only)
let __filename: string
let __dirname: string

if (isNode) {
  // For Node.js environment, we'll handle this in the methods that need it
  __filename = ''
  __dirname = ''
} else {
  // Browser environment - provide fallback values
  __filename = ''
  __dirname = ''
}

export interface SoundAsset {
  id: string
  name: string
  category: 'train' | 'city' | 'nature' | 'station'
  filename: string
  path: string
  duration?: number
  tags?: string[]
}

export interface SoundCategory {
  id: string
  name: string
  description: string
  assets: SoundAsset[]
}

// Sound categories and assets
export const SOUND_CATEGORIES: SoundCategory[] = [
  {
    id: 'train',
    name: 'Train Sounds',
    description: 'Locomotive and train-related audio effects',
    assets: [
      {
        id: 'train-wheels-ringing',
        name: 'Train Wheels Ringing Around Bend',
        category: 'train',
        filename: '700035__jotraing__train-wheels-ringing-around-bend.wav',
        path: 'train/700035__jotraing__train-wheels-ringing-around-bend.wav',
        duration: 6300,
        tags: ['wheels', 'bend', 'ringing', 'locomotive']
      },
      {
        id: 'bbc-trains',
        name: 'BBC Trains',
        category: 'train',
        filename: 'bbc_trains--di_07041127.mp3',
        path: 'train/bbc_trains--di_07041127.mp3',
        duration: 5000,
        tags: ['bbc', 'diesel', 'locomotive']
      },
      {
        id: 'steam-whistle',
        name: 'Steam Locomotive Whistle',
        category: 'train',
        filename: 'steam-whistle.mp3',
        path: 'train/steam-whistle.mp3',
        duration: 3000,
        tags: ['steam', 'whistle', 'locomotive', 'classic']
      },
      {
        id: 'wheel-squeal',
        name: 'Train Wheel Squeal',
        category: 'train',
        filename: 'wheel-squeal.mp3',
        path: 'train/wheel-squeal.mp3',
        duration: 1500,
        tags: ['wheels', 'squeal', 'friction', 'curve']
      },
      {
        id: 'steam-chuff',
        name: 'Steam Engine Chuff',
        category: 'train',
        filename: 'steam-chuff.mp3',
        path: 'train/steam-chuff.mp3',
        duration: 800,
        tags: ['steam', 'chuff', 'engine', 'rhythm']
      }
    ]
  },
  {
    id: 'city',
    name: 'City Sounds',
    description: 'Urban and city environment audio',
    assets: [
      {
        id: 'city-traffic',
        name: 'City Traffic',
        category: 'city',
        filename: 'traffic.mp3',
        path: 'city/traffic.mp3',
        duration: 10000,
        tags: ['traffic', 'city', 'ambient', 'urban']
      },
      {
        id: 'pedestrian-crossing',
        name: 'Pedestrian Crossing',
        category: 'city',
        filename: 'pedestrian-crossing.mp3',
        path: 'city/pedestrian-crossing.mp3',
        duration: 1500,
        tags: ['crossing', 'pedestrian', 'signal', 'beep']
      }
    ]
  },
  {
    id: 'nature',
    name: 'Nature Sounds',
    description: 'Natural environment and wildlife audio',
    assets: [
      {
        id: 'birds-chirping',
        name: 'Birds Chirping',
        category: 'nature',
        filename: 'birds-chirping.mp3',
        path: 'nature/birds-chirping.mp3',
        duration: 8000,
        tags: ['birds', 'nature', 'ambient', 'peaceful']
      },
      {
        id: 'wind-through-trees',
        name: 'Wind Through Trees',
        category: 'nature',
        filename: 'wind-trees.mp3',
        path: 'nature/wind-trees.mp3',
        duration: 12000,
        tags: ['wind', 'trees', 'nature', 'ambient']
      }
    ]
  },
  {
    id: 'station',
    name: 'Station Sounds',
    description: 'Train station and platform audio',
    assets: [
      {
        id: 'station-announcement',
        name: 'Station Announcement',
        category: 'station',
        filename: 'announcement.mp3',
        path: 'station/announcement.mp3',
        duration: 5000,
        tags: ['announcement', 'public', 'station', 'voice']
      },
      {
        id: 'ticket-machine',
        name: 'Ticket Machine',
        category: 'station',
        filename: 'ticket-machine.mp3',
        path: 'station/ticket-machine.mp3',
        duration: 2000,
        tags: ['ticket', 'machine', 'electronic', 'beep']
      }
    ]
  }
]

// Utility functions for different app contexts
export class SoundPathResolver {
  /**
   * Get the absolute path to a sound asset
   * @param assetPath - Relative path from assets directory (e.g., 'train/sound.wav')
   * @returns Absolute path to the sound file
   */
  static async getAbsolutePath(assetPath: string): Promise<string> {
    if (!isNode) {
      throw new Error('getAbsolutePath is not available in browser environment')
    }
    // In Node.js, we need to dynamically resolve the path
    try {
      const { fileURLToPath } = await import('url')
      const { join, dirname } = await import('path')
      // Only use import.meta.url in Node.js environment
      if (typeof import.meta !== 'undefined' && import.meta.url) {
        const currentFilename = fileURLToPath(import.meta.url)
        const currentDirname = dirname(currentFilename)
        return join(currentDirname, 'assets', assetPath)
      } else {
        throw new Error('import.meta.url is not available')
      }
    } catch (error) {
      throw new Error('Failed to resolve absolute path in Node.js environment')
    }
  }

  /**
   * Get the web-accessible URL for cloud/throttle apps
   * @param assetPath - Relative path from assets directory
   * @param baseUrl - Base URL of the app (e.g., '/sounds/' for cloud app)
   * @returns Web-accessible URL
   */
  static getWebUrl(assetPath: string, baseUrl: string = '/sounds/'): string {
    return `${baseUrl}${assetPath}`
  }

  /**
   * Get the file system path for server apps
   * @param assetPath - Relative path from assets directory
   * @returns File system path
   */
  static async getServerPath(assetPath: string): Promise<string> {
    if (!isNode) {
      throw new Error('getServerPath is not available in browser environment')
    }
    // For server apps, we need to resolve from the server's perspective
    // The server is in apps/server, so we need to go up to the root and then to packages/sounds
    // This assumes the server is running from apps/server directory
    try {
      const { join } = await import('path')
      // Only access process.cwd() in Node.js environment
      if (typeof process !== 'undefined' && process.cwd) {
        const rootDir = join(process.cwd(), '..', '..')
        return join(rootDir, 'packages', 'sounds', 'assets', assetPath)
      } else {
        throw new Error('process.cwd is not available')
      }
    } catch (error) {
      throw new Error('Failed to resolve server path in Node.js environment')
    }
  }

  /**
   * Get the mobile app path for throttle apps
   * @param assetPath - Relative path from assets directory
   * @returns Mobile app asset path
   */
  static getMobilePath(assetPath: string): string {
    // For mobile apps, you might want to bundle assets or use a different path strategy
    return `assets/${assetPath}`
  }
}

// Export all sound assets for easy access
export const ALL_SOUNDS = SOUND_CATEGORIES.flatMap(category => category.assets)

// Helper function to find sounds by category
export function getSoundsByCategory(categoryId: string): SoundAsset[] {
  const category = SOUND_CATEGORIES.find(cat => cat.id === categoryId)
  return category?.assets || []
}

// Helper function to find sounds by tag
export function getSoundsByTag(tag: string): SoundAsset[] {
  return ALL_SOUNDS.filter(sound => sound.tags?.includes(tag))
}

// Helper function to find sound by ID
export function getSoundById(id: string): SoundAsset | undefined {
  return ALL_SOUNDS.find(sound => sound.id === id)
}
