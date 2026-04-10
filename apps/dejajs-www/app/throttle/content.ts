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
      title: 'Drive a loco',
      description:
        'Pick any loco from your roster and drive it with precise speed control, direction, and all its sound and light functions.',
    },
    {
      icon: '🎛️',
      title: 'Multi-throttle console',
      description:
        'Run several trains at once from a single screen. Jump between throttles without losing your place.',
    },
    {
      icon: '🎩',
      title: 'Conductor view',
      description:
        'The operating-session dashboard. See every active train, swap between them fast, and keep the whole session flowing.',
    },
    {
      icon: '🚂',
      title: 'Your loco roster',
      description:
        'Browse every locomotive on your layout with color-coded cards, photos, and custom function labels.',
    },
    {
      icon: '🔀',
      title: 'Throw turnouts',
      description:
        'Flip any switch on the layout from wherever you are standing. No reaching across the benchwork.',
    },
    {
      icon: '🛤️',
      title: 'Trigger routes',
      description:
        'Fire a preset route with one tap and watch a whole series of turnouts line up automatically.',
    },
    {
      icon: '🎬',
      title: 'Fire effects',
      description:
        'Play sounds, trigger lighting scenes, and run layout animations right from your phone.',
    },
    {
      icon: '🚦',
      title: 'Control signals',
      description:
        'Clear a signal, stop a train, or run a full ABS sequence without walking back to the dispatcher panel.',
    },
    {
      icon: '🧪',
      title: 'Program decoders',
      description:
        'Tune CVs, set addresses, and test new locos on the programming track without leaving the app.',
    },
    {
      icon: '⚙️',
      title: 'Personal settings',
      description:
        'Tweak your throttle the way you like it. Preferences stay in sync across every device you sign in from.',
    },
  ],
  ctas: {
    primary: {
      label: 'Open Throttle App',
      href: 'https://throttle.dejajs.com',
      external: true,
      style: 'primary',
    },
    secondary: {
      href: '/docs/throttle',
      style: 'secondary',
    },
    guide: {
      label: 'Read the Guide',
      href: '/guides/throttle',
      style: 'secondary',
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
