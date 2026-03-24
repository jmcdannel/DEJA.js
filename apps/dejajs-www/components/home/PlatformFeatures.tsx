import AnimateIn from './AnimateIn';
import SectionLabel from './SectionLabel';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: '☁️',
    title: 'Cloud Sync',
    description: 'Roster, turnouts, and settings sync instantly across all devices via Firebase.',
  },
  {
    icon: '📱',
    title: 'Any Device',
    description: 'Web app works on phone, tablet, and desktop. PWA install — no app store.',
  },
  {
    icon: '🔒',
    title: 'Private Platform',
    description:
      'Subscription-gated access. Your layout data is yours — secured by Firebase Auth.',
  },
  {
    icon: '⚡',
    title: 'Real-Time',
    description: 'Commands reach your track in under 100ms via WebSocket + serial bridge.',
  },
  {
    icon: '🔧',
    title: 'DCC-EX Native',
    description:
      'Built specifically for DCC-EX. Full protocol support — not a general-purpose tool.',
  },
  {
    icon: '🎆',
    title: 'Effects & Automation',
    description: 'Trigger sounds, lights, and automation events from any device on your network.',
  },
  {
    icon: '📡',
    title: 'MQTT Ready',
    description: 'Optional MQTT broker integration for advanced automation and sensor inputs.',
  },
  {
    icon: '🔀',
    title: 'Multi-Track',
    description:
      'Support for Main, Programming, DC/PWM, and Booster modes on separate CommandStations.',
  },
  {
    icon: '🚦',
    title: 'Signal Control',
    description: 'Configure signal heads with full aspect control tied to block occupancy.',
  },
];

export default function PlatformFeatures() {
  return (
    <section className="py-24 bg-slate-900/50">
      <div className="max-w-6xl mx-auto px-6">
        <AnimateIn className="text-center mb-16">
          <SectionLabel color="cyan">Platform</SectionLabel>
          <h2 className="mt-6 text-4xl font-bold text-white">Built for serious layouts.</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Every feature designed around how real model railroaders actually operate.
          </p>
        </AnimateIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <AnimateIn key={feature.title} delay={index * 0.05}>
              <div className="p-6 rounded-2xl border border-gray-800 bg-gray-950/60 hover:border-deja-cyan/30 transition group h-full">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-white mb-2 group-hover:text-deja-cyan transition">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
