// Sound Scanner Service
// Scans the sounds package for new files and imports them to the store

import { soundStoreService, type StoredSound } from './soundStore'
import { readdir, readFile, stat } from 'fs/promises'
import { join, extname, basename } from 'path'

export interface SoundFile {
  name: string
  path: string
  size: number
  modified: Date
  category: string
  duration?: number
}

export interface ScanResult {
  success: boolean
  newFiles: SoundFile[]
  existingFiles: string[]
  imported: StoredSound[]
  errors: string[]
  summary: {
    total: number
    new: number
    existing: number
    imported: number
    errors: number
  }
}

export class SoundScanner {
  private soundsPackagePath: string
  private supportedExtensions = ['.mp3', '.wav', '.ogg', '.m4a']
  private categoryMapping: Record<string, string> = {
    'train': 'train',
    'station': 'station',
    'city': 'city',
    'nature': 'nature',
    'ambient': 'ambient',
    'mechanical': 'mechanical',
    'transport': 'transport',
    'industrial': 'industrial'
  }

  constructor(soundsPackagePath?: string) {
    this.soundsPackagePath = soundsPackagePath || join(process.cwd(), 'packages', 'sounds', 'assets')
  }

  // Scan the sounds package for new files
  async scanForNewSounds(): Promise<ScanResult> {
    try {
      console.log('🔍 Scanning sounds package...')
      console.log(`📁 Path: ${this.soundsPackagePath}`)

      const allFiles = await this.getAllSoundFiles()
      const existingSounds = soundStoreService.getAllSounds()
      const existingPaths = new Set(existingSounds.map(s => s.filePath))

      const newFiles: SoundFile[] = []
      const existingFiles: string[] = []
      const imported: StoredSound[] = []
      const errors: string[] = []

      for (const file of allFiles) {
        if (existingPaths.has(file.path)) {
          existingFiles.push(file.path)
        } else {
          newFiles.push(file)
        }
      }

      // Import new files
      for (const file of newFiles) {
        try {
          const sound = await this.importSoundFile(file)
          if (sound) {
            imported.push(sound)
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          errors.push(`Failed to import ${file.name}: ${errorMsg}`)
        }
      }

      const result: ScanResult = {
        success: true,
        newFiles,
        existingFiles,
        imported,
        errors,
        summary: {
          total: allFiles.length,
          new: newFiles.length,
          existing: existingFiles.length,
          imported: imported.length,
          errors: errors.length
        }
      }

      console.log('✅ Scan completed!')
      console.log(`📊 Summary: ${result.summary.total} total, ${result.summary.new} new, ${result.summary.imported} imported, ${result.summary.errors} errors`)

      return result

    } catch (error) {
      console.error('❌ Scan failed:', error)
      return {
        success: false,
        newFiles: [],
        existingFiles: [],
        imported: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        summary: { total: 0, new: 0, existing: 0, imported: 0, errors: 0 }
      }
    }
  }

  // Get all sound files from the package
  private async getAllSoundFiles(): Promise<SoundFile[]> {
    const files: SoundFile[] = []
    
    try {
      await this.scanDirectory(this.soundsPackagePath, files)
    } catch (error) {
      console.error('Failed to scan sounds package:', error)
    }

    return files
  }

  // Recursively scan directories
  private async scanDirectory(dirPath: string, files: SoundFile[]): Promise<void> {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name)
        
        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          await this.scanDirectory(fullPath, files)
        } else if (entry.isFile()) {
          // Check if it's a supported sound file
          if (this.isSoundFile(entry.name)) {
            const stats = await stat(fullPath)
            const category = this.detectCategory(fullPath)
            
            files.push({
              name: entry.name,
              path: fullPath,
              size: stats.size,
              modified: stats.mtime,
              category
            })
          }
        }
      }
    } catch (error) {
      console.error(`Failed to scan directory ${dirPath}:`, error)
    }
  }

  // Check if file is a supported sound file
  private isSoundFile(filename: string): boolean {
    const ext = extname(filename).toLowerCase()
    return this.supportedExtensions.includes(ext)
  }

  // Detect category from file path
  private detectCategory(filePath: string): string {
    const pathParts = filePath.toLowerCase().split('/')
    
    // Look for category in path segments
    for (const part of pathParts) {
      if (this.categoryMapping[part]) {
        return this.categoryMapping[part]
      }
    }
    
    // Look for category in filename
    const filename = basename(filePath, extname(filePath)).toLowerCase()
    for (const [key, value] of Object.entries(this.categoryMapping)) {
      if (filename.includes(key)) {
        return value
      }
    }
    
    // Default category
    return 'ambient'
  }

  // Import a single sound file
  private async importSoundFile(file: SoundFile): Promise<StoredSound | null> {
    try {
      // Generate a relative path for the file
      const relativePath = file.path.replace(this.soundsPackagePath, '').replace(/^\/+/, '')
      
      // Create tags based on filename and category
      const tags = this.generateTags(file.name, file.category)
      
      // Try to get duration (this would require audio analysis in a real implementation)
      const duration = await this.getAudioDuration(file.path)
      
      const sound = soundStoreService.addSound({
        name: this.generateDisplayName(file.name),
        category: file.category,
        filePath: relativePath,
        duration,
        tags,
        source: 'imported',
        metadata: {
          description: `Imported from sounds package`,
          license: 'Local',
          attribution: 'DEJA.js Sounds Package'
        }
      })

      console.log(`✅ Imported: ${sound.name} (${file.category})`)
      return sound

    } catch (error) {
      console.error(`❌ Failed to import ${file.name}:`, error)
      return null
    }
  }

  // Generate display name from filename
  private generateDisplayName(filename: string): string {
    const name = basename(filename, extname(filename))
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim()
  }

  // Generate tags for a sound file
  private generateTags(filename: string, category: string): string[] {
    const tags = [category, 'imported']
    const name = basename(filename, extname(filename)).toLowerCase()
    
    // Add tags based on filename patterns
    if (name.includes('train')) tags.push('train', 'locomotive')
    if (name.includes('whistle')) tags.push('whistle', 'steam')
    if (name.includes('engine')) tags.push('engine', 'motor')
    if (name.includes('crowd')) tags.push('crowd', 'people')
    if (name.includes('traffic')) tags.push('traffic', 'urban')
    if (name.includes('nature')) tags.push('nature', 'outdoor')
    if (name.includes('mechanical')) tags.push('mechanical', 'industrial')
    
    return [...new Set(tags)] // Remove duplicates
  }

  // Get audio duration (placeholder - would need audio analysis library)
  private async getAudioDuration(filePath: string): Promise<number | undefined> {
    // In a real implementation, you'd use a library like 'audio-duration' or 'ffprobe'
    // For now, return undefined
    return undefined
  }

  // Get scan statistics
  async getScanStats(): Promise<{
    packagePath: string
    supportedExtensions: string[]
    categoryMapping: Record<string, string>
  }> {
    return {
      packagePath: this.soundsPackagePath,
      supportedExtensions: this.supportedExtensions,
      categoryMapping: this.categoryMapping
    }
  }
}

// Export the scanner class
export default SoundScanner
