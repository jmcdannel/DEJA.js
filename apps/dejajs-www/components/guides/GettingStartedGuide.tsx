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

function Table({ rows }: { rows: [string, string][] }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse">
        <tbody>
          {rows.map(([label, value], i) => (
            <tr key={i} className="border-b border-gray-800">
              <td className="py-2 pr-4 text-gray-400 font-mono whitespace-nowrap">{label}</td>
              <td className="py-2 text-gray-300">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GettingStartedGuide() {
  return (
    <article className="max-w-3xl mx-auto">
      <header className="mb-12">
        <p className="text-deja-cyan text-xs font-mono tracking-widest uppercase mb-3">Getting Started</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
          From zero to running trains
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          By the end of this guide your DCC-EX CommandStation will be connected to DEJA.js and you&apos;ll
          be driving trains from any browser on your network.
        </p>
      </header>

      {/* Requirements */}
      <section className="mb-12 p-5 rounded-xl border border-gray-800 bg-gray-900/50">
        <h2 className="text-white font-semibold mb-3">What You Need</h2>
        <Table rows={[
          ['Node.js v20+', 'Install via nvm or nodejs.org'],
          ['DCC-EX CommandStation', 'Arduino Mega running DCC-EX EX-CommandStation firmware'],
          ['USB cable', 'Connecting the CommandStation to your computer'],
        ]} />
        <p className="text-xs text-gray-500 font-mono mt-2">
          Confirm Node.js: <span className="text-deja-lime">node --version</span> should print v20.x.x or higher
        </p>
      </section>

      {/* Steps */}
      <div className="space-y-12">
        <Step number={1} title="Sign Up">
          <p>Create your free DEJA Cloud account — no credit card required.</p>
          <ol className="list-decimal list-inside space-y-1.5 ml-2 text-sm">
            <li>Go to <a href="https://cloud.dejajs.com" target="_blank" rel="noopener noreferrer" className="text-deja-cyan hover:underline">cloud.dejajs.com</a> and click <strong>Sign Up</strong></li>
            <li>Sign in with <strong>Google</strong>, <strong>GitHub</strong>, or <strong>email and password</strong></li>
            <li>The onboarding wizard starts automatically</li>
          </ol>
        </Step>

        <Step number={2} title="Choose a Plan">
          <p>Pick the tier that fits your layout. Hobbyist is completely free. Paid plans include a 14-day free trial.</p>
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 pr-4 text-gray-400"></th>
                  <th className="text-left py-2 pr-4 text-gray-300 font-semibold">Hobbyist</th>
                  <th className="text-left py-2 pr-4 text-gray-300 font-semibold">Engineer</th>
                  <th className="text-left py-2 text-gray-300 font-semibold">Conductor</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Price', 'Free', '$7/mo', '$18/mo'],
                  ['Locomotives', '5', '25', 'Unlimited'],
                  ['Layouts', '1', '2', 'Unlimited'],
                  ['Turnouts / Signals / Effects', '—', '15 each', 'Unlimited'],
                  ['Tour App', '—', '—', 'Included'],
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
        </Step>

        <Step number={3} title="Register Your Layout">
          <p>Give your layout a name and a unique ID. This is how DEJA.js organizes your locomotives, turnouts, effects, and all other configuration.</p>
          <p className="text-sm text-gray-400 p-3 rounded-lg bg-gray-900 border border-gray-800">
            After this step the wizard shows your <code className="text-deja-lime font-mono text-xs">LAYOUT_ID</code> and Firebase credentials.
            Copy these — you&apos;ll need them in Step 4. You can always find them later in <strong>DEJA Cloud → Settings → View Local Environment Configuration</strong>.
          </p>
        </Step>

        <Step number={4} title="Install the Server">
          <p>Open a terminal on the machine connected to your DCC-EX CommandStation and run one command:</p>
          <CommandBlock command="curl -fsSL https://install.dejajs.com | bash" />
          <p className="text-sm">The install script will:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
            <li>Check for Node.js 20+ (provides install instructions if missing)</li>
            <li>Prompt for your account credentials (from Step 3)</li>
            <li>Detect your serial ports for the DCC-EX CommandStation</li>
            <li>Download and install the DEJA Server</li>
            <li>Start the server automatically</li>
          </ol>
          <p className="text-xs text-gray-500 mt-3">
            Windows users: install via <a href="https://learn.microsoft.com/en-us/windows/wsl/install" target="_blank" rel="noopener noreferrer" className="text-deja-cyan hover:underline">WSL</a>, then run the command above from a WSL terminal.
          </p>
        </Step>

        <Step number={5} title="Register Your CommandStation">
          <ol className="list-decimal list-inside space-y-1.5 ml-2 text-sm">
            <li>In <a href="https://cloud.dejajs.com" target="_blank" rel="noopener noreferrer" className="text-deja-cyan hover:underline">DEJA Cloud</a>, open your layout</li>
            <li>Go to <strong>Devices</strong> and click <strong>Add</strong></li>
            <li>Select <strong>DCC-EX CommandStation → USB → Submit</strong></li>
          </ol>
        </Step>

        <Step number={6} title="Manage the Server">
          <p>The install script starts the server automatically. Use the <code className="text-deja-lime font-mono text-xs">deja</code> CLI to manage it:</p>
          <div className="grid grid-cols-2 gap-2 my-4 text-sm font-mono">
            {[
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
        </Step>

        <Step number={7} title="Connect Hardware">
          <ol className="list-decimal list-inside space-y-1.5 ml-2 text-sm">
            <li>Open <a href="https://monitor.dejajs.com" target="_blank" rel="noopener noreferrer" className="text-deja-cyan hover:underline">DEJA Monitor</a> in a browser</li>
            <li>Find the <strong>DCC-EX CommandStation</strong> device card</li>
            <li>Select the USB port from the dropdown and click <strong>Connect</strong></li>
          </ol>
          <p className="text-sm text-gray-400 mt-3">
            <strong>Verify:</strong> The device card shows a green &ldquo;connected&rdquo; status and displays DCC-EX firmware version information.
          </p>
        </Step>

        <Step number={8} title="Drive Trains">
          <ol className="list-decimal list-inside space-y-1.5 ml-2 text-sm">
            <li>In <a href="https://cloud.dejajs.com" target="_blank" rel="noopener noreferrer" className="text-deja-cyan hover:underline">DEJA Cloud</a>, go to <strong>Roster</strong> and click <strong>Add Loco</strong> — enter the DCC address and a name</li>
            <li>Open <a href="https://throttle.dejajs.com" target="_blank" rel="noopener noreferrer" className="text-deja-cyan hover:underline">DEJA Throttle</a> on any device on your network</li>
            <li>Click the track power button to energize the track</li>
            <li>Select your locomotive and use the speed slider to drive</li>
          </ol>
        </Step>
      </div>

      {/* What's Next */}
      <section className="mt-16 pt-8 border-t border-gray-800">
        <h2 className="text-white font-bold text-xl mb-5">What&apos;s Next</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Throttle App', desc: 'Full guide to the train control interface', href: '/guides/throttle' },
            { label: 'Cloud App', desc: 'Roster management, turnouts, and effects', href: '/guides/cloud' },
            { label: 'Monitor App', desc: 'Diagnostics and real-time logging', href: '/guides/monitor' },
            { label: 'Server', desc: 'Backend configuration and CLI reference', href: '/guides/server' },
          ].map((item) => (
            <Link
              key={item.href}
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
