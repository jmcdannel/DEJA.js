import AppSpotlight from './AppSpotlight';
import TerminalBlock from './TerminalBlock';

const dccFeedLines = [
  { type: 'info' as const, text: 'Layout connected · Pittsburg & Shasta 1:87' },
  { type: 'command' as const, text: '<t 3 68 1>  ← Locomotive 3 speed 68 fwd' },
  { type: 'output' as const, text: '<T 4 1>     ← Turnout 4 thrown' },
  { type: 'command' as const, text: '<F 3 0 1>   ← Function 0 (headlight) ON' },
  { type: 'output' as const, text: '<T 7 0>     ← Turnout 7 closed' },
  { type: 'success' as const, text: 'All systems nominal' },
];

export default function MonitorSpotlight() {
  return (
    <AppSpotlight
      label="Monitor App"
      labelColor="cyan"
      appName="DEJA Monitor"
      tagline="Your layout's black box."
      description="Real-time telemetry, DCC command traces, device health, and serial port output. Know exactly what's happening on your layout at all times."
      features={[
        { icon: '📡', label: 'Live DCC Feed', description: 'See every DCC command as it hits the track in real time' },
        { icon: '🔌', label: 'Device Status', description: 'Connection health and last-seen time for every device' },
        { icon: '🖥️', label: 'Serial Monitor', description: 'Raw serial port output streamed live from the CommandStation' },
        { icon: '💊', label: 'System Health', description: 'CPU, memory, and connection status for the DEJA Server process' },
      ]}
      callout={{
        icon: '🔍',
        title: 'Real-time DCC command trace',
        body: 'Every command sent to your CommandStation is logged with timestamp, address, and decoded meaning.',
      }}
      mainScreenshot={{ src: '/screenshots/monitor_desktop_dashboard.png', alt: 'DEJA Monitor dashboard' }}
      pipScreenshot={{ src: '/screenshots/monitor_mobile_dashboard.png', alt: 'DEJA Monitor mobile view' }}
      pipBorderColor="#06b6d4"
      logoPath="/monitor/icon-512.png"
      ctaHref="https://monitor.dejajs.com"
      docsHref="/monitor"
      flip={true}
      bgClass="bg-gray-950"
    >
      <div className="mb-8">
        <TerminalBlock title="dcc-feed" lines={dccFeedLines} />
      </div>
    </AppSpotlight>
  );
}
