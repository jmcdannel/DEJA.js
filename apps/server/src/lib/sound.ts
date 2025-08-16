import { log } from '../utils/logger.js'
import playSoundLib from 'play-sound'
import { audioCacheService } from './AudioCacheService.js'

export interface SoundCommand {
  action: 'play' | 'stop' | 'volume'
  url: string
  volume?: number
  loop?: boolean
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
    
    // If it's a remote URL, check cache first, then download if needed
    if (url.startsWith('http')) {
      // Check cache first
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
    } else {
      // Local file path
      localFilePath = url
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
