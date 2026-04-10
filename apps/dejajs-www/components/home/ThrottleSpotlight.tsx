import Image from 'next/image';
import AnimateIn from './AnimateIn';
import AppSpotlight from './AppSpotlight';

// Add or remove screenshots here to update the gallery
const screenshots = [
  { src: '/screenshots/throttle_desktop_throttle.png', alt: 'DEJA Throttle — locomotive control', aspect: 'desktop' as const },
  { src: '/screenshots/throttle_mobile_home.png', alt: 'DEJA Throttle — mobile home', aspect: 'mobile' as const },
];

function ThrottleGallery() {
  const [desktop, ...mobiles] = screenshots.filter(Boolean);
  return (
    <AnimateIn direction="right" className="flex flex-col gap-4">
      {/* Desktop screenshot — full width */}
      {desktop && (
        <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
          <Image
            src={desktop.src}
            alt={desktop.alt}
            width={900}
            height={560}
            className="w-full h-auto"
          />
        </div>
      )}

      {/* Mobile screenshots — row of portraits */}
      {mobiles.length > 0 && (
        <div className={`grid gap-4 ${mobiles.length === 1 ? 'grid-cols-2' : `grid-cols-${Math.min(mobiles.length, 3)}`}`}>
          {mobiles.map((shot) => (
            <div key={shot.src} className="rounded-xl overflow-hidden border border-gray-800 shadow-lg">
              <Image
                src={shot.src}
                alt={shot.alt}
                width={320}
                height={600}
                className="w-full h-auto object-cover"
              />
            </div>
          ))}
          {/* Placeholder slot — replace with a real screenshot when available */}
          <div className="rounded-xl border border-gray-800/60 bg-gray-900/40 flex items-center justify-center min-h-[160px]">
            <div className="text-center text-gray-600 text-sm px-4">
              <p className="text-2xl mb-2">📱</p>
              <p>More screens<br />coming soon</p>
            </div>
          </div>
        </div>
      )}
    </AnimateIn>
  );
}

export default function ThrottleSpotlight() {
  return (
    <AppSpotlight
      label="Throttle App"
      labelColor="cyan"
      appName="DEJA Throttle"
      tagline="Complete locomotive control."
      description="Precise speed control, function mapping, EZ Consist, and CV Programming — from any browser. No app store, no install. Add it to your homescreen and it works like a native app."
      features={[
        { icon: '🎚️', label: 'Speed & Direction', description: 'Smooth 0–126 step control with momentary and toggle functions' },
        { icon: '🚂', label: 'EZ Consist', description: 'Build multi-loco consists with independent function control per unit' },
        { icon: '⚙️', label: 'CV Programming', description: 'Read and write decoder CVs directly from the Throttle app' },
        { icon: '🗂️', label: 'Roster', description: 'Full loco roster with addresses, names, and road numbers' },
        { icon: '🔀', label: 'Turnouts & Routes', description: 'Throw turnouts individually or trigger full preset routes' },
        { icon: '📱', label: 'PWA — No App Store', description: 'Add to homescreen on iOS or Android for a native-feel experience' },
      ]}
      callout={{
        icon: '📱',
        title: 'Web App — works on any device',
        body: 'Open throttle.dejajs.com in Safari or Chrome and tap "Add to Homescreen". Full-screen, no browser chrome.',
      }}
      mainScreenshot={{ src: '/screenshots/throttle_desktop_throttle.png', alt: 'DEJA Throttle desktop view' }}
      pipScreenshot={{ src: '/screenshots/throttle_mobile_home.png', alt: 'DEJA Throttle mobile view' }}
      logoVariant="throttle"
      ctaHref="https://throttle.dejajs.com/demo"
      ctaLabel="Try Now in Demo Mode"
      docsHref="/throttle"
      docsLabel="Learn More"
      bgClass="bg-gray-950"
      visualSlot={<ThrottleGallery />}
    />
  );
}
