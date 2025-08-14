#!/usr/bin/env node
// Sound Scanner Script with Vercel Blob Integration
// Run with: pnpm run scan-sounds

import { readdir, stat, writeFile, readFile, mkdir, rename } from 'fs/promises'
import { join, extname, basename, dirname } from 'path'
import { fileURLToPath } from 'url'
import { put } from '@vercel/blob'
import { audioConverter, type ConversionResult } from '../src/audioConverter.js'

// Get current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface SoundFile {
  name: string
  path: string
  size: number
  modified: Date
  category: string
  duration?: number
}

interface BlobUploadResult {
  url: string
  pathname: string
  contentType?: string
  contentDisposition?: string
  etag?: string
  size?: number
}

interface ScanResult {
  success: boolean
  newFiles: SoundFile[]
  existingFiles: string[]
  uploaded: number
  archived: number
  errors: string[]
  summary: {
    total: number
    new: number
    existing: number
    uploaded: number
    archived: number
    errors: number
  }
}

class SoundScanner {
  private soundsPackagePath: string
  private archivePath: string
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

  constructor() {
    // Path to the assets directory within the sounds package
    this.soundsPackagePath = join(__dirname, '..', 'assets')
    // Path to the archive directory
    this.archivePath = join(__dirname, '..', 'archive')
  }

  // Scan the sounds package for new files and upload to Vercel Blob
  async scanForNewSounds(): Promise<ScanResult> {
    try {
      console.log('🔍 Scanning sounds package...')
      console.log(`📁 Path: ${this.soundsPackagePath}`)
      console.log(`🗄️ Archive Path: ${this.archivePath}`)

      // Ensure archive directory exists
      await mkdir(this.archivePath, { recursive: true })

      const allFiles = await this.getAllSoundFiles()
      const newFiles: SoundFile[] = []
      const existingFiles: string[] = []
      const uploaded: SoundFile[] = []
      const archived: SoundFile[] = []
      const errors: string[] = []

      // Check for existing store file
      const storePath = join(__dirname, '..', 'sound-store.json')
      let existingStore: any = {}
      
      try {
        const storeData = await readFile(storePath, 'utf-8')
        existingStore = JSON.parse(storeData)
      } catch (error) {
        // Store file doesn't exist yet, that's fine
      }

      // Check which files are new vs existing
      for (const file of allFiles) {
        const relativePath = file.path.replace(this.soundsPackagePath, '').replace(/^\/+/, '')
        if (existingStore[relativePath]) {
          existingFiles.push(relativePath)
        } else {
          newFiles.push(file)
        }
      }

      // Process new files: upload to Vercel Blob and archive locally
      for (const file of newFiles) {
        try {
          console.log(`📤 Processing: ${file.name}`)
          
          // Convert audio if needed (WAV to MP3)
          const fileBuffer = await readFile(file.path)
          const conversionResult = await audioConverter.convertAudioFile(fileBuffer, file.path)
          
          // Always proceed, even if conversion fails (we'll use original file)
          if (!conversionResult.success) {
            console.log(`⚠️ Audio conversion failed for ${file.name}, using original file`)
          }
          
          // Upload to Vercel Blob
          const blobResult = await this.uploadToBlob(file, conversionResult)
          
          // Create sound data entry
          const relativePath = file.path.replace(this.soundsPackagePath, '').replace(/^\/+/, '')
          const uploadPath = conversionResult.outputPath || file.path
          const finalRelativePath = uploadPath.replace(this.soundsPackagePath, '').replace(/^\/+/, '')
          
          const soundData = {
            id: `sound-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: this.generateDisplayName(file.name),
            category: file.category,
            filePath: finalRelativePath,
            duration: file.duration,
            tags: this.generateTags(file.name, file.category),
            source: 'imported' as const,
            importedAt: new Date().toISOString(),
            blobUrl: blobResult.url,
            blobPathname: blobResult.pathname,
            metadata: {
              description: `Imported from sounds package`,
              license: 'Local',
              attribution: 'DEJA.js Sounds Package',
              originalSize: file.size,
              originalPath: relativePath,
              convertedSize: conversionResult.convertedSize,
              compressionRatio: conversionResult.compressionRatio,
              originalFormat: extname(file.path).toLowerCase(),
              finalFormat: extname(uploadPath).toLowerCase(),
              converted: conversionResult.converted
            }
          }
          
          existingStore[finalRelativePath] = soundData
          uploaded.push(file)
          
          // Archive the local file
          await this.archiveFile(file)
          archived.push(file)
          
          console.log(`✅ Uploaded and archived: ${file.name}`)
          
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          errors.push(`Failed to process ${file.name}: ${errorMsg}`)
          console.error(`❌ Error processing ${file.name}:`, error)
        }
      }

      // Save updated store
      if (Object.keys(existingStore).length > 0) {
        await writeFile(storePath, JSON.stringify(existingStore, null, 2))
        console.log(`💾 Sound store saved to: ${storePath}`)
        

      }

      const result: ScanResult = {
        success: true,
        newFiles,
        existingFiles,
        uploaded: uploaded.length,
        archived: archived.length,
        errors,
        summary: {
          total: allFiles.length,
          new: newFiles.length,
          existing: existingFiles.length,
          uploaded: uploaded.length,
          archived: archived.length,
          errors: errors.length
        }
      }

      console.log('✅ Scan completed!')
      console.log(`📊 Summary: ${result.summary.total} total, ${result.summary.new} new, ${result.summary.existing} existing, ${result.summary.uploaded} uploaded, ${result.summary.archived} archived, ${result.summary.errors} errors`)

      return result

    } catch (error) {
      console.error('❌ Scan failed:', error)
      return {
        success: false,
        newFiles: [],
        existingFiles: [],
        uploaded: 0,
        archived: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        summary: { total: 0, new: 0, existing: 0, uploaded: 0, archived: 0, errors: 0 }
      }
    }
  }

  // Upload file to Vercel Blob Store
  private async uploadToBlob(file: SoundFile, conversionResult: ConversionResult): Promise<BlobUploadResult> {
    try {
      // Use converted buffer and path if available
      const uploadBuffer = conversionResult.outputBuffer || await readFile(file.path)
      const uploadPath = conversionResult.outputPath || file.path
      
      // Generate blob path (use converted extension if available)
      const relativePath = uploadPath.replace(this.soundsPackagePath, '').replace(/^\/+/, '')
      const blobPath = `sounds/${relativePath}`
      
      console.log(`📤 Uploading ${file.name} → ${blobPath} (${(uploadBuffer.length / 1024 / 1024).toFixed(2)}MB)`)
      
      // Upload to Vercel Blob
      const result = await put(blobPath, uploadBuffer, {
        access: 'public',
        addRandomSuffix: false
      })
      
      return result
    } catch (error) {
      throw new Error(`Failed to upload to Vercel Blob: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Archive local file to archive directory
  private async archiveFile(file: SoundFile): Promise<void> {
    try {
      // Create archive subdirectory structure
      const relativePath = file.path.replace(this.soundsPackagePath, '').replace(/^\/+/, '')
      const archiveSubDir = dirname(join(this.archivePath, relativePath))
      await mkdir(archiveSubDir, { recursive: true })
      
      // Move file to archive
      const archiveFilePath = join(this.archivePath, relativePath)
      await rename(file.path, archiveFilePath)
      
      console.log(`📦 Archived: ${file.path} → ${archiveFilePath}`)
    } catch (error) {
      throw new Error(`Failed to archive file: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

  // Get scan statistics
  async getScanStats(): Promise<{
    packagePath: string
    archivePath: string
    supportedExtensions: string[]
    categoryMapping: Record<string, string>
  }> {
    return {
      packagePath: this.soundsPackagePath,
      archivePath: this.archivePath,
      supportedExtensions: this.supportedExtensions,
      categoryMapping: this.categoryMapping
    }
  }
}

async function main() {
  console.log('🚂 DEJA.js Sound Scanner with Vercel Blob Integration')
  console.log('====================================================')
  
  try {
    // Initialize scanner
    const scanner = new SoundScanner()
    
    // Get scan statistics
    const stats = await scanner.getScanStats()
    console.log(`\n📊 Scanner Configuration:`)
    console.log(`   Package Path: ${stats.packagePath}`)
    console.log(`   Archive Path: ${stats.archivePath}`)
    console.log(`   Supported Extensions: ${stats.supportedExtensions.join(', ')}`)
    console.log(`   Categories: ${Object.keys(stats.categoryMapping).join(', ')}`)
    
    // Scan for new sounds
    console.log(`\n🔍 Starting scan...`)
    const result = await scanner.scanForNewSounds()
    
    if (result.success) {
      console.log(`\n✅ Scan completed successfully!`)
      console.log(`\n📊 Results:`)
      console.log(`   Total files found: ${result.summary.total}`)
      console.log(`   New files: ${result.summary.new}`)
      console.log(`   Existing files: ${result.summary.existing}`)
      console.log(`   Successfully uploaded: ${result.summary.uploaded}`)
      console.log(`   Successfully archived: ${result.summary.archived}`)
      console.log(`   Errors: ${result.summary.errors}`)
      
      if (result.newFiles.length > 0) {
        console.log(`\n🎵 Sound files processed:`)
        result.newFiles.forEach(file => {
          console.log(`   ✅ ${file.name} (${file.category}) - ${file.path}`)
        })
      }
      
      if (result.errors.length > 0) {
        console.log(`\n❌ Errors encountered:`)
        result.errors.forEach(error => {
          console.log(`   ❌ ${error}`)
        })
      }
      
      console.log(`\n💡 What happened:`)
      console.log(`   1. Sound files were uploaded to Vercel Blob Store`)
      console.log(`   2. Local files were moved to the archive folder`)
      console.log(`   3. Sound store was updated with blob URLs`)
      console.log(`   4. Archive folder is ignored by git`)
      
      console.log(`\n🌐 Access your sounds:`)
      console.log(`   - Sound store: packages/sounds/sound-store.json`)
      console.log(`   - Vercel Blob URLs: Direct access from sound store`)
      console.log(`   - Archive: packages/sounds/archive/`)
      
      // Cleanup audio converter
      await audioConverter.cleanup()
      
    } else {
      console.log(`\n❌ Scan failed!`)
      console.log(`   Errors: ${result.errors.join(', ')}`)
      process.exit(1)
    }
    
  } catch (error) {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Unhandled error:', error)
    process.exit(1)
  })
}

export default main
