// Mock API Service for Development
// This service simulates BBC API responses for local development

export interface MockBBCSound {
  id: string
  title: string
  duration: number
  category: string
  bbcId: string
  downloadUrl: string
  tags: string[]
  license: string
  attribution: string
}

export interface MockBBCSearchResponse {
  success: boolean
  results: MockBBCSound[]
  total: number
  query: string
}

export interface MockBBCImportResponse {
  success: boolean
  result?: {
    soundId: string
    filePath: string
    metadata: {
      title: string
      category: string
      duration: number
      tags: string[]
      source: string
      license: string
      attribution: string
    }
  }
  error?: string
}

class MockAPIService {
  private mockSounds: MockBBCSound[] = [
    {
      id: 'mock-train-whistle',
      title: 'Steam Locomotive Whistle',
      duration: 3500,
      category: 'train',
      bbcId: 'train-whistle',
      downloadUrl: '/mock/audio/train-whistle.mp3',
      tags: ['steam', 'whistle', 'locomotive', 'classic'],
      license: 'BBC RemArc Licence',
      attribution: 'BBC Sound Effects Library'
    },
    {
      id: 'mock-station-announcement',
      title: 'Station Platform Announcement',
      duration: 8000,
      category: 'station',
      bbcId: 'station-announcement',
      downloadUrl: '/mock/audio/station-announcement.mp3',
      tags: ['platform', 'announcement', 'crowd', 'public'],
      license: 'BBC RemArc Licence',
      attribution: 'BBC Sound Effects Library'
    },
    {
      id: 'mock-city-traffic',
      title: 'City Street Traffic',
      duration: 12000,
      category: 'city',
      bbcId: 'city-traffic',
      downloadUrl: '/mock/audio/city-traffic.mp3',
      tags: ['traffic', 'urban', 'street', 'ambient'],
      license: 'BBC RemArc Licence',
      attribution: 'BBC Sound Effects Library'
    },
    {
      id: 'mock-nature-birds',
      title: 'Forest Birdsong',
      duration: 15000,
      category: 'nature',
      bbcId: 'nature-birds',
      downloadUrl: '/mock/audio/nature-birds.mp3',
      tags: ['birds', 'forest', 'nature', 'ambient'],
      license: 'BBC RemArc Licence',
      attribution: 'BBC Sound Effects Library'
    },
    {
      id: 'mock-mechanical-engine',
      title: 'Diesel Engine Running',
      duration: 10000,
      category: 'mechanical',
      bbcId: 'mechanical-engine',
      downloadUrl: '/mock/audio/mechanical-engine.mp3',
      tags: ['diesel', 'engine', 'mechanical', 'industrial'],
      license: 'BBC RemArc Licence',
      attribution: 'BBC Sound Effects Library'
    }
  ]

  // Simulate API delay
  private async delay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Mock BBC Search
  async searchSounds(query: string, category?: string): Promise<MockBBCSearchResponse> {
    await this.delay(800) // Simulate network delay
    
    console.log('🎭 Mock API: Searching for:', query, 'in category:', category)
    
    let results = this.mockSounds.filter(sound => 
      sound.title.toLowerCase().includes(query.toLowerCase()) ||
      sound.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )
    
    if (category && category !== '') {
      results = results.filter(sound => sound.category === category)
    }
    
    return {
      success: true,
      results,
      total: results.length,
      query
    }
  }

  // Mock BBC Import
  async importSound(bbcUrl: string, category: string, customName?: string, customTags?: string[]): Promise<MockBBCImportResponse> {
    await this.delay(1500) // Simulate processing delay
    
    console.log('🎭 Mock API: Importing sound from:', bbcUrl)
    
    // Extract a mock sound ID from the URL
    const mockId = bbcUrl.includes('train') ? 'mock-train-whistle' :
                   bbcUrl.includes('station') ? 'mock-station-announcement' :
                   bbcUrl.includes('city') ? 'mock-city-traffic' :
                   bbcUrl.includes('nature') ? 'mock-nature-birds' :
                   bbcUrl.includes('mechanical') ? 'mock-mechanical-engine' : 'mock-train-whistle'
    
    const mockSound = this.mockSounds.find(s => s.id === mockId)
    
    if (!mockSound) {
      return {
        success: false,
        error: 'Mock sound not found'
      }
    }
    
    const soundId = `bbc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    return {
      success: true,
      result: {
        soundId,
        filePath: `/mock/storage/${soundId}.mp3`,
        metadata: {
          title: customName || mockSound.title,
          category: category as any,
          duration: mockSound.duration,
          tags: [
            'bbc',
            'professional',
            'high-quality',
            ...(customTags || []),
            mockSound.category
          ],
          source: 'bbc',
          license: mockSound.license,
          attribution: mockSound.attribution
        }
      }
    }
  }

  // Mock BBC Metadata
  async getSoundMetadata(bbcId: string): Promise<MockBBCSound | null> {
    await this.delay(500)
    
    console.log('🎭 Mock API: Getting metadata for:', bbcId)
    
    return this.mockSounds.find(sound => sound.bbcId === bbcId) || null
  }

  // Mock BBC Audio Download
  async downloadAudio(downloadUrl: string): Promise<ArrayBuffer> {
    await this.delay(2000) // Simulate download delay
    
    console.log('🎭 Mock API: Downloading audio from:', downloadUrl)
    
    // Return a mock audio buffer (1KB of random data)
    return new ArrayBuffer(1024)
  }

  // Get all mock sounds
  getAllMockSounds(): MockBBCSound[] {
    return [...this.mockSounds]
  }

  // Add custom mock sound
  addMockSound(sound: MockBBCSound): void {
    this.mockSounds.push(sound)
    console.log('🎭 Mock API: Added new mock sound:', sound.title)
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    await this.delay(100)
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    }
  }
}

// Export singleton instance
export const mockAPIService = new MockAPIService()

// Export types
export type { MockBBCSound, MockBBCSearchResponse, MockBBCImportResponse }
