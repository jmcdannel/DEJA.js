// 🗺️ Hardcoded content for the Tour product page.

import type { ProductContent, Screenshot } from '../../components/products/types';

export const tourContent: ProductContent = {
  slug: 'tour',
  name: 'Tour',
  icon: '/tour/icon-512.png',
  tagline:
    'Give your layout a story. Guided presets and automated sequences turn open-house day into a narrated experience.',
  heroKicker: 'Guided layouts for clubs and showcases',
  features: [
    {
      icon: '🗺️',
      title: 'Section-by-section tours',
      description:
        'Walk visitors through distinct areas of your layout with rich context for each section.',
    },
    {
      icon: '🎬',
      title: 'Preset sequences',
      description:
        'Chain effects, sounds, and routes into a repeatable demonstration — one tap, every time.',
    },
    {
      icon: '🖼️',
      title: 'Embed rich media',
      description:
        'Add photos, videos, and descriptions to bring the story behind each area of your layout to life.',
    },
    {
      icon: '🚂',
      title: 'Showcase mode',
      description:
        'Perfect for club open houses, train shows, or giving first-time visitors an unforgettable walkthrough.',
    },
  ],
  ctas: {
    primary: {
      label: 'Try the demo',
      href: 'https://tour.dejajs.com',
      external: true,
      style: 'primary',
    },
    secondary: {
      label: 'Tour Docs',
      href: '/docs/tour',
      style: 'secondary',
    },
    guide: {
      label: 'Read the Guide',
      href: '/guides/tour',
      style: 'secondary',
    },
  },
  seo: {
    title: 'DEJA.js Tour — Give Your Layout a Story',
    description:
      'Guided layout tours for clubs and open-house events. Preset routes, embedded media, and automated sequences.',
  },
};

export const tourScreenshots: Screenshot[] = [
  { src: '/screenshots/tour_desktop_welcome.png',     alt: 'Tour welcome screen', caption: 'A guided entry point' },
  { src: '/screenshots/tour_desktop_sections.png',    alt: 'Tour sections',       caption: 'Section-by-section navigation' },
  { src: '/screenshots/tour_desktop_area-detail.png', alt: 'Area detail',         caption: 'Rich media per area' },
  { src: '/screenshots/tour_desktop_effects.png',     alt: 'Effects panel',       caption: 'Trigger effects from tour' },
  { src: '/screenshots/tour_desktop_media.png',       alt: 'Media gallery',       caption: 'Photos and video' },
];
