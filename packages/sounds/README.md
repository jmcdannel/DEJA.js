# DEJA.js Sounds Package

A shared sound assets package for DEJA.js applications that integrates with Vercel Blob Store for cloud-based sound management.

## 🚀 Features

- **Cloud-based storage**: All sounds are stored in Vercel Blob Store for fast, global access
- **BBC Sound Effects**: Integration with BBC Sound Effects Library (BBC RemArc Licence)
- **Automatic categorization**: Sounds are automatically categorized by type and content
- **Search and filtering**: Powerful search capabilities across all sound assets
- **Cross-platform**: Works in browser, Node.js, and mobile environments
- **Caching**: Built-in caching for performance optimization

## 📦 Installation

This package is part of the DEJA.js monorepo and is automatically available to all apps.

## 🔧 Configuration

### Environment Variables

Set these environment variables in your app:

```bash
# Vercel Blob Store Configuration
VITE_BLOB_STORE_URL=https://your-store-id.public.blob.vercel-storage.com
VITE_VERCEL_BLOB_TOKEN=your_vercel_blob_token_here

# BBC Sound Effects API (optional)
VITE_BBC_API_KEY=your_bbc_api_key_here
```

### Default Blob Store

If no environment variable is set, the package will use the default BBC sounds blob store:
`https://xndozjm68szqabqe.public.blob.vercel-storage.com`

## 🎵 Usage

### Basic Usage

```typescript
import { getAllSounds, getSoundsByCategory, searchSounds, type SoundData } from '@repo/sounds'

// Get all sounds
const allSounds = await getAllSounds()

// Get sounds by category
const trainSounds = await getSoundsByCategory('train')

// Search sounds
const searchResults = await searchSounds('whistle')
```

### Sound Data Structure

```typescript
interface SoundData {
  id: string
  name: string
  category: string
  filePath: string
  tags: string[]
  source: string
  importedAt: string
  blobUrl: string
  blobPathname: string
  metadata: {
    description: string
    license: string
    attribution: string
    originalSize: number
    originalPath: string
    convertedSize?: number
    compressionRatio?: number
    originalFormat?: string
    finalFormat?: string
    converted?: boolean
  }
}
```

### Available Categories

- `train` - Locomotive and train-related sounds
- `station` - Station announcements and ambient sounds
- `city` - Urban and city environment sounds
- `nature` - Natural and outdoor sounds
- `ambient` - Background and atmospheric sounds
- `mechanical` - Industrial and mechanical sounds
- `transport` - General transportation sounds
- `industrial` - Factory and industrial sounds

## 🛠️ Development

### Scripts

```bash
# Build the package
pnpm build

# Type checking
pnpm type-check

# Scan and upload new sounds to blob store
pnpm scan-sounds

# Test blob store connection
pnpm test-blob

# Upload sound store to blob store
pnpm upload-sound-store
```

### Adding New Sounds

1. Place sound files in the `assets/` directory
2. Run `pnpm scan-sounds` to process and upload them
3. Files are automatically categorized and tagged
4. Local files are moved to `archive/` after processing

### Blob Store Integration

The package automatically:
- Uploads new sounds to Vercel Blob Store
- Maintains a sound store index in the blob store
- Provides direct blob URLs for fast access
- Handles fallbacks if blob store is unavailable

## 🔗 Integration with Apps

### Cloud App

The cloud app uses the sounds package for:
- Effect sound selection
- Sound preview and playback
- Sound management and organization

### Throttle App

The throttle app uses the sounds package for:
- Mobile sound playback
- Offline sound access
- Sound effects for train operations

### Monitor App

The monitor app uses the sounds package for:
- Sound monitoring and logging
- Audio feedback for system events

## 📚 API Reference

### Core Functions

- `getAllSounds()` - Get all available sounds
- `getSoundsByCategory(category)` - Get sounds by category
- `searchSounds(query, category?)` - Search sounds by text
- `getSoundById(id)` - Get sound by ID
- `getSoundByFilePath(filePath)` - Get sound by file path

### Data Access

- `soundsData` - Promise that resolves to all sound data
- `soundsDataSync` - Synchronous access (populated after initial load)

## 🚨 Error Handling

The package includes robust error handling:
- Graceful fallbacks if blob store is unavailable
- Empty results instead of crashes
- Detailed logging for debugging
- Automatic retry mechanisms

## 📄 License

All sounds must comply with their respective licenses:
- **BBC Sounds**: BBC RemArc Licence - See [https://sound-effects.bbcrewind.co.uk/licensing](https://sound-effects.bbcrewind.co.uk/licensing)
- **Custom Sounds**: Local license as specified in metadata
- **Imported Sounds**: Original license preserved

## 🤝 Contributing

1. Add new sounds to the `assets/` directory
2. Run `pnpm scan-sounds` to process them
3. Test in your app
4. Commit the updated sound store

## 🔍 Troubleshooting

### Common Issues

**"Could not load sound store data"**
- Check your blob store token
- Verify the blob store URL is correct
- Ensure the sound store has been uploaded

**"No sounds found"**
- Run `pnpm upload-sound-store` to upload the sound store
- Check blob store permissions
- Verify environment variables

**"Audio playback failed"**
- Check blob store accessibility
- Verify sound file formats
- Check network connectivity

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=sounds:*
```

## 📈 Performance

- **Caching**: Built-in caching reduces API calls
- **Lazy Loading**: Sounds are loaded on-demand
- **CDN**: Vercel Blob Store provides global CDN
- **Compression**: Audio files are automatically compressed
- **Optimization**: Efficient data structures and algorithms
