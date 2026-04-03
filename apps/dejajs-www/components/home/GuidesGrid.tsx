import Link from 'next/link';
import AnimateIn from './AnimateIn';
import SectionLabel from './SectionLabel';

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
    comingSoon: true,
    color: 'border-gray-700/30',
    iconBg: 'bg-gray-800',
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

export default function GuidesGrid() {
  return (
    <section className="py-20 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <AnimateIn>
            <SectionLabel color="cyan">Guides</SectionLabel>
          </AnimateIn>
          <AnimateIn delay={0.1}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-3">Learn DEJA.js</h2>
          </AnimateIn>
          <AnimateIn delay={0.15}>
            <p className="text-gray-400 max-w-lg mx-auto">
              Step-by-step guides to help you get the most out of the platform — whether you&apos;re just getting started or expanding a club layout.
            </p>
          </AnimateIn>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {guides.map((g, i) => {
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
              return (
                <AnimateIn key={g.href} delay={i * 0.05}>
                  <div>{content}</div>
                </AnimateIn>
              );
            }

            return (
              <AnimateIn key={g.href} delay={i * 0.05}>
                <Link href={g.href} className="block">
                  {content}
                </Link>
              </AnimateIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
