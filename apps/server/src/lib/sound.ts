import { log } from '../utils/logger.js'
import { SoundPathResolver } from '@repo/sounds'

export interface SoundCommand {
  action: 'play' | 'stop' | 'volume'
  url: string
  volume?: number
  loop?: boolean
}

// Track running sound processes
const runningSounds = new Map<string, any>()

export function soundCommand(efx: any): SoundCommand | undefined {
  try {
    if (!efx.sound) {
      log.error('[SOUND] No sound URL provided', efx)
      return undefined
    }

    return {
      action: efx.state ? 'play' : 'stop',
      url: efx.sound,
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
    
    let resolvedUrl: string
    
    // Check if this is a sound asset ID from the shared package
    if (url.startsWith('@')) {
      // Handle sound asset IDs (e.g., '@train-wheels-ringing')
      const soundId = url.substring(1)
      const { getSoundById } = await import('@repo/sounds')
      const sound = getSoundById(soundId)
      
      if (!sound) {
        log.error('[SOUND] Sound asset not found:', soundId)
        return
      }
      
      resolvedUrl = await SoundPathResolver.getServerPath(sound.path)
      log.info('[SOUND] Resolved sound asset', { soundId, assetPath: sound.path, resolvedUrl })
    } else {
      // Handle direct file paths
      const { resolve, isAbsolute } = await import('path')
      
      if (isAbsolute(url)) {
        resolvedUrl = url
      } else {
        // Try to resolve as a relative path to the shared sounds package
        resolvedUrl = await SoundPathResolver.getServerPath(url)
      }
    }
    
    log.info('[SOUND] Playing sound', { 
      originalUrl: url, 
      resolvedUrl, 
      volume,
      exists: await checkFileExists(resolvedUrl)
    })
    
    // Check if file exists before trying to play
    if (!(await checkFileExists(resolvedUrl))) {
      log.error('[SOUND] Sound file does not exist:', resolvedUrl)
      return
    }
    
    const { spawn } = await import('child_process')
    const platform = process.platform
    
    let command: string
    let args: string[]
    
    if (platform === 'darwin') {
      // macOS - afplay doesn't support volume flag, so we'll use the basic command
      command = 'afplay'
      args = [resolvedUrl]
    } else if (platform === 'linux') {
      // Linux
      command = 'aplay'
      args = [resolvedUrl]
    } else if (platform === 'win32') {
      // Windows
      command = 'powershell'
      args = ['-Command', `(New-Object Media.SoundPlayer '${resolvedUrl}').PlaySync()`]
    } else {
      log.warn('[SOUND] Unsupported platform for audio playback:', platform)
      return
    }
    
    log.info('[SOUND] Executing command:', { command, args })
    
    const child = spawn(command, args, { 
      stdio: 'pipe', // Change to 'pipe' to capture stderr for debugging
      cwd: process.cwd()
    })
    
    // Store the process for later stopping
    runningSounds.set(url, child)
    
    // Capture stderr for debugging
    child.stderr?.on('data', (data) => {
      log.warn('[SOUND] Command stderr:', data.toString())
    })
    
    child.on('error', (error) => {
      log.error('[SOUND] Failed to play sound:', error)
      runningSounds.delete(url)
    })
    
    child.on('exit', (code) => {
      if (code === 0) {
        log.info('[SOUND] Sound playback completed successfully')
      } else {
        log.error('[SOUND] Sound playback failed with exit code:', code)
      }
      runningSounds.delete(url)
    })
    
  } catch (err) {
    log.error('[SOUND] Error playing sound', err)
  }
}

// Helper function to check if file exists
async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    const { access } = await import('fs/promises')
    await access(filePath)
    return true
  } catch {
    return false
  }
}

export async function stopSound(url: string): Promise<void> {
  try {
    log.info('[SOUND] Stopping sound', { url })
    
    const process = runningSounds.get(url)
    if (process) {
      try {
        // Kill the process
        process.kill('SIGTERM')
        
        // Force kill after a short delay if it doesn't stop gracefully
        setTimeout(() => {
          if (process.exitCode === null) {
            process.kill('SIGKILL')
          }
        }, 1000)
        
        log.info('[SOUND] Sound stopped successfully', { url })
      } catch (error) {
        log.error('[SOUND] Error stopping sound process:', error)
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
