import type { CSSProperties, Component } from 'vue'

export interface BackgroundDefinition {
  id: string
  name: string
  type: 'image' | 'effect'
  category: 'photo' | 'animated'
  /** For 'image' type: URL resolved by Vite */
  asset?: string
  /** For 'effect' type: Vue component to render */
  component?: () => Promise<{ default: Component }>
  /** CSS properties for the background container */
  css?: CSSProperties
}

// Image assets — imported statically so Vite can resolve/hash them
import northernlightsUrl from '../assets/backgrounds/northernlights.jpg'
import tracksUrl from '../assets/backgrounds/tracks1.jpg'
import forestUrl from '../assets/backgrounds/foresttracks.jpg'
import wavesUrl from '../assets/backgrounds/vertwaves.jpg'
import viaductUrl from '../assets/backgrounds/viaduct.jpg'
import nebulaUrl from '../assets/backgrounds/nebula.jpg'
import milkywayUrl from '../assets/backgrounds/milkyway.jpg'
import neonLinesUrl from '../assets/backgrounds/neon-lines.jpg'
import railroadNightUrl from '../assets/backgrounds/railroad-night.jpg'
import darkTracksUrl from '../assets/backgrounds/dark-tracks.jpg'
import steamLocoUrl from '../assets/backgrounds/steam-locomotive.jpg'
import trainStationUrl from '../assets/backgrounds/train-station-night.jpg'

export const backgrounds: BackgroundDefinition[] = [
  {
    id: 'northernlights',
    name: 'Northern Lights',
    type: 'image',
    category: 'photo',
    asset: northernlightsUrl,
  },
  {
    id: 'tracks',
    name: 'Railroad Tracks',
    type: 'image',
    category: 'photo',
    asset: tracksUrl,
  },
  {
    id: 'forest',
    name: 'Forest Tracks',
    type: 'image',
    category: 'photo',
    asset: forestUrl,
  },
  {
    id: 'waves',
    name: 'Vertical Waves',
    type: 'image',
    category: 'photo',
    asset: wavesUrl,
  },
  {
    id: 'viaduct',
    name: 'Viaduct Bridge',
    type: 'image',
    category: 'photo',
    asset: viaductUrl,
  },
  {
    id: 'decor',
    name: 'Ambient Glow',
    type: 'effect',
    category: 'animated',
    component: () => import('../BackgroundDecor.vue'),
  },
  {
    id: 'stars',
    name: 'Falling Stars',
    type: 'effect',
    category: 'animated',
    component: () => import('../BackgroundFallingStars.vue'),
  },
  {
    id: 'nebula',
    name: 'Nebula',
    type: 'image',
    category: 'photo',
    asset: nebulaUrl,
  },
  {
    id: 'milkyway',
    name: 'Milky Way',
    type: 'image',
    category: 'photo',
    asset: milkywayUrl,
  },
  {
    id: 'neon',
    name: 'Neon Lines',
    type: 'image',
    category: 'photo',
    asset: neonLinesUrl,
  },
  {
    id: 'railroad-night',
    name: 'Railroad at Night',
    type: 'image',
    category: 'photo',
    asset: railroadNightUrl,
  },
  {
    id: 'dark-tracks',
    name: 'Dark Tracks',
    type: 'image',
    category: 'photo',
    asset: darkTracksUrl,
  },
  {
    id: 'steam-locomotive',
    name: 'Steam Locomotive',
    type: 'image',
    category: 'photo',
    asset: steamLocoUrl,
  },
  {
    id: 'train-station',
    name: 'Train Station at Night',
    type: 'image',
    category: 'photo',
    asset: trainStationUrl,
  },
  {
    id: 'starfield',
    name: 'Starfield',
    type: 'effect',
    category: 'animated',
    component: () => import('../BackgroundStarfield.vue'),
  },
  {
    id: 'aurora',
    name: 'Aurora',
    type: 'effect',
    category: 'animated',
    component: () => import('../BackgroundAurora.vue'),
  },
]

export function getBackgroundById(
  id: string,
): BackgroundDefinition | undefined {
  return backgrounds.find((bg) => bg.id === id)
}
