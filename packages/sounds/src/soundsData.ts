// This module exports the sound data directly, eliminating the need to fetch from JSON files
// The data is loaded from the sound-store.json and exported as a module

import soundStoreData from '../sound-store.json' assert { type: 'json' }

export interface SoundData {
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

// Export the sound store data
export const soundsData: Record<string, SoundData> = soundStoreData

// Helper function to get all sounds
export function getAllSounds(): SoundData[] {
  return Object.values(soundsData)
}

// Helper function to get sounds by category
export function getSoundsByCategory(category: string): SoundData[] {
  return Object.values(soundsData).filter(sound => sound.category === category)
}

// Helper function to search sounds
export function searchSounds(query: string, category?: string): SoundData[] {
  let results = Object.values(soundsData).filter(sound => 
    sound.name.toLowerCase().includes(query.toLowerCase()) ||
    sound.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  )
  
  if (category) {
    results = results.filter(sound => sound.category === category)
  }
  
  return results
}

// Helper function to get sound by ID
export function getSoundById(id: string): SoundData | undefined {
  return Object.values(soundsData).find(sound => sound.id === id)
}

// Helper function to get sound by file path
export function getSoundByFilePath(filePath: string): SoundData | undefined {
  return soundsData[filePath]
}
