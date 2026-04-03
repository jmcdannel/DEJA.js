import Link from 'next/link';
import Image from 'next/image';
import { mdiUsb } from '@mdi/js';
import { Callout, CommandBlock, Step, MdiIcon } from './shared';
import DocLink from '../DocLink';

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

      {/* Video placeholder */}
      <div className="mb-12 rounded-2xl border border-gray-800 bg-gray-900/50 overflow-hidden shadow-2xl">
        <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-gray-900/80">
          <div className="w-16 h-16 rounded-full border-2 border-deja-lime/30 bg-deja-lime/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-deja-lime ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">Video walkthrough coming soon</p>
        </div>
      </div>

      {/* Prerequisites */}
      <section className="mb-12 p-5 rounded-xl border border-gray-800 bg-gray-900/50">
        <h2 className="text-white font-semibold mb-3">Before You Start</h2>
        <p className="text-sm text-gray-300 mb-4">
          This guide assumes you&apos;ve already{' '}
          <a href="https://cloud.dejajs.com" target="_blank" rel="noopener noreferrer" className="text-deja-cyan hover:underline">signed up</a>
          {' '}and completed the onboarding steps, which includes installing the server. If you haven&apos;t
          done that yet, head to the{' '}
          <Link href="/guides/getting-started" className="text-deja-cyan hover:underline">Getting Started guide</Link>
          {' '}first — it only takes a few minutes.
        </p>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-900 border border-gray-800">
          <MdiIcon path={mdiUsb} className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <p className="text-sm text-gray-300">
            Make sure your <strong className="text-white">DCC-EX CommandStation is connected via USB</strong> to
            the computer running the server. That&apos;s all you need.
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          For platform compatibility and system requirements, see the{' '}
          <DocLink href="/docs/server/installation">Installation</DocLink>.
        </p>
      </section>

      {/* Steps */}
      <div className="space-y-12">
        {/* Step 1 — Meet the CLI */}
        <Step number={1} title="Meet the deja Server CLI">
          <p>
            The DEJA Server comes with a simple command-line tool called <code className="text-deja-lime font-mono text-xs">deja</code>.
            Think of it like a remote control for your server — you type a short command,
            and the server does the rest.
          </p>
          <p>
            You don&apos;t need to be a computer expert to use it. There are only a handful of
            commands, and they all do exactly what their names say:{' '}
            <code className="text-deja-lime font-mono text-xs">deja start</code>,{' '}
            <code className="text-deja-lime font-mono text-xs">deja stop</code>,{' '}
            <code className="text-deja-lime font-mono text-xs">deja status</code>.
            That&apos;s the kind of thing we&apos;re talking about — nothing complicated.
          </p>
          <Callout emoji="💡">
            <p>
              To use these commands, open a <strong className="text-white">terminal</strong> on the computer
              connected to your CommandStation. On a Mac, search for &quot;Terminal&quot; in Spotlight.
              On a Raspberry Pi or Linux, it&apos;s usually in your applications menu.
              Type the command, press Enter, and you&apos;re done.
            </p>
          </Callout>
        </Step>

        {/* Step 2 — Starting the Server */}
        <Step number={2} title="Starting the Server">
          <p>
            When you type <code className="text-deja-lime font-mono text-xs">deja start</code>, the server
            launches and you&apos;ll see a live console scrolling with status updates as it connects
            to your CommandStation, Firebase, and any other services.
          </p>
          <CommandBlock command="deja start" />
          <Image src="/screenshots/server_terminal_start.png" alt="DEJA Server starting up — live console output showing connections being established" width={800} height={400} className="rounded-lg border border-gray-700 my-4" />
          <p>
            This is the default mode — the server runs right in your terminal so you can
            see exactly what&apos;s happening. Press{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-xs text-gray-300">Ctrl+C</kbd>
            {' '}when you want to stop it.
          </p>
          <Callout emoji="💡">
            <p>
              Want the server to run in the background so you can close the terminal?
              Add the <code className="text-deja-lime font-mono text-xs">-b</code> flag:{' '}
              <code className="text-deja-lime font-mono text-xs">deja start -b</code>
            </p>
          </Callout>
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
              Remember: <code className="text-deja-lime font-mono text-xs">deja start</code> runs in the foreground
              by default (you&apos;ll see the live console). Add{' '}
              <code className="text-deja-lime font-mono text-xs">-b</code> to run in the background.
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
            <DocLink href="/docs/server/remote-access">Remote Access</DocLink>.
          </p>
        </Step>
      </div>

      {/* Inside the CLI */}
      <section className="mt-12">
        <h2 className="text-white font-bold text-xl mb-2">Inside the Server Console</h2>
        <p className="text-gray-400 text-sm mb-6">
          When the server is running in the foreground, you&apos;re inside an interactive console.
          You can type commands right at the prompt — no need to stop and restart. Here&apos;s what&apos;s
          available.
        </p>

        {/* Slash Commands */}
        <div className="mb-8">
          <h3 className="text-white font-semibold text-lg mb-3">Slash Commands</h3>
          {/* TODO: screenshot — server_terminal_help.png (output of /help command) */}
          <p className="text-gray-400 text-sm mb-4">
            Type a <code className="text-deja-lime font-mono text-xs">/</code> followed by a command name.
            You can also press <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-xs text-gray-300">Tab</kbd> to
            autocomplete, or type <code className="text-deja-lime font-mono text-xs">/help</code> to see the full list.
          </p>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            {[
              { cat: 'Server', cmds: [
                ['/start', '', 'Start the server'],
                ['/stop', '', 'Stop the server and exit'],
                ['/restart', '/r', 'Restart the server'],
                ['/quit', '/q', 'Exit the console (server keeps running)'],
              ]},
              { cat: 'Navigation', cmds: [
                ['/menu', '/m', 'Open the interactive menu'],
                ['/status', '/s', 'Show the status panel'],
                ['/logs', '/l', 'Show the log view'],
                ['/ports', '/p', 'Show serial port selector'],
              ]},
              { cat: 'Devices', cmds: [
                ['/devices', '/d', 'Show device dialog and manage connections'],
                ['/connect', '/c', 'Connect a device by name'],
                ['/disconnect', '/dc', 'Disconnect a device by name'],
              ]},
              { cat: 'Tools', cmds: [
                ['/help', '/h', 'Show all available commands'],
                ['/filter', '/f', 'Cycle log filter (all → error → warn)'],
                ['/tunnel', '/t', 'Toggle remote access tunnel'],
              ]},
            ].map((group) => (
              <div key={group.cat} className="rounded-lg border border-gray-800 bg-gray-900/50 overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-800 bg-gray-900">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{group.cat}</p>
                </div>
                <div className="px-3 py-2 space-y-1.5">
                  {group.cmds.map(([cmd, shorthand, desc]) => (
                    <div key={cmd} className="flex items-baseline gap-2">
                      <code className="text-deja-lime font-mono text-xs shrink-0">{cmd}</code>
                      {shorthand && <code className="text-gray-600 font-mono text-xs shrink-0">{shorthand}</code>}
                      <span className="text-gray-500 text-xs">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div className="mb-8">
          <h3 className="text-white font-semibold text-lg mb-3">The Menu</h3>
          <p className="text-gray-400 text-sm mb-3">
            Type <code className="text-deja-lime font-mono text-xs">/menu</code> (or just press{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-xs text-gray-300">Esc</kbd>)
            to open a visual menu. Use the arrow keys to navigate and{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-xs text-gray-300">Enter</kbd>
            {' '}to select. It&apos;s another way to access everything above without remembering command names.
          </p>
          {/* TODO: screenshot — server_terminal_menu.png */}
          {/* TODO: screenshot — server_terminal_status_panel.png (the /status view) */}
          {/* TODO: screenshot — server_terminal_ports.png (the /ports serial port selector) */}
        </div>

        {/* DCC Passthrough */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-3">DCC Commands</h3>
          <p className="text-gray-400 text-sm">
            You can also type raw DCC-EX commands directly at the prompt — they&apos;re sent
            straight to your CommandStation. For example, type{' '}
            <code className="text-deja-lime font-mono text-xs">{'<1>'}</code> to turn track power on.
            See the{' '}
            <DocLink href="/docs/server/cli">CLI Reference</DocLink>
            {' '}for more details.
          </p>
        </div>

        {/* Reading the Console */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-3">Reading the Console Output</h3>
          <p className="text-gray-400 text-sm mb-4">
            Each line in the console follows the same format. Here&apos;s what each part means:
          </p>
          <div className="rounded-lg border border-gray-700 bg-gray-950 overflow-hidden mb-4">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-800 bg-gray-900">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              <span className="ml-2 text-gray-500 text-xs font-mono">message types</span>
            </div>
            <div className="px-4 py-3 space-y-1 font-mono text-xs leading-relaxed">
              {[
                { icon: '▶', color: 'text-green-400', level: 'start', levelColor: 'text-green-400', msg: 'A service or process is launching' },
                { icon: '✔', color: 'text-green-400', level: 'success', levelColor: 'text-green-400', msg: 'Something connected or completed' },
                { icon: '✔', color: 'text-green-400', level: 'complete', levelColor: 'text-green-400', msg: 'A task finished (port opened, layout loaded)' },
                { icon: '●', color: 'text-blue-400', level: 'note', levelColor: 'text-blue-400', msg: 'Configuration detail or status update' },
                { icon: 'ℹ', color: 'text-blue-400', level: 'info', levelColor: 'text-blue-400', msg: 'Something happened, no action needed' },
                { icon: '★', color: 'text-yellow-400', level: 'star', levelColor: 'text-yellow-400', msg: 'A DCC command was sent to the track' },
                { icon: '⚠', color: 'text-yellow-400', level: 'warn', levelColor: 'text-yellow-400', msg: 'Non-critical issue — server keeps running' },
                { icon: '✖', color: 'text-red-400', level: 'error', levelColor: 'text-red-400', msg: 'Something went wrong' },
                { icon: '✖', color: 'text-red-400', level: 'fatal', levelColor: 'text-red-400', msg: 'Critical error — server may need a restart' },
              ].map((row) => (
                <div key={row.level} className="flex items-baseline">
                  <span className="text-gray-600 shrink-0">[DEJA.JS] › </span>
                  <span className={`${row.color} shrink-0`}>{row.icon}  </span>
                  <span className={`${row.levelColor} shrink-0 w-20 inline-block`}>{row.level}</span>
                  <span className="text-gray-400">{row.msg}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500">
            For a complete guide to every message — startup sequence, DCC commands, shutdown, and common errors — see the{' '}
            <DocLink href="/docs/server/cli#understanding-console-output">Console Output reference</DocLink>.
          </p>
        </div>
      </section>

      {/* CLI Quick Reference */}
      <section className="mt-12 p-5 rounded-xl border border-gray-800 bg-gray-900/50">
        <h2 className="text-white font-semibold mb-3">CLI Quick Reference</h2>
        <p className="text-gray-400 text-sm mb-4">
          The <code className="text-deja-lime font-mono text-xs">deja</code> CLI is your control panel.
          Here&apos;s every command at a glance:
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm font-mono">
          {[
            ['deja start', 'Start the server'],
            ['deja start -b', 'Start in background'],
            ['deja stop', 'Stop the server'],
            ['deja restart', 'Restart the server'],
            ['deja status', 'Check server status'],
            ['deja logs', 'View recent logs'],
            ['deja logs -f', 'Follow logs live'],
            ['deja update', 'Update to latest version'],
            ['deja tunnel start', 'Start remote access'],
            ['deja tunnel stop', 'Stop remote access'],
            ['deja tunnel status', 'Check tunnel status'],
            ['deja --version', 'Show installed version'],
          ].map(([cmd, desc]) => (
            <div key={cmd} className="p-3 rounded-lg bg-gray-900 border border-gray-800">
              <p className="text-deja-lime text-xs">{cmd}</p>
              <p className="text-gray-500 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          For the full CLI reference with all options and flags, see the{' '}
          <DocLink href="/docs/server/cli">CLI Reference</DocLink>.
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
          <DocLink href="/docs/server/troubleshooting">Troubleshooting</DocLink>{' '}
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
