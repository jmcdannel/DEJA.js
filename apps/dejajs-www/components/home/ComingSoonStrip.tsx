import SectionLabel from './SectionLabel';

const items = [
  '📱 iOS Native App',
  '🤖 Android Native App',
  '🔌 WiThrottle Protocol',
  '🗺️ Layout Map Editor',
  '🎬 Automated Sequences',
  '📊 Operations Mode',
  '🔔 Push Notifications',
  '🔗 Multi-layout Support',
];

const doubledItems = [...items, ...items];

export default function ComingSoonStrip() {
  return (
    <section className="bg-gray-950 border-y border-deja-cyan/10 py-12">
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="flex items-center gap-4">
          <SectionLabel color="magenta">Coming Soon</SectionLabel>
          <div className="flex-1 h-px bg-deja-magenta/20" />
        </div>
      </div>

      <div className="relative overflow-hidden">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-gray-950 to-transparent pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-gray-950 to-transparent pointer-events-none" />

        <div className="flex animate-marquee whitespace-nowrap gap-8">
          {doubledItems.map((item, index) => (
            <span
              key={index}
              className="px-4 py-2 rounded-full border border-deja-magenta/20 bg-deja-magenta/5 text-gray-400 text-sm font-medium flex-shrink-0"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
