# BBC Sound Import API Implementation

## Overview

The BBC Sound Importer component is currently using a mock implementation. To make it fully functional, you'll need to implement a Vercel API route that handles the actual BBC sound download and storage.

## Implementation Steps

### 1. Create Vercel API Route

Create a new file at `apps/cloud/api/bbc-sounds/import.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { bbcUrl, category, customName, customTags } = req.body

    // Extract sound ID from BBC URL
    const soundId = extractSoundId(bbcUrl)
    
    // Fetch actual metadata from BBC
    const metadata = await fetchBBCMetadata(soundId)
    
    // Download the MP3 file
    const audioBuffer = await downloadBBCAudio(metadata.downloadUrl)
    
    // Store in cloud storage (Vercel Blob, AWS S3, etc.)
    const storageUrl = await storeAudioFile(audioBuffer, `bbc-${soundId}.mp3`)
    
    // Return success with storage URL
    res.status(200).json({
      success: true,
      result: {
        soundId: `bbc-${soundId}`,
        filePath: storageUrl,
        metadata: {
          ...metadata,
          title: customName || metadata.title,
          tags: [...metadata.tags, 'bbc', 'professional', ...customTags]
        }
      }
    })

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
}
```

### 2. Update Frontend

Replace the mock implementation in `BBCSoundImporter.vue` with actual API calls:

```typescript
// Replace the mock implementation with:
const response = await fetch('/api/bbc-sounds/import', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bbcUrl: bbcUrl.value,
    category: selectedCategory.value,
    customName: customName.value,
    customTags: customTags.value ? customTags.value.split(',').map(tag => tag.trim()).filter(Boolean) : []
  })
})

const result = await response.json()
```

### 3. Required Dependencies

Install necessary packages for audio handling:

```bash
npm install @vercel/blob node-fetch
```

### 4. BBC API Integration

To get real metadata from BBC, you'll need to:

1. **Scrape the BBC page** for sound details
2. **Use BBC's API** if available
3. **Handle authentication** if required

### 5. Audio Storage Options

- **Vercel Blob**: Simple cloud storage
- **AWS S3**: More control and features
- **Cloudinary**: Specialized audio/video hosting

## Current Status

✅ **Frontend Component**: BBC Sound Importer UI is complete  
✅ **Device Integration**: DEJA Server device type added  
✅ **Sound Playback**: Server-side audio playback implemented  
🔄 **API Route**: Mock implementation ready for Vercel API  
⏳ **BBC Integration**: Needs real BBC API implementation  
⏳ **Cloud Storage**: Needs audio file storage solution  

## Benefits of This Approach

1. **No Port Conflicts**: API runs on same domain as frontend
2. **HTTPS Native**: Vercel provides HTTPS by default
3. **Serverless**: Scales automatically with usage
4. **Integrated**: Part of main app deployment
5. **Simpler**: No separate HTTP server to manage

## Next Steps

1. Implement the Vercel API route
2. Add real BBC metadata fetching
3. Set up cloud storage for audio files
4. Test with actual BBC sound URLs
5. Deploy to Vercel
