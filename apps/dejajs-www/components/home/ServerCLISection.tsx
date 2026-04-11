import AnimateIn from './AnimateIn';
import SectionLabel from './SectionLabel';
import TerminalBlock from './TerminalBlock';

const features = [
  { icon: '🔌', text: 'USB serial bridge to DCC-EX CommandStation at 115,200 baud' },
  { icon: '🌐', text: 'WebSocket server for real-time browser ↔ hardware communication' },
  { icon: '☁️', text: 'DEJA Cloud sync — layout commands flow from cloud to track instantly' },
  { icon: '🔄', text: 'Self-updating via deja update — always on the latest version' },
];

const platforms = ['macOS', 'Linux', 'Raspberry Pi'];

const installLines = [
  { type: 'command' as const, text: 'curl -fsSL https://install.dejajs.com | bash' },
  { type: 'output' as const, text: 'Downloading DEJA Server v1.2.0...' },
  { type: 'output' as const, text: 'Installing dependencies...' },
  { type: 'success' as const, text: 'DEJA Server v1.2.0 installed' },
  { type: 'output' as const, text: '' },
  { type: 'info' as const, text: 'Starting server...' },
  { type: 'success' as const, text: 'Server running on ws://localhost:8082' },
  { type: 'success' as const, text: 'CommandStation connected on /dev/ttyUSB0' },
  { type: 'info' as const, text: 'Signed in · Layout: Pittsburg & Shasta 1:87' },
];

const cliLines = [
  { type: 'command' as const, text: 'deja start      # Start the server' },
  { type: 'command' as const, text: 'deja stop       # Stop the server' },
  { type: 'command' as const, text: 'deja restart    # Restart the server' },
  { type: 'command' as const, text: 'deja update     # Update to latest version' },
  { type: 'command' as const, text: 'deja status     # Check server health' },
  { type: 'command' as const, text: 'deja logs       # Stream server logs' },
  { type: 'command' as const, text: 'deja init       # Re-initialize layout' },
];

export default function ServerCLISection() {
  return (
    <section className="bg-slate-900/70 py-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left column */}
        <AnimateIn direction="left">
          <div className="space-y-6">
            <SectionLabel color="magenta">Server + CLI</SectionLabel>

            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              One command.{' '}
              <span className="block text-deja-magenta">Everything connected.</span>
            </h2>

            <p className="text-gray-400 text-lg leading-relaxed">
              The DEJA Server is a lightweight Node.js process that bridges your DCC-EX
              CommandStation to the cloud. Install it once, start it with a single command,
              and your entire layout — throttles, turnouts, signals, effects — is live.
            </p>

            <ul className="space-y-3">
              {features.map(({ icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-gray-300">
                  <span className="text-xl leading-tight mt-0.5">{icon}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            {/* Platform pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {platforms.map((platform) => (
                <span
                  key={platform}
                  className="px-3 py-1 rounded-full border border-deja-magenta/30 bg-deja-magenta/5 text-deja-magenta text-xs font-semibold tracking-wide"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </AnimateIn>

        {/* Right column — two stacked terminals */}
        <AnimateIn direction="right" delay={0.15}>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-mono text-gray-500 mb-2 pl-1">install</p>
              <TerminalBlock title="bash" lines={installLines} />
            </div>
            <div>
              <p className="text-xs font-mono text-gray-500 mb-2 pl-1">deja cli</p>
              <TerminalBlock title="deja" lines={cliLines} />
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
