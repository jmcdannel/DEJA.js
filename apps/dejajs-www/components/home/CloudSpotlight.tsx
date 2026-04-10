import AppSpotlight from './AppSpotlight';

export default function CloudSpotlight() {
  return (
    <AppSpotlight
      label="Cloud App"
      labelColor="cyan"
      appName="DEJA Cloud"
      tagline="Your layout, managed."
      description="Configure your roster, wire up turnouts and signals, manage devices and connections, and control your layout from anywhere. Connects via USB, WebSocket, or MQTT — including DEJA IO devices."
      features={[
        { icon: '📋', label: 'Roster Management', description: 'Add locos with addresses, names, road numbers, and function maps' },
        { icon: '🔌', label: 'Device & Connection Management', description: 'Connect via USB, WebSocket, or MQTT — configure DEJA IO devices or use custom integrations' },
        { icon: '🔀', label: 'Turnouts & Routes', description: 'Map physical turnouts and build automated route sequences' },
        { icon: '🚦', label: 'Signals', description: 'Configure signal heads and assign them to track blocks' },
        { icon: '🎆', label: 'Effects', description: 'Trigger sounds, lights, and automation events from any device' },
        { icon: '🖥️', label: 'DCC Console', description: 'Send raw DCC-EX commands and view live serial output' },
      ]}
      callout={{
        icon: '☁️',
        title: 'Instant sync across all devices',
        body: 'Change a setting on your desktop — it instantly updates on your phone, tablet, and every connected device.',
      }}
      mainScreenshot={{ src: '/screenshots/cloud_desktop_roster.png', alt: 'DEJA Cloud roster view' }}
      pipScreenshot={{ src: '/screenshots/cloud_desktop_signals.png', alt: 'DEJA Cloud signals view' }}
      logoVariant="cloud"
      ctaHref="/cloud"
      ctaLabel="Learn More"
      docsHref="/docs/cloud"
      docsLabel="View Docs"
      bgClass="bg-slate-900/60"
    />
  );
}
