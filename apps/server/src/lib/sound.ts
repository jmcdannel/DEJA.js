import { log } from '../utils/logger.js'
import { SoundPathResolver } from '@repo/sounds'

export interface SoundCommand {
  action: 'play' | 'stop' | 'volume'
  url: string
  volume?: number
  loop?: boolean
}

// Track running sound processes
interface RunningSound {
  player: any
  tempFile?: string
  isRemote: boolean
  startTime: number
  process?: any // Store the actual audio process for stopping
}

const runningSounds = new Map<string, RunningSound>()

// Audio cache configuration
const CACHE_CONFIG = {
  maxSize: (parseInt(process.env.AUDIO_CACHE_SIZE_MB || '200') * 1024 * 1024), // Configurable cache size, default 200MB
  tempDir: process.env.AUDIO_CACHE_DIR || 'temp-sounds-cache'
}

// Cache tracking
interface CachedAudio {
  filePath: string
  size: number
  lastAccessed: number
  accessCount: number
}

const audioCache = new Map<string, CachedAudio>()
let currentCacheSize = 0

// Log cache configuration on startup
log.info('[SOUND] Audio cache initialized', {
  maxSize: formatBytes(CACHE_CONFIG.maxSize),
  tempDir: CACHE_CONFIG.tempDir,
  configSource: process.env.AUDIO_CACHE_SIZE_MB ? 'environment' : 'default'
})

export function soundCommand(efx: any): SoundCommand | undefined {
  try {
    // Device is required for sound effects
    if (!efx.device) {
      log.error('[SOUND] Device field is required for sound effects', efx)
      return undefined
    }
    
    // Use soundBlobUrl if available, otherwise fall back to sound field
    const soundUrl = efx.soundBlobUrl || efx.sound
    
    if (!soundUrl) {
      log.error('[SOUND] No sound URL provided', efx)
      return undefined
    }

    return {
      action: efx.state ? 'play' : 'stop',
      url: soundUrl,
      volume: 1.0,
      loop: false
    }
  } catch (err) {
    log.error('[SOUND] Error creating sound command', err)
    return undefined
  }
}

export async function playSound(url: string, volume: number = 1.0): Promise<void> {
  try {
    // Stop any existing sound with the same URL first
    await stopSound(url)
    
    // Stop other sounds to make room for this one
    await stopOtherSounds(url)
        
    log.info('[SOUND] Playing sound', { 
      originalUrl: url, 
      url, 
      volume
    })
    
    let localFilePath: string
    
    // If it's a remote URL, check cache first, then download if needed
    if (url.startsWith('http')) {
      // Check cache first
      const cachedPath = await getCachedAudio(url)
      if (cachedPath) {
        localFilePath = cachedPath
        log.info('[SOUND] Using cached audio file', { cachedPath })
      } else {
        log.info('[SOUND] Audio not in cache, downloading...')
        
        const { writeFile } = await import('fs/promises')
        const { join } = await import('path')
        const { randomUUID } = await import('crypto')
        
        // Ensure cache directory exists
        const cacheDir = await ensureCacheDirectory()
        const tempFile = join(cacheDir, `sound-${randomUUID()}.mp3`)
        
        try {
          // Download the audio file
          const response = await fetch(url)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          
          const audioBuffer = await response.arrayBuffer()
          const audioData = Buffer.from(audioBuffer)
          await writeFile(tempFile, audioData)
          
          localFilePath = tempFile
          
          // Add to cache
          await addToCache(url, tempFile, audioData.length)
          
          log.info('[SOUND] Audio file downloaded and cached successfully', { tempFile, size: audioData.length })
          
        } catch (downloadError) {
          log.error('[SOUND] Failed to download audio file:', downloadError)
          throw downloadError
        }
      }
    } else {
      // Local file path
      localFilePath = url
    }
    
    // Use platform-specific audio players for better control
    const { spawn } = await import('child_process')
    const platform = process.platform
    
    let command: string
    let args: string[]
    
    if (platform === 'darwin') {
      // macOS - afplay
      command = 'afplay'
      args = [localFilePath]
    } else if (platform === 'linux') {
      // Linux - aplay
      command = 'aplay'
      args = [localFilePath]
    } else if (platform === 'win32') {
      // Windows - powershell with Media.SoundPlayer
      command = 'powershell'
      args = ['-Command', `(New-Object Media.SoundPlayer '${localFilePath}').PlaySync()`]
    } else {
      // Fallback to play-sound for unsupported platforms
      const player = (await import('play-sound')).default()
      
      runningSounds.set(url, { 
        player, 
        tempFile: localFilePath, 
        isRemote: url.startsWith('http'),
        startTime: Date.now()
      })
      
      player.play(localFilePath, (err: any) => {
        if (err) {
          log.error('[SOUND] Failed to play sound:', err)
        } else {
          log.info('[SOUND] Sound playback completed successfully')
        }
        
        // Clean up temporary file if it was downloaded
        const soundInfo = runningSounds.get(url)
        if (soundInfo?.isRemote && soundInfo.tempFile) {
          cleanupTempFile(soundInfo.tempFile)
        }
        
        runningSounds.delete(url)
      })
      return
    }
    
    // Spawn the audio process
    const audioProcess = spawn(command, args, { 
      stdio: 'pipe',
      cwd: process.cwd()
    })
    
    // Store the process for later stopping
    runningSounds.set(url, { 
      player: null, 
      tempFile: localFilePath, 
      isRemote: url.startsWith('http'),
      startTime: Date.now(),
      process: audioProcess
    })
    
    // Handle process completion
    audioProcess.on('exit', (code) => {
      if (code === 0) {
        log.info('[SOUND] Sound playback completed successfully')
      } else {
        log.info('[SOUND] Sound playback ended with code:', code)
      }
      
      // Clean up temporary file if it was downloaded
      const soundInfo = runningSounds.get(url)
      if (soundInfo?.isRemote && soundInfo.tempFile) {
        cleanupTempFile(soundInfo.tempFile)
      }
      
      runningSounds.delete(url)
    })
    
    // Handle process errors
    audioProcess.on('error', (error) => {
      log.error('[SOUND] Audio process error:', error)
      runningSounds.delete(url)
    })
    
  } catch (err) {
    log.error('[SOUND] Error playing sound', err)
  }
}

// Cache management functions
async function ensureCacheDirectory(): Promise<string> {
  const { mkdir } = await import('fs/promises')
  const { join } = await import('path')
  
  const cacheDir = join(process.cwd(), CACHE_CONFIG.tempDir)
  try {
    await mkdir(cacheDir, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
  return cacheDir
}

async function generateCacheKey(url: string): Promise<string> {
  const { createHash } = await import('crypto')
  return createHash('md5').update(url).digest('hex')
}

async function getCachedAudio(url: string): Promise<string | null> {
  const cacheKey = await generateCacheKey(url)
  const cached = audioCache.get(cacheKey)
  
  if (cached) {
    // Check if file still exists
    try {
      const { access } = await import('fs/promises')
      await access(cached.filePath)
      
      // Update access stats
      cached.lastAccessed = Date.now()
      cached.accessCount++
      
      log.info('[SOUND] Audio found in cache', { url, cacheKey, size: cached.size })
      return cached.filePath
    } catch {
      // File was deleted, remove from cache
      audioCache.delete(cacheKey)
      currentCacheSize -= cached.size
    }
  }
  
  return null
}

async function addToCache(url: string, filePath: string, size: number): Promise<void> {
  const cacheKey = await generateCacheKey(url)
  
  // Make space if needed
  await makeCacheSpace(size)
  
  // Add to cache
  audioCache.set(cacheKey, {
    filePath,
    size,
    lastAccessed: Date.now(),
    accessCount: 1
  })
  
  currentCacheSize += size
  log.info('[SOUND] Audio added to cache', { url, cacheKey, size, currentCacheSize: formatBytes(currentCacheSize) })
}

async function makeCacheSpace(neededSize: number): Promise<void> {
  if (currentCacheSize + neededSize <= CACHE_CONFIG.maxSize) {
    return
  }
  
  log.info('[SOUND] Cache full, making space', { 
    currentSize: formatBytes(currentCacheSize), 
    maxSize: formatBytes(CACHE_CONFIG.maxSize),
    neededSize: formatBytes(neededSize)
  })
  
  // Sort by access count (least used first), then by last accessed
  const sortedEntries = Array.from(audioCache.entries())
    .sort(([, a], [, b]) => {
      if (a.accessCount !== b.accessCount) {
        return a.accessCount - b.accessCount
      }
      return a.lastAccessed - b.lastAccessed
    })
  
  // Remove entries until we have enough space
  for (const [cacheKey, cached] of sortedEntries) {
    if (currentCacheSize + neededSize <= CACHE_CONFIG.maxSize) {
      break
    }
    
    try {
      const { unlink } = await import('fs/promises')
      await unlink(cached.filePath)
      
      audioCache.delete(cacheKey)
      currentCacheSize -= cached.size
      
      log.info('[SOUND] Evicted from cache', { cacheKey, size: cached.size, currentSize: formatBytes(currentCacheSize) })
    } catch (error) {
      log.warn('[SOUND] Failed to remove cached file', { cacheKey, error })
      // Remove from cache anyway
      audioCache.delete(cacheKey)
      currentCacheSize -= cached.size
    }
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Helper function to clean up temporary files
async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    const { unlink } = await import('fs/promises')
    await unlink(filePath)
    log.info('[SOUND] Temporary file cleaned up:', filePath)
  } catch (error) {
    log.warn('[SOUND] Failed to clean up temporary file:', filePath, error)
  }
}



export async function stopSound(url: string): Promise<void> {
  try {
    log.info('[SOUND] Stopping sound', { url })
    
    const soundInfo = runningSounds.get(url)
    if (soundInfo) {
      try {
        if (soundInfo.process) {
          // We have a process to kill - stop it immediately
          log.info('[SOUND] Stopping audio process', { url })
          
          // Kill the process gracefully first
          soundInfo.process.kill('SIGTERM')
          
          // Force kill after a short delay if it doesn't stop gracefully
          setTimeout(() => {
            if (soundInfo.process && soundInfo.process.exitCode === null) {
              log.info('[SOUND] Force killing audio process', { url })
              soundInfo.process.kill('SIGKILL')
            }
          }, 1000)
          
          log.info('[SOUND] Sound stopped successfully', { url })
        } else if (soundInfo.player) {
          // Fallback for play-sound (can't stop, just remove from tracking)
          log.info('[SOUND] Sound player removed from tracking (sound will continue until completion)', { url })
        }
        
        // Clean up temporary file if it was downloaded
        if (soundInfo.isRemote && soundInfo.tempFile) {
          await cleanupTempFile(soundInfo.tempFile)
        }
      } catch (error) {
        log.error('[SOUND] Error stopping sound:', error)
      } finally {
        runningSounds.delete(url)
      }
    } else {
      log.info('[SOUND] No running sound found to stop', { url })
    }
  } catch (err) {
    log.error('[SOUND] Error stopping sound', err)
  }
}

// Stop all sounds except the specified one
export async function stopOtherSounds(keepUrl: string): Promise<void> {
  try {
    const urlsToStop = Array.from(runningSounds.keys()).filter(url => url !== keepUrl)
    
    if (urlsToStop.length > 0) {
      log.info('[SOUND] Stopping other sounds to make room for new sound', { 
        keepUrl, 
        stoppingCount: urlsToStop.length 
      })
      
      for (const url of urlsToStop) {
        await stopSound(url)
      }
    }
  } catch (err) {
    log.error('[SOUND] Error stopping other sounds', err)
  }
}

// Stop all running sounds
export async function stopAllSounds(): Promise<void> {
  try {
    log.info('[SOUND] Stopping all sounds')
    const urls = Array.from(runningSounds.keys())
    
    for (const url of urls) {
      await stopSound(url)
    }
    
    log.info('[SOUND] All sounds stopped')
  } catch (err) {
    log.error('[SOUND] Error stopping all sounds', err)
  }
}

// Get list of currently running sounds
export function getRunningSounds(): string[] {
  return Array.from(runningSounds.keys())
}

// Get detailed information about running sounds
export function getRunningSoundsInfo() {
  const sounds = Array.from(runningSounds.entries()).map(([url, info]) => ({
    url,
    isRemote: info.isRemote,
    startTime: info.startTime,
    duration: Date.now() - info.startTime,
    tempFile: info.tempFile
  }))
  
  return {
    count: sounds.length,
    sounds
  }
}

// Cache management exports
export function getCacheStats() {
  return {
    currentSize: currentCacheSize,
    maxSize: CACHE_CONFIG.maxSize,
    currentSizeFormatted: formatBytes(currentCacheSize),
    maxSizeFormatted: formatBytes(CACHE_CONFIG.maxSize),
    itemCount: audioCache.size,
    usagePercent: Math.round((currentCacheSize / CACHE_CONFIG.maxSize) * 100)
  }
}

export function setCacheMaxSize(maxSizeMB: number) {
  const newMaxSize = maxSizeMB * 1024 * 1024
  CACHE_CONFIG.maxSize = newMaxSize
  log.info('[SOUND] Cache max size updated', { 
    oldSize: formatBytes(CACHE_CONFIG.maxSize), 
    newSize: formatBytes(newMaxSize) 
  })
  
  // If current size exceeds new limit, make space
  if (currentCacheSize > newMaxSize) {
    makeCacheSpace(0)
  }
}

export async function clearCache(): Promise<void> {
  log.info('[SOUND] Clearing audio cache...')
  
  for (const [cacheKey, cached] of audioCache.entries()) {
    try {
      const { unlink } = await import('fs/promises')
      await unlink(cached.filePath)
    } catch (error) {
      log.warn('[SOUND] Failed to remove cached file during clear', { cacheKey, error })
    }
  }
  
  audioCache.clear()
  currentCacheSize = 0
  
  log.info('[SOUND] Audio cache cleared successfully')
}
