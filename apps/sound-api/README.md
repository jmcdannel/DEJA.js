# DEJA Sound API

A Next.js API for managing BBC sound effects from Vercel Blob storage.

## Features

- List all sound files from your Vercel Blob store
- Get metadata for individual sound files
- CORS-enabled for cross-origin requests
- Built with Next.js 14 and TypeScript

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables:**
   Create a `.env.local` file with:
   ```bash
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
   ```

3. **Get your Vercel Blob token:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to Storage → Blob
   - Create or select your blob store
   - Copy the read-write token

## Development

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## Port Configuration

This app uses port **3001** to avoid conflicts with other DEJA apps:

- **Sound API**: Port 3001
- **Cloud App**: Port 3011  
- **Tour App**: Port 3021
- **Monitor App**: Port 3031
- **Throttle App**: Port 3041

## API Endpoints

### GET /api/sounds
List all sound files in your blob store.

**Response:**
```json
{
  "sounds": [
    {
      "name": "Steam Train Whistle",
      "url": "https://...",
      "size": 256000,
      "uploadedAt": "2024-01-15T10:30:00Z",
      "contentType": "audio/mpeg",
      "pathname": "sounds/steam-train-whistle.mp3"
    }
  ]
}
```

### GET /api/sounds/[pathname]
Get metadata for a specific sound file.

**Response:**
```json
{
  "sound": {
    "name": "Steam Train Whistle",
    "url": "https://...",
    "size": 256000,
    "uploadedAt": "2024-01-15T10:30:00Z",
    "contentType": "audio/mpeg",
    "pathname": "sounds/steam-train-whistle.mp3"
  }
}
```

## Usage in Your Cloud App

Update your `SoundFileService` to use these API endpoints:

```typescript
// apps/cloud/src/Effects/Sounds/SoundFileService.ts
export class SoundFileService {
  private apiBaseUrl: string

  constructor() {
    this.apiBaseUrl = 'http://localhost:3001/api' // Updated port
    console.log('SoundFileService initialized with API URL:', this.apiBaseUrl)
  }

  async listSoundFiles(): Promise<SoundFile[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/sounds`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data.sounds || []
    } catch (error) {
      console.error('Error listing sound files:', error)
      throw new Error('Failed to load sound files')
    }
  }
}
```

## Deployment

1. **Deploy to Vercel:**
   ```bash
   vercel
   ```

2. **Set environment variables in Vercel dashboard**

3. **Update your cloud app to use the deployed API URL**

## CORS Configuration

The API is configured to allow cross-origin requests from any origin. You can customize this in `next.config.js` if needed.

## Error Handling

All endpoints return appropriate HTTP status codes and error messages in JSON format.
