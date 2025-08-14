// BBC Sound Effects API Configuration
export const BBC_API_CONFIG = {
  // BBC API endpoints
  baseUrl: 'https://sound-effects.bbcrewind.co.uk',
  searchEndpoint: 'https://sound-effects.bbcrewind.co.uk/search',
  
  // API keys (set via environment variables)
  apiKey: import.meta.env.VITE_BBC_API_KEY || '',
  
  // Rate limiting
  rateLimit: {
    requestsPerMinute: 60,
    delayBetweenRequests: 1000, // 1 second
  },
  
  // Audio quality preferences
  audioQuality: {
    preferredFormat: 'mp3',
    preferredBitrate: '128k',
    maxDuration: 300000, // 5 minutes in milliseconds
  },
  
  // Storage configuration
  storage: {
    // Primary storage: Vercel Blob
    primary: {
      type: 'vercel-blob',
      bucket: 'bbc-sounds',
      access: 'public',
      cdn: true,
    },
    
    // Fallback storage: Firebase Storage
    fallback: {
      type: 'firebase-storage',
      bucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      path: 'sounds/bbc',
      access: 'public',
    },
  },
  
  // Metadata mapping
  categoryMapping: {
    'train': ['locomotive', 'railway', 'steam', 'diesel'],
    'station': ['platform', 'announcement', 'crowd', 'bell'],
    'city': ['traffic', 'ambient', 'urban', 'street'],
    'nature': ['birds', 'wind', 'water', 'forest'],
    'ambient': ['background', 'atmosphere', 'environment'],
    'mechanical': ['engine', 'machinery', 'industrial'],
    'transport': ['vehicle', 'motor', 'aircraft'],
    'industrial': ['factory', 'construction', 'machinery'],
  },
  
  // License information - Based on BBC Sound Effects licensing requirements
  licenses: {
    default: 'BBC RemArc Licence',
    attribution: 'BBC Sound Effects Library',
    usage: 'Educational and personal use only',
    requirements: [
      'Must credit BBC Sound Effects Library',
      'Educational and personal use permitted',
      'Commercial use requires separate licensing',
      'Attribution must be visible and prominent'
    ],
    url: 'https://sound-effects.bbcrewind.co.uk/licensing'
  },
}

// Helper function to get storage configuration
export function getStorageConfig() {
  // Check if Vercel Blob is available
  if (import.meta.env.VITE_VERCEL_BLOB_TOKEN) {
    return BBC_API_CONFIG.storage.primary
  }
  
  // Fallback to Firebase Storage
  if (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) {
    return BBC_API_CONFIG.storage.fallback
  }
  
  throw new Error('No storage configuration available. Please set up Vercel Blob or Firebase Storage.')
}

// Helper function to validate BBC URL
export function validateBBCUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.hostname === 'sound-effects.bbcrewind.co.uk' &&
           parsedUrl.pathname === '/search'
  } catch {
    return false
  }
}

// Helper function to extract search query from BBC URL
export function extractSearchQuery(url: string): string | null {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.searchParams.get('q')
  } catch {
    return null
  }
}
