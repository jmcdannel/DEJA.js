import { put } from '@vercel/blob'
import type { VercelRequest, VercelResponse } from '@vercel/node'

interface BBCImportRequest {
  bbcUrl: string
  category: string
  customName?: string
  customTags?: string[]
}

interface BBCMetadata {
  title: string
  duration: number
  category: string
  downloadUrl: string
  license: string
  attribution: string
}

interface ImportResponse {
  success: boolean
  result?: {
    soundId: string
    filePath: string
    metadata: {
      title: string
      category: string
      duration: number
      tags: string[]
      source: string
      license: string
      attribution: string
    }
  }
  error?: string
}

// Extract sound ID from BBC URL
function extractSoundId(bbcUrl: string): string {
  try {
    const url = new URL(bbcUrl)
    const searchParams = new URLSearchParams(url.search)
    const query = searchParams.get('q')
    
    if (!query) {
      throw new Error('Could not extract sound query from URL')
    }
    
    // Create a unique ID from the query
    return `bbc-${query.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`
  } catch (error) {
    throw new Error('Invalid BBC URL format')
  }
}

// Fetch metadata from BBC (placeholder - would need real BBC API integration)
async function fetchBBCMetadata(soundId: string): Promise<BBCMetadata> {
  // TODO: Implement real BBC API integration
  // For now, return mock data based on the sound ID
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Extract category from sound ID for demo purposes
  const category = soundId.includes('train') ? 'train' : 
                   soundId.includes('station') ? 'station' : 
                   soundId.includes('city') ? 'city' : 
                   soundId.includes('nature') ? 'nature' : 'ambient'
  
  return {
    title: `BBC Sound: ${soundId.replace('bbc-', '')}`,
    duration: Math.floor(Math.random() * 10000) + 2000, // 2-12 seconds
    category,
    downloadUrl: `https://sound-effects.bbcrewind.co.uk/audio/${soundId.replace('bbc-', '')}.mp3`,
    license: 'BBC RemArc Licence',
    attribution: 'BBC Sound Effects Library'
  }
}

// Download audio from BBC (placeholder - would need real implementation)
async function downloadBBCAudio(downloadUrl: string): Promise<ArrayBuffer> {
  // TODO: Implement real BBC audio download
  // This would require proper BBC API authentication and download handling
  
  // For now, return a mock audio buffer
  // In production, you'd use:
  // const response = await fetch(downloadUrl, {
  //   headers: { 'Authorization': `Bearer ${BBC_API_KEY}` }
  // })
  // return await response.arrayBuffer()
  
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 1000))
  return new ArrayBuffer(1024) // 1KB mock audio
}

// Store audio file in Vercel Blob storage
async function storeAudioFile(audioBuffer: ArrayBuffer, filename: string): Promise<string> {
  try {
    // Convert ArrayBuffer to Blob
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' })
    
    // Upload to Vercel Blob
    const { url } = await put(filename, blob, {
      access: 'public',
      contentType: 'audio/mpeg'
    })
    
    return url
  } catch (error) {
    console.error('Failed to store audio file:', error)
    throw new Error('Failed to store audio file in cloud storage')
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    })
    return
  }

  try {
    const { bbcUrl, category, customName, customTags }: BBCImportRequest = req.body

    // Validate required fields
    if (!bbcUrl || !category) {
      res.status(400).json({
        success: false,
        error: 'BBC URL and category are required'
      })
      return
    }

    // Extract sound ID from BBC URL
    const soundId = extractSoundId(bbcUrl)
    
    // Fetch actual metadata from BBC
    const metadata = await fetchBBCMetadata(soundId)
    
    // Download the MP3 file
    const audioBuffer = await downloadBBCAudio(metadata.downloadUrl)
    
    // Store in Vercel Blob storage
    const storageUrl = await storeAudioFile(audioBuffer, `${soundId}.mp3`)
    
    // Return success with storage URL
    res.status(200).json({
      success: true,
      result: {
        soundId,
        filePath: storageUrl,
        metadata: {
          title: customName || metadata.title,
          category: category as any,
          duration: metadata.duration,
          tags: [
            'bbc',
            'professional',
            'high-quality',
            'bbc-sound-effects-library',
            ...(customTags || []),
            metadata.category
          ],
          source: 'bbc',
          license: metadata.license,
          attribution: metadata.attribution,
          licenseUrl: 'https://sound-effects.bbcrewind.co.uk/licensing',
          usageRestrictions: 'Educational and personal use only. Commercial use requires separate licensing.'
        }
      }
    })

  } catch (error) {
    console.error('BBC Sound Import Error:', error)
    
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
} 
