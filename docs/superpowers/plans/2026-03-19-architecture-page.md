# Architecture Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an animated Architecture guide page at `/guides/architecture` with a cinematic hero, five reference sections, interactive diagram switcher, and video placeholder.

**Architecture:** Full-page React component composed of six section components, all client-side (`'use client'`) for Framer Motion animations. Reuses existing `AnimateIn` wrapper, `ArchitectureDiagram` SVG component, and screenshot assets. New components live in `components/architecture/`.

**Tech Stack:** Next.js 15, React, Framer Motion, Tailwind CSS, existing `AnimateIn` + `ArchitectureDiagram` components.

**Spec:** `docs/superpowers/specs/2026-03-19-architecture-page-design.md`

---

### Task 1: Route & Navigation Setup

**Files:**
- Create: `apps/dejajs-www/app/guides/architecture/page.tsx`
- Modify: `apps/dejajs-www/app/guides/layout.tsx`

- [ ] **Step 1: Add Architecture to guides sidebar**

In `apps/dejajs-www/app/guides/layout.tsx`, add the Architecture guide entry to the `guides` array (after Getting Started, before Throttle):

```tsx
{ label: 'Architecture', href: '/guides/architecture', desc: 'How the platform works' },
```

- [ ] **Step 2: Create the page route**

Create `apps/dejajs-www/app/guides/architecture/page.tsx`:

```tsx
import type { Metadata } from 'next';
import ArchitecturePage from '../../../components/architecture/ArchitecturePage';

export const metadata: Metadata = {
  title: 'Architecture',
  description: 'How DEJA.js works — from a tap on your phone to a train on the track.',
};

export default function ArchitectureGuidePage() {
  return <ArchitecturePage />;
}
```

- [ ] **Step 3: Create placeholder ArchitecturePage component**

Create `apps/dejajs-www/components/architecture/ArchitecturePage.tsx`:

```tsx
'use client';

export default function ArchitecturePage() {
  return (
    <div className="space-y-32">
      <p className="text-gray-400">Architecture page — sections coming next.</p>
    </div>
  );
}
```

- [ ] **Step 4: Verify in browser**

Navigate to `http://localhost:3052/guides/architecture`. Confirm the sidebar shows "Architecture" as a link (not "Coming Soon") and the placeholder text renders.

- [ ] **Step 5: Commit**

```
feat: add architecture guide route and navigation entry
```

---

### Task 2: Reusable Mockup Components

**Files:**
- Create: `apps/dejajs-www/components/architecture/PhoneMockup.tsx`
- Create: `apps/dejajs-www/components/architecture/TerminalMockup.tsx`
- Create: `apps/dejajs-www/components/architecture/ArduinoMockup.tsx`

- [ ] **Step 1: Create PhoneMockup**

A phone frame that wraps a screenshot image. Renders a rounded-rect phone bezel with notch, status bar, and the image inside.

```tsx
// apps/dejajs-www/components/architecture/PhoneMockup.tsx
'use client';

import Image from 'next/image';

interface PhoneMockupProps {
  src: string;
  alt: string;
  className?: string;
}

export default function PhoneMockup({ src, alt, className = '' }: PhoneMockupProps) {
  return (
    <div className={`relative w-[180px] ${className}`}>
      {/* Phone bezel */}
      <div className="rounded-[24px] border-2 border-gray-700 bg-gray-900 p-2 shadow-2xl">
        {/* Notch */}
        <div className="mx-auto w-16 h-1.5 bg-gray-800 rounded-full mb-1.5" />
        {/* Screen */}
        <div className="rounded-[16px] overflow-hidden">
          <Image src={src} alt={alt} width={360} height={780} className="w-full h-auto" />
        </div>
        {/* Home indicator */}
        <div className="mx-auto w-12 h-1 bg-gray-700 rounded-full mt-2" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create TerminalMockup**

A macOS-style terminal window with traffic light dots and children content.

```tsx
// apps/dejajs-www/components/architecture/TerminalMockup.tsx
'use client';

interface TerminalMockupProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function TerminalMockup({ title = 'Terminal', children, className = '' }: TerminalMockupProps) {
  return (
    <div className={`rounded-xl border border-gray-700 bg-gray-900 shadow-2xl overflow-hidden ${className}`}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/80 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-gray-500 font-mono ml-2">{title}</span>
      </div>
      {/* Terminal body */}
      <div className="p-4 font-mono text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create ArduinoMockup**

A stylized Arduino Mega + Motor Shield SVG placeholder.

```tsx
// apps/dejajs-www/components/architecture/ArduinoMockup.tsx
'use client';

interface ArduinoMockupProps {
  className?: string;
}

export default function ArduinoMockup({ className = '' }: ArduinoMockupProps) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 200 140" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        {/* PCB board */}
        <rect x="10" y="20" width="180" height="110" rx="4" fill="#0f172a" stroke="rgb(139,92,246)" strokeWidth="2" />

        {/* USB-B port */}
        <rect x="20" y="10" width="28" height="16" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1.5" />

        {/* Power jack */}
        <rect x="60" y="12" width="20" height="12" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1" />

        {/* Main chip (ATmega2560) */}
        <rect x="70" y="55" width="50" height="40" rx="2" fill="#1e1e3e" stroke="rgb(139,92,246)" strokeWidth="1.5" />
        <text x="95" y="78" textAnchor="middle" fontSize="7" fill="rgb(139,92,246)" fontFamily="monospace">ATmega</text>
        <text x="95" y="88" textAnchor="middle" fontSize="7" fill="rgb(139,92,246)" fontFamily="monospace">2560</text>

        {/* Pin headers — top */}
        {Array.from({ length: 16 }).map((_, i) => (
          <rect key={`top-${i}`} x={30 + i * 9} y="22" width="5" height="8" rx="1" fill="rgb(234,179,8)" fillOpacity="0.6" />
        ))}

        {/* Pin headers — bottom */}
        {Array.from({ length: 16 }).map((_, i) => (
          <rect key={`bot-${i}`} x={30 + i * 9} y="108" width="5" height="8" rx="1" fill="rgb(234,179,8)" fillOpacity="0.6" />
        ))}

        {/* Motor Shield overlay (semi-transparent) */}
        <rect x="25" y="35" width="150" height="60" rx="3" fill="rgb(139,92,246)" fillOpacity="0.08" stroke="rgb(139,92,246)" strokeWidth="1" strokeDasharray="4 2" />
        <text x="100" y="50" textAnchor="middle" fontSize="8" fill="rgb(139,92,246)" fillOpacity="0.7" fontFamily="monospace">Motor Shield</text>

        {/* LED indicators */}
        <circle cx="160" cy="100" r="3" fill="rgb(34,197,94)" fillOpacity="0.8" />
        <circle cx="170" cy="100" r="3" fill="rgb(6,182,212)" fillOpacity="0.8" />

        {/* Label */}
        <text x="100" y="138" textAnchor="middle" fontSize="10" fill="rgb(139,92,246)" fontWeight="bold" fontFamily="system-ui">DCC-EX CommandStation</text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: Verify all three render**

Temporarily import all three in `ArchitecturePage` and confirm they render correctly.

- [ ] **Step 5: Commit**

```
feat: add PhoneMockup, TerminalMockup, ArduinoMockup components
```

---

### Task 3: Hero Section — Diagonal Story Cascade

**Files:**
- Create: `apps/dejajs-www/components/architecture/ArchitectureHero.tsx`
- Modify: `apps/dejajs-www/components/architecture/ArchitecturePage.tsx`

- [ ] **Step 1: Create ArchitectureHero**

The diagonal cascade with three elements sliding in from alternate sides. Uses `AnimateIn` with alternating `left`/`right` directions and staggered delays.

```tsx
// apps/dejajs-www/components/architecture/ArchitectureHero.tsx
'use client';

import AnimateIn from '../home/AnimateIn';
import PhoneMockup from './PhoneMockup';
import TerminalMockup from './TerminalMockup';
import ArduinoMockup from './ArduinoMockup';

export default function ArchitectureHero() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Headline */}
      <AnimateIn className="text-center mb-16">
        <p className="text-xs text-gray-500 font-mono tracking-[0.2em] uppercase mb-3">Architecture</p>
        <h1 className="text-5xl sm:text-6xl font-bold text-white">
          Tap. Command. Move.
        </h1>
        <p className="text-gray-400 mt-4 max-w-lg mx-auto">
          From the app in your hand to the track under your trains — every layer connected.
        </p>
      </AnimateIn>

      {/* Diagonal cascade */}
      <div className="flex flex-col gap-8 max-w-3xl mx-auto">
        {/* 1. Phone — slides from left */}
        <AnimateIn direction="left" delay={0.1}>
          <div className="flex items-center gap-6 -translate-x-8 sm:-translate-x-16">
            <PhoneMockup
              src="/screenshots/throttle_mobile_throttle.png"
              alt="DEJA.js Throttle app"
              className="w-[120px] sm:w-[150px]"
            />
            <div>
              <p className="text-deja-cyan font-semibold text-lg">You tap</p>
              <p className="text-gray-500 text-sm">Speed, direction, functions — all from your phone.</p>
            </div>
          </div>
        </AnimateIn>

        {/* Arrow */}
        <AnimateIn delay={0.2}>
          <p className="text-gray-600 text-2xl text-center">↘</p>
        </AnimateIn>

        {/* 2. CLI Terminal — slides from right */}
        <AnimateIn direction="right" delay={0.3}>
          <div className="flex items-center gap-6 translate-x-4 sm:translate-x-12 flex-row-reverse">
            <TerminalMockup title="deja" className="w-[260px] sm:w-[320px]">
              <p><span className="text-gray-500">$</span> <span className="text-deja-cyan">deja start</span></p>
              <p className="text-green-400 mt-1">✓ WebSocket ready</p>
              <p className="text-green-400">✓ Firebase connected</p>
              <p className="text-green-400">✓ Serial: /dev/ttyUSB0</p>
            </TerminalMockup>
            <div className="text-right">
              <p className="text-deja-cyan font-semibold text-lg">Server routes</p>
              <p className="text-gray-500 text-sm">WebSocket, Firebase, serial — all bridged.</p>
            </div>
          </div>
        </AnimateIn>

        {/* Arrow */}
        <AnimateIn delay={0.4}>
          <p className="text-gray-600 text-2xl text-center">↘</p>
        </AnimateIn>

        {/* 3. Arduino — slides from left */}
        <AnimateIn direction="left" delay={0.5}>
          <div className="flex items-center gap-6 translate-x-8 sm:translate-x-20">
            <ArduinoMockup className="w-[180px] sm:w-[220px]" />
            <div>
              <p className="text-[rgb(139,92,246)] font-semibold text-lg">Train moves</p>
              <p className="text-gray-500 text-sm">DCC signal on the rails. Your layout, alive.</p>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into ArchitecturePage**

Update `ArchitecturePage.tsx`:

```tsx
'use client';

import ArchitectureHero from './ArchitectureHero';

export default function ArchitecturePage() {
  return (
    <div className="space-y-32">
      <ArchitectureHero />
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

Navigate to `/guides/architecture`. Scroll down — three elements should cascade in diagonally with staggered delays.

- [ ] **Step 4: Commit**

```
feat: add ArchitectureHero with diagonal story cascade
```

---

### Task 4: Apps Section

**Files:**
- Create: `apps/dejajs-www/components/architecture/AppsSection.tsx`
- Modify: `apps/dejajs-www/components/architecture/ArchitecturePage.tsx`

- [ ] **Step 1: Create AppsSection**

Phone frame (Throttle) on left, tablet-style frame (Cloud dashboard) on right. Text describes multi-device access.

```tsx
// apps/dejajs-www/components/architecture/AppsSection.tsx
'use client';

import Image from 'next/image';
import AnimateIn from '../home/AnimateIn';
import PhoneMockup from './PhoneMockup';

export default function AppsSection() {
  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <AnimateIn direction="left">
          <p className="text-xs text-deja-cyan font-mono tracking-[0.2em] uppercase mb-3">DEJA.js Apps</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Control from any device.
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Throttle, Cloud, Monitor — every app connected to the same layout in real time.
            Open Throttle on your phone, Cloud on your tablet, Monitor on your laptop.
            Changes sync instantly across all of them.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Throttle', desc: 'Drive trains, throw turnouts, trigger effects' },
              { label: 'Cloud', desc: 'Manage your roster, routes, and automation' },
              { label: 'Monitor', desc: 'See everything happening on your layout' },
            ].map((app) => (
              <div key={app.label} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-deja-cyan mt-2 shrink-0" />
                <span className="text-gray-300">
                  <span className="font-semibold text-white">{app.label}</span> — {app.desc}
                </span>
              </div>
            ))}
          </div>
        </AnimateIn>

        {/* Illustrations */}
        <AnimateIn direction="right" className="flex items-end justify-center gap-4">
          <PhoneMockup
            src="/screenshots/throttle_mobile_throttle.png"
            alt="Throttle app on mobile"
            className="w-[140px]"
          />
          {/* Tablet-style frame */}
          <div className="rounded-2xl border-2 border-gray-700 bg-gray-900 p-2 shadow-2xl w-[280px]">
            <div className="mx-auto w-8 h-1 bg-gray-800 rounded-full mb-1" />
            <div className="rounded-xl overflow-hidden">
              <Image
                src="/screenshots/cloud_desktop_roster.png"
                alt="Cloud dashboard"
                width={560}
                height={350}
                className="w-full h-auto"
              />
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to ArchitecturePage**

Import `AppsSection` and add after `ArchitectureHero`.

- [ ] **Step 3: Verify in browser**

- [ ] **Step 4: Commit**

```
feat: add AppsSection with phone and tablet mockups
```

---

### Task 5: Server & CLI Section

**Files:**
- Create: `apps/dejajs-www/components/architecture/ServerSection.tsx`
- Modify: `apps/dejajs-www/components/architecture/ArchitecturePage.tsx`

- [ ] **Step 1: Create ServerSection**

Terminal mockup with progressive build animation — CLI output lines appear one by one using staggered `AnimateIn` children.

```tsx
// apps/dejajs-www/components/architecture/ServerSection.tsx
'use client';

import AnimateIn from '../home/AnimateIn';
import TerminalMockup from './TerminalMockup';

export default function ServerSection() {
  const lines = [
    { text: '$ deja start', color: 'text-deja-cyan', delay: 0 },
    { text: '', color: '', delay: 0.1 },
    { text: '✓ WebSocket server on :8082', color: 'text-green-400', delay: 0.2 },
    { text: '✓ Firebase connected (layout: tamarack)', color: 'text-green-400', delay: 0.4 },
    { text: '✓ Serial: /dev/ttyUSB0 @ 115200', color: 'text-green-400', delay: 0.6 },
    { text: '✓ MQTT broker connected', color: 'text-green-400', delay: 0.8 },
    { text: '', color: '', delay: 0.9 },
    { text: '  Ready — listening for commands', color: 'text-gray-400', delay: 1.0 },
  ];

  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Illustration — left (flipped from Apps section) */}
        <AnimateIn direction="left">
          <TerminalMockup title="deja — tamarack" className="max-w-md">
            {lines.map((line, i) => (
              <AnimateIn key={i} delay={line.delay} direction="none">
                <p className={line.color}>{line.text || '\u00A0'}</p>
              </AnimateIn>
            ))}
          </TerminalMockup>
        </AnimateIn>

        {/* Text — right */}
        <AnimateIn direction="right">
          <p className="text-xs text-deja-cyan font-mono tracking-[0.2em] uppercase mb-3">DEJA Server</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            One command. Everything connects.
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            The DEJA Server bridges your apps to your layout. It speaks WebSocket to your browser,
            Firebase to the cloud, serial to your DCC-EX command station, and MQTT to your IO devices.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Install it anywhere Node.js runs — your laptop, a Raspberry Pi, or a dedicated server.
            One command and your entire layout is online.
          </p>
        </AnimateIn>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to ArchitecturePage**

Import `ServerSection` and add after `AppsSection`.

- [ ] **Step 3: Verify in browser**

Scroll to the server section — terminal lines should appear one by one with staggered delays, simulating a progressive build.

- [ ] **Step 4: Commit**

```
feat: add ServerSection with progressive CLI animation
```

---

### Task 6: IO Devices Section

**Files:**
- Create: `apps/dejajs-www/components/architecture/IoDevicesSection.tsx`
- Modify: `apps/dejajs-www/components/architecture/ArchitecturePage.tsx`

- [ ] **Step 1: Create IoDevicesSection**

Shows Arduino and Pico W with peripherals cascading in. Uses the existing architecture diagram color scheme (yellow for IO, green for peripherals).

```tsx
// apps/dejajs-www/components/architecture/IoDevicesSection.tsx
'use client';

import AnimateIn from '../home/AnimateIn';

const peripherals = [
  { label: 'IALED Strips', icon: '💡' },
  { label: 'Servos', icon: '🔄' },
  { label: 'Signals', icon: '🚦' },
  { label: 'Relays', icon: '⚡' },
  { label: 'Sensors', icon: '📡' },
  { label: 'Sound', icon: '🔊' },
];

const devices = [
  { name: 'Arduino', desc: 'USB serial — direct pin control for LEDs, servos, relays, and more.' },
  { name: 'Pico W', desc: 'WiFi MQTT — wireless IO for signals, sensors, and effects anywhere on the layout.' },
];

export default function IoDevicesSection() {
  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <AnimateIn direction="left">
          <p className="text-xs text-[rgb(234,179,8)] font-mono tracking-[0.2em] uppercase mb-3">DEJA IO</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Expand endlessly.
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Arduino and Pico W devices bring your layout to life. Connect LEDs, servos, signals,
            relays, sensors, and speakers — anything that plugs into a microcontroller becomes part
            of your DEJA.js platform.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {devices.map((d) => (
              <div key={d.name} className="rounded-lg border border-[rgb(234,179,8)]/20 bg-[rgb(234,179,8)]/5 p-4">
                <p className="text-[rgb(234,179,8)] font-semibold mb-1">{d.name}</p>
                <p className="text-gray-400 text-sm">{d.desc}</p>
              </div>
            ))}
          </div>
        </AnimateIn>

        {/* Peripheral grid */}
        <div className="grid grid-cols-3 gap-4">
          {peripherals.map((p, i) => (
            <AnimateIn key={p.label} delay={i * 0.1} direction="up">
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-green-500/20 bg-green-500/5">
                <span className="text-2xl">{p.icon}</span>
                <span className="text-green-400 text-sm font-semibold">{p.label}</span>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to ArchitecturePage**

Import `IoDevicesSection` and add after `ServerSection`.

- [ ] **Step 3: Verify in browser**

Peripherals should cascade in one by one with staggered delays.

- [ ] **Step 4: Commit**

```
feat: add IoDevicesSection with cascading peripherals
```

---

### Task 7: Interactive Diagram Section with Toggle + Swipe

**Files:**
- Create: `apps/dejajs-www/components/architecture/DiagramSection.tsx`
- Create: `apps/dejajs-www/components/architecture/DiagramSwitcher.tsx`
- Modify: `apps/dejajs-www/components/architecture/ArchitecturePage.tsx`

- [ ] **Step 1: Create DiagramSwitcher**

Segmented pill toggle on desktop. On mobile, same toggle works (carousel deferred — toggle is functional on all screen sizes). Framer Motion `AnimatePresence` + `layout` for morphing transitions between configs.

```tsx
// apps/dejajs-www/components/architecture/DiagramSwitcher.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArchitectureDiagram } from '../diagrams/ArchitectureDiagram';
import { DIAGRAM_CONFIGS } from '../diagrams/configs';

const VISIBLE_CONFIGS = DIAGRAM_CONFIGS.filter(c => c.id !== 'withrottle');

export default function DiagramSwitcher() {
  const [activeId, setActiveId] = useState('minimal');

  return (
    <div>
      {/* Segmented toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-full border border-gray-700 bg-gray-900 p-1">
          {VISIBLE_CONFIGS.map((config) => (
            <button
              key={config.id}
              onClick={() => setActiveId(config.id)}
              className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeId === config.id
                  ? 'text-gray-950'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {activeId === config.id && (
                <motion.div
                  layoutId="diagram-toggle-bg"
                  className="absolute inset-0 rounded-full bg-deja-cyan"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{config.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Diagram with crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeId}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <ArchitectureDiagram config={activeId} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Create DiagramSection**

```tsx
// apps/dejajs-www/components/architecture/DiagramSection.tsx
'use client';

import AnimateIn from '../home/AnimateIn';
import DiagramSwitcher from './DiagramSwitcher';

export default function DiagramSection() {
  return (
    <section>
      <AnimateIn className="text-center mb-10">
        <p className="text-xs text-gray-500 font-mono tracking-[0.2em] uppercase mb-3">Full Picture</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          See the full picture.
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto">
          Choose your configuration — from a single throttle to a complete platform with IO devices,
          multiple command stations, and cloud sync.
        </p>
      </AnimateIn>

      <AnimateIn delay={0.2}>
        <DiagramSwitcher />
      </AnimateIn>
    </section>
  );
}
```

- [ ] **Step 3: Add to ArchitecturePage**

Import `DiagramSection` and add after `IoDevicesSection`.

- [ ] **Step 4: Verify in browser**

Toggle between Minimal, Standard, Full. The pill toggle should animate smoothly. The diagram should crossfade between configs.

- [ ] **Step 5: Commit**

```
feat: add DiagramSection with animated toggle switcher
```

---

### Task 8: Video Section

**Files:**
- Create: `apps/dejajs-www/components/architecture/VideoSection.tsx`
- Modify: `apps/dejajs-www/components/architecture/ArchitecturePage.tsx`

- [ ] **Step 1: Create VideoSection**

Placeholder video player with a styled thumbnail. Will be replaced with actual video later.

```tsx
// apps/dejajs-www/components/architecture/VideoSection.tsx
'use client';

import AnimateIn from '../home/AnimateIn';

export default function VideoSection() {
  return (
    <section>
      <AnimateIn className="text-center mb-8">
        <p className="text-xs text-gray-500 font-mono tracking-[0.2em] uppercase mb-3">Walkthrough</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          See it in action.
        </h2>
      </AnimateIn>

      <AnimateIn delay={0.2}>
        <div className="max-w-3xl mx-auto">
          {/* Video placeholder */}
          <div className="relative aspect-video rounded-2xl border border-gray-700 bg-gray-900 overflow-hidden flex items-center justify-center">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />

            {/* Play button */}
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-deja-cyan/50 bg-deja-cyan/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-deja-cyan ml-1" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-mono">Coming soon</p>
            </div>
          </div>
        </div>
      </AnimateIn>
    </section>
  );
}
```

- [ ] **Step 2: Add to ArchitecturePage**

Import `VideoSection` and add as the last section. Final `ArchitecturePage.tsx`:

```tsx
'use client';

import ArchitectureHero from './ArchitectureHero';
import AppsSection from './AppsSection';
import ServerSection from './ServerSection';
import IoDevicesSection from './IoDevicesSection';
import DiagramSection from './DiagramSection';
import VideoSection from './VideoSection';

export default function ArchitecturePage() {
  return (
    <div className="space-y-32">
      <ArchitectureHero />
      <AppsSection />
      <ServerSection />
      <IoDevicesSection />
      <DiagramSection />
      <VideoSection />
    </div>
  );
}
```

- [ ] **Step 3: Verify full page end-to-end**

Scroll through the entire page at `/guides/architecture`. Confirm all 6 sections render, animations trigger on scroll, and diagram toggle works.

- [ ] **Step 4: Commit**

```
feat: add VideoSection placeholder, complete architecture page
```

---

### Task 9: Polish & Final Review

**Files:**
- Possibly modify any of the above components for spacing/alignment tweaks

- [ ] **Step 1: Check responsive behavior**

Resize browser to mobile width. Verify:
- Hero cascade stacks vertically
- Section grids stack to single column
- Diagram switcher is usable on mobile
- Phone mockup scales appropriately

- [ ] **Step 2: Run lint and type-check**

```bash
pnpm lint && pnpm check-types
```

Fix any issues.

- [ ] **Step 3: Final scroll-through in browser**

Full page scroll at desktop and mobile widths. Verify animation timing feels right — no jarring jumps, no elements appearing too early or too late.

- [ ] **Step 4: Commit any polish fixes**

```
fix: polish architecture page responsive layout and animation timing
```
