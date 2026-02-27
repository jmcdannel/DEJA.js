import { log } from '../utils/logger.js'
import { mkdir, access, unlink, writeFile } from 'fs/promises'
import { join } from 'path'
import { createHash } from 'crypto'

export interface CachedAudio {
  filePath: string
  size: number
  lastAccessed: number
  accessCount: number
}

export interface CacheStats {
  currentSize: number
  maxSize: number
  currentSizeFormatted: string
  maxSizeFormatted: string
  itemCount: number
  usagePercent: number
}

export class AudioCacheService {
  private audioCache = new Map<string, CachedAudio>()
  private currentCacheSize = 0
  private maxSize: number
  private readonly tempDir: string

  constructor() {
    this.maxSize = (parseInt(process.env.AUDIO_CACHE_SIZE_MB || '200') * 1024 * 1024) // Configurable cache size, default 200MB
    this.tempDir = process.env.AUDIO_CACHE_DIR || 'temp-sounds-cache'
    
    // Log cache configuration on startup
    log.info('[AUDIO_CACHE] Audio cache initialized', {
      maxSize: this.formatBytes(this.maxSize),
      tempDir: this.tempDir,
      configSource: process.env.AUDIO_CACHE_SIZE_MB ? 'environment' : 'default'
    })
  }

  /**
   * Ensure the cache directory exists
   */
  async ensureCacheDirectory(): Promise<string> {
    const cacheDir = join(process.cwd(), this.tempDir)
    log.info('[AUDIO_CACHE] Cache directory path:', cacheDir)
    
    try {
      await mkdir(cacheDir, { recursive: true })
      log.info('[AUDIO_CACHE] Cache directory ensured successfully')
    } catch (error) {
      log.warn('[AUDIO_CACHE] Cache directory creation warning (might already exist):', error)
    }
    
    return cacheDir
  }

  /**
   * Generate a cache key from a URL
   */
  async generateCacheKey(url: string): Promise<string> {
    return createHash('md5').update(url).digest('hex')
  }

  /**
   * Get cached audio file path if it exists
   */
  async getCachedAudio(url: string): Promise<string | null> {
    const cacheKey = await this.generateCacheKey(url)
    log.info('[AUDIO_CACHE] Checking cache for URL:', url, 'Cache key:', cacheKey)
    
    const cached = this.audioCache.get(cacheKey)
    log.info('[AUDIO_CACHE] Cache lookup result:', cached ? 'found' : 'not found')
    
    if (cached) {
      // Check if file still exists
      try {
        await access(cached.filePath)
        
        // Update access stats
        cached.lastAccessed = Date.now()
        cached.accessCount++
        
        log.info('[AUDIO_CACHE] Audio found in cache', { 
          url, 
          cacheKey, 
          size: cached.size, 
          filePath: cached.filePath 
        })
        return cached.filePath
      } catch (error) {
        log.warn('[AUDIO_CACHE] Cached file not accessible, removing from cache:', error)
        // File was deleted, remove from cache
        this.audioCache.delete(cacheKey)
        this.currentCacheSize -= cached.size
      }
    }
    
    // Also check if the file exists in cache directory with the expected filename
    // This handles cases where the cache map was cleared but files still exist
    const expectedFilename = this.generateFilenameFromUrl(url)
    const cacheDir = await this.ensureCacheDirectory()
    const expectedPath = join(cacheDir, expectedFilename)
    
    try {
      await access(expectedPath)
      log.info('[AUDIO_CACHE] Found existing file in cache directory:', expectedPath)
      
      // Get file stats to determine size
      const { stat } = await import('fs/promises')
      const stats = await stat(expectedPath)
      
      // Add it back to the cache map
      await this.addToCache(url, expectedPath, stats.size)
      
      return expectedPath
    } catch (error) {
      // File doesn't exist in cache directory
    }
    
    log.info('[AUDIO_CACHE] No cached audio found for URL:', url)
    return null
  }

  /**
   * Add audio file to cache
   */
  async addToCache(url: string, filePath: string, size: number): Promise<void> {
    const cacheKey = await this.generateCacheKey(url)
    log.info('[AUDIO_CACHE] Adding to cache:', { url, cacheKey, filePath, size })
    
    // Make space if needed
    await this.makeCacheSpace(size)
    
    // Add to cache
    this.audioCache.set(cacheKey, {
      filePath,
      size,
      lastAccessed: Date.now(),
      accessCount: 1
    })
    
    this.currentCacheSize += size
    log.info('[AUDIO_CACHE] Audio added to cache successfully', { 
      url, 
      cacheKey, 
      size, 
      currentSize: this.formatBytes(this.currentCacheSize),
      cacheItemCount: this.audioCache.size
    })
  }

  /**
   * Make space in cache by removing least used items
   */
  private async makeCacheSpace(neededSize: number): Promise<void> {
    if (this.currentCacheSize + neededSize <= this.maxSize) {
      return
    }
    
    log.info('[AUDIO_CACHE] Cache full, making space', { 
      currentSize: this.formatBytes(this.currentCacheSize), 
      maxSize: this.formatBytes(this.maxSize),
      neededSize: this.formatBytes(neededSize)
    })
    
    // Sort by access count (least used first), then by last accessed
    const sortedEntries = Array.from(this.audioCache.entries())
      .sort(([, a], [, b]) => {
        if (a.accessCount !== b.accessCount) {
          return a.accessCount - b.accessCount
        }
        return a.lastAccessed - b.lastAccessed
      })
    
    // Remove entries until we have enough space
    for (const [cacheKey, cached] of sortedEntries) {
      if (this.currentCacheSize + neededSize <= this.maxSize) {
        break
      }
      
      try {
        await unlink(cached.filePath)
        
        this.audioCache.delete(cacheKey)
        this.currentCacheSize -= cached.size
        
        log.info('[AUDIO_CACHE] Evicted from cache', { 
          cacheKey, 
          size: cached.size, 
          currentSize: this.formatBytes(this.currentCacheSize) 
        })
      } catch (error) {
        log.warn('[AUDIO_CACHE] Failed to remove cached file', { cacheKey, error })
        // Remove from cache anyway
        this.audioCache.delete(cacheKey)
        this.currentCacheSize -= cached.size
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    return {
      currentSize: this.currentCacheSize,
      maxSize: this.maxSize,
      currentSizeFormatted: this.formatBytes(this.currentCacheSize),
      maxSizeFormatted: this.formatBytes(this.maxSize),
      itemCount: this.audioCache.size,
      usagePercent: Math.round((this.currentCacheSize / this.maxSize) * 100)
    }
  }

  /**
   * Set new maximum cache size
   */
  setCacheMaxSize(maxSizeMB: number): void {
    const newMaxSize = maxSizeMB * 1024 * 1024
    const oldSize = this.maxSize
    this.maxSize = newMaxSize
    
    log.info('[AUDIO_CACHE] Cache max size updated', { 
      oldSize: this.formatBytes(oldSize), 
      newSize: this.formatBytes(newMaxSize) 
    })
    
    // If current size exceeds new limit, make space
    if (this.currentCacheSize > newMaxSize) {
      this.makeCacheSpace(0)
    }
  }

  /**
   * Clear all cached audio files
   */
  async clearCache(): Promise<void> {
    log.info('[AUDIO_CACHE] Clearing audio cache...')
    
    for (const [cacheKey, cached] of this.audioCache.entries()) {
      try {
        await unlink(cached.filePath)
      } catch (error) {
        log.warn('[AUDIO_CACHE] Failed to remove cached file during clear', { cacheKey, error })
      }
    }
    
    this.audioCache.clear()
    this.currentCacheSize = 0
    
    log.info('[AUDIO_CACHE] Audio cache cleared successfully')
  }

  /**
   * Download and cache audio file from URL
   */
  async downloadAndCacheAudio(url: string): Promise<string> {
    log.info('[AUDIO_CACHE] Starting download from URL:', url)

    // Defense-in-depth: reject non-HTTP URLs at the cache layer too
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      throw new Error(`[AUDIO_CACHE] Blocked non-HTTP URL: ${url}`)
    }

    // Download the audio file
    const response = await fetch(url)
    log.info('[AUDIO_CACHE] Fetch response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const audioBuffer = await response.arrayBuffer()
    const audioData = Buffer.from(audioBuffer)
    log.info('[AUDIO_CACHE] Downloaded audio data size:', audioData.length, 'bytes')
    
    // Generate a filename based on the URL to enable proper caching
    const filename = this.generateFilenameFromUrl(url)
    const cacheDir = await this.ensureCacheDirectory()
    const cacheFile = join(cacheDir, filename)
    
    // Write file to cache
    await writeFile(cacheFile, audioData)
    log.info('[AUDIO_CACHE] Audio file written to:', cacheFile)
    
    // Add to cache
    await this.addToCache(url, cacheFile, audioData.length)
    
    log.info('[AUDIO_CACHE] Audio file downloaded and cached successfully', { 
      cacheFile, 
      size: audioData.length 
    })
    
    return cacheFile
  }

  /**
   * Generate a filename from URL that preserves the original name and structure
   */
  private generateFilenameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      
      // Extract the original filename from the path
      let filename = pathname.split('/').pop() || 'audio'
      
      // If no extension, add .mp3 as default
      if (!filename.includes('.') || filename === 'audio') {
        // Use hash-based naming for URLs without clear filenames
        const hash = createHash('md5').update(url).digest('hex').substring(0, 8)
        filename = `audio_${hash}.mp3`
      }
      
      // If filename is too long or contains invalid characters, create a hash-based name
      if (filename.length > 100 || /[<>:"/\\|?*]/.test(filename)) {
        const hash = createHash('md5').update(url).digest('hex').substring(0, 8)
        const extension = filename.includes('.') ? filename.split('.').pop() : 'mp3'
        filename = `audio_${hash}.${extension}`
      }
      
      return filename
    } catch (error) {
      // Fallback to hash-based naming if URL parsing fails
      const hash = createHash('md5').update(url).digest('hex').substring(0, 8)
      return `audio_${hash}.mp3`
    }
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Test cache functionality
   */
  async testCacheFunctionality(testUrl: string): Promise<any> {
    log.info('[AUDIO_CACHE] Testing cache functionality with URL:', testUrl)
    
    try {
      // Test cache directory
      const cacheDir = await this.ensureCacheDirectory()
      log.info('[AUDIO_CACHE] Cache directory test result:', cacheDir)
      
      // Test cache key generation
      const cacheKey = await this.generateCacheKey(testUrl)
      log.info('[AUDIO_CACHE] Cache key test result:', cacheKey)
      
      // Test filename generation
      const expectedFilename = this.generateFilenameFromUrl(testUrl)
      log.info('[AUDIO_CACHE] Expected filename:', expectedFilename)
      
      // Test cache lookup
      const cachedResult = await this.getCachedAudio(testUrl)
      log.info('[AUDIO_CACHE] Cache lookup test result:', cachedResult)
      
      // Test cache stats
      const cacheStats = this.getCacheStats()
      log.info('[AUDIO_CACHE] Cache stats test result:', cacheStats)
      
      return {
        cacheDir,
        cacheKey,
        expectedFilename,
        cachedResult,
        cacheStats,
        success: true
      }
    } catch (error) {
      log.error('[AUDIO_CACHE] Cache functionality test failed:', error)
      return {
        error: error instanceof Error ? error.message : String(error),
        success: false
      }
    }
  }

  /**
   * Get detailed cache information for debugging
   */
  getCacheDetails(): any {
    const cacheEntries = Array.from(this.audioCache.entries()).map(([key, cached]) => ({
      key,
      filePath: cached.filePath,
      size: cached.size,
      lastAccessed: new Date(cached.lastAccessed).toISOString(),
      accessCount: cached.accessCount
    }))
    
    return {
      ...this.getCacheStats(),
      entries: cacheEntries,
      cacheDirectory: this.tempDir
    }
  }
}

// Export singleton instance
export const audioCacheService = new AudioCacheService()
