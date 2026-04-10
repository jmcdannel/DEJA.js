// ☁️ Hardcoded content for the Cloud product page.

import type { ProductContent, Screenshot } from '../../components/products/types';

export const cloudContent: ProductContent = {
  slug: 'cloud',
  name: 'Cloud',
  icon: '/cloud/icon-512.png',
  tagline:
    'Your roster, turnouts, effects, and devices — live-synced across every phone, tablet, and laptop in the room.',
  heroKicker: 'The hub for your whole layout',
  features: [
    {
      icon: '🔄',
      title: 'Live multi-device sync',
      description:
        'Rename a loco on your laptop and every throttle in the room updates instantly. No file imports, no CSV syncs.',
    },
    {
      icon: '🎨',
      title: 'Color-coded everything',
      description:
        'Pick a color for a loco, turnout, or effect in Cloud and that color follows the item into Throttle and Monitor. 🚦',
    },
    {
      icon: '🔐',
      title: 'Secure layout access',
      description:
        'Manage your connected hardware with secure per-device access. Authorize throttles and keep strangers off your track.',
    },
    {
      icon: '🌐',
      title: 'Multiple layout spaces',
      description:
        'Run your home layout, your club layout, and a test bench from one account. Switch between them in one tap.',
    },
  ],
  ctas: {
    primary: {
      label: 'Sign up free',
      href: 'https://cloud.dejajs.com/signup',
      external: true,
      style: 'primary',
    },
    secondary: {
      label: 'Read the docs',
      href: '/docs/cloud',
      style: 'secondary',
    },
    guide: {
      label: 'Follow the guide',
      href: '/guides/cloud',
      style: 'ghost',
    },
  },
  seo: {
    title: 'DEJA.js Cloud — Your Layout, Everywhere',
    description:
      'Centralized roster, turnouts, effects, and device management for DCC-EX layouts. Live sync across every throttle in the room.',
  },
};

export const cloudScreenshots: Screenshot[] = [
  { src: '/screenshots/cloud_desktop_dashboard.png', alt: 'Cloud dashboard',  caption: 'Your layout at a glance' },
  { src: '/screenshots/cloud_desktop_roster.png',    alt: 'Loco roster',      caption: 'Roster with color coding' },
  { src: '/screenshots/cloud_desktop_turnouts.png',  alt: 'Turnout config',   caption: 'Visual turnout management' },
  { src: '/screenshots/cloud_desktop_effects.png',   alt: 'Effects manager',  caption: 'Effects and sounds' },
  { src: '/screenshots/cloud_desktop_routes.png',    alt: 'Routes manager',   caption: 'Preset routes' },
  { src: '/screenshots/cloud_desktop_signals.png',   alt: 'Signals manager',  caption: 'Signal state control' },
];
