'use client';

import Image from 'next/image';
import Link from 'next/link';
import AnimateIn from '../home/AnimateIn';
import SectionLabel from '../home/SectionLabel';
import Logo from '../Logo';
import PhoneMockup from '../architecture/PhoneMockup';
import DocLink from '../DocLink';

/* ── Shared sub-components ── */

function FeatureCard({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-800/60 bg-gray-900/40 hover:border-deja-cyan/20 hover:bg-gray-900/60 transition-all">
      <span className="text-lg shrink-0 mt-0.5">{emoji}</span>
      <span className="text-sm text-gray-300">{text}</span>
    </div>
  );
}

function FeatureGrid({ items }: { items: { emoji: string; text: string }[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {items.map((item, i) => (
        <AnimateIn key={item.text} delay={i * 0.05}>
          <FeatureCard emoji={item.emoji} text={item.text} />
        </AnimateIn>
      ))}
    </div>
  );
}

function CloudNote({ children }: { children: React.ReactNode }) {
  return (
    <AnimateIn>
      <div className="p-4 rounded-lg border border-indigo-500/20 bg-indigo-950/20">
        <p className="text-xs text-indigo-400 font-mono tracking-wider uppercase mb-2">☁️ Configured in DEJA Cloud</p>
        <div className="text-sm text-gray-300 leading-relaxed">{children}</div>
      </div>
    </AnimateIn>
  );
}

function VideoPlaceholder() {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 overflow-hidden shadow-2xl">
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

interface Callout {
  number: number;
  label: string;
  desc: string;
  x: string;
  y: string;
}

function CalloutKey({ callouts }: { callouts: Callout[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-2 mt-4">
      {callouts.map((c, i) => (
        <AnimateIn key={c.number} delay={i * 0.05}>
          <div className="flex items-start gap-3 p-2.5 rounded-lg border border-gray-800/60 bg-gray-900/40">
            <span className="w-6 h-6 rounded-full bg-deja-cyan text-gray-950 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {c.number}
            </span>
            <div>
              <span className="text-white text-sm font-medium">{c.label}</span>
              <span className="text-gray-400 text-sm"> — {c.desc}</span>
            </div>
          </div>
        </AnimateIn>
      ))}
    </div>
  );
}

function AnnotatedScreenshot({
  src,
  alt,
  callouts,
  cropTop = '0%',
  cropHeight = '100%',
}: {
  src: string;
  alt: string;
  callouts: Callout[];
  cropTop?: string;
  cropHeight?: string;
}) {
  return (
    <div className="space-y-0">
      <AnimateIn>
        <div className="rounded-2xl border border-gray-700 bg-gray-900 p-2 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-1.5 px-2 py-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500/70" />
            <span className="w-2 h-2 rounded-full bg-yellow-500/70" />
            <span className="w-2 h-2 rounded-full bg-green-500/70" />
          </div>
          <div className="relative overflow-hidden rounded-xl" style={{ height: cropHeight }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="w-full h-auto absolute left-0"
              style={{ top: cropTop }}
            />
            {callouts.map((c) => (
              <div
                key={c.number}
                className="absolute z-10"
                style={{ left: c.x, top: c.y, transform: 'translate(-50%, -50%)' }}
              >
                <span className="w-6 h-6 rounded-full bg-deja-cyan text-gray-950 text-xs font-bold flex items-center justify-center shadow-lg shadow-deja-cyan/40">
                  {c.number}
                </span>
              </div>
            ))}
          </div>
        </div>
      </AnimateIn>
      <CalloutKey callouts={callouts} />
    </div>
  );
}

/* ── Two-column feature section ── */

function FeatureSection({
  label,
  title,
  desc,
  features,
  screenshot,
  screenshotAlt,
  screenshotDevice = 'mobile',
  flip = false,
  cloudNote,
  docLink,
  docLabel,
  children,
}: {
  label: string;
  title: string;
  desc: string;
  features: { emoji: string; text: string }[];
  screenshot: string;
  screenshotAlt: string;
  screenshotDevice?: 'mobile' | 'desktop';
  flip?: boolean;
  cloudNote?: React.ReactNode;
  docLink?: string;
  docLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <AnimateIn direction={flip ? 'right' : 'left'} className={flip ? 'lg:order-2' : ''}>
          <SectionLabel>{label}</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-3">{title}</h2>
          <p className="text-gray-400 leading-relaxed mb-6">{desc}</p>
          <FeatureGrid items={features} />
          {cloudNote && <div className="mt-4">{cloudNote}</div>}
          {children}
          {docLink && docLabel && (
            <div className="mt-4">
              <DocLink href={docLink}>{docLabel}</DocLink>
            </div>
          )}
        </AnimateIn>
        <AnimateIn direction={flip ? 'left' : 'right'} className={`flex justify-center ${flip ? 'lg:order-1' : ''}`}>
          {screenshotDevice === 'mobile' ? (
            <PhoneMockup src={screenshot} alt={screenshotAlt} className="w-[220px]" />
          ) : (
            <div className="rounded-2xl border-2 border-gray-700 bg-gray-900 p-2 shadow-2xl w-full max-w-lg">
              <div className="mx-auto w-8 h-1 bg-gray-800 rounded-full mb-1" />
              <div className="rounded-xl overflow-hidden">
                <Image src={screenshot} alt={screenshotAlt} width={1200} height={675} className="w-full h-auto" />
              </div>
            </div>
          )}
        </AnimateIn>
      </div>
    </section>
  );
}

/* ── Main guide ── */

export default function ThrottleGuide() {
  return (
    <div className="-mx-6 px-6">
      {/* ── Hero ── */}
      <section className="relative py-16 overflow-hidden">
        {/* Atmospheric glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)' }} />
        <div className="absolute top-20 right-0 w-[400px] h-[300px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(213,0,249,0.06) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <AnimateIn>
            <SectionLabel color="magenta">Guide</SectionLabel>
          </AnimateIn>
          <AnimateIn delay={0.1}>
            <div className="mt-6 mb-6 flex justify-center">
              <Logo size="3xl" appTitle="Throttle" />
            </div>
          </AnimateIn>
          <AnimateIn delay={0.2}>
            <p className="text-gray-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
              Walk through a complete session — connect to your command station, add a locomotive,
              control speed and direction, throw turnouts, and trigger effects.
            </p>
          </AnimateIn>
          <AnimateIn delay={0.3}>
            <VideoPlaceholder />
          </AnimateIn>
        </div>
      </section>

      {/* ── Prerequisites ── */}
      <AnimateIn>
        <div className="max-w-2xl mx-auto mb-8 p-5 rounded-xl border border-gray-800 bg-gray-900/50 text-center">
          <p className="text-gray-300 text-sm leading-relaxed">
            Make sure you&apos;ve completed the{' '}
            <Link href="/guides/getting-started" className="text-deja-cyan hover:underline">Getting Started</Link>{' '}
            guide — your server should be running and your command station connected.
          </p>
        </div>
      </AnimateIn>

      {/* ── Navigating the App ── */}
      <section className="bg-gray-900/50 border-y border-gray-800/50 py-20 -mx-6 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimateIn>
            <SectionLabel>Navigation</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-3">Navigating the App</h2>
            <p className="text-gray-400 leading-relaxed mb-8">Two persistent navigation elements are visible on every screen.</p>
          </AnimateIn>

          <AnimateIn delay={0.1}>
            <h3 className="text-white font-semibold text-xl mb-2">🔝 Header Bar</h3>
            <p className="text-gray-400 text-sm mb-4">System-level controls and status at a glance.</p>
          </AnimateIn>
          <AnnotatedScreenshot
            src="/screenshots/throttle_desktop_home.png"
            alt="Throttle header bar with numbered callouts"
            cropTop="0%"
            cropHeight="72px"
            callouts={[
              { number: 1, label: 'Menu', desc: 'Opens the side navigation drawer', x: '4%', y: '50%' },
              { number: 2, label: 'App Logo', desc: 'Tap to go home', x: '13%', y: '50%' },
              { number: 3, label: 'Layout Chip', desc: 'Active layout — tap to switch', x: '68%', y: '50%' },
              { number: 4, label: 'Device Status', desc: 'Connected device count', x: '78%', y: '50%' },
              { number: 5, label: 'User Profile', desc: 'Account menu', x: '88%', y: '50%' },
              { number: 6, label: 'Emergency Stop', desc: 'Immediately halts all trains', x: '95%', y: '50%' },
            ]}
          />

          <div className="mt-12" />

          <AnimateIn>
            <h3 className="text-white font-semibold text-xl mb-2">🔽 Bottom Navigation</h3>
            <p className="text-gray-400 text-sm mb-4">
              Color-coded icon buttons for quick access. Customize which items appear in{' '}
              <Link href="#settings" className="text-deja-cyan hover:underline">Settings</Link>.
            </p>
          </AnimateIn>
          <AnnotatedScreenshot
            src="/screenshots/throttle_desktop_throttle-list.png"
            alt="Throttle bottom navigation bar with numbered callouts"
            cropTop="-87%"
            cropHeight="72px"
            callouts={[
              { number: 1, label: 'Throttles', desc: 'Multi-train grid view', x: '32%', y: '50%' },
              { number: 2, label: 'Effects', desc: 'Sound and lighting effects', x: '40%', y: '50%' },
              { number: 3, label: 'Locos', desc: 'Locomotive roster', x: '48%', y: '50%' },
              { number: 4, label: 'Routes', desc: 'Track route execution', x: '55%', y: '50%' },
              { number: 5, label: 'Turnouts', desc: 'Switch control', x: '62%', y: '50%' },
              { number: 6, label: 'Signals', desc: 'Signal aspect monitoring', x: '70%', y: '50%' },
            ]}
          />
        </div>
      </section>

      {/* ── Connect ── */}
      <FeatureSection
        label="Step 1"
        title="Connect"
        desc="Open Throttle in your browser. The home screen shows your command station's connection status. Green means you're ready to go."
        features={[
          { emoji: '🔌', text: 'Automatic connection to your DEJA.js server' },
          { emoji: '🟢', text: 'Status indicators for server, devices, and track power' },
          { emoji: '🕐', text: 'Speedometer widgets for active throttles' },
        ]}
        screenshot="/screenshots/throttle_mobile_home.png"
        screenshotAlt="Throttle home screen"
        docLink="/docs/throttle/connect"
        docLabel="Connection setup reference"
      />

      {/* ── Add a Loco ── */}
      <div className="bg-gray-900/50 border-y border-gray-800/50 -mx-6 px-6">
        <FeatureSection
          label="Step 2"
          title="Add a Locomotive"
          desc="Tap the + button on the throttle list to add a locomotive to your session. Enter the DCC address and a name."
          features={[
            { emoji: '🔢', text: 'Enter DCC address (1–9999) and locomotive name' },
            { emoji: '🏷️', text: 'Assign a road name (BNSF, UP, CSX, NS, and more)' },
            { emoji: '🖼️', text: 'Set an image for the locomotive avatar' },
            { emoji: '⚡', text: 'Appears immediately in the throttle list' },
          ]}
          screenshot="/screenshots/throttle_mobile_home.png"
          screenshotAlt="Add locomotive"
          flip
          cloudNote={
            <CloudNote>
              Full locomotive management happens in{' '}
              <Link href="/guides/cloud" className="text-deja-cyan hover:underline">DEJA Cloud</Link>{' '}
              — configure decoder functions (F0–F28), build consists, and toggle onboard sound.
            </CloudNote>
          }
          docLink="/docs/throttle/roster"
          docLabel="Roster reference"
        />
      </div>

      {/* ── Select a Loco ── */}
      <FeatureSection
        label="Step 3"
        title="Select a Locomotive"
        desc="The throttle list shows all locomotives in your session. Tap one to open full throttle control."
        features={[
          { emoji: '🎴', text: 'Grid of active throttles with speed, name, and avatar' },
          { emoji: '🔀', text: 'Drag tiles to reorder (persists between sessions)' },
          { emoji: '🎮', text: 'Quick control buttons on each tile' },
          { emoji: '📱', text: 'Responsive — 1 column on mobile, 2+ on desktop' },
        ]}
        screenshot="/screenshots/throttle_mobile_home.png"
        screenshotAlt="Throttle list with locomotives"
        docLink="/docs/throttle/throttle-list"
        docLabel="Throttle list reference"
      />

      {/* ── Speed & Direction ── */}
      <div className="bg-gray-900/50 border-y border-gray-800/50 -mx-6 px-6">
        <FeatureSection
          label="Step 4"
          title="Control Speed & Direction"
          desc="Everything you need to drive. Set speed, change direction, and stop — all from one screen."
          features={[
            { emoji: '🎚️', text: 'Speed slider (0–126 DCC steps) on desktop/tablet' },
            { emoji: '🔘', text: '5-button speed controls (+5, +1, Stop, −1, −5)' },
            { emoji: '↔️', text: 'Direction — REV / IDLE / FWD (zero speed only)' },
            { emoji: '🛑', text: 'Brake control (0–10) for gradual deceleration' },
            { emoji: '👉', text: 'Swipe left/right between active throttles' },
            { emoji: '🅿️', text: 'Park button — stops the loco and releases it' },
          ]}
          screenshot="/screenshots/throttle_mobile_throttle.png"
          screenshotAlt="Throttle control screen"
          flip
          docLink="/docs/throttle/throttle"
          docLabel="Throttle control reference"
        />
      </div>

      {/* ── Functions ── */}
      <FeatureSection
        label="Step 5"
        title="Use Functions"
        desc="Tap the function button to open the speed dial. Toggle lights, horn, bell, and 25+ decoder features."
        features={[
          { emoji: '🎛️', text: 'Speed dial with up to 29 function buttons (F0–F28)' },
          { emoji: '💡', text: 'F0: Headlight, F1: Bell, F2: Horn/Whistle' },
          { emoji: '🔧', text: 'F3–F28: Decoder-specific (brake, coupler, sounds)' },
          { emoji: '🔗', text: 'Consist display shows linked multi-unit groups' },
        ]}
        screenshot="/screenshots/throttle_mobile_functions.png"
        screenshotAlt="Function speed dial expanded"
        cloudNote={
          <CloudNote>
            Function labels, icons, and visibility are configured per locomotive in{' '}
            <Link href="/guides/cloud" className="text-deja-cyan hover:underline">DEJA Cloud</Link>.
          </CloudNote>
        }
        docLink="/docs/throttle/throttle"
        docLabel="Functions reference"
      />

      {/* ── Turnouts ── */}
      <div className="bg-gray-900/50 border-y border-gray-800/50 -mx-6 px-6">
        <FeatureSection
          label="Step 6"
          title="Throw Turnouts"
          desc="Tap a turnout to toggle between straight and divergent. Color changes instantly to show state."
          features={[
            { emoji: '🎛️', text: 'CTC-style lever switches as the default view' },
            { emoji: '🟢', text: 'Color-coded state indicators — normal vs. reverse' },
            { emoji: '👁️', text: 'Multiple views: Switch, Button, Card, Table' },
            { emoji: '🏷️', text: 'Filter by device or tags' },
            { emoji: '⏱️', text: '3-second cooldown prevents rapid repeated throws' },
          ]}
          screenshot="/screenshots/throttle_mobile_turnouts2.png"
          screenshotAlt="Turnouts view"
          flip
          cloudNote={
            <CloudNote>
              Turnouts are defined in{' '}
              <Link href="/guides/cloud" className="text-deja-cyan hover:underline">DEJA Cloud</Link>{' '}
              — name, DCC index, type, pin values, and hardware device.
            </CloudNote>
          }
          docLink="/docs/throttle/turnouts"
          docLabel="Turnouts reference"
        />
      </div>

      {/* ── Effects ── */}
      <FeatureSection
        label="Step 7"
        title="Try Effects"
        desc="Trigger sound and lighting effects across your layout. Tap to toggle — everything updates in real time."
        features={[
          { emoji: '💡', text: 'Light, LED, Street Light, Relay, Frog Juicer, Power, PIN' },
          { emoji: '🔊', text: 'Sound effects from your uploaded library' },
          { emoji: '🌈', text: 'IALED — individually addressable LED strips' },
          { emoji: '⚙️', text: 'Macros — custom on/off command sequences' },
          { emoji: '🏷️', text: 'Filter by device, type, or tags' },
          { emoji: '👤', text: 'Guest-accessible effects marked with a chip' },
        ]}
        screenshot="/screenshots/throttle_mobile_effects.png"
        screenshotAlt="Effects view"
        cloudNote={
          <CloudNote>
            Effects are configured in{' '}
            <Link href="/guides/cloud" className="text-deja-cyan hover:underline">DEJA Cloud</Link>{' '}
            — hardware devices, pins, sound library, macros, and guest access.
          </CloudNote>
        }
        docLink="/docs/throttle/effects"
        docLabel="Effects reference"
      />

      {/* ── Conductor ── */}
      <div className="bg-gray-900/50 border-y border-gray-800/50 py-20 -mx-6 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimateIn>
            <SectionLabel color="magenta">Operator Station</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-3">Conductor Mode</h2>
            <p className="text-gray-400 leading-relaxed mb-8">
              A three-pane layout designed for large screens. Throttle list, active throttle, and turnouts — all in one view.
            </p>
          </AnimateIn>
          <FeatureGrid items={[
            { emoji: '🖥️', text: 'Three-pane layout: throttle list + active throttle + turnouts' },
            { emoji: '🚂', text: 'Select any loco from the left panel to control it center' },
            { emoji: '🔀', text: 'Throw turnouts from the right panel' },
            { emoji: '📱', text: 'Panes stack vertically on mobile' },
          ]} />
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6 items-end">
            <AnimateIn direction="left" className="lg:col-span-3">
              <div className="rounded-2xl border-2 border-gray-700 bg-gray-900 p-2 shadow-2xl">
                <div className="mx-auto w-8 h-1 bg-gray-800 rounded-full mb-1" />
                <div className="rounded-xl overflow-hidden">
                  <Image src="/screenshots/throttle_desktop_conductor.png" alt="Conductor mode on desktop" width={1200} height={675} className="w-full h-auto" />
                </div>
              </div>
            </AnimateIn>
            <AnimateIn direction="right" className="lg:col-span-2 flex justify-center">
              <PhoneMockup src="/screenshots/throttle_mobile_conductor.png" alt="Conductor mode on mobile" className="w-[180px]" />
            </AnimateIn>
          </div>
          <div className="mt-4">
            <DocLink href="/docs/throttle/conductor">Conductor mode reference</DocLink>
          </div>
        </div>
      </div>

      {/* ── Settings ── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto">
          <AnimateIn>
            <SectionLabel color="lime">Customize</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-3">Settings</h2>
            <p className="text-gray-400 leading-relaxed mb-8">Make Throttle yours. Customize the look, navigation, and connection.</p>
          </AnimateIn>
          <FeatureGrid items={[
            { emoji: '🎨', text: 'Switch between light and dark themes' },
            { emoji: '📌', text: 'Choose which pages appear in the bottom nav' },
            { emoji: '🔗', text: 'Configure server connection URL and port' },
            { emoji: '🏠', text: 'Select and switch between layouts' },
            { emoji: '👤', text: 'Manage your account and sign out' },
          ]} />
          <div className="mt-4">
            <DocLink href="/docs/throttle/settings">Settings reference</DocLink>
          </div>
        </div>
      </section>

      {/* ── What's Next ── */}
      <section className="py-16 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <AnimateIn>
            <h2 className="text-white font-bold text-2xl mb-6">What&apos;s Next</h2>
          </AnimateIn>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Signals', desc: 'Monitor signal aspects across your layout', href: '/docs/throttle/signals' },
              { label: 'Cloud Guide', desc: 'Configure your roster, turnouts, effects, and more', href: '/guides/cloud' },
              { label: 'Home Screen', desc: 'Speedometer widgets and layout overview', href: '/docs/throttle/home' },
              { label: 'Architecture', desc: 'How the entire DEJA.js platform works', href: '/guides/architecture' },
            ].map((item, i) => (
              <AnimateIn key={item.href} delay={i * 0.1}>
                <Link
                  href={item.href}
                  className="block p-5 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-deja-cyan/40 hover:bg-gray-900 transition-all group"
                >
                  <p className="text-white font-semibold group-hover:text-deja-cyan transition-colors">{item.label} →</p>
                  <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                </Link>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
