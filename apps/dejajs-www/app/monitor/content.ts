// 📡 Hardcoded content for the Monitor product page.

import type { ProductContent, Screenshot } from '../../components/products/types';

export const monitorContent: ProductContent = {
  slug: 'monitor',
  name: 'Monitor',
  icon: '/monitor/icon-512.png',
  tagline:
    'See what your layout is doing, live. Command traces, device health, and event streams on every screen.',
  heroKicker: 'Debug your layout, not your toolchain',
  features: [
    {
      icon: '📜',
      title: 'Command traces',
      description:
        'Every DCC-EX command flows through Monitor in real time. Watch raw and parsed bytes between your server and the CommandStation.',
    },
    {
      icon: '📊',
      title: 'Live telemetry',
      description:
        'Track power draw, main and prog track status, and server uptime — all in one unified dashboard.',
    },
    {
      icon: '📱',
      title: 'Mobile and desktop dashboards',
      description:
        'Keep Monitor open on your phone while you drive. Full dashboard on the desktop for deeper diagnostics.',
    },
    {
      icon: '🔍',
      title: 'Event filtering',
      description:
        'Cut through the noise. Filter the event stream by turnouts, locos, errors, or specific IO devices.',
    },
  ],
  ctas: {
    primary: {
      label: 'Open Monitor',
      href: 'https://monitor.dejajs.com',
      external: true,
      style: 'primary',
    },
    secondary: {
      label: 'Monitor Docs',
      href: '/docs/monitor',
      style: 'secondary',
    },
    guide: {
      label: 'Read the Guide',
      href: '/guides/monitor',
      style: 'secondary',
    },
  },
  seo: {
    title: 'DEJA.js Monitor — See Your Layout, Live',
    description:
      'Live diagnostics for your DCC-EX layout. Command traces, telemetry, and event streams on every screen.',
  },
};

export const monitorScreenshots: Screenshot[] = [
  { src: '/screenshots/monitor_desktop_dashboard.png', alt: 'Monitor desktop dashboard', caption: 'Desktop dashboard' },
  { src: '/screenshots/monitor_mobile_dashboard.png',  alt: 'Monitor mobile dashboard',  caption: 'Same data on your phone' },
  { src: '/screenshots/monitor_desktop_settings.png',  alt: 'Monitor settings',          caption: 'Per-device settings' },
];
