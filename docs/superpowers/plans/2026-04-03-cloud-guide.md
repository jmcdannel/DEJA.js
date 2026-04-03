# Cloud Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create an interactive guide for the DEJA Cloud app on the dejajs-www marketing site, matching the Throttle guide's patterns.

**Architecture:** Single `CloudGuide.tsx` component with inline sub-components (matching ThrottleGuide pattern), a Next.js route page, and minor edits to the guides index and sidebar to activate the Cloud entry. Also update Cloud MDX docs.

**Tech Stack:** React 18, Next.js, Tailwind CSS, existing shared components (AnimateIn, SectionLabel, Logo, PhoneMockup, DocLink)

**Spec:** `docs/superpowers/specs/2026-04-03-cloud-guide-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `apps/dejajs-www/components/guides/CloudGuide.tsx` | Create | Main guide component with all sections |
| `apps/dejajs-www/app/guides/cloud/page.tsx` | Create | Next.js route page |
| `apps/dejajs-www/app/guides/page.tsx` | Modify | Activate Cloud guide (remove comingSoon) |
| `apps/dejajs-www/components/GuidesSidebar.tsx` | Modify | Activate Cloud guide (remove comingSoon) |
| `docs/cloud/overview.mdx` | Modify | Add guide link, reorder sections |

---

### Task 1: Create CloudGuide.tsx — Sub-components and Hero

**Files:**
- Create: `apps/dejajs-www/components/guides/CloudGuide.tsx`

This task creates the file with all shared sub-components and the Hero + Prerequisites sections. The component follows the exact same pattern as `ThrottleGuide.tsx` — `'use client'` directive, inline sub-components, same imports.

- [ ] **Step 1: Create CloudGuide.tsx with sub-components and hero**

Create `apps/dejajs-www/components/guides/CloudGuide.tsx` with the following content:

```tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AnimateIn from '../home/AnimateIn';
import SectionLabel from '../home/SectionLabel';
import Logo from '../Logo';
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

function ThrottleNote({ children }: { children: React.ReactNode }) {
  return (
    <AnimateIn>
      <div className="p-4 rounded-lg border border-teal-500/20 bg-teal-950/20">
        <p className="text-xs text-teal-400 font-mono tracking-wider uppercase mb-2">🚂 See it in Throttle</p>
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

function FeatureSection({
  title,
  desc,
  features,
  screenshot,
  screenshotAlt,
  flip = false,
  throttleNote,
  docLink,
  docLabel,
  children,
}: {
  title: string;
  desc: string;
  features: { emoji: string; text: string }[];
  screenshot: string;
  screenshotAlt: string;
  flip?: boolean;
  throttleNote?: React.ReactNode;
  docLink?: string;
  docLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <AnimateIn direction={flip ? 'right' : 'left'} className={flip ? 'lg:order-2' : ''}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">{title}</h2>
          <p className="text-gray-400 leading-relaxed mb-6">{desc}</p>
          <FeatureGrid items={features} />
          {throttleNote && <div className="mt-4">{throttleNote}</div>}
          {children}
          {docLink && docLabel && (
            <div className="mt-4">
              <DocLink href={docLink}>{docLabel}</DocLink>
            </div>
          )}
        </AnimateIn>
        <AnimateIn direction={flip ? 'left' : 'right'} className={`flex justify-center ${flip ? 'lg:order-1' : ''}`}>
          <div className="rounded-2xl border-2 border-gray-700 bg-gray-900 p-2 shadow-2xl w-full max-w-lg">
            <div className="mx-auto w-8 h-1 bg-gray-800 rounded-full mb-1" />
            <div className="rounded-xl overflow-hidden">
              <Image src={screenshot} alt={screenshotAlt} width={1200} height={675} className="w-full h-auto" />
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

/* ── Main guide (sections added in subsequent tasks) ── */

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
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dejajs-www/components/guides/CloudGuide.tsx
git commit -m "feat(www): add CloudGuide component with sub-components and hero"
```

---

### Task 2: Add Guided Flow sections (Dashboard, Device, Loco, Turnout, Effect)

**Files:**
- Modify: `apps/dejajs-www/components/guides/CloudGuide.tsx`

Add the 5 guided flow `FeatureSection` blocks inside the `CloudGuide` component, after the Prerequisites section and before the closing `</div>`. These alternate left/right (`flip`) and include `ThrottleNote` callouts where relevant.

- [ ] **Step 1: Add the 5 guided flow sections**

Insert after the Prerequisites `</AnimateIn>` closing tag and before the final `</div>`:

```tsx
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
        throttleNote={
          <ThrottleNote>
            Open Throttle from the QR code on your dashboard to start driving immediately.
          </ThrottleNote>
        }
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
        throttleNote={
          <ThrottleNote>
            Locomotives you add here appear instantly in the Throttle app — including
            function labels and consist groups.
          </ThrottleNote>
        }
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
          throttleNote={
            <ThrottleNote>
              Turnouts configured here appear in Throttle&apos;s turnout view with
              color-coded toggle switches.
            </ThrottleNote>
          }
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
        throttleNote={
          <ThrottleNote>
            Effects you create here can be triggered from the Throttle&apos;s Effects
            view — or automatically via sensor automations.
          </ThrottleNote>
        }
        docLink="/docs/cloud/effects"
        docLabel="Effects reference"
      />
```

- [ ] **Step 2: Commit**

```bash
git add apps/dejajs-www/components/guides/CloudGuide.tsx
git commit -m "feat(www): add guided flow sections to CloudGuide"
```

---

### Task 3: Add Feature Reference Carousel

**Files:**
- Modify: `apps/dejajs-www/components/guides/CloudGuide.tsx`

Add the `CloudFeaturesCarousel` component and its data array above the `CloudGuide` component, then render it inside the guide after the guided flow sections. This follows the exact pattern of `LayoutFeaturesCarousel` from ThrottleGuide.

- [ ] **Step 1: Add carousel data and component**

Insert above `export default function CloudGuide()`:

```tsx
/* ── Cloud Features Carousel ── */

interface CarouselSlide {
  id: string;
  emoji: string;
  title: string;
  tagline: string;
  desc: string;
  desktopScreenshot: string;
  features: { emoji: string; text: string }[];
  docHref: string;
  docLabel: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}

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

function CloudFeaturesCarousel() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = cloudFeatures[activeIdx];

  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto">
        <AnimateIn>
          <SectionLabel color="lime">Feature Reference</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-3">Everything in Cloud</h2>
          <p className="text-gray-400 leading-relaxed mb-10">
            Beyond the basics, Cloud gives you full control over every aspect of your layout.
            Configure it here, control it from{' '}
            <Link href="/guides/throttle" className="text-deja-cyan hover:underline">Throttle</Link>.
          </p>
        </AnimateIn>

        {/* Tab buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          {cloudFeatures.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => setActiveIdx(i)}
              className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                i === activeIdx
                  ? `${slide.accentBg} border-2 ${slide.accentBorder} ${slide.accentColor} shadow-lg`
                  : 'border-2 border-gray-800/60 text-gray-500 hover:border-gray-600 hover:text-gray-300 hover:bg-gray-900/50'
              }`}
            >
              <span className="text-2xl">{slide.emoji}</span>
              <span>{slide.title}</span>
            </button>
          ))}
        </div>

        {/* Active slide */}
        <div key={active.id}>
          <div className="mb-8">
            <h3 className={`text-3xl font-bold ${active.accentColor} mb-2`}>{active.title}</h3>
            <p className="text-xl text-white font-semibold">{active.tagline}</p>
            <p className="text-gray-400 leading-relaxed mt-3 max-w-2xl">{active.desc}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Screenshot — desktop browser frame */}
            <div className="relative">
              <div className="rounded-2xl border-2 border-gray-700 bg-gray-900 p-2 shadow-2xl">
                <div className="mx-auto w-8 h-1 bg-gray-800 rounded-full mb-1" />
                <div className="rounded-xl overflow-hidden">
                  <Image
                    src={active.desktopScreenshot}
                    alt={`${active.title} desktop view`}
                    width={1200}
                    height={675}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <FeatureGrid items={active.features} />
              <div className="mt-6 flex flex-wrap gap-3">
                <DocLink href={active.docHref}>{active.docLabel}</DocLink>
              </div>

              <div className={`mt-6 p-6 rounded-xl border-2 border-dashed ${active.accentBorder} ${active.accentBg} flex flex-col items-center gap-2`}>
                <span className="text-4xl">{active.emoji}</span>
                <p className={`text-sm font-medium ${active.accentColor}`}>Illustration coming soon</p>
                <p className="text-xs text-gray-500 text-center">Custom graphic for {active.title.toLowerCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Render the carousel inside CloudGuide**

Insert after the "Add an Effect" `FeatureSection` and before the closing `</div>`:

```tsx
      {/* ── Feature Reference Carousel ── */}
      <CloudFeaturesCarousel />
```

- [ ] **Step 3: Commit**

```bash
git add apps/dejajs-www/components/guides/CloudGuide.tsx
git commit -m "feat(www): add feature reference carousel to CloudGuide"
```

---

### Task 4: Add What's Next section

**Files:**
- Modify: `apps/dejajs-www/components/guides/CloudGuide.tsx`

Add the "What's Next" link grid at the bottom of the guide, after the carousel and before the closing `</div>`.

- [ ] **Step 1: Add What's Next section**

Insert after `<CloudFeaturesCarousel />` and before the closing `</div>`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/dejajs-www/components/guides/CloudGuide.tsx
git commit -m "feat(www): add What's Next section to CloudGuide"
```

---

### Task 5: Create route page and activate guide in navigation

**Files:**
- Create: `apps/dejajs-www/app/guides/cloud/page.tsx`
- Modify: `apps/dejajs-www/app/guides/page.tsx` (lines 36-42)
- Modify: `apps/dejajs-www/components/GuidesSidebar.tsx` (line 19)

- [ ] **Step 1: Create the route page**

Create `apps/dejajs-www/app/guides/cloud/page.tsx`:

```tsx
import type { Metadata } from 'next';
import CloudGuide from '../../../components/guides/CloudGuide';

export const metadata: Metadata = {
  title: 'Cloud',
  description: 'A complete guide to DEJA Cloud — manage your roster, configure turnouts, set up effects, wire signals, build routes, and create sensor automations.',
};

export default function CloudPage() {
  return <CloudGuide />;
}
```

- [ ] **Step 2: Activate Cloud in guides index**

In `apps/dejajs-www/app/guides/page.tsx`, replace the Cloud entry (lines 36-42):

```tsx
  {
    label: 'Cloud',
    href: '/guides/cloud',
    desc: 'Roster management, turnout configuration, route automation, and effects setup.',
    icon: '☁️',
    comingSoon: true,
    color: 'border-gray-700/30',
    iconBg: 'bg-gray-800',
  },
```

With:

```tsx
  {
    label: 'Cloud',
    href: '/guides/cloud',
    desc: 'Roster management, turnout configuration, route automation, and effects setup.',
    icon: '☁️',
    color: 'border-indigo-400/30 hover:border-indigo-400/60',
    iconBg: 'bg-indigo-400/10',
  },
```

- [ ] **Step 3: Activate Cloud in sidebar**

In `apps/dejajs-www/components/GuidesSidebar.tsx`, replace line 19:

```tsx
  { title: 'Cloud', href: '/guides/cloud', desc: 'Roster, turnouts & effects', comingSoon: true },
```

With:

```tsx
  { title: 'Cloud', href: '/guides/cloud', desc: 'Roster, turnouts & effects' },
```

- [ ] **Step 4: Commit**

```bash
git add apps/dejajs-www/app/guides/cloud/page.tsx apps/dejajs-www/app/guides/page.tsx apps/dejajs-www/components/GuidesSidebar.tsx
git commit -m "feat(www): add cloud guide route and activate in navigation"
```

---

### Task 6: Update Cloud MDX docs

**Files:**
- Modify: `docs/cloud/overview.mdx`

Add a prominent link to the interactive guide at the top, reorder the "What You Can Do" list to match the guide flow, and update "Next Steps" to include the guide.

- [ ] **Step 1: Update overview.mdx**

In `docs/cloud/overview.mdx`, after the frontmatter and `# Cloud App` heading (line 9), insert:

```mdx
> 🚀 **New to DEJA Cloud?** Start with the [interactive Cloud Guide](/guides/cloud) for a visual walkthrough of every feature.
```

Then replace the "Next Steps" section at the bottom (lines 75-80) with:

```mdx
## Next Steps

- [Cloud Guide](/guides/cloud) -- Interactive visual walkthrough of every feature.
- [Locomotive Roster](/docs/cloud/roster) -- Add and configure your locomotives.
- [Turnouts](/docs/cloud/turnouts) -- Define and organize your layout switches.
- [Effects](/docs/cloud/effects) -- Set up lights, sounds, LEDs, and macros.
- [Signals](/docs/cloud/signals) -- Wire three-aspect signal heads.
- [Routes](/docs/cloud/routes) -- Create automated turnout sequences.
- [Sensors](/docs/cloud/sensors) -- Monitor sensors and build automation rules.
- [Layout Configuration](/docs/cloud/layout) -- Set up devices and serial connections.
- [DCC-EX Console](/docs/cloud/dcc-ex) -- Send commands directly to your CommandStation.
- [Settings](/docs/cloud/settings) -- Account, theme, subscription, and server config.
```

- [ ] **Step 2: Commit**

```bash
git add docs/cloud/overview.mdx
git commit -m "docs(cloud): add guide link and expand next steps in overview"
```

---

### Task 7: Also activate Throttle guide in navigation

**Files:**
- Modify: `apps/dejajs-www/app/guides/page.tsx` (lines 26-33)

The Throttle guide exists and is rendered but is still marked `comingSoon` in the guides index. Since we're updating navigation, fix this too.

- [ ] **Step 1: Activate Throttle in guides index**

In `apps/dejajs-www/app/guides/page.tsx`, replace the Throttle entry (lines 26-33):

```tsx
  {
    label: 'Throttle',
    href: '/guides/throttle',
    desc: 'Train control, function buttons, consists, and everything you can do from the Throttle app.',
    icon: '🚂',
    comingSoon: true,
    color: 'border-gray-700/30',
    iconBg: 'bg-gray-800',
  },
```

With:

```tsx
  {
    label: 'Throttle',
    href: '/guides/throttle',
    desc: 'Train control, function buttons, consists, and everything you can do from the Throttle app.',
    icon: '🚂',
    color: 'border-deja-cyan/30 hover:border-deja-cyan/60',
    iconBg: 'bg-deja-cyan/10',
  },
```

- [ ] **Step 2: Activate Throttle in sidebar**

In `apps/dejajs-www/components/GuidesSidebar.tsx`, the Throttle entry on line 18 does NOT have `comingSoon` — it's already active. No change needed.

- [ ] **Step 3: Commit**

```bash
git add apps/dejajs-www/app/guides/page.tsx
git commit -m "fix(www): activate throttle guide in guides index"
```
