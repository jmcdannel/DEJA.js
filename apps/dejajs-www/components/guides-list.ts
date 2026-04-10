export interface GuideItem {
  title: string;
  href: string;
  desc: string;
  comingSoon?: boolean;
}

export const guides: GuideItem[] = [
  { title: 'Getting Started', href: '/guides/getting-started', desc: 'From zero to driving trains' },
  { title: 'Architecture', href: '/guides/architecture', desc: 'How the platform works' },
  { title: 'Throttle', href: '/guides/throttle', desc: 'Train control & functions' },
  { title: 'Server', href: '/guides/server', desc: 'Installation & CLI reference' },
  { title: 'Cloud', href: '/guides/cloud', desc: 'Roster, turnouts & effects' },
  { title: 'IO', href: '/guides/io', desc: 'Hardware expansion & MQTT' },
  { title: 'Monitor', href: '/guides/monitor', desc: 'Diagnostics & logging', comingSoon: true },
];
