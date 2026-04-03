'use client';

import Link from 'next/link';
import AnimateIn from '../home/AnimateIn';
import SectionLabel from '../home/SectionLabel';
import Logo from '../Logo';
import { FeatureSection, VideoPlaceholder, FeatureCarousel } from './shared';
import type { CarouselSlide } from './shared';

/* ── Cloud Features Data ── */

const cloudFeatures: CarouselSlide[] = [
  {
    id: 'roster',
    emoji: '🚂',
    title: 'Roster',
    tagline: 'Your fleet, fully configured',
    desc: 'Manage every locomotive on your layout. Set DCC addresses, configure decoder functions, build multi-unit consists, and sync your roster to DCC-EX.',
    desktopScreenshot: '/screenshots/cloud_desktop_roster.png',
    features: [
      { emoji: '🔍', text: 'Search by name, address, or road number' },
      { emoji: '🎛️', text: 'Configure F0–F28 with custom labels and icons' },
      { emoji: '🚂', text: 'Build consists with direction and speed trim' },
      { emoji: '🔄', text: 'Two-way sync with DCC-EX command station' },
      { emoji: '📥', text: 'Import existing roster from your command station' },
    ],
    docHref: '/docs/cloud/roster',
    docLabel: 'Roster',
    accentColor: 'text-pink-400',
    accentBg: 'bg-pink-400/10',
    accentBorder: 'border-pink-400/40',
  },
  {
    id: 'devices',
    emoji: '🖥️',
    title: 'Devices',
    tagline: 'Your hardware, connected',
    desc: 'Manage DCC-EX command stations, microcontrollers, and serial devices. Monitor connection status and configure ports.',
    desktopScreenshot: '/screenshots/cloud_desktop_dashboard.png',
    features: [
      { emoji: '🔌', text: 'Auto-detect available serial ports' },
      { emoji: '🟢', text: 'Real-time connection status with reconnect' },
      { emoji: '🔄', text: 'Drag-to-reorder devices in priority order' },
      { emoji: '⚙️', text: 'Per-device configuration and port assignment' },
    ],
    docHref: '/docs/cloud/layout',
    docLabel: 'Devices',
    accentColor: 'text-cyan-400',
    accentBg: 'bg-cyan-400/10',
    accentBorder: 'border-cyan-400/40',
  },
  {
    id: 'turnouts',
    emoji: '🔀',
    title: 'Turnouts',
    tagline: 'Every switch, mapped and named',
    desc: 'Define turnout positions, assign devices, and organize with tags. Generate printable labels for your fascia.',
    desktopScreenshot: '/screenshots/cloud_desktop_turnouts.png',
    features: [
      { emoji: '⚙️', text: 'Straight and divergent position values per turnout' },
      { emoji: '🏷️', text: 'Filter and sort by device, tags, or name' },
      { emoji: '🖨️', text: 'Generate printable labels for your layout fascia' },
      { emoji: '🎨', text: 'Color-coded by type: Kato, Servo, Tortoise, DCC' },
      { emoji: '💡', text: 'Link an effect to trigger on state change' },
    ],
    docHref: '/docs/cloud/turnouts',
    docLabel: 'Turnouts',
    accentColor: 'text-amber-400',
    accentBg: 'bg-amber-400/10',
    accentBorder: 'border-amber-400/40',
  },
  {
    id: 'effects',
    emoji: '💡',
    title: 'Effects',
    tagline: 'Lights, sounds, and automation',
    desc: 'Set up lights, LEDs, relays, sound effects, addressable LED strips, and macros. Ten effect types cover every layout need.',
    desktopScreenshot: '/screenshots/cloud_desktop_effects.png',
    features: [
      { emoji: '💡', text: 'Light, LED, Street Light, Relay, Frog Juicer, Power, PIN' },
      { emoji: '🔊', text: 'Upload and assign sound files for audio effects' },
      { emoji: '🌈', text: 'IALED — addressable LED strip patterns and animations' },
      { emoji: '⚙️', text: 'Macros — custom on/off command sequences' },
      { emoji: '👤', text: 'Toggle guest access per effect' },
    ],
    docHref: '/docs/cloud/effects',
    docLabel: 'Effects',
    accentColor: 'text-indigo-400',
    accentBg: 'bg-indigo-400/10',
    accentBorder: 'border-indigo-400/40',
  },
  {
    id: 'signals',
    emoji: '🚦',
    title: 'Signals',
    tagline: 'Three-aspect signaling',
    desc: 'Wire three-aspect signal heads with per-pin configuration. Choose common anode or cathode wiring and set red, yellow, and green GPIO pins.',
    desktopScreenshot: '/screenshots/cloud_desktop_signals.png',
    features: [
      { emoji: '🔴', text: 'Individual GPIO pins for red, yellow, and green' },
      { emoji: '🔌', text: 'Common anode or common cathode wiring support' },
      { emoji: '📡', text: 'Real-time aspect updates from your command station' },
      { emoji: '🏷️', text: 'Organize by device, tags, or block location' },
    ],
    docHref: '/docs/cloud/signals',
    docLabel: 'Signals',
    accentColor: 'text-emerald-400',
    accentBg: 'bg-emerald-400/10',
    accentBorder: 'border-emerald-400/40',
  },
  {
    id: 'routes',
    emoji: '🛤️',
    title: 'Routes',
    tagline: 'One tap, multiple turnouts',
    desc: 'Create automated turnout sequences. Define which turnouts to throw and in what state — then execute the entire route with a single tap.',
    desktopScreenshot: '/screenshots/cloud_desktop_routes.png',
    features: [
      { emoji: '🔀', text: 'Add multiple turnouts with target states per route' },
      { emoji: '▶️', text: 'Run Route button executes all turnouts at once' },
      { emoji: '🏷️', text: 'Name routes by origin and destination points' },
      { emoji: '🎨', text: 'Color-coded route cards for quick identification' },
    ],
    docHref: '/docs/cloud/routes',
    docLabel: 'Routes',
    accentColor: 'text-purple-400',
    accentBg: 'bg-purple-400/10',
    accentBorder: 'border-purple-400/40',
  },
  {
    id: 'sensors',
    emoji: '📡',
    title: 'Sensors',
    tagline: 'Detect and automate',
    desc: 'Monitor real-time sensor state and build automation rules. Link sensors to effects, turnouts, signals, and routes for hands-free operation.',
    desktopScreenshot: '/screenshots/cloud_desktop_dashboard.png',
    features: [
      { emoji: '🔍', text: 'IR, current, reed, optical, and pressure sensor types' },
      { emoji: '⚡', text: 'Automation rules: sensor triggers actions automatically' },
      { emoji: '🔗', text: 'Link to effects, turnouts, signals, routes, or throttle' },
      { emoji: '⚙️', text: 'Debounce, cooldown, and retry configuration' },
    ],
    docHref: '/docs/cloud/sensors',
    docLabel: 'Sensors',
    accentColor: 'text-teal-400',
    accentBg: 'bg-teal-400/10',
    accentBorder: 'border-teal-400/40',
  },
  {
    id: 'connect',
    emoji: '🔗',
    title: 'Connect',
    tagline: 'Bridge to your command station',
    desc: 'Manage connectivity between DEJA Cloud and your DCC-EX hardware. Select devices, choose serial ports, and monitor connection health in real time.',
    desktopScreenshot: '/screenshots/cloud_desktop_dashboard.png',
    features: [
      { emoji: '🔌', text: 'Connect and disconnect devices with one tap' },
      { emoji: '📡', text: 'WebSocket bridge to your local DEJA Server' },
      { emoji: '🟢', text: 'Live connection health indicators' },
      { emoji: '🔄', text: 'Automatic reconnect on connection loss' },
    ],
    docHref: '/docs/cloud/layout',
    docLabel: 'Connect',
    accentColor: 'text-orange-400',
    accentBg: 'bg-orange-400/10',
    accentBorder: 'border-orange-400/40',
  },
  {
    id: 'dccex',
    emoji: '⌨️',
    title: 'DCC-EX Console',
    tagline: 'Direct command access',
    desc: 'View real-time DCC-EX output, use quick-access command buttons, and reference the command cheat sheet — all from your browser.',
    desktopScreenshot: '/screenshots/cloud_desktop_dashboard.png',
    features: [
      { emoji: '📺', text: 'LCD terminal with live DCC-EX output stream' },
      { emoji: '🎛️', text: 'Quick-access grid for common commands' },
      { emoji: '📖', text: 'Built-in command cheat sheet and syntax reference' },
      { emoji: '🔌', text: 'Connection status and DCC-EX version display' },
    ],
    docHref: '/docs/cloud/dcc-ex',
    docLabel: 'DCC-EX Console',
    accentColor: 'text-lime-400',
    accentBg: 'bg-lime-400/10',
    accentBorder: 'border-lime-400/40',
  },
  {
    id: 'settings',
    emoji: '⚙️',
    title: 'Settings',
    tagline: 'Customize everything',
    desc: 'Manage your account, subscription, theme, server setup, layout tags, and page backgrounds — all from one place.',
    desktopScreenshot: '/screenshots/cloud_desktop_settings.png',
    features: [
      { emoji: '🎨', text: 'Dark, light, and high-contrast themes' },
      { emoji: '💳', text: 'Subscription management and Stripe billing portal' },
      { emoji: '🏷️', text: 'Create tags to organize turnouts, effects, and signals' },
      { emoji: '🖼️', text: 'Custom backgrounds for each page' },
      { emoji: '🔧', text: 'Server install command and layout configuration' },
    ],
    docHref: '/docs/cloud/settings',
    docLabel: 'Settings',
    accentColor: 'text-blue-400',
    accentBg: 'bg-blue-400/10',
    accentBorder: 'border-blue-400/40',
  },
];

/* ── Main guide ── */

export default function CloudGuide() {
  return (
    <div className="-mx-6 px-6">
      {/* ── Hero ── */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)' }} />
        <div className="absolute top-20 right-0 w-[400px] h-[300px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(213,0,249,0.06) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <AnimateIn>
            <SectionLabel color="magenta">Guide</SectionLabel>
          </AnimateIn>
          <AnimateIn delay={0.1}>
            <div className="mt-6 mb-6 flex justify-center">
              <Logo size="3xl" appTitle="Cloud" />
            </div>
          </AnimateIn>
          <AnimateIn delay={0.2}>
            <p className="text-gray-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
              Your layout&apos;s command center — manage your roster, configure every turnout,
              effect, signal, and route, then control it all from any device.
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
            guide — your account should be created and your server running.
          </p>
        </div>
      </AnimateIn>

      {/* ── Dashboard ── */}
      <FeatureSection
        title="Dashboard"
        desc="Your home base. The dashboard shows device connection status, command activity, layout info, and a QR code to launch Throttle on your phone."
        features={[
          { emoji: '🔌', text: 'Device connection list with live status indicators' },
          { emoji: '📊', text: 'Command activity chart showing recent traffic' },
          { emoji: '🏷️', text: 'Layout info card with name, server IP, and port' },
          { emoji: '📱', text: 'QR code to open Throttle on any device' },
        ]}
        screenshot="/screenshots/cloud_desktop_dashboard.png"
        screenshotAlt="Cloud dashboard"
        docLink="/docs/cloud/dashboard"
        docLabel="Dashboard reference"
      />

      {/* ── Add a Device ── */}
      <div className="bg-gray-900/50 border-y border-gray-800/50 -mx-6 px-6">
        <FeatureSection
          title="Add a Device"
          desc="Connect your DCC-EX CommandStation or other hardware. Navigate to Devices, add a new device, and select the serial port."
          features={[
            { emoji: '🖥️', text: 'Support for DCC-EX, microcontrollers, and serial devices' },
            { emoji: '🔌', text: 'Auto-detect available serial ports' },
            { emoji: '🟢', text: 'Real-time connection status with reconnect' },
            { emoji: '🔄', text: 'Drag-to-reorder devices in priority order' },
          ]}
          screenshot="/screenshots/cloud_desktop_dashboard.png"
          screenshotAlt="Cloud device management"
          flip
          docLink="/docs/cloud/layout"
          docLabel="Device setup reference"
        />
      </div>

      {/* ── Add a Locomotive ── */}
      <FeatureSection
        title="Add a Locomotive"
        desc="Build your roster. Tap the add button, enter a DCC address and name, choose a road name, and your loco is ready to drive."
        features={[
          { emoji: '🔢', text: 'DCC address (1–9999) — 2 or 4-digit' },
          { emoji: '🏷️', text: 'Name and road name with color coding' },
          { emoji: '🔊', text: 'Toggle onboard sound for sound decoders' },
          { emoji: '🎛️', text: 'Configure decoder functions F0–F28 with labels and icons' },
          { emoji: '🚂', text: 'Build multi-unit consists with direction and trim' },
        ]}
        screenshot="/screenshots/cloud_desktop_roster.png"
        screenshotAlt="Cloud locomotive roster"
        docLink="/docs/cloud/roster"
        docLabel="Roster reference"
      />

      {/* ── Configure a Turnout ── */}
      <div className="bg-gray-900/50 border-y border-gray-800/50 -mx-6 px-6">
        <FeatureSection
          title="Configure a Turnout"
          desc="Define each switch on your layout. Set the name, DCC index, straight and divergent positions, and assign it to a device."
          features={[
            { emoji: '🔀', text: 'Name, index, and straight/divergent position values' },
            { emoji: '⚙️', text: 'Type: Kato, Servo, Tortoise, or DCC' },
            { emoji: '🔗', text: 'Assign to a device and optionally link an effect' },
            { emoji: '🏷️', text: 'Organize with color coding and tags' },
          ]}
          screenshot="/screenshots/cloud_desktop_turnouts.png"
          screenshotAlt="Cloud turnout configuration"
          flip
          docLink="/docs/cloud/turnouts"
          docLabel="Turnouts reference"
        />
      </div>

      {/* ── Add an Effect ── */}
      <FeatureSection
        title="Add an Effect"
        desc="Bring your layout to life with lights, sounds, LEDs, and macros. Choose an effect type, assign a device and pin, and it's ready to trigger."
        features={[
          { emoji: '💡', text: '10 types: Light, LED, Street Light, Relay, Sound, Macro, IALED, and more' },
          { emoji: '🔗', text: 'Assign to a device and GPIO pin' },
          { emoji: '🔊', text: 'Upload sound files for audio effects' },
          { emoji: '👤', text: 'Mark effects as guest-accessible for visitors' },
        ]}
        screenshot="/screenshots/cloud_desktop_effects.png"
        screenshotAlt="Cloud effects management"
        docLink="/docs/cloud/effects"
        docLabel="Effects reference"
      />

      {/* ── DCC-EX Console ── */}
      <div className="bg-gray-900/50 border-y border-gray-800/50 -mx-6 px-6">
        <FeatureSection
          title="DCC-EX Console"
          desc="Send commands directly to your CommandStation. The built-in console shows real-time output, quick-access buttons for common operations, and a cheat sheet for the full command set."
          features={[
            { emoji: '📺', text: 'LCD terminal with live DCC-EX output stream' },
            { emoji: '🎛️', text: 'Quick-access grid for power, stop, reset, and more' },
            { emoji: '📖', text: 'Built-in command cheat sheet with syntax examples' },
            { emoji: '🔌', text: 'Connection status and DCC-EX version display' },
          ]}
          screenshot="/screenshots/cloud_desktop_dashboard.png"
          screenshotAlt="DCC-EX console"
          flip
          docLink="/docs/cloud/dcc-ex"
          docLabel="DCC-EX Console reference"
        />
      </div>

      {/* ── Feature Reference Carousel ── */}
      <FeatureCarousel
        slides={cloudFeatures}
        sectionLabel="Feature Reference"
        sectionColor="lime"
        title="Everything in Cloud"
        description={
          <>
            Beyond the basics, Cloud gives you full control over every aspect of your layout.
            Configure it here, control it from{' '}
            <Link href="/guides/throttle" className="text-deja-cyan hover:underline">Throttle</Link>.
          </>
        }
        tabColumns="sm:grid-cols-4"
      />

      {/* ── What's Next ── */}
      <section className="py-16 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <AnimateIn>
            <h2 className="text-white font-bold text-2xl mb-6">What&apos;s Next</h2>
          </AnimateIn>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Throttle Guide', desc: 'Drive trains with what you just configured', href: '/guides/throttle' },
              { label: 'Architecture', desc: 'How the entire DEJA.js platform works', href: '/guides/architecture' },
              { label: 'IO Guide', desc: 'Expand with Arduino and Pico W hardware', href: '/guides/io' },
              { label: 'Monitor', desc: 'Diagnostics, logging, and system health', href: '/guides/monitor' },
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
