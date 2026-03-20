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

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-sm text-gray-300">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="text-deja-cyan shrink-0">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CloudNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-lg border border-indigo-500/20 bg-indigo-950/20">
      <p className="text-xs text-indigo-400 font-mono tracking-wider uppercase mb-2">☁️ Configured in DEJA Cloud</p>
      <div className="text-sm text-gray-300 leading-relaxed">{children}</div>
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

function NavItem({ label, color, desc }: { label: string; color: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
      <span className="text-white text-sm font-medium">{label}</span>
      <span className="text-gray-500 text-xs">— {desc}</span>
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

        {/* ── Navigation Breakdown ── */}
        <Section title="Navigating the App">
          <p>
            Throttle has three navigation layers that are always available, no matter which screen you&apos;re on.
          </p>

          <div className="space-y-6 mt-4">
            {/* Header */}
            <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/50">
              <h3 className="text-white font-semibold mb-3">🔝 Header Bar</h3>
              <p className="text-sm text-gray-300 mb-3">
                The top bar gives you system-level controls and status at a glance.
              </p>
              <FeatureList items={[
                'Hamburger menu — opens the side navigation drawer',
                'Layout chip — shows the active layout name; tap to switch layouts',
                'Device status — shows connected device count (e.g., 3/4)',
                'Track power toggle — turn main track power on or off',
                'Emergency stop — red button that immediately halts all trains',
                'User profile — account menu (far right)',
              ]} />
            </div>

            {/* Footer nav */}
            <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/50">
              <h3 className="text-white font-semibold mb-3">🔽 Bottom Navigation</h3>
              <p className="text-sm text-gray-300 mb-3">
                A pill-shaped button bar at the bottom of the screen. Shows your favorite pages as color-coded icon buttons for quick access. Customize which items appear in Settings.
              </p>
              <div className="grid grid-cols-2 gap-x-6">
                <NavItem label="Locos" color="bg-pink-400" desc="Roster" />
                <NavItem label="Throttles" color="bg-lime-400" desc="Multi-train grid" />
                <NavItem label="Effects" color="bg-indigo-400" desc="Sound & lights" />
                <NavItem label="Conductor" color="bg-rose-400" desc="Operator station" />
                <NavItem label="Routes" color="bg-purple-400" desc="Track routes" />
                <NavItem label="Turnouts" color="bg-amber-400" desc="Switch control" />
                <NavItem label="Signals" color="bg-emerald-400" desc="Signal aspects" />
                <NavItem label="Settings" color="bg-blue-400" desc="Preferences" />
              </div>
            </div>

            {/* Side menu */}
            <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/50">
              <h3 className="text-white font-semibold mb-3">☰ Side Menu</h3>
              <p className="text-sm text-gray-300 mb-3">
                Slide out from the left via the hamburger icon. Shows the full list of pages with icons and labels. On mobile it closes automatically after you tap an item.
              </p>
              <FeatureList items={[
                'All 11 pages listed with color-coded icons',
                'DEJA Suite app switcher at the bottom — quick links to Cloud, Monitor, and Tour',
                'Active page highlighted',
              ]} />
            </div>
          </div>

          <Screenshot src="/screenshots/throttle_desktop_home.png" alt="Throttle app showing header, bottom nav, and side menu" device="desktop" />
        </Section>

        {/* ── Connect ── */}
        <Section title="Connect">
          <p>
            Open Throttle in your browser. The home screen shows the connection status
            of your command station. When the server is running and connected, the status
            indicator turns green.
          </p>
          <FeatureList items={[
            'Automatic connection to your DEJA.js server',
            'Status indicators for server, devices, and track power',
            'Speedometer widgets for active throttles on the home screen',
          ]} />
          <Screenshot src="/screenshots/throttle_mobile_home.png" alt="Throttle home screen showing connection status" device="mobile" />
          <DocLink href="/docs/throttle/connect">Connection setup reference</DocLink>
        </Section>

        {/* ── Add a Loco ── */}
        <Section title="Add a Locomotive">
          <p>
            Tap the <strong>+</strong> button on the throttle list to add a locomotive to your
            session. Enter the DCC address and a name.
          </p>
          <FeatureList items={[
            'Enter DCC address (1–9999) and locomotive name',
            'Assign a road name (BNSF, UP, CSX, NS, and more)',
            'Set an image for the locomotive avatar',
            'Added locomotives appear immediately in the throttle list',
          ]} />
          <Screenshot src="/screenshots/throttle_desktop_add-loco.png" alt="Add locomotive dialog" device="desktop" />
          <CloudNote>
            Full locomotive management happens in{' '}
            <Link href="/guides/cloud" className="text-deja-cyan hover:underline">DEJA Cloud</Link>{' '}
            — configure decoder functions (F0–F28) with custom labels and icons, build multi-unit consists,
            and toggle onboard sound. Changes sync to Throttle in real time.
          </CloudNote>
          <DocLink href="/docs/throttle/roster">Roster reference</DocLink>
        </Section>

        {/* ── Select a Loco ── */}
        <Section title="Select a Locomotive">
          <p>
            The throttle list shows all locomotives in your session. Tap a locomotive to open
            its throttle control screen.
          </p>
          <FeatureList items={[
            'Grid view of all active throttles with speed, name, and avatar',
            'Drag tiles to reorder (order persists between sessions)',
            'Quick control buttons on each tile',
            'Responsive layout — 1 column on mobile, 2+ on tablet and desktop',
          ]} />
          <Screenshot src="/screenshots/throttle_desktop_throttle-list.png" alt="Throttle list with locomotives" device="desktop" />
          <DocLink href="/docs/throttle/throttle-list">Throttle list reference</DocLink>
        </Section>

        {/* ── Speed & Direction ── */}
        <Section title="Control Speed & Direction">
          <p>
            The throttle control screen gives you everything you need to drive a single locomotive.
            Use the speed controls to set speed and tap direction to switch between forward and reverse.
          </p>
          <FeatureList items={[
            'Speed slider (0–126 DCC steps) on desktop and tablet',
            '5-button vertical speed controls (+5, +1, Stop, −1, −5) on all screen sizes',
            'Direction slider — REV / IDLE / FWD (only changeable at zero speed)',
            'Brake control (0–10) for gradual deceleration',
            'Swipe left/right to switch between active throttles',
            'Park button — stops the loco and releases the throttle',
            'Emergency stop accessible from the header on every page',
          ]} />
          <Screenshot src="/screenshots/throttle_mobile_throttle.png" alt="Throttle control screen with speed controls" device="mobile" />
          <DocLink href="/docs/throttle/throttle">Throttle control reference</DocLink>
        </Section>

        {/* ── Functions ── */}
        <Section title="Use Functions">
          <p>
            Tap the function button to open the speed dial. Toggle decoder functions like
            headlights, bell, and horn. Each button shows its current state — on or off.
          </p>
          <FeatureList items={[
            'Speed dial with up to 29 function buttons (F0–F28)',
            'F0: Headlight, F1: Bell, F2: Horn/Whistle',
            'F3–F28: Decoder-specific features (dynamic brake, coupler, sounds, lighting)',
            'Each function shows a labeled icon',
            'Consist display shows linked multi-unit groups',
          ]} />
          <Screenshot src="/screenshots/throttle_mobile_functions.png" alt="Function speed dial expanded" device="mobile" />
          <CloudNote>
            Function labels, icons, and visibility are configured per locomotive in{' '}
            <Link href="/guides/cloud" className="text-deja-cyan hover:underline">DEJA Cloud</Link>{' '}
            under the Roster section. Customize which functions appear and what they&apos;re called.
          </CloudNote>
          <DocLink href="/docs/throttle/throttle">Functions reference</DocLink>
        </Section>

        {/* ── Turnouts ── */}
        <Section title="Throw Turnouts">
          <p>
            The turnouts view shows all configured turnouts on your layout. Tap a turnout
            to toggle between straight (normal) and divergent (reverse).
          </p>
          <FeatureList items={[
            'CTC-style lever switches as the default view',
            'Color-coded state indicators — normal vs. reverse',
            'Multiple view modes: Switch, Button, Card, Table',
            'Filter by device or tags',
            '3-second cooldown per toggle prevents rapid repeated throws',
          ]} />
          <Screenshot src="/screenshots/throttle_desktop_turnouts.png" alt="Turnouts view with state indicators" device="desktop" />
          <CloudNote>
            Turnouts are defined in{' '}
            <Link href="/guides/cloud" className="text-deja-cyan hover:underline">DEJA Cloud</Link>{' '}
            — set the name, DCC index, type (Kato, Servo, etc.), pin values, and assign to a hardware
            device. Apply colors and tags for organization.
          </CloudNote>
          <DocLink href="/docs/throttle/turnouts">Turnouts reference</DocLink>
        </Section>

        {/* ── Routes ── */}
        <Section title="Fire a Route">
          <p>
            Routes execute a sequence of turnout changes with a single tap. Select a route
            from the list or tap a location on the track map.
          </p>
          <FeatureList items={[
            'Interactive SVG track maps with clickable origin and destination points',
            'Select origin (P1) → destination (P2) to execute a route',
            'Horizontal timeline showing the turnout sequence',
            'Progress bar fills during execution (2 seconds per step)',
            'Alternative list view with route cards and a Run button',
          ]} />
          <Screenshot src="/screenshots/throttle_desktop_routes.png" alt="Routes view with route list" device="desktop" />
          <CloudNote>
            Routes are created in{' '}
            <Link href="/guides/cloud" className="text-deja-cyan hover:underline">DEJA Cloud</Link>{' '}
            — define Point 1 (origin) and Point 2 (destination), set the turnout sequence with target
            states, and test the route before saving.
          </CloudNote>
          <DocLink href="/docs/throttle/routes">Routes reference</DocLink>
        </Section>

        {/* ── Effects ── */}
        <Section title="Try Effects">
          <p>
            Trigger sound and lighting effects on your layout. The effects view shows all
            available effects grouped by category. Tap an effect to toggle it on or off.
          </p>
          <FeatureList items={[
            '10 effect types: Light, LED, Street Light, Relay, Frog Juicer, Power, PIN, Sound, IALED, Macro',
            'Toggle effects on/off with a switch in each card',
            'Filter by device, type, or tags',
            'Guest-accessible effects marked with an indicator chip',
            'Responsive grid layout adapts to screen size',
          ]} />
          <Screenshot src="/screenshots/throttle_mobile_effects.png" alt="Effects view with available effects" device="mobile" />
          <CloudNote>
            Effects are configured in{' '}
            <Link href="/guides/cloud" className="text-deja-cyan hover:underline">DEJA Cloud</Link>{' '}
            — create effects for each type, assign hardware devices and pins, browse the sound library,
            define macro command sequences, and set guest access per effect. All changes appear in
            Throttle immediately via Firebase.
          </CloudNote>
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
