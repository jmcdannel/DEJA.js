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

// Export the actual sound store data with blob URLs
export * from './src/soundsData'

// Legacy exports for backward compatibility
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

// Utility functions for different app contexts
export class SoundPathResolver {
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
   * Get the mobile app path for throttle apps
   * @param assetPath - Relative path from assets directory
   * @returns Mobile app asset path
   */
  static getMobilePath(assetPath: string): string {
    // For mobile apps, you might want to bundle assets or use a different path strategy
    return `assets/${assetPath}`
  }
}
