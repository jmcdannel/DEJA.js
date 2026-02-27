import { log } from '../utils/logger.js'
import playSoundLib from 'play-sound'
import { audioCacheService } from './AudioCacheService.js'

export interface SoundCommand {
  action: 'play' | 'stop' | 'volume'
  url: string
  volume?: number
  loop?: boolean
}

/**
 * Validate that a sound URL is safe to fetch.
 * Blocks private/internal IPs, cloud metadata endpoints, and non-HTTPS schemes.
 */
function isAllowedSoundUrl(url: string): boolean {
  if (typeof url !== 'string' || url.length === 0 || url.length > 2048) return false

  // Only allow http(s) URLs
  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    log.warn('[SOUND] Blocked non-HTTP URL scheme:', url)
    return false
  }

  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()

    // Block cloud metadata endpoints
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
      log.warn('[SOUND] Blocked cloud metadata URL:', url)
      return false
    }

    // Block private/internal IP ranges
    const ipMatch = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
    if (ipMatch) {
      const [, a, b] = ipMatch.map(Number)
      if (
        a === 10 ||                          // 10.0.0.0/8
        a === 127 ||                         // 127.0.0.0/8 (loopback)
        (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
        (a === 192 && b === 168) ||          // 192.168.0.0/16
        (a === 169 && b === 254) ||          // 169.254.0.0/16 (link-local)
        a === 0                              // 0.0.0.0/8
      ) {
        log.warn('[SOUND] Blocked private IP URL:', url)
        return false
      }
    }

    // Block localhost variants
    if (hostname === 'localhost' || hostname === '[::1]') {
      log.warn('[SOUND] Blocked localhost URL:', url)
      return false
    }

    return true
  } catch {
    log.warn('[SOUND] Failed to parse URL:', url)
    return false
  }
}

// Track running sound processes
interface RunningSound {
  audio: any
  tempFile?: string
  isRemote: boolean
  startTime: number
}

const runningSounds = new Map<string, RunningSound>()



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
      loop: false,
      url: soundUrl,
      volume: 1.0
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

    // Only allow HTTP(S) URLs — block local file paths from user input
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      log.error('[SOUND] Blocked non-HTTP sound URL (local paths not allowed):', url)
      return
    }

    // Validate URL against SSRF blocklist
    if (!isAllowedSoundUrl(url)) {
      log.error('[SOUND] Blocked disallowed sound URL:', url)
      return
    }

    // Check cache first, then download if needed
    const cachedPath = await audioCacheService.getCachedAudio(url)
    if (cachedPath) {
      localFilePath = cachedPath
      log.info('[SOUND] Using cached audio file', { cachedPath })
    } else {
      log.info('[SOUND] Audio not in cache, downloading...')

      try {
        // Download and cache the audio file
        localFilePath = await audioCacheService.downloadAndCacheAudio(url)
      } catch (downloadError) {
        log.error('[SOUND] Failed to download audio file:', downloadError)
        throw downloadError
      }
    }
    
    
         const player = playSoundLib()
     const audio = player.play(localFilePath, (err: any) => {
       if (err) {
         log.error('[SOUND] Failed to play sound:', err)
       } else {
         log.info('[SOUND] Sound playback completed successfully')
       }
       
     })
    runningSounds.set(url, { 
      audio,
      isRemote: url.startsWith('http'),
      startTime: Date.now(),
      tempFile: localFilePath
    })
    
  } catch (err) {
    log.error('[SOUND] Error playing sound', err)
  }
}

// Cache management functions







export async function stopSound(url: string): Promise<void> {
  try {
    log.info('[SOUND] Stopping sound', { url })
    
    const soundInfo = runningSounds.get(url)
    if (soundInfo) {
      try {
        // Note: play-sound doesn't support stopping individual sounds
        // The sound will continue until completion, but we remove it from tracking
        log.info('[SOUND] Sound player removed from tracking (sound will continue until completion)', { url })
        soundInfo.audio.kill()
        // Don't clean up cached files - let them stay in cache for reuse
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
