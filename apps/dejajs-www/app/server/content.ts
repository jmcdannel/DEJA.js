// 🖥️ Hardcoded content for the Server product page.

import type { ProductContent } from '../../components/products/types';

export const serverContent: ProductContent = {
  slug: 'server',
  name: 'Server',
  icon: '/server/icon-512.png',
  tagline:
    'The quiet bridge between your browser and your DCC-EX CommandStation. Runs on Mac, Linux, and Raspberry Pi.',
  heroKicker: 'One install command. Runs anywhere.',
  features: [
    {
      icon: '⚡',
      title: 'Single-command install',
      description:
        'Paste one curl command and DEJA.js Server is running. No Docker, no Python virtualenv, no yak to shave.',
    },
    {
      icon: '🖥️',
      title: 'Mac, Linux, and Raspberry Pi',
      description:
        'Runs natively on macOS, Linux, and a Raspberry Pi. Plug in USB, start the server, start driving.',
    },
    {
      icon: '🔌',
      title: 'Bridges every protocol',
      description:
        'Connects your browser, your layout devices, and your DEJA Cloud roster over the right channel for each job.',
    },
    {
      icon: '🛡️',
      title: 'Managed with the deja CLI',
      description:
        'Start, stop, update, and inspect your server with a single `deja` command. PID files and graceful shutdown built in.',
    },
  ],
  ctas: {
    primary: {
      label: 'Install in 1 command',
      href: '/docs/server#install',
      style: 'primary',
    },
    secondary: {
      href: '/docs/server',
      style: 'secondary',
    },
    guide: {
      label: 'Read the Guide',
      href: '/guides/server',
      style: 'secondary',
    },
  },
  seo: {
    title: 'DEJA.js Server — One Command to Bridge Browser and DCC-EX',
    description:
      'A lightweight Node.js bridge between your browser and your DCC-EX CommandStation. Runs on Mac, Linux, or a Raspberry Pi, installed with one command.',
  },
};
