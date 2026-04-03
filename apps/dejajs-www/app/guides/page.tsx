import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guides — DEJA.js',
  description: 'Learn how to set up and use the DEJA.js platform — from your first loop of track to a full club layout.',
};

const guides = [
  {
    label: 'Getting Started',
    href: '/guides/getting-started',
    desc: 'From zero to driving trains in minutes. Sign up, install the server, and take control.',
    icon: '🚀',
    color: 'border-deja-cyan/30 hover:border-deja-cyan/60',
    iconBg: 'bg-deja-cyan/10',
  },
  {
    label: 'Architecture',
    href: '/guides/architecture',
    desc: 'How DEJA.js works — from a tap on your phone to a train on the track. The full platform explained.',
    icon: '🏗️',
    color: 'border-purple-400/30 hover:border-purple-400/60',
    iconBg: 'bg-purple-400/10',
  },
  {
    label: 'Throttle',
    href: '/guides/throttle',
    desc: 'Train control, function buttons, consists, and everything you can do from the Throttle app.',
    icon: '🚂',
    color: 'border-deja-cyan/30 hover:border-deja-cyan/60',
    iconBg: 'bg-deja-cyan/10',
  },
  {
    label: 'Server',
    href: '/guides/server',
    desc: 'Installation, CLI reference, configuration, and running the DEJA Server on any platform.',
    icon: '💻',
    color: 'border-deja-lime/30 hover:border-deja-lime/60',
    iconBg: 'bg-deja-lime/10',
  },
  {
    label: 'Cloud',
    href: '/guides/cloud',
    desc: 'Roster management, turnout configuration, route automation, and effects setup.',
    icon: '☁️',
    color: 'border-indigo-400/30 hover:border-indigo-400/60',
    iconBg: 'bg-indigo-400/10',
  },
  {
    label: 'IO',
    href: '/guides/io',
    desc: 'Hardware expansion with Arduino and Pico W — LEDs, servos, signals, sensors, and MQTT.',
    icon: '🔌',
    comingSoon: true,
    color: 'border-gray-700/30',
    iconBg: 'bg-gray-800',
  },
  {
    label: 'Monitor',
    href: '/guides/monitor',
    desc: 'Diagnostics, DCC command logging, device status, and system health monitoring.',
    icon: '📊',
    comingSoon: true,
    color: 'border-gray-700/30',
    iconBg: 'bg-gray-800',
  },
];

export default function GuidesIndex() {
  return (
    <div>
      <div className="mb-10">
        <p className="text-xs text-deja-cyan font-mono tracking-[0.2em] uppercase mb-2">Guides</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Learn DEJA.js</h1>
        <p className="text-gray-400 max-w-lg">
          Step-by-step guides to help you get the most out of the platform — whether you&apos;re just getting started or expanding a club layout.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {guides.map((g) => {
          const content = (
            <div className={`rounded-xl border ${g.color} bg-gray-800/20 p-5 h-full transition-colors ${g.comingSoon ? 'opacity-50 cursor-default' : ''}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${g.iconBg} flex items-center justify-center text-xl shrink-0`}>
                  {g.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-semibold text-sm">{g.label}</p>
                    {g.comingSoon && (
                      <span className="text-[10px] text-gray-600 uppercase font-semibold tracking-wider">Soon</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{g.desc}</p>
                </div>
              </div>
            </div>
          );

          if (g.comingSoon) {
            return <div key={g.href}>{content}</div>;
          }

          return (
            <Link key={g.href} href={g.href} className="block">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
