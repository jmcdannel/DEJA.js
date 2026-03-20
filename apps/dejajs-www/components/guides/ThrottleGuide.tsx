import Image from 'next/image';
import Link from 'next/link';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="scroll-mt-24">
      <h2 className="text-white font-bold text-2xl mb-4">{title}</h2>
      <div className="text-gray-300 leading-relaxed space-y-4">{children}</div>
    </section>
  );
}

function Screenshot({ src, alt, device }: { src: string; alt: string; device: 'mobile' | 'desktop' }) {
  return (
    <div className={`my-6 rounded-xl border border-gray-800 overflow-hidden bg-gray-900/50 ${device === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-800 bg-gray-900">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-gray-500 text-xs font-mono">{device}</span>
      </div>
      <Image
        src={src}
        alt={alt}
        width={device === 'mobile' ? 390 : 1200}
        height={device === 'mobile' ? 844 : 675}
        className="w-full h-auto"
      />
    </div>
  );
}

function DocLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <p className="text-sm">
      <Link href={href} className="text-deja-cyan hover:underline">
        {children} →
      </Link>
    </p>
  );
}

function VideoPlaceholder() {
  return (
    <div className="my-8 rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
      <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-gray-900/80">
        <div className="w-16 h-16 rounded-full border-2 border-deja-cyan/30 bg-deja-cyan/10 flex items-center justify-center">
          <svg className="w-6 h-6 text-deja-cyan ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <p className="text-gray-400 text-sm">Video walkthrough coming soon</p>
      </div>
    </div>
  );
}

export default function ThrottleGuide() {
  return (
    <article className="max-w-3xl mx-auto">
      <header className="mb-12">
        <p className="text-deja-cyan text-xs font-mono tracking-widest uppercase mb-3">Guide</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
          Throttle
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Walk through a complete session — connect to your command station, add a locomotive,
          control speed and direction, throw turnouts, fire routes, and trigger effects.
        </p>
      </header>

      {/* Hero video */}
      <section className="mb-12">
        <p className="text-gray-400 mb-2">Prefer to watch? Here&apos;s the full walkthrough.</p>
        <VideoPlaceholder />
      </section>

      {/* Prerequisites */}
      <section className="mb-12 p-5 rounded-xl border border-gray-800 bg-gray-900/50">
        <h2 className="text-white font-semibold mb-3">Before You Begin</h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          Make sure you&apos;ve completed the{' '}
          <Link href="/guides/getting-started" className="text-deja-cyan hover:underline">Getting Started</Link>{' '}
          guide — your server should be running and your command station connected.
        </p>
      </section>

      <div className="space-y-16">
        <Section title="Connect">
          <p>
            Open Throttle in your browser. The home screen shows the connection status
            of your command station. When the server is running and connected, the status
            indicator turns green.
          </p>
          <Screenshot src="/screenshots/throttle_mobile_home.png" alt="Throttle home screen showing connection status" device="mobile" />
          <DocLink href="/docs/throttle/connect">Connection setup reference</DocLink>
        </Section>

        <Section title="Add a Locomotive">
          <p>
            Tap the <strong>+</strong> button on the throttle list to add a locomotive to your
            session. Enter the DCC address and a name. You can also assign an image and roadname.
          </p>
          <Screenshot src="/screenshots/throttle_desktop_add-loco.png" alt="Add locomotive dialog" device="desktop" />
          <DocLink href="/docs/throttle/roster">Roster reference</DocLink>
        </Section>

        <Section title="Select a Locomotive">
          <p>
            The throttle list shows all locomotives in your session. Tap a locomotive to open
            its throttle control screen.
          </p>
          <Screenshot src="/screenshots/throttle_desktop_throttle-list.png" alt="Throttle list with locomotives" device="desktop" />
          <DocLink href="/docs/throttle/throttle-list">Throttle list reference</DocLink>
        </Section>

        <Section title="Control Speed & Direction">
          <p>
            Use the speed controls to set your locomotive&apos;s speed. Tap the direction
            button to switch between forward and reverse. The speed display shows the current
            DCC speed value (0–126).
          </p>
          <Screenshot src="/screenshots/throttle_mobile_throttle.png" alt="Throttle control screen with speed controls" device="mobile" />
          <DocLink href="/docs/throttle/throttle">Throttle control reference</DocLink>
        </Section>

        <Section title="Use Functions">
          <p>
            Tap the function button to open the speed dial. Toggle decoder functions like
            headlights (F0), bell (F1), and horn (F2). Each function button shows its
            current state — on or off.
          </p>
          <Screenshot src="/screenshots/throttle_mobile_functions.png" alt="Function speed dial expanded" device="mobile" />
          <DocLink href="/docs/throttle/throttle">Functions reference</DocLink>
        </Section>

        <Section title="Throw Turnouts">
          <p>
            The turnouts view shows all configured turnouts on your layout. Tap a turnout
            to throw or close it. The color changes to indicate the current state.
          </p>
          <Screenshot src="/screenshots/throttle_desktop_turnouts.png" alt="Turnouts view with state indicators" device="desktop" />
          <DocLink href="/docs/throttle/turnouts">Turnouts reference</DocLink>
        </Section>

        <Section title="Fire a Route">
          <p>
            Routes execute a sequence of turnout changes with a single tap. Select a route
            from the list to run it. A progress bar shows the execution status as each
            turnout in the sequence is thrown.
          </p>
          <Screenshot src="/screenshots/throttle_desktop_routes.png" alt="Routes view with route list" device="desktop" />
          <DocLink href="/docs/throttle/routes">Routes reference</DocLink>
        </Section>

        <Section title="Try Effects">
          <p>
            Trigger sound and lighting effects on your layout. The effects view shows all
            available effects grouped by category. Tap an effect to activate it.
          </p>
          <Screenshot src="/screenshots/throttle_mobile_effects.png" alt="Effects view with available effects" device="mobile" />
          <DocLink href="/docs/throttle/effects">Effects reference</DocLink>
        </Section>
      </div>

      {/* What's Next */}
      <section className="mt-16 pt-8 border-t border-gray-800">
        <h2 className="text-white font-bold text-xl mb-5">What&apos;s Next</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Conductor Mode', desc: 'Full operator station with a three-pane layout', href: '/docs/throttle/conductor' },
            { label: 'Signals', desc: 'Monitor signal aspects across your layout', href: '/docs/throttle/signals' },
            { label: 'Settings', desc: 'Customize navigation, themes, and preferences', href: '/docs/throttle/settings' },
            { label: 'Home Screen', desc: 'Speedometer widgets and layout overview', href: '/docs/throttle/home' },
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
