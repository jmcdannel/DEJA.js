#!/usr/bin/env node
// Test script to verify Vercel Blob connection
// Run with: BLOB_READ_WRITE_TOKEN=your_token tsx scripts/test-blob-connection.ts

import { put } from '@vercel/blob'

async function testBlobConnection() {
  console.log('🧪 Testing Vercel Blob connection...')
  
  try {
    // Check if token is available
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      console.error('❌ BLOB_READ_WRITE_TOKEN environment variable not set')
      console.log('💡 Set it with: export BLOB_READ_WRITE_TOKEN=your_token')
      console.log('💡 Or run with: BLOB_READ_WRITE_TOKEN=your_token tsx scripts/test-blob-connection.ts')
      return false
    }
    
    console.log('✅ Token found')
    
    // Try to upload a small test file
    const testData = Buffer.from('Test connection to Vercel Blob Store')
    const testPath = 'test/connection-test.txt'
    
    console.log('📤 Attempting test upload...')
    const result = await put(testPath, testData, {
      access: 'public',
      addRandomSuffix: false
    })
    
    console.log('✅ Upload successful!')
    console.log(`   URL: ${result.url}`)
    console.log(`   Path: ${result.pathname}`)
    console.log(`   Upload successful`)
    
    return true
    
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return false
  }
}

async function main() {
  console.log('🚂 DEJA.js Vercel Blob Connection Test')
  console.log('=====================================')
  
  const success = await testBlobConnection()
  
  if (success) {
    console.log('\n🎉 Vercel Blob connection is working!')
    console.log('💡 You can now run the scan-sounds script')
  } else {
    console.log('\n💥 Vercel Blob connection failed!')
    console.log('💡 Check your token and try again')
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
