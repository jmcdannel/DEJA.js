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

interface Callout {
  number: number;
  label: string;
  desc: string;
  x: string;
  y: string;
}

function CalloutMarker({ number, x, y }: { number: number; x: string; y: string }) {
  return (
    <div
      className="absolute z-10 flex items-center justify-center"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      <span className="absolute w-8 h-8 rounded-full bg-deja-cyan/20 animate-ping" />
      <span className="relative w-6 h-6 rounded-full bg-deja-cyan text-gray-950 text-xs font-bold flex items-center justify-center shadow-lg shadow-deja-cyan/30">
        {number}
      </span>
    </div>
  );
}

function CalloutKey({ callouts }: { callouts: Callout[] }) {
  return (
    <div className="mt-4 grid gap-2">
      {callouts.map((c) => (
        <div key={c.number} className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-full bg-deja-cyan text-gray-950 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
            {c.number}
          </span>
          <div>
            <span className="text-white text-sm font-medium">{c.label}</span>
            <span className="text-gray-400 text-sm"> — {c.desc}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnnotatedScreenshot({
  src,
  alt,
  callouts,
  aspectClass,
  objectPosition,
}: {
  src: string;
  alt: string;
  callouts: Callout[];
  aspectClass: string;
  objectPosition: string;
}) {
  return (
    <div className="my-6 space-y-0">
      <div className="rounded-xl border border-gray-800 overflow-hidden bg-gray-900/50">
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-800 bg-gray-900">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </div>
        <div className={`relative ${aspectClass} overflow-hidden`}>
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            style={{ objectPosition }}
          />
          {callouts.map((c) => (
            <CalloutMarker key={c.number} number={c.number} x={c.x} y={c.y} />
          ))}
        </div>
      </div>
      <CalloutKey callouts={callouts} />
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

          {/* Header — annotated zoomed screenshot */}
          <h3 className="text-white font-semibold text-lg mt-6">🔝 Header Bar</h3>
          <p className="text-sm text-gray-300">
            The top bar gives you system-level controls and status at a glance. It&apos;s visible on every screen.
          </p>
          <AnnotatedScreenshot
            src="/screenshots/throttle_desktop_home.png"
            alt="Throttle header bar with numbered callouts"
            aspectClass="aspect-[6/1]"
            objectPosition="center 7.5%"
            callouts={[
              { number: 1, label: 'Menu', desc: 'Opens the side navigation drawer', x: '4%', y: '50%' },
              { number: 2, label: 'App Logo', desc: 'DEJA Throttle branding — tap to go home', x: '13%', y: '50%' },
              { number: 3, label: 'Layout Chip', desc: 'Shows active layout name; tap to switch layouts', x: '68%', y: '50%' },
              { number: 4, label: 'Device Status', desc: 'Connected device count (e.g., 5/5) — tap for details', x: '78%', y: '50%' },
              { number: 5, label: 'User Profile', desc: 'Account menu and sign-out', x: '88%', y: '50%' },
              { number: 6, label: 'Emergency Stop', desc: 'Red button — immediately halts all trains on the layout', x: '95%', y: '50%' },
            ]}
          />

          {/* Bottom nav — annotated zoomed screenshot */}
          <h3 className="text-white font-semibold text-lg mt-10">🔽 Bottom Navigation</h3>
          <p className="text-sm text-gray-300">
            A pill-shaped button bar at the bottom of the screen. Shows your favorite pages as
            color-coded icon buttons. Customize which items appear in Settings.
          </p>
          <AnnotatedScreenshot
            src="/screenshots/throttle_desktop_throttle-list.png"
            alt="Throttle bottom navigation bar with numbered callouts"
            aspectClass="aspect-[8/1]"
            objectPosition="center 95%"
            callouts={[
              { number: 1, label: 'Throttles', desc: 'Multi-train grid view', x: '32%', y: '50%' },
              { number: 2, label: 'Effects', desc: 'Sound and lighting effects', x: '40%', y: '50%' },
              { number: 3, label: 'Locos', desc: 'Locomotive roster', x: '48%', y: '50%' },
              { number: 4, label: 'Routes', desc: 'Track route execution', x: '55%', y: '50%' },
              { number: 5, label: 'Turnouts', desc: 'Switch control', x: '62%', y: '50%' },
              { number: 6, label: 'Signals', desc: 'Signal aspect monitoring', x: '70%', y: '50%' },
            ]}
          />
          <p className="text-xs text-gray-500 mt-2">
            The bottom bar is fully customizable — add or remove items in{' '}
            <Link href="/docs/throttle/settings" className="text-deja-cyan hover:underline">Settings</Link>.
          </p>

          {/* Side menu */}
          <h3 className="text-white font-semibold text-lg mt-10">☰ Side Menu</h3>
          <p className="text-sm text-gray-300">
            Slide out from the left via the hamburger icon. Shows the full list of pages with
            icons and labels. On mobile it closes automatically after you tap an item.
          </p>
          <FeatureList items={[
            'All 11 pages listed with color-coded icons',
            'DEJA Suite app switcher at the bottom — quick links to Cloud, Monitor, and Tour',
            'Active page highlighted',
          ]} />

          <Screenshot src="/screenshots/throttle_desktop_home.png" alt="Throttle app full view showing header and bottom nav" device="desktop" />
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
