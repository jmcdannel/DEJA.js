import Link from 'next/link';
import CopyButton from '../home/CopyButton';
import { mdiLaptop, mdiUsb } from '@mdi/js';

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="relative pl-14">
      <div className="absolute left-0 top-0 w-10 h-10 rounded-full border border-deja-lime/30 bg-deja-lime/10 flex items-center justify-center shrink-0">
        <span className="text-deja-lime font-bold text-sm font-mono">0{number}</span>
      </div>
      <h3 className="text-white font-bold text-xl mb-3">{title}</h3>
      <div className="text-gray-300 leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

function CommandBlock({ command }: { command: string }) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-950 overflow-hidden my-4">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-800 bg-gray-900">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-gray-500 text-xs font-mono">bash</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="text-deja-lime/60 font-mono text-sm select-none shrink-0">$</span>
        <span className="font-mono text-sm text-deja-lime flex-1 break-all">{command}</span>
        <CopyButton text={command} />
      </div>
    </div>
  );
}

function TerminalOutput({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-950 overflow-hidden my-4">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-800 bg-gray-900">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-gray-500 text-xs font-mono">output</span>
      </div>
      <div className="px-4 py-3 font-mono text-sm text-gray-400 leading-relaxed whitespace-pre-line">
        {children}
      </div>
    </div>
  );
}

function Callout({ emoji, children }: { emoji: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 p-4 rounded-lg bg-deja-lime/5 border border-deja-lime/20 my-4">
      <span className="text-lg shrink-0">{emoji}</span>
      <div className="text-sm text-gray-300 leading-relaxed">{children}</div>
    </div>
  );
}

function MdiIcon({ path, className = '' }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d={path} fill="currentColor" />
    </svg>
  );
}

export default function ServerGuide() {
  return (
    <article className="max-w-3xl mx-auto">
      {/* Hero */}
      <header className="mb-12">
        <p className="text-deja-lime text-xs font-mono tracking-widest uppercase mb-3">Server Guide</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
          Your bridge to the track
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          The DEJA Server is a small program that runs on the computer connected to your
          CommandStation. It takes the commands you send from the Throttle, Cloud, and Monitor apps
          and passes them to your DCC-EX hardware over USB. You set it up once, and it runs
          quietly in the background while you focus on running trains.
        </p>
      </header>

      {/* Requirements */}
      <section className="mb-12 p-5 rounded-xl border border-gray-800 bg-gray-900/50">
        <h2 className="text-white font-semibold mb-3">What You&apos;ll Need</h2>
        <ul className="space-y-3 text-sm text-gray-300">
          <li className="flex items-center gap-3">
            <MdiIcon path={mdiLaptop} className="w-5 h-5 shrink-0 text-deja-lime" />
            <span>A <strong className="text-white">computer</strong> — Raspberry Pi, Mac, or Linux PC</span>
          </li>
          <li className="flex items-center gap-3">
            <MdiIcon path={mdiUsb} className="w-5 h-5 shrink-0 text-amber-400" />
            <span>A <strong className="text-white">USB cable</strong> connecting your CommandStation to the computer</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-5 h-5 shrink-0 flex items-center justify-center text-deja-cyan text-sm">⬡</span>
            <span>
              <strong className="text-white">Node.js 20</strong> — the installer will tell you if you need it
            </span>
          </li>
        </ul>
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-800">
          <span className="text-xs text-gray-500 mr-1 self-center">Supported platforms:</span>
          {[
            { emoji: '🍎', label: 'macOS' },
            { emoji: '🐧', label: 'Linux' },
            { emoji: '🍓', label: 'Raspberry Pi' },
            { emoji: '🪟', label: 'Windows (via WSL)' },
          ].map((p) => (
            <span key={p.label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-xs text-gray-300">
              <span>{p.emoji}</span> {p.label}
            </span>
          ))}
        </div>
      </section>

      {/* Steps */}
      <div className="space-y-12">
        {/* Step 1 — Install */}
        <Step number={1} title="Install the Server">
          <p>
            Open a terminal on the computer connected to your CommandStation and run this one command:
          </p>
          <CommandBlock command="curl -fsSL https://install.dejajs.com | bash" />
          <p className="text-sm">
            That&apos;s it — the installer handles everything. It downloads the server, detects your
            CommandStation on USB, and gets things running. The whole process takes about a minute.
          </p>
          <Callout emoji="🍓">
            <p>
              <strong className="text-white">Raspberry Pi?</strong> DEJA Server runs great on a Pi 4 or 5.
              Just plug your CommandStation in via USB, open a terminal, and run the command above.
            </p>
          </Callout>
          <Callout emoji="🔗">
            <p>
              <strong className="text-white">Personalized install link:</strong> If you started from the{' '}
              <Link href="/guides/getting-started" className="text-deja-lime hover:underline">Getting Started</Link>{' '}
              guide, the onboarding wizard gives you a pre-configured install command with your Layout ID
              baked in — no extra setup needed.
            </p>
          </Callout>
          <p className="text-xs text-gray-500 mt-3">
            🪟 Windows users: install via{' '}
            <a href="https://learn.microsoft.com/en-us/windows/wsl/install" target="_blank" rel="noopener noreferrer" className="text-deja-lime hover:underline">WSL</a>,
            then run the command from a WSL terminal.
          </p>
        </Step>

        {/* Step 2 — Status */}
        <Step number={2} title="Check That It&apos;s Working">
          <p>
            Once the installer finishes, check that the server is running:
          </p>
          <CommandBlock command="deja status" />
          <p>
            You should see a green <span className="text-green-400 font-mono text-sm">●</span> next to{' '}
            <strong className="text-white">running</strong> — that means the server is connected to your
            CommandStation and ready to receive commands.
          </p>
          {/* TODO: screenshot — server_terminal_status.png */}
          <TerminalOutput>
            <span className="text-green-400">●</span> DEJA Server <span className="text-gray-500">v1.2.0</span>{'\n'}
            Status: <span className="text-green-400">running</span>{'\n'}
            Layout: <span className="text-white">My Railroad</span>{'\n'}
            Serial: <span className="text-white">/dev/ttyUSB0</span> <span className="text-gray-500">(115200 baud)</span>
          </TerminalOutput>
        </Step>

        {/* Step 3 — Logs */}
        <Step number={3} title="View Your Logs">
          <p>
            Want to see what the server is doing? Check the logs:
          </p>
          <CommandBlock command="deja logs" />
          <p>
            This shows recent activity — connections, commands sent to the track, and any errors.
            If you want to watch the logs in real time (handy for debugging), add the{' '}
            <code className="text-deja-lime font-mono text-xs">-f</code> flag:
          </p>
          <CommandBlock command="deja logs -f" />
          <p className="text-sm text-gray-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-xs text-gray-300">Ctrl+C</kbd> to
            stop watching. The server keeps running in the background — you&apos;re just closing the log viewer.
          </p>
        </Step>

        {/* Step 4 — Stop, Start & Restart */}
        <Step number={4} title="Stop, Start & Restart">
          <p>
            You&apos;ve got three commands for controlling the server. They do exactly what they say:
          </p>
          <div className="grid sm:grid-cols-3 gap-3 my-4">
            {[
              { cmd: 'deja stop', desc: 'Shut down the server', icon: '⏹' },
              { cmd: 'deja start', desc: 'Start it back up', icon: '▶️' },
              { cmd: 'deja restart', desc: 'Stop + start in one step', icon: '🔄' },
            ].map((item) => (
              <div key={item.cmd} className="p-4 rounded-lg bg-gray-900 border border-gray-800 text-center">
                <p className="text-lg mb-2">{item.icon}</p>
                <p className="text-deja-lime font-mono text-sm mb-1">{item.cmd}</p>
                <p className="text-gray-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
          <Callout emoji="💡">
            <p>
              By default, the server runs in the background so you can close the terminal and it keeps going.
              If you want to run it in the foreground (useful for debugging), start it without the{' '}
              <code className="text-deja-lime font-mono text-xs">-b</code> flag:{' '}
              <code className="text-deja-lime font-mono text-xs">deja start</code> runs in the background,
              while <code className="text-deja-lime font-mono text-xs">deja run</code> runs in the foreground.
            </p>
          </Callout>
        </Step>

        {/* Step 5 — Update */}
        <Step number={5} title="Keep It Updated">
          <p>
            When a new version is available, updating is one command:
          </p>
          <CommandBlock command="deja update" />
          <p>
            This downloads the latest version and restarts the server automatically. All your settings —
            layout ID, serial port, configuration — are preserved. Nothing to reconfigure.
          </p>
        </Step>

        {/* Step 6 — Remote Access */}
        <Step number={6} title="Monitor from Anywhere">
          <p>
            Want to check on your railroad when you&apos;re not on your home network? The tunnel command
            creates a secure connection so you can access your server remotely:
          </p>
          <CommandBlock command="deja tunnel start" />
          <p>
            This gives you a public URL that connects back to your server. Open it on any device,
            anywhere — your phone at work, a laptop at a friend&apos;s house, wherever.
          </p>
          <Callout emoji="🔒">
            <p>
              Remote access requires an{' '}
              <Link href="/pricing" className="text-deja-lime hover:underline">Engineer or Conductor plan</Link>.
              The connection is encrypted and only accessible with your DEJA account credentials.
            </p>
          </Callout>
          <p className="text-sm text-gray-400">
            For the full setup details, see the{' '}
            <Link href="/docs/server/remote-access" className="text-deja-lime hover:underline">Remote Access docs</Link>.
          </p>
        </Step>
      </div>

      {/* CLI Quick Reference */}
      <section className="mt-12 p-5 rounded-xl border border-gray-800 bg-gray-900/50">
        <h2 className="text-white font-semibold mb-3">CLI Quick Reference</h2>
        <p className="text-gray-400 text-sm mb-4">
          The <code className="text-deja-lime font-mono text-xs">deja</code> CLI is your control panel.
          Here&apos;s every command at a glance:
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm font-mono">
          {[
            ['deja start', 'Start the server (background)'],
            ['deja stop', 'Stop the server'],
            ['deja restart', 'Restart the server'],
            ['deja status', 'Check server status'],
            ['deja logs', 'View recent logs'],
            ['deja logs -f', 'Follow logs in real time'],
            ['deja run', 'Run in the foreground'],
            ['deja update', 'Update to latest version'],
            ['deja tunnel start', 'Start remote access tunnel'],
            ['deja tunnel stop', 'Stop the tunnel'],
            ['deja config', 'View current configuration'],
            ['deja version', 'Show installed version'],
          ].map(([cmd, desc]) => (
            <div key={cmd} className="p-3 rounded-lg bg-gray-900 border border-gray-800">
              <p className="text-deja-lime text-xs">{cmd}</p>
              <p className="text-gray-500 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          For the full CLI reference with all options and flags, see the{' '}
          <Link href="/docs/server/cli" className="text-deja-lime hover:underline">CLI Reference docs</Link>.
        </p>
      </section>

      {/* Troubleshooting */}
      <section className="mt-12">
        <h2 className="text-white font-bold text-xl mb-5">Troubleshooting</h2>
        <div className="space-y-3">
          {/* Issue 1 */}
          <details className="group rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
            <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-900 transition-colors">
              <span className="text-gray-500 group-open:rotate-90 transition-transform text-sm">▶</span>
              <span className="text-white font-medium text-sm">Server not connecting to CommandStation</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-300 space-y-2 border-t border-gray-800 pt-3">
              <p>1. Make sure the USB cable is plugged in to both the CommandStation and your computer.</p>
              <p>2. Run <code className="text-deja-lime font-mono text-xs">deja status</code> to see if the server detects a serial port.</p>
              <p>3. Try <code className="text-deja-lime font-mono text-xs">deja restart</code> — the server re-scans for devices on startup.</p>
            </div>
          </details>

          {/* Issue 2 */}
          <details className="group rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
            <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-900 transition-colors">
              <span className="text-gray-500 group-open:rotate-90 transition-transform text-sm">▶</span>
              <span className="text-white font-medium text-sm">Permission denied on serial port</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-300 space-y-2 border-t border-gray-800 pt-3">
              <p>On Linux and Raspberry Pi, your user needs permission to access serial devices. Run this once:</p>
              <CommandBlock command="sudo usermod -a -G dialout $USER" />
              <p>Then log out and back in (or reboot) for the change to take effect.</p>
            </div>
          </details>

          {/* Issue 3 */}
          <details className="group rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
            <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-900 transition-colors">
              <span className="text-gray-500 group-open:rotate-90 transition-transform text-sm">▶</span>
              <span className="text-white font-medium text-sm">Server won&apos;t start</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-300 space-y-2 border-t border-gray-800 pt-3">
              <p>1. Check that Node.js 20+ is installed: <code className="text-deja-lime font-mono text-xs">node --version</code></p>
              <p>2. Check the logs for error details: <code className="text-deja-lime font-mono text-xs">deja logs</code></p>
              <p>3. Try reinstalling: <code className="text-deja-lime font-mono text-xs">curl -fsSL https://install.dejajs.com | bash</code></p>
            </div>
          </details>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Still stuck? Check the{' '}
          <Link href="/docs/server/troubleshooting" className="text-deja-lime hover:underline">full troubleshooting guide</Link>{' '}
          or reach out on{' '}
          <a href="https://discord.gg/dejajs" target="_blank" rel="noopener noreferrer" className="text-deja-lime hover:underline">Discord</a>.
        </p>
      </section>

      {/* What's Next */}
      <section className="mt-16 pt-8 border-t border-gray-800">
        <h2 className="text-white font-bold text-xl mb-2">What&apos;s Next?</h2>
        <p className="text-gray-400 text-sm mb-5">
          Your server is up and running — here&apos;s where to go from here.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Open the Throttle', desc: 'Take control of your trains from any device', href: '/guides/getting-started' },
            { label: 'Manage Your Layout', desc: 'Roster, turnouts, routes, and effects in one place', href: '/guides/cloud' },
            { label: 'Monitor Your Railroad', desc: 'Diagnostics, command logs, and device health', href: '/docs/monitor' },
            { label: 'CLI Reference', desc: 'Every command, flag, and option explained', href: '/docs/server/cli' },
          ].map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="p-4 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-deja-lime/40 hover:bg-gray-900 transition-all group"
            >
              <p className="text-white font-semibold group-hover:text-deja-lime transition-colors">{item.label} →</p>
              <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
