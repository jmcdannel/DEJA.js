import AppSpotlight from './AppSpotlight';

export default function CloudSpotlight() {
  return (
    <AppSpotlight
      label="Cloud App"
      labelColor="cyan"
      appName="DEJA Cloud"
      tagline="Your layout, managed."
      description="Configure your roster, wire up turnouts and signals, set up effects, and manage your layout from anywhere. All data syncs in real time across every connected device."
      features={[
        { icon: '📋', label: 'Roster Management', description: 'Add locos with addresses, names, road numbers, and function maps' },
        { icon: '🔀', label: 'Turnouts & Routes', description: 'Map physical turnouts and build automated route sequences' },
        { icon: '🚦', label: 'Signals', description: 'Configure signal heads and assign them to track blocks' },
        { icon: '🎆', label: 'Effects', description: 'Trigger sounds, lights, and automation events from any device' },
        { icon: '🖥️', label: 'DCC Console', description: 'Send raw DCC-EX commands and view live serial output' },
      ]}
      callout={{
        icon: '☁️',
        title: 'Firebase real-time sync',
        body: 'Configuration lives in the cloud. Change a setting on your desktop — it instantly updates on your phone.',
      }}
      mainScreenshot={{ src: '/screenshots/cloud_desktop_roster.png', alt: 'DEJA Cloud roster view' }}
      pipScreenshot={{ src: '/screenshots/cloud_desktop_signals.png', alt: 'DEJA Cloud signals view' }}
      pipBorderColor="#0891b2"
      logoPath="/cloud/icon-512.png"
      ctaHref="https://cloud.dejajs.com"
      docsHref="/cloud"
      bgClass="bg-slate-900/60"
    />
  );
}
