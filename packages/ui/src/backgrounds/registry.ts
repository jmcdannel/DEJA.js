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

// Image assets — hosted on Vercel Blob
import { backgroundUrls } from './blob-urls'

export const backgrounds: BackgroundDefinition[] = [
  {
    id: 'northernlights',
    name: 'Northern Lights',
    type: 'image',
    category: 'photo',
    asset: backgroundUrls.northernlights,
  },
  {
    id: 'tracks',
    name: 'Railroad Tracks',
    type: 'image',
    category: 'photo',
    asset: backgroundUrls.tracks1,
  },
  {
    id: 'forest',
    name: 'Forest Tracks',
    type: 'image',
    category: 'photo',
    asset: backgroundUrls.foresttracks,
  },
  {
    id: 'waves',
    name: 'Vertical Waves',
    type: 'image',
    category: 'photo',
    asset: backgroundUrls.vertwaves,
  },
  {
    id: 'viaduct',
    name: 'Viaduct Bridge',
    type: 'image',
    category: 'photo',
    asset: backgroundUrls.viaduct,
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
    asset: backgroundUrls.nebula,
  },
  {
    id: 'milkyway',
    name: 'Milky Way',
    type: 'image',
    category: 'photo',
    asset: backgroundUrls.milkyway,
  },
  {
    id: 'neon',
    name: 'Neon Lines',
    type: 'image',
    category: 'photo',
    asset: backgroundUrls['neon-lines'],
  },
  {
    id: 'railroad-night',
    name: 'Railroad at Night',
    type: 'image',
    category: 'photo',
    asset: backgroundUrls['railroad-night'],
  },
  {
    id: 'dark-tracks',
    name: 'Dark Tracks',
    type: 'image',
    category: 'photo',
    asset: backgroundUrls['dark-tracks'],
  },
  {
    id: 'steam-locomotive',
    name: 'Steam Locomotive',
    type: 'image',
    category: 'photo',
    asset: backgroundUrls['steam-locomotive'],
  },
  {
    id: 'train-station',
    name: 'Train Station at Night',
    type: 'image',
    category: 'photo',
    asset: backgroundUrls['train-station-night'],
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
