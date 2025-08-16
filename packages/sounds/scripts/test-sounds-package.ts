#!/usr/bin/env node
// Test script to verify the sounds package is working correctly
// Run with: tsx scripts/test-sounds-package.ts

import { getAllSounds, getSoundsByCategory, searchSounds } from '../dist/src/soundsData.js'

async function testSoundsPackage() {
  console.log('🧪 Testing DEJA.js Sounds Package')
  console.log('================================')
  
  try {
    console.log('\n1️⃣ Testing getAllSounds()...')
    const allSounds = await getAllSounds()
    console.log(`✅ getAllSounds() returned ${allSounds.length} sounds`)
    
    if (allSounds.length > 0) {
      console.log('   First sound:', allSounds[0].name)
      console.log('   Categories found:', [...new Set(allSounds.map(s => s.category))])
    }
    
    console.log('\n2️⃣ Testing getSoundsByCategory("train")...')
    const trainSounds = await getSoundsByCategory('train')
    console.log(`✅ getSoundsByCategory("train") returned ${trainSounds.length} sounds`)
    
    console.log('\n3️⃣ Testing searchSounds("whistle")...')
    const searchResults = await searchSounds('whistle')
    console.log(`✅ searchSounds("whistle") returned ${searchResults.length} results`)
    
    console.log('\n4️⃣ Testing blob store URLs...')
    if (allSounds.length > 0) {
      const firstSound = allSounds[0]
      console.log(`   Sound: ${firstSound.name}`)
      console.log(`   Blob URL: ${firstSound.blobUrl}`)
      console.log(`   Category: ${firstSound.category}`)
      console.log(`   Tags: ${firstSound.tags.join(', ')}`)
    }
    
    console.log('\n🎉 All tests passed! The sounds package is working correctly.')
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

async function main() {
  const success = await testSoundsPackage()
  
  if (success) {
    console.log('\n✅ Sounds package is ready to use!')
  } else {
    console.log('\n💥 Sounds package has issues that need to be fixed.')
    process.exit(1)
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Unhandled error:', error)
    process.exit(1)
  })
}

export default main
