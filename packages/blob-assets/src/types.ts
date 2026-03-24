export interface AssetEntry {
  originalPath: string
  blobUrl: string
  blobPathname: string
  contentType: string
  size: number
  category: string
  uploadedAt: string
}

export interface AssetManifest {
  version: string
  updatedAt: string
  assets: Record<string, AssetEntry>
}
