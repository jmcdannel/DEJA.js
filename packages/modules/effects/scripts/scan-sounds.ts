#!/usr/bin/env node
// Sound Scanner Script
// Run with: turbo run scan-sounds

import SoundScanner from '../soundScanner'
import { soundStoreService } from '../soundStore'
import { join } from 'path'

async function main() {
  console.log('🚂 DEJA.js Sound Scanner')
  console.log('========================')
  
  try {
    // Initialize scanner
    const scanner = new SoundScanner()
    
    // Get scan statistics
    const stats = await scanner.getScanStats()
    console.log(`\n📊 Scanner Configuration:`)
    console.log(`   Package Path: ${stats.packagePath}`)
    console.log(`   Supported Extensions: ${stats.supportedExtensions.join(', ')}`)
    console.log(`   Categories: ${Object.keys(stats.categoryMapping).join(', ')}`)
    
    // Get current store stats
    const storeStats = soundStoreService.getStats()
    console.log(`\n📦 Current Store Status:`)
    console.log(`   Total Sounds: ${storeStats.total}`)
    console.log(`   By Category: ${JSON.stringify(storeStats.byCategory, null, 2)}`)
    console.log(`   By Source: ${JSON.stringify(storeStats.bySource, null, 2)}`)
    
    // Scan for new sounds
    console.log(`\n🔍 Starting scan...`)
    const result = await scanner.scanForNewSounds()
    
    if (result.success) {
      console.log(`\n✅ Scan completed successfully!`)
      console.log(`\n📊 Results:`)
      console.log(`   Total files found: ${result.summary.total}`)
      console.log(`   New files: ${result.summary.new}`)
      console.log(`   Existing files: ${result.summary.existing}`)
      console.log(`   Successfully imported: ${result.summary.imported}`)
      console.log(`   Errors: ${result.summary.errors}`)
      
      if (result.imported.length > 0) {
        console.log(`\n🎵 Newly imported sounds:`)
        result.imported.forEach(sound => {
          console.log(`   ✅ ${sound.name} (${sound.category}) - ${sound.filePath}`)
        })
      }
      
      if (result.errors.length > 0) {
        console.log(`\n❌ Errors encountered:`)
        result.errors.forEach(error => {
          console.log(`   ❌ ${error}`)
        })
      }
      
      // Show updated store stats
      const newStoreStats = soundStoreService.getStats()
      console.log(`\n📦 Updated Store Status:`)
      console.log(`   Total Sounds: ${newStoreStats.total}`)
      console.log(`   By Category: ${JSON.stringify(newStoreStats.byCategory, null, 2)}`)
      
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
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unhandled error:', error)
    process.exit(1)
  })
}

export default main
