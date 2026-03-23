import Link from 'next/link';
import CopyButton from '../home/CopyButton';

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="relative pl-14">
      <div className="absolute left-0 top-0 w-10 h-10 rounded-full border border-deja-cyan/30 bg-deja-cyan/10 flex items-center justify-center shrink-0">
        <span className="text-deja-cyan font-bold text-sm font-mono">0{number}</span>
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

function Callout({ emoji, children }: { emoji: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 p-4 rounded-lg bg-deja-cyan/5 border border-deja-cyan/20 my-4">
      <span className="text-lg shrink-0">{emoji}</span>
      <div className="text-sm text-gray-300 leading-relaxed">{children}</div>
    </div>
  );
}

function ArchitectureDiagram() {
  return (
    <div className="my-6 p-6 rounded-xl border border-gray-800 bg-gray-900/50">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-2xl">📱</div>
          <p className="text-white font-semibold text-sm">Your Devices</p>
          <p className="text-gray-500 text-xs">Phone, tablet, laptop</p>
        </div>
        <div className="text-gray-600 text-xl md:rotate-0 rotate-90">⟷</div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-xl bg-deja-cyan/10 border border-deja-cyan/30 flex items-center justify-center text-2xl">☁️</div>
          <p className="text-white font-semibold text-sm">DEJA Cloud</p>
          <p className="text-gray-500 text-xs">Real-time sync</p>
        </div>
        <div className="text-gray-600 text-xl md:rotate-0 rotate-90">⟷</div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-xl bg-deja-lime/10 border border-deja-lime/30 flex items-center justify-center text-2xl">🖥️</div>
          <p className="text-white font-semibold text-sm">DEJA Server</p>
          <p className="text-gray-500 text-xs">Your Pi or computer</p>
        </div>
        <div className="text-gray-600 text-xl md:rotate-0 rotate-90">⟷</div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl">🚂</div>
          <p className="text-white font-semibold text-sm">CommandStation</p>
          <p className="text-gray-500 text-xs">DCC-EX via USB</p>
        </div>
      </div>
    </div>
  );
}

export default function GettingStartedGuide() {
  return (
    <article className="max-w-3xl mx-auto">
      <header className="mb-12">
        <p className="text-deja-cyan text-xs font-mono tracking-widest uppercase mb-3">Getting Started</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
          You&apos;ll be running trains in minutes
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          DEJA.js is the new DCC platform — built for today&apos;s devices, designed to replace outdated
          interfaces with something you&apos;ll actually enjoy using. Browser-based, multi-device,
          cloud-synced. Here&apos;s how to get started.
        </p>
      </header>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="text-white font-semibold text-lg mb-3">How It Works</h2>
        <p className="text-gray-400 text-sm mb-4">
          Three pieces work together to control your railroad. You probably already have the first one.
        </p>
        <ArchitectureDiagram />
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
            <p className="text-white font-semibold mb-1">🚂 CommandStation</p>
            <p className="text-gray-500">The DCC-EX hardware you already have — Arduino Mega + Motor Shield</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
            <p className="text-white font-semibold mb-1">🖥️ DEJA Server</p>
            <p className="text-gray-500">Runs on the machine connected to your CommandStation via USB</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
            <p className="text-white font-semibold mb-1">📱 DEJA Apps</p>
            <p className="text-gray-500">Open in any browser — phone, tablet, laptop. All stay in sync.</p>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="mb-12 p-5 rounded-xl border border-gray-800 bg-gray-900/50">
        <h2 className="text-white font-semibold mb-3">What You&apos;ll Need</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-deja-cyan mt-0.5">✓</span>
            <span>A <strong className="text-white">DCC-EX CommandStation</strong> (Arduino Mega + Motor Shield)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-deja-cyan mt-0.5">✓</span>
            <span>A <strong className="text-white">computer</strong> to run the server — Raspberry Pi, Mac, or Linux</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-deja-cyan mt-0.5">✓</span>
            <span>A <strong className="text-white">phone, tablet, or laptop</strong> to control your trains</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-deja-cyan mt-0.5">✓</span>
            <span>About <strong className="text-white">5 minutes</strong></span>
          </li>
        </ul>
      </section>

      {/* Steps */}
      <div className="space-y-12">
        <Step number={1} title="Create Your Account">
          <p>
            Head to <a href="https://cloud.dejajs.com" target="_blank" rel="noopener noreferrer" className="text-deja-cyan hover:underline">cloud.dejajs.com</a> and
            sign up with Google, GitHub, or email. It takes about 10 seconds.
          </p>
          <p>The onboarding wizard walks you through everything from here — you won&apos;t need to leave the browser until it&apos;s time to install the server.</p>
        </Step>

        <Step number={2} title="Pick a Plan">
          <p>
            The <strong className="text-white">free Hobbyist plan</strong> gets you started with up to 5 locomotives — no credit card, no commitment.
            Upgrade anytime to unlock turnouts, effects, signals, and more.
          </p>
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 pr-4 text-gray-400"></th>
                  <th className="text-left py-2 pr-4 text-deja-cyan font-semibold">Hobbyist</th>
                  <th className="text-left py-2 pr-4 text-gray-300 font-semibold">Engineer</th>
                  <th className="text-left py-2 text-gray-300 font-semibold">Conductor</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Price', 'Free', '$7/mo', '$18/mo'],
                  ['Locomotives', '5', '25', 'Unlimited'],
                  ['Turnouts / Signals / Effects', '—', '15 each', 'Unlimited'],
                  ['Devices', '1 (default)', '5', 'Unlimited'],
                  ['Remote Access', '—', '✓', '✓'],
                ].map(([label, h, e, c]) => (
                  <tr key={label} className="border-b border-gray-800">
                    <td className="py-2 pr-4 text-gray-400">{label}</td>
                    <td className="py-2 pr-4 text-gray-300">{h}</td>
                    <td className="py-2 pr-4 text-gray-300">{e}</td>
                    <td className="py-2 text-gray-300">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">Paid plans include a 14-day free trial. See the <Link href="/pricing" className="text-deja-cyan hover:underline">full comparison</Link> for details.</p>
        </Step>

        <Step number={3} title="Name Your Layout">
          <p>
            Give your layout a name and a unique ID. This is how DEJA.js organizes everything —
            your roster, turnout positions, effects, and settings all live under this layout.
          </p>
          <Callout emoji="💡">
            <p>You can create multiple layouts later if you have more than one railroad (paid plans).</p>
          </Callout>
        </Step>

        <Step number={4} title="Install the Server">
          <p>
            Open a terminal on the machine connected to your CommandStation and run one command:
          </p>
          <CommandBlock command="curl -fsSL https://install.dejajs.com | bash" />
          <p className="text-sm">
            The script handles everything — downloads the server, detects your CommandStation,
            and connects automatically. While it installs, you can start adding locomotives
            to your roster right in the browser.
          </p>
          <Callout emoji="🍓">
            <p>
              <strong className="text-white">Raspberry Pi?</strong> DEJA Server runs great on a Pi 4 or 5.
              Just plug your CommandStation in via USB and run the command above.
            </p>
          </Callout>
          <p className="text-xs text-gray-500 mt-3">
            Windows users: install via{' '}
            <a href="https://learn.microsoft.com/en-us/windows/wsl/install" target="_blank" rel="noopener noreferrer" className="text-deja-cyan hover:underline">WSL</a>,
            then run the command from a WSL terminal.
          </p>
        </Step>

        <Step number={5} title="Add Your First Locomotive">
          <p>
            While the server installs, add a locomotive to your roster.
            You just need the <strong className="text-white">DCC address</strong> (usually printed on the decoder)
            and a <strong className="text-white">name</strong>.
          </p>
          <Callout emoji="🔢">
            <p>
              Not sure of the address? Most new decoders default to <strong className="text-white">address 3</strong>.
              You can always change it later.
            </p>
          </Callout>
        </Step>

        <Step number={6} title="Open the Throttle & Drive">
          <p>
            Once the server connects, open{' '}
            <a href="https://throttle.dejajs.com" target="_blank" rel="noopener noreferrer" className="text-deja-cyan hover:underline">throttle.dejajs.com</a>
            {' '}on any device — your phone, a tablet, your laptop. Select your locomotive,
            turn on track power, and drive. 🚂
          </p>
          <p>
            Everything syncs in real time. Open the throttle on multiple devices and they all
            stay in perfect sync — change the speed on your phone, see it update on your tablet instantly.
          </p>
        </Step>
      </div>

      {/* Server Management */}
      <section className="mt-12 p-5 rounded-xl border border-gray-800 bg-gray-900/50">
        <h2 className="text-white font-semibold mb-3">Managing Your Server</h2>
        <p className="text-gray-400 text-sm mb-4">
          The <code className="text-deja-lime font-mono text-xs">deja</code> CLI manages your server. Here are the commands you&apos;ll use most:
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm font-mono">
          {[
            ['deja start', 'Start the server'],
            ['deja stop', 'Stop the server'],
            ['deja status', 'Check server status'],
            ['deja logs', 'View server logs'],
            ['deja restart', 'Restart the server'],
            ['deja update', 'Update to latest version'],
          ].map(([cmd, desc]) => (
            <div key={cmd} className="p-3 rounded-lg bg-gray-900 border border-gray-800">
              <p className="text-deja-lime text-xs">{cmd}</p>
              <p className="text-gray-500 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What's Next */}
      <section className="mt-16 pt-8 border-t border-gray-800">
        <h2 className="text-white font-bold text-xl mb-2">What&apos;s Next?</h2>
        <p className="text-gray-400 text-sm mb-5">
          You&apos;re driving trains — nice. Here&apos;s where it gets even better.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Add More Locos', desc: 'Build out your roster with names, road numbers, and functions', href: '/guides/cloud' },
            { label: 'Upgrade Your Plan', desc: 'Unlock turnouts, effects, signals, sounds, and more', href: '/pricing' },
            { label: 'Explore the Cloud Dashboard', desc: 'Manage your layout, devices, and settings', href: '/guides/cloud' },
            { label: 'Connect IO Devices', desc: 'Expand with Arduino and Pico W for lights, sounds, and servos', href: '/guides/architecture' },
          ].map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="p-4 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-deja-cyan/40 hover:bg-gray-900 transition-all group"
            >
              <p className="text-white font-semibold group-hover:text-deja-cyan transition-colors">{item.label} →</p>
              <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
