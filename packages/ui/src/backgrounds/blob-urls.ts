// Background image URLs hosted on Vercel Blob
// Re-generate with: pnpm --filter=@repo/blob-assets upload-assets -- --category backgrounds --dir packages/ui/src/assets/backgrounds
const BLOB_BASE =
  'https://xndozjm68szqabqe.public.blob.vercel-storage.com/backgrounds'

export const backgroundUrls = {
  northernlights: `${BLOB_BASE}/northernlights.jpg`,
  tracks1: `${BLOB_BASE}/tracks1.jpg`,
  foresttracks: `${BLOB_BASE}/foresttracks.jpg`,
  vertwaves: `${BLOB_BASE}/vertwaves.jpg`,
  viaduct: `${BLOB_BASE}/viaduct.jpg`,
  nebula: `${BLOB_BASE}/nebula.jpg`,
  milkyway: `${BLOB_BASE}/milkyway.jpg`,
  'neon-lines': `${BLOB_BASE}/neon-lines.jpg`,
  'railroad-night': `${BLOB_BASE}/railroad-night.jpg`,
  'dark-tracks': `${BLOB_BASE}/dark-tracks.jpg`,
  'steam-locomotive': `${BLOB_BASE}/steam-locomotive.jpg`,
  'train-station-night': `${BLOB_BASE}/train-station-night.jpg`,
} as const
