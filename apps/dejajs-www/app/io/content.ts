// 🧩 Hardcoded content for the IO product page.

import type { ProductContent } from '../../components/products/types';

export const ioContent: ProductContent = {
  slug: 'io',
  name: 'IO',
  icon: '/io/icon-512.png',
  tagline:
    'Expand your layout with code, not catalogs. Arduinos, Pico Ws, and MQTT — no proprietary modules required.',
  heroKicker: 'Open hardware. Open protocols.',
  features: [
    {
      icon: '🧩',
      title: 'Arduino and Pico W support',
      description:
        'Plug-and-play firmware for Arduino Mega and Raspberry Pi Pico W. Drop the sketch on, wire it up, and your devices register themselves with the server on boot.',
    },
    {
      icon: '📡',
      title: 'MQTT native',
      description:
        'Every IO device speaks MQTT directly to your server. Subscribe to events, publish commands, compose anything.',
    },
    {
      icon: '💡',
      title: 'Effects, sensors, servos, signals',
      description:
        'Wire LED strips, occupancy sensors, servo turnouts, and signals — each one becomes a first-class element in Cloud.',
    },
    {
      icon: '🔓',
      title: 'No proprietary modules',
      description:
        'Skip expensive proprietary decoders for things a Pico W can do. Open hardware, open firmware, total control.',
    },
  ],
  ctas: {
    primary: {
      label: 'See compatible hardware',
      href: '/guides/io',
      style: 'primary',
    },
    secondary: {
      label: 'IO Docs',
      href: '/docs/io',
      style: 'secondary',
    },
    guide: {
      label: 'Read the Guide',
      href: '/guides/io',
      style: 'secondary',
    },
  },
  seo: {
    title: 'DEJA.js IO — Open Hardware Expansion for DCC-EX',
    description:
      'Expand your layout with Arduino, Pico W, and MQTT. Sensors, servos, effects, and signals — no proprietary modules.',
  },
};

export const ioHardwarePhotos: Array<{ src?: string; alt: string; caption?: string }> = [
  { alt: 'Raspberry Pi Pico W with DEJA firmware',  caption: 'Pico W running CircuitPython' },
  { alt: 'Arduino Mega wired for effects',          caption: 'Arduino Mega I/O board' },
  { alt: 'Servo-driven turnout mechanism',          caption: 'Servo turnouts' },
  { alt: 'LED strip lighting a station scene',      caption: 'Scene lighting' },
  { alt: 'Occupancy sensor on the mainline',        caption: 'Block occupancy sensors' },
  { alt: 'Signal head wired to IO',                 caption: 'Signal heads' },
];
