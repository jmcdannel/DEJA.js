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
      icon: '📊',
      title: 'Layout dashboard',
      description:
        'Your whole layout at a glance. See what is powered on, who is running, and what needs attention the moment you log in.',
    },
    {
      icon: '🚂',
      title: 'Loco roster',
      description:
        'Organize every engine on your railroad with photos, custom colors, function labels, and notes your operators will actually read.',
    },
    {
      icon: '🔊',
      title: 'Sound library',
      description:
        'Upload horn blasts, bell dings, and background ambience once and make them playable from every throttle in the room.',
    },
    {
      icon: '🎬',
      title: 'Effects manager',
      description:
        'Design lighting scenes, animations, and sound cues, then drop them on any throttle with a tap.',
    },
    {
      icon: '🛤️',
      title: 'Preset routes',
      description:
        'Save your favorite sequences of turnouts as named routes so operators can line up a whole yard lead in one tap.',
    },
    {
      icon: '🚦',
      title: 'Signal wiring',
      description:
        'Configure signal heads, aspects, and logic without touching a wire. Tie them to blocks and watch them come alive.',
    },
    {
      icon: '📡',
      title: 'Sensors and automation',
      description:
        'Hook up block detectors and build simple if-this-then-that rules to automate your railroad without a line of code.',
    },
    {
      icon: '🔀',
      title: 'Turnout manager',
      description:
        'Name every switch on the layout, group them, and label them so new operators can find the right one the first time.',
    },
    {
      icon: '🧭',
      title: 'Track diagrams',
      description:
        'Draw a clickable schematic of your railroad that mirrors reality and makes dispatching a whole lot easier.',
    },
    {
      icon: '⚡',
      title: 'Power districts',
      description:
        'Map out your track power zones so you can kill power to one yard without bringing the whole railroad down.',
    },
    {
      icon: '💻',
      title: 'DCC-EX console',
      description:
        'Talk directly to your command station when you need to. Send commands, inspect responses, and troubleshoot in plain text.',
    },
    {
      icon: '🔌',
      title: 'Device management',
      description:
        'Pair throttles, command stations, and IO devices to your layout and see exactly what is online right now.',
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
      label: 'Cloud Docs',
      href: '/docs/cloud',
      style: 'secondary',
    },
    guide: {
      label: 'Read the Guide',
      href: '/guides/cloud',
      style: 'secondary',
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
