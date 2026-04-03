# 📦 @repo/blob-assets

Upload and manage binary assets (images, videos, audio) on [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for DEJA.js.

## 🤔 Why?

Large binary files (logos, backgrounds, videos) don't belong in git. This package provides a CLI and programmatic API to upload them to Vercel Blob and track them in a local manifest file, so apps can reference CDN URLs instead of bundling assets.

## 📁 Structure

```
blob-assets/
├── src/
│   ├── index.ts        # Public API exports
│   ├── types.ts        # AssetEntry, AssetManifest types
│   ├── manifest.ts     # Load/save blob-assets-manifest.json
│   └── upload.ts       # Upload files/directories to Vercel Blob
├── scripts/
│   └── upload-assets.ts  # CLI script for batch uploads
└── blob-assets-manifest.json  # Tracks all uploaded assets (committed to git)
```

## 🚀 Usage

### CLI — Upload a directory of assets

```bash
# Requires BLOB_READ_WRITE_TOKEN in your .env
pnpm --filter=@repo/blob-assets upload-assets -- --category tour --dir apps/tour/public

# With extension filter
pnpm --filter=@repo/blob-assets upload-assets -- --category screenshots --dir ./screenshots --extensions .png,.jpg
```

**Arguments:**

| Flag | Required | Description |
|------|----------|-------------|
| `--category` | ✅ | Asset category (e.g., `tour`, `backgrounds`, `screenshots`, `docs`) |
| `--dir` | ✅ | Directory containing files to upload |
| `--extensions` | ❌ | Comma-separated extensions (default: `.png,.jpg,.jpeg,.svg,.mp4,.wav,.mp3`) |

The script skips files already in the manifest (by blob pathname) and updates `blob-assets-manifest.json` when done.

### Programmatic API

```typescript
import { uploadAsset, uploadDirectory, loadManifest, saveManifest } from '@repo/blob-assets'
import type { AssetEntry, AssetManifest } from '@repo/blob-assets'

// Upload a single file
const entry = await uploadAsset('path/to/image.png', 'tour/', 'tour')
console.log(entry.blobUrl) // https://xndozjm68szqabqe.public.blob.vercel-storage.com/tour/image.png

// Upload an entire directory
const entries = await uploadDirectory('apps/tour/public', 'tour/', 'tour', {
  extensions: ['.png', '.jpg'],
})

// Read/write the manifest
const manifest = await loadManifest()
manifest.assets['my/file.png'] = entry
await saveManifest(manifest)
```

## 📋 Manifest

`blob-assets-manifest.json` is the source of truth for uploaded assets. It maps repo-relative file paths to their Vercel Blob URLs:

```json
{
  "version": "1",
  "updatedAt": "2026-03-18T18:34:03.063Z",
  "assets": {
    "apps/tour/public/DejaJsLogo.png": {
      "originalPath": "apps/tour/public/DejaJsLogo.png",
      "blobUrl": "https://....public.blob.vercel-storage.com/tour/DejaJsLogo.png",
      "blobPathname": "tour/DejaJsLogo.png",
      "contentType": "image/png",
      "size": 1357498,
      "category": "tour",
      "uploadedAt": "2026-03-18T17:09:59.081Z"
    }
  }
}
```

This file is committed to git so all developers can reference blob URLs without re-uploading.

## 🔑 Environment

Requires `BLOB_READ_WRITE_TOKEN` — set in `.env` at the repo root or export directly.

## 📎 Supported MIME Types

`.png`, `.jpg`, `.jpeg`, `.svg`, `.mp4`, `.mp3`, `.wav`, `.ico`, `.gif`, `.webp`
