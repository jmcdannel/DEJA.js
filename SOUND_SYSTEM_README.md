# 🎵 DEJA.js Sound System

## 🚂 Overview

The DEJA.js Sound System provides a local sound management solution that scans the sounds package and allows you to browse, search, and manage sound effects within the cloud app. This replaces the previous BBC Sound Importer that had CORS issues.

## ✨ Features

### **Sound Store Management**
- **Local Storage**: Sounds are stored in browser localStorage
- **Automatic Categorization**: Sounds are categorized based on file paths and names
- **Smart Tagging**: Automatic tag generation based on filename patterns
- **Search & Filter**: Find sounds by name, category, or tags
- **Import/Export**: Backup and restore your sound store

### **Sound Scanner Script**
- **Turbo Integration**: Run with `turbo run scan-sounds`
- **Automatic Discovery**: Scans the sounds package for new files
- **Category Detection**: Automatically assigns categories based on file structure
- **Duplicate Prevention**: Only imports new files, skips existing ones

### **Cloud App Integration**
- **Sound Store Browser**: Browse all imported sounds
- **Sound Management**: Edit, delete, and organize sounds
- **Integration**: Works with existing sound effects system

## 🚀 Getting Started

### **1. Scan for New Sounds**

Run the sound scanner to import sounds from the package:

```bash
# From the root directory
pnpm run scan-sounds

# Or from the modules directory
cd packages/modules/effects
pnpm run scan-sounds
```

The scanner will:
- Scan the `packages/sounds/assets` directory
- Detect supported audio formats (`.mp3`, `.wav`, `.ogg`, `.m4a`)
- Automatically categorize sounds based on file paths
- Generate tags based on filenames
- Import new sounds to the store

### **2. Access the Sound Store**

In the cloud app:
1. Navigate to **Effects** → **Sound Store**
2. Browse your imported sounds
3. Search and filter by category or tags
4. Edit sound metadata as needed

### **3. Use Sounds in Effects**

Sounds in the store can be used with the existing sound effects system:
- **Sound Test**: Test imported sounds
- **Effect Forms**: Assign sounds to effects
- **Layout Integration**: Use sounds in your model railroad layout

## 🔧 Technical Details

### **Supported Audio Formats**
- `.mp3` - MPEG Audio Layer III
- `.wav` - Waveform Audio File Format
- `.ogg` - Ogg Vorbis
- `.m4a` - MPEG-4 Audio

### **Automatic Categorization**
The scanner automatically categorizes sounds based on:

1. **Directory Structure**: 
   - `train/` → `train` category
   - `station/` → `station` category
   - `city/` → `city` category

2. **Filename Patterns**:
   - `train_whistle.mp3` → `train` category
   - `station_announcement.wav` → `station` category
   - `city_traffic.mp3` → `city` category

### **Default Categories**
- `train` - Train-related sounds
- `station` - Station and platform sounds
- `city` - Urban and city sounds
- `nature` - Natural and outdoor sounds
- `ambient` - Background and ambient sounds
- `mechanical` - Mechanical and industrial sounds
- `transport` - Transportation sounds
- `industrial` - Industrial and factory sounds

### **Tag Generation**
Tags are automatically generated based on:
- **Category**: Always includes the category as a tag
- **Filename**: Extracts meaningful words from filenames
- **Patterns**: Recognizes common sound types (whistle, engine, crowd, etc.)

## 📁 File Structure

```
packages/
├── modules/
│   └── effects/
│       ├── soundStore.ts          # Frontend store service
│       ├── soundScanner.ts        # Node.js scanner script
│       ├── scripts/
│       │   └── scan-sounds.ts     # CLI script
│       └── index.ts               # Module exports
├── sounds/
│   └── assets/
│       ├── train/
│       │   ├── whistle.mp3
│       │   └── engine.wav
│       ├── station/
│       │   ├── announcement.mp3
│       │   └── crowd.wav
│       └── city/
│           ├── traffic.mp3
│           └── sirens.wav
```

## 🎯 Usage Examples

### **Running the Scanner**

```bash
# Basic scan
pnpm run scan-sounds

# Output example:
🚂 DEJA.js Sound Scanner
========================

📊 Scanner Configuration:
   Package Path: /path/to/packages/sounds/assets
   Supported Extensions: .mp3, .wav, .ogg, .m4a
   Categories: train, station, city, nature, ambient, mechanical, transport, industrial

📦 Current Store Status:
   Total Sounds: 15
   By Category: {"train": 5, "station": 3, "city": 2, "nature": 5}
   By Source: {"imported": 15}

🔍 Starting scan...

✅ Scan completed successfully!

📊 Results:
   Total files found: 20
   New files: 5
   Existing files: 15
   Successfully imported: 5
   Errors: 0

🎵 Newly imported sounds:
   ✅ Steam Whistle (train) - train/steam-whistle.mp3
   ✅ Station Bell (station) - station/bell.mp3
   ✅ City Ambience (city) - city/ambience.mp3
```

### **Managing Sounds in the Store**

1. **Browse**: View all sounds in a grid layout
2. **Search**: Find sounds by name or tags
3. **Filter**: Show sounds by category
4. **Edit**: Modify names, categories, and tags
5. **Delete**: Remove sounds from the store
6. **Export**: Download your sound store as JSON
7. **Import**: Restore from a previously exported file

## 🔄 Workflow

### **Development Workflow**

1. **Add New Sounds**:
   - Place audio files in `packages/sounds/assets/`
   - Organize by category folders
   - Use descriptive filenames

2. **Scan for Changes**:
   ```bash
   pnpm run scan-sounds
   ```

3. **Test in Cloud App**:
   - Navigate to Effects → Sound Store
   - Verify sounds are properly categorized
   - Test sound playback

4. **Use in Effects**:
   - Assign sounds to effects
   - Test in your layout

### **Production Workflow**

1. **Deploy Sounds Package**:
   - Ensure sounds are included in the package
   - Verify file paths are correct

2. **Run Scanner**:
   - Execute scanner on deployment
   - Import new sounds automatically

3. **Verify Store**:
   - Check sound store in production
   - Ensure all sounds are available

## 🚨 Troubleshooting

### **Common Issues**

1. **Scanner Fails**:
   ```bash
   # Check if sounds package exists
   ls packages/sounds/assets
   
   # Verify file permissions
   chmod +r packages/sounds/assets
   ```

2. **Sounds Not Appearing**:
   - Check browser console for errors
   - Verify localStorage is enabled
   - Check if sounds were imported successfully

3. **Build Errors**:
   ```bash
   # Clean and rebuild
   pnpm run clean
   pnpm run build
   ```

### **Debug Commands**

```bash
# Check scanner configuration
node -e "console.log(require('./packages/modules/effects/soundScanner.ts'))"

# Test store service
node -e "const { soundStoreService } = require('./packages/modules/effects/soundStore.ts'); console.log(soundStoreService.getStats())"
```

## 🔮 Future Enhancements

### **Planned Features**
- **Audio Duration Detection**: Extract actual audio length
- **Waveform Visualization**: Show audio waveforms
- **Batch Operations**: Bulk edit multiple sounds
- **Sound Libraries**: Share sound collections
- **Advanced Search**: Full-text search with filters

### **Integration Ideas**
- **Layout Automation**: Auto-assign sounds to layout elements
- **Sound Scheduling**: Time-based sound playback
- **Volume Control**: Per-sound volume management
- **Effects Chains**: Combine multiple sounds

## 📚 API Reference

### **SoundStoreService**

```typescript
// Get all sounds
const sounds = soundStoreService.getAllSounds()

// Search sounds
const results = soundStoreService.searchSounds('train', 'train')

// Add sound
const sound = soundStoreService.addSound({
  name: 'Steam Whistle',
  category: 'train',
  filePath: 'train/whistle.mp3',
  tags: ['steam', 'whistle'],
  source: 'imported'
})

// Update sound
soundStoreService.updateSound(id, { name: 'New Name' })

// Remove sound
soundStoreService.removeSound(id)

// Get statistics
const stats = soundStoreService.getStats()
```

### **SoundScanner**

```typescript
import SoundScanner from '@repo/modules/effects/soundScanner'

const scanner = new SoundScanner()
const result = await scanner.scanForNewSounds()

console.log(`Imported ${result.imported.length} new sounds`)
```

## 🎉 Benefits

1. **No CORS Issues**: All sounds are local
2. **Fast Access**: No network delays
3. **Full Control**: Manage your own sound library
4. **Automatic Organization**: Smart categorization and tagging
5. **Easy Integration**: Works with existing systems
6. **Offline Capable**: No internet required
7. **Scalable**: Add unlimited sounds

---

## 🆘 Support

For issues with the sound system:

1. **Check the scanner output** for error messages
2. **Verify file permissions** in the sounds package
3. **Check browser console** for frontend errors
4. **Review the scanner logs** for import issues
5. **Test with a simple sound file** to isolate problems

The sound system is designed to be robust and self-healing. Most issues can be resolved by running the scanner again or checking the file organization in the sounds package.
