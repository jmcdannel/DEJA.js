// 🎨 Per-product Tailwind accent class lookup.
// Token values are defined in styles/globals.css under the @theme block.

import type { ProductAccent, ProductSlug } from './types';

export const PRODUCT_ACCENTS: Record<ProductSlug, ProductAccent> = {
  throttle: {
    slug: 'throttle',
    textClass: 'text-deja-throttle',
    bgClass: 'bg-deja-throttle',
    borderClass: 'border-deja-throttle',
    glowClass: 'glow-throttle',
  },
  server: {
    slug: 'server',
    textClass: 'text-deja-server',
    bgClass: 'bg-deja-server',
    borderClass: 'border-deja-server',
    glowClass: 'glow-server',
  },
  cloud: {
    slug: 'cloud',
    textClass: 'text-deja-cloud',
    bgClass: 'bg-deja-cloud',
    borderClass: 'border-deja-cloud',
    glowClass: 'glow-cloud',
  },
  io: {
    slug: 'io',
    textClass: 'text-deja-io',
    bgClass: 'bg-deja-io',
    borderClass: 'border-deja-io',
    glowClass: 'glow-io',
  },
  monitor: {
    slug: 'monitor',
    textClass: 'text-deja-monitor',
    bgClass: 'bg-deja-monitor',
    borderClass: 'border-deja-monitor',
    glowClass: 'glow-monitor',
  },
  tour: {
    slug: 'tour',
    textClass: 'text-deja-tour',
    bgClass: 'bg-deja-tour',
    borderClass: 'border-deja-tour',
    glowClass: 'glow-tour',
  },
};

export function getAccent(slug: ProductSlug): ProductAccent {
  return PRODUCT_ACCENTS[slug];
}
