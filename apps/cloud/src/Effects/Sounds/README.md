# Sound Effects Components

This directory contains components for managing and playing sound effects from your Vercel blob store.

## Components

### SoundFileList.vue
The main component that lists, plays, uploads, and deletes sound files from your Vercel blob store.

**Features:**
- Display list of sound files with metadata
- Play/pause audio files
- Upload new audio files
- Delete existing files
- Responsive design
- BBC sound effects attribution

### SoundFileService.ts
Service class that handles all interactions with the Vercel blob store.

**Methods:**
- `listSoundFiles()` - Retrieve all sound files
- `uploadSoundFile(file)` - Upload a new audio file
- `deleteSoundFile(url)` - Delete a sound file

### SoundEffectsDemo.vue
Demo page showcasing the SoundFileList component with setup instructions.

## Setup

### 1. Create Vercel Blob Store
Create a blob store named "bbc-sounds" in your Vercel project.

### 2. Environment Variables
Add these to your `.env.local` file:

```bash
# Option 1: Direct Vercel API access
VITE_VERCEL_BLOB_TOKEN=your_vercel_token_here
VITE_VERCEL_BLOB_API_URL=https://api.vercel.com/v1

# Option 2: Custom API endpoint
VITE_SOUNDS_API_ENDPOINT=https://your-api.com/sounds
```

### 3. Vercel API Token
To get your Vercel API token:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Settings → Tokens
3. Create a new token with appropriate permissions

## Usage

### Basic Usage
```vue
<template>
  <SoundFileList />
</template>

<script setup>
import SoundFileList from '@/Effects/SoundFileList.vue'
</script>
```

### With Custom Configuration
```vue
<template>
  <SoundFileList />
</template>

<script setup>
import SoundFileList from '@/Effects/SoundFileList.vue'
import { soundFileService } from '@/Effects/SoundFileService'

// Customize the service if needed
soundFileService.setStoreName('custom-sounds')
</script>
```

## API Integration

### Custom API Endpoint
If you prefer to use your own API instead of direct Vercel access:

```typescript
// Your API should return data in this format:
{
  sounds: [
    {
      name: "Steam Train Whistle",
      url: "https://your-blob-store.com/steam-train-whistle.mp3",
      duration: 3200,
      size: 256000,
      uploadedAt: "2024-01-15T10:30:00Z",
      contentType: "audio/mpeg"
    }
  ]
}
```

### File Upload
The component handles file validation:
- File type must be audio (mp3, wav, ogg, m4a, etc.)
- File size limit: 10MB
- Automatic file type detection

## Styling

The component uses scoped CSS with a clean, modern design. You can customize the appearance by:

1. Overriding CSS variables
2. Modifying the component styles
3. Using CSS-in-JS solutions

## Browser Support

- Modern browsers with ES6+ support
- Web Audio API support for audio playback
- File API support for uploads

## Troubleshooting

### Common Issues

1. **Audio won't play**: Check browser autoplay policies and ensure audio context is created
2. **Upload fails**: Verify file size and type, check network connectivity
3. **Files not loading**: Verify environment variables and API permissions

### Debug Mode
Enable console logging by setting:
```typescript
localStorage.setItem('debug', 'true')
```

## Contributing

When adding new features:
1. Follow the existing code style
2. Add TypeScript types for new interfaces
3. Include error handling
4. Test with different audio formats
5. Update this README

## License

This component includes BBC sound effects attribution as required by their licensing terms.
