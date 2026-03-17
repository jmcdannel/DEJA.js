import AppSpotlight from './AppSpotlight';

export default function ThrottleSpotlight() {
  return (
    <AppSpotlight
      label="Throttle App"
      labelColor="cyan"
      appName="DEJA Throttle"
      tagline="Complete locomotive control."
      description="Precise speed control, function mapping, consist management, and more — from any browser. No app store, no install. Add it to your homescreen and it works like a native app."
      features={[
        { icon: '🎚️', label: 'Speed & Direction', description: 'Smooth 0–126 step control with momentary and toggle functions' },
        { icon: '🚂', label: 'Consist Management', description: 'Build multi-loco consists with independent function control' },
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
      pipBorderColor="#8b5cf6"
      logoPath="/throttle/icon-512.png"
      ctaHref="https://throttle.dejajs.com"
      docsHref="/throttle"
      bgClass="bg-gray-950"
    />
  );
}
