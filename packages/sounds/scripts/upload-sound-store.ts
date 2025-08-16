#!/usr/bin/env node
// Script to upload sound-store.json to Vercel Blob Store
// Run with: BLOB_READ_WRITE_TOKEN=your_token tsx scripts/upload-sound-store.ts

import { put } from '@vercel/blob'
import { readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Get current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function uploadSoundStore() {
  console.log('🚂 DEJA.js Sound Store Upload to Vercel Blob')
  console.log('============================================')
  
  try {
    // Check for required environment variable
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN environment variable not set')
      console.log('💡 Set it with: export BLOB_READ_WRITE_TOKEN=your_token')
      console.log('💡 Or run with: BLOB_READ_WRITE_TOKEN=your_token tsx scripts/upload-sound-store.ts')
      process.exit(1)
    }
    
    console.log('✅ BLOB_READ_WRITE_TOKEN environment variable found')
    
    // Read the sound-store.json file
    const soundStorePath = join(__dirname, '..', 'sound-store.json')
    console.log(`📖 Reading sound store from: ${soundStorePath}`)
    
    const soundStoreData = await readFile(soundStorePath, 'utf-8')
    const soundStore = JSON.parse(soundStoreData)
    
    console.log(`📊 Sound store contains ${Object.keys(soundStore).length} sounds`)
    
    // Upload to Vercel Blob Store
    const blobPath = 'sounds/sound-store.json'
    console.log(`📤 Uploading sound store to blob path: ${blobPath}`)
    
    const result = await put(blobPath, soundStoreData, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json'
    })
    
    console.log('✅ Sound store uploaded successfully!')
    console.log(`   URL: ${result.url}`)
    console.log(`   Path: ${result.pathname}`)
    console.log(`   Size: ${(soundStoreData.length / 1024).toFixed(2)}KB`)
    
    // Test the upload by fetching the file
    console.log('\n🧪 Testing the upload...')
    const testResponse = await fetch(result.url)
    
    if (testResponse.ok) {
      const testData = await testResponse.json()
      console.log(`✅ Upload test successful! Retrieved ${Object.keys(testData).length} sounds`)
    } else {
      console.log(`⚠️ Upload test failed: ${testResponse.status} ${testResponse.statusText}`)
    }
    
    console.log('\n💡 Next steps:')
    console.log('   1. Update your environment variables with the blob store URL')
    console.log('   2. The sounds package will now fetch from the blob store')
    console.log('   3. Run your application to test the new implementation')
    
    return true
    
  } catch (error) {
    console.error('❌ Upload failed:', error)
    return false
  }
}

async function main() {
  const success = await uploadSoundStore()
  
  if (success) {
    console.log('\n🎉 Sound store upload completed successfully!')
  } else {
    console.log('\n💥 Sound store upload failed!')
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

