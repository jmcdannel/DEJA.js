// 🎚️ Hardcoded content for the Throttle product page.

import type { ProductContent, Screenshot } from '../../components/products/types';

export const throttleContent: ProductContent = {
  slug: 'throttle',
  name: 'Throttle',
  icon: '/throttle/icon-512.png',
  tagline:
    'The throttle that fits in your pocket. Touch-first, instant, and designed for real operating sessions.',
  heroKicker: 'Drive on any phone, tablet, or laptop',
  features: [
    {
      icon: '🎚️',
      title: 'Precision speed control',
      description:
        'Smooth sliders plus exact ±1 step modifiers. Visual feedback confirms every speed change instantly.',
    },
    {
      icon: '🔗',
      title: 'EZ Consist',
      description:
        'Build a consist visually: pick locos, choose a lead, drive them as one. No CV programming required.',
    },
    {
      icon: '🎛️',
      title: 'Function mapping',
      description:
        'Function buttons map dynamically from your roster. Color-code lights, horns, and bells for instant recognition.',
    },
    {
      icon: '🔀',
      title: 'Turnouts & routes at the throttle',
      description:
        'Throw switches and trigger routes without leaving the throttle view. Your whole layout is one tap away.',
    },
  ],
  ctas: {
    primary: {
      label: 'Launch throttle.dejajs.com',
      href: 'https://throttle.dejajs.com',
      external: true,
      style: 'primary',
    },
    secondary: {
      label: 'Read the docs',
      href: '/docs/throttle',
      style: 'secondary',
    },
    guide: {
      label: 'Follow the guide',
      href: '/guides/throttle',
      style: 'ghost',
    },
  },
  seo: {
    title: 'DEJA.js Throttle — Precision Mobile Control for DCC-EX',
    description:
      'Touch-first throttle app for DCC-EX layouts. Visual consist building, function mapping, turnouts and routes — and nothing to install. Just open a URL.',
  },
};

export const throttleScreenshots: Screenshot[] = [
  { src: '/screenshots/throttle_desktop_throttle-list.png', alt: 'Throttle list view',  caption: 'Multi-throttle control, one screen' },
  { src: '/screenshots/throttle_desktop_throttle.png',      alt: 'Single throttle view', caption: 'Speed, functions, direction' },
  { src: '/screenshots/throttle_desktop_conductor.png',     alt: 'Conductor view',       caption: 'Switch between throttles fast' },
  { src: '/screenshots/throttle_desktop_routes.png',        alt: 'Routes view',          caption: 'Trigger preset routes' },
  { src: '/screenshots/throttle_desktop_turnouts.png',      alt: 'Turnouts view',        caption: 'Throw switches from anywhere' },
  { src: '/screenshots/throttle_desktop_effects.png',       alt: 'Effects view',         caption: 'Fire sounds and lights' },
];
