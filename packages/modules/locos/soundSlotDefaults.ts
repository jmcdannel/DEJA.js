// packages/modules/locos/soundSlotDefaults.ts

export interface SoundSlot {
  label: string
  icon: string        // key from FUNCTION_ICONS (light, bell, horn, etc.)
  soundKey: string    // Vercel Blob filename/key — placeholder until catalog is complete
  isMomentary: boolean
}

export const soundSlotDefaults: SoundSlot[] = [
  { label: 'Horn',      icon: 'horn',     soundKey: 'train-horn.mp3',          isMomentary: true  },
  { label: 'Bell',      icon: 'bell',     soundKey: 'train-bell.mp3',          isMomentary: true  },
  { label: 'Coupler',   icon: 'coupler',  soundKey: 'train-coupler.mp3',       isMomentary: true  },
  { label: 'Brake',     icon: 'brake',    soundKey: 'train-brake-squeal.mp3',  isMomentary: true  },
  { label: 'Air',       icon: 'air',      soundKey: 'train-air-release.mp3',   isMomentary: true  },
  { label: 'Dyn Brake', icon: 'fan',      soundKey: 'train-dynamic-brake.mp3', isMomentary: false },
  { label: 'Announce',  icon: 'announce', soundKey: 'station-announce.mp3',    isMomentary: false },
  { label: 'Ambient',   icon: 'sound',    soundKey: 'train-ambient.mp3',       isMomentary: false },
]
