# DEJA.js Sounds Package

This package manages sound assets for DEJA.js applications using Vercel Blob Store for cloud storage and local archiving.

## 🚀 New Sound Storage System

The sounds package now uses a hybrid approach:
- **Cloud Storage**: Files are uploaded to Vercel Blob Store for web access
- **Local Archive**: Original files are moved to an archive folder (git-ignored)
- **Sound Store**: Metadata is maintained in JSON format for easy access

## 📁 Directory Structure

```
packages/sounds/
├── assets/           # Source sound files (organized by category)
├── archive/          # Archived files after processing (git-ignored)
├── scripts/          # Processing scripts
├── sound-store.json  # Sound metadata and blob URLs
└── README.md         # This file
```

**Note**: The sound store is no longer copied to the cloud app's public folder. All sounds are accessed directly from Vercel Blob Store.

## 🛠️ Scripts

### `pnpm run scan-sounds`
Scans the `assets/` directory for new sound files and:
1. Uploads them to Vercel Blob Store
2. Moves local files to the `archive/` folder
3. Updates the sound store with metadata and blob URLs
4. Saves the sound store to both the package and cloud app

### `pnpm run test-blob`
Tests the Vercel Blob connection before running the full scan.

### `pnpm run copy-to-public`
Legacy script - no longer needed since sounds are accessed directly from Vercel Blob Store.

## 🔧 Setup Requirements

### Environment Variables
The scan script requires a Vercel Blob read/write token:

```bash
export BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
```

### Vercel Blob Store
Ensure you have a Vercel Blob store configured (e.g., `bbc-sounds`) with public access.

## 📊 Sound Categories

The scanner automatically categorizes sounds based on:
- **Directory structure**: Files in `train/` → `train` category
- **Filename patterns**: `steam-whistle.mp3` → `train` category
- **Default fallback**: `ambient` for unrecognized files

Supported categories:
- `train` - Locomotive and railway sounds
- `station` - Station ambience and announcements
- `city` - Urban environment sounds
- `nature` - Outdoor and natural sounds
- `ambient` - Background and atmospheric sounds
- `mechanical` - Industrial and mechanical sounds
- `transport` - General transportation sounds
- `industrial` - Factory and industrial sounds

## 🎵 Supported File Formats

- MP3 (`.mp3`)
- WAV (`.wav`)
- OGG (`.ogg`)
- M4A (`.m4a`)

## 🔄 Workflow

### 1. Add New Sounds
Place new sound files in the appropriate category folder under `assets/`:

```
assets/
├── train/
│   ├── steam-whistle.mp3
│   └── diesel-engine.mp3
├── station/
│   └── crowd-ambience.mp3
└── nature/
    └── birds-chirping.mp3
```

### 2. Run the Scanner
```bash
# From the root directory
pnpm run scan-sounds

# Or from the sounds package
cd packages/sounds
pnpm run scan-sounds
```

### 3. What Happens
- Files are uploaded to Vercel Blob Store
- Local files are moved to `archive/` (maintaining structure)
- Sound store is updated with metadata and blob URLs
- All sounds are accessible directly from Vercel Blob Store
- No duplication in cloud app public folders

### 4. Access Sounds
- **Web apps**: Use the sound store JSON or direct blob URLs
- **Direct URLs**: All sounds load from Vercel Blob Store
- **Local development**: Files are archived locally
- **Git**: Sound files are no longer tracked (only metadata)

## 📋 Sound Store Format

The sound store contains metadata for each sound file:

```json
{
  "train/steam-whistle.mp3": {
    "id": "sound-1234567890-abc123",
    "name": "Steam Whistle",
    "category": "train",
    "filePath": "train/steam-whistle.mp3",
    "tags": ["train", "locomotive", "whistle", "steam", "imported"],
    "source": "imported",
    "importedAt": "2024-01-01T00:00:00.000Z",
    "blobUrl": "https://vercel-blob.com/...",
    "blobPathname": "sounds/train/steam-whistle.mp3",
    "metadata": {
      "description": "Imported from sounds package",
      "license": "Local",
      "attribution": "DEJA.js Sounds Package",
      "originalSize": 1234567,
      "originalPath": "train/steam-whistle.mp3"
    }
  }
}
```

## 🚨 Important Notes

### Git Ignorance
- The `archive/` folder is automatically ignored by git
- Only the sound store JSON and metadata are committed
- This significantly reduces repository size

### File Management
- **Don't manually edit** files in the `archive/` folder
- **Don't commit** the archive folder to git
- Original files are preserved locally for backup

### Blob Store
- Files are uploaded with public access
- URLs are permanent and CDN-enabled
- Storage costs apply based on Vercel's pricing

## 🔍 Troubleshooting

### Test Blob Connection
```bash
cd packages/sounds
BLOB_READ_WRITE_TOKEN=your_token pnpm run test-blob
```

### Check Environment
```bash
echo $BLOB_READ_WRITE_TOKEN
```

### Verify Archive
```bash
ls -la packages/sounds/archive/
```

## 📚 Related Documentation

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [DEJA.js Sound System Overview](../SOUND_SYSTEM_README.md)
- [API Documentation](../../API_DOCUMENTATION.md)

## 🤝 Contributing

When adding new sounds:
1. Place files in the appropriate category folder
2. Use descriptive filenames
3. Ensure proper licensing and attribution
4. Run the scanner to process them
5. Verify the sound store is updated

## 📄 License

Sound files maintain their original licenses. The DEJA.js Sounds Package is provided as-is for educational and development purposes.
