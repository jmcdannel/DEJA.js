# Homepage Hero Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static right-column visual on the `dejajs.com` homepage hero with an autoplaying animated sequence that shows how a tap on the throttle app flows through the DEJA Server, gets translated to a DCC-EX command, and makes the train move on the track.

**Architecture:** Extract the animation primitives currently baked into `components/architecture/ArchitectureHero.tsx` into a shared `animation-primitives.tsx` module. Refactor `ArchitectureHero` to consume them (no behavior change). Build a new `components/home/HomepageHeroAnimation.tsx` that composes those primitives into a "big phone on the left + vertical pipeline (terminal → DCC-EX → track) on the right" layout. Wire it into `HeroSection.tsx` replacing the current static `ttt-architecture.svg` + phone overlay.

**Tech Stack:** Next.js 14+ App Router, React Server/Client Components, `framer-motion`, `next/image`, Tailwind CSS, TypeScript (strict). No tests — `dejajs-www` has no test suite.

**Spec:** `docs/superpowers/specs/2026-04-10-homepage-hero-animation-design.md`

---

## Preconditions

- Working in the `www-homepage` worktree at `/Users/jmcdannel/TTT/DEJA.js.git/www-homepage`.
- Branch `www-homepage` has been merged with `preview` (commit `61724a03` or later), so `apps/dejajs-www/components/architecture/ArchitectureHero.tsx` is the 734-line version containing the `Connector`, `TapRipple`, `TypeWriter`, `SequenceTerminal`, `SequenceOvalTrack`, and `StepLabel` helpers plus the `SEQ` constants and `EASE_ENTER` easing.
- `node_modules` are installed (run `pnpm install` from repo root if not).
- `.env` is present in the repo root — copy it if needed for `pnpm --filter=dejajs-www dev` to work.

Verify with:

```bash
cd /Users/jmcdannel/TTT/DEJA.js.git/www-homepage
git log --oneline -1
wc -l apps/dejajs-www/components/architecture/ArchitectureHero.tsx
```

Expected: `734 apps/dejajs-www/components/architecture/ArchitectureHero.tsx` (the actual line count may be ±2 depending on merge state, but it must contain all the helpers).

---

## File Structure

### Files to create

- `apps/dejajs-www/components/architecture/animation-primitives.tsx` — Shared client module exporting the animation primitives (`Connector`, `TapRipple`, `TypeWriter`, `SequenceTerminal`, `SequenceOvalTrack`), timing constants (`SEQ`), and easing curve (`EASE_ENTER`). Consumed by both `ArchitectureHero` and `HomepageHeroAnimation`.
- `apps/dejajs-www/components/home/HomepageHeroAnimation.tsx` — The new animated component for the homepage hero right column. Self-contained, autoplays on mount, supports `useReducedMotion()` and a replay button.

### Files to modify

- `apps/dejajs-www/components/architecture/ArchitectureHero.tsx` — Remove the inlined `Connector`, `TapRipple`, `TypeWriter`, `SequenceTerminal`, `SequenceOvalTrack`, `SEQ`, and `EASE_ENTER` definitions. Import them from `./animation-primitives`. `StepLabel` stays inlined here (homepage doesn't use it). No behavioral change.
- `apps/dejajs-www/components/home/HeroSection.tsx` — Replace the right-column `<AnimateIn delay={0.3} direction="right" …>` block (currently lines 79–102, containing the architecture SVG and phone mockup overlay) with `<HomepageHeroAnimation />`. No changes to the left column, background orbs, or scroll indicator.

### Files NOT to touch

- Any other file in `apps/dejajs-www/`.
- `TerminalMockup.tsx` — stays as-is, consumed by `SequenceTerminal` in the new primitives module.
- `/architecture` page (`apps/dejajs-www/app/...`) and all other components under `components/architecture/` except `ArchitectureHero.tsx`.

---

## Task 1: Extract animation primitives to a shared module

**Goal:** Move the five helper components and the `SEQ` / `EASE_ENTER` constants out of `ArchitectureHero.tsx` into a new `animation-primitives.tsx` module, without changing any behavior.

**Files:**
- Create: `apps/dejajs-www/components/architecture/animation-primitives.tsx`
- Modify: `apps/dejajs-www/components/architecture/ArchitectureHero.tsx`

- [ ] **Step 1.1: Create the shared primitives module**

Create `apps/dejajs-www/components/architecture/animation-primitives.tsx` with the exact content below. This is a verbatim copy of lines 21–52 (SEQ), 54 (EASE_ENTER), 62–152 (Connector), 155–177 (TapRipple), 180–212 (TypeWriter), 215–255 (SequenceTerminal), and 258–334 (SequenceOvalTrack) from the current `ArchitectureHero.tsx`, plus the `'use client'` directive and the `TerminalMockup` import.

```tsx
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import TerminalMockup from './TerminalMockup';

/**
 * Shared animation primitives used by both the architecture page hero
 * and the homepage hero. Extracted from ArchitectureHero.tsx so both
 * heroes can consume the same building blocks and stay in sync.
 */

export const SEQ = {
  // ── PHASE 1: intro ────────────────────────────────
  phoneShrinkDur: 0.35,
  conn1Draw: 0.35,
  conn1Dur: 0.35,
  terminalFade: 0.6,
  terminalDur: 0.2,
  typingStart: 0.75,    // "deja start" @ 40ms/char ≈ 0.4s
  readyLine: 1.2,
  conn2Draw: 1.3,
  conn2Dur: 0.35,
  dccFade: 1.55,
  dccDur: 0.2,
  conn3Draw: 1.7,
  conn3Dur: 0.35,
  trackFade: 1.95,
  trackDur: 0.2,

  // ── PHASE 2: story (slower — gives viewer time to read each label) ────────
  tap: 2.25,            // 👆 tap ripple on phone
  label1: 2.35,         // "You tap" / "Throttle App"
  dot1: 2.95,           // pause 0.6s after label1 so the viewer can read it
  dotDur: 0.8,
  label2: 3.85,         // "Server routes" / "DEJA Server" — as dot arrives
  throttleCmd: 4.35,    // ← throttle line
  serialCmd: 4.7,       // → <t 3 50 1> line
  dot2: 5.25,
  label3: 6.15,         // "Translates & transmits" / "DCC-EX CommandStation"
  dot3: 6.65,
  label4: 7.55,         // "Train moves" / "DCC Track"
  trainStart: 7.65,     // 🚂 train begins orbit
} as const;

export const EASE_ENTER = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** Smooth cable-drape S-curve connector, optional traveling command dot. */
export function Connector({
  direction,
  drawDelay,
  drawDuration = 0.35,
  color1,
  color2,
  id,
  showDot = false,
  dotDelay = 0,
  dotDuration = 0.6,
}: {
  direction: 'left-to-right' | 'right-to-left';
  drawDelay: number;
  drawDuration?: number;
  color1: string;
  color2: string;
  id: string;
  showDot?: boolean;
  dotDelay?: number;
  dotDuration?: number;
}) {
  // Original vertical-tangent S — renders as a letterboxed square in the row
  // center thanks to the default preserveAspectRatio="xMidYMid meet". Graphics
  // are positioned near the row center to sit close to the curve endpoints.
  const d =
    direction === 'left-to-right'
      ? 'M 10,2 C 10,40 90,60 90,98'
      : 'M 90,2 C 90,40 10,60 10,98';

  return (
    <div className="w-full h-10 sm:h-12">
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        <path
          d={d}
          stroke={color1}
          strokeOpacity={0.06}
          strokeWidth={2}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <motion.path
          d={d}
          stroke={`url(#${id})`}
          strokeWidth={2}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: drawDuration, delay: drawDelay, ease: EASE_ENTER }}
        />
        {showDot && (
          <>
            <motion.circle
              r={4}
              fill={color1}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ delay: dotDelay, duration: dotDuration, times: [0, 0.05, 0.9, 1] }}
            >
              <animateMotion dur={`${dotDuration}s`} fill="freeze" begin={`${dotDelay}s`}>
                <mpath href={`#${id}-path`} />
              </animateMotion>
            </motion.circle>
            <motion.circle
              r={8}
              fill={color1}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.25, 0.25, 0] }}
              transition={{ delay: dotDelay, duration: dotDuration, times: [0, 0.05, 0.9, 1] }}
            >
              <animateMotion dur={`${dotDuration}s`} fill="freeze" begin={`${dotDelay}s`}>
                <mpath href={`#${id}-path`} />
              </animateMotion>
            </motion.circle>
          </>
        )}
        <path id={`${id}-path`} d={d} fill="none" stroke="none" />
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color1} stopOpacity={0.8} />
            <stop offset="100%" stopColor={color2} stopOpacity={0.6} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/** 👆 Tap ripple on the phone. */
export function TapRipple({ delay }: { delay: number }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ delay, duration: 0.7 }}
    >
      <motion.div
        className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm"
        initial={{ scale: 0.5 }}
        animate={{ scale: [0.5, 1, 0.8] }}
        transition={{ delay, duration: 0.3 }}
      />
      <motion.div
        className="absolute w-16 h-16 rounded-full border-2 border-deja-cyan/50"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 2.0], opacity: [0, 0.7, 0] }}
        transition={{ delay: delay + 0.05, duration: 0.5 }}
      />
    </motion.div>
  );
}

/** Types text one character at a time after an absolute delay. */
export function TypeWriter({
  text,
  startAt,
  speed = 40,
}: {
  text: string;
  startAt: number;
  speed?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        setCount((c) => {
          if (c >= text.length) {
            if (interval) clearInterval(interval);
            return c;
          }
          return c + 1;
        });
      }, speed);
    }, startAt * 1000);

    return () => {
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [text, startAt, speed]);

  return <span>{text.slice(0, count)}</span>;
}

/** Terminal with typewriter prompt + rolling output lines. */
export function SequenceTerminal() {
  // Delays are relative to terminal mount, so subtract terminalFade offset.
  const typingStart = SEQ.typingStart - SEQ.terminalFade;
  const readyStart = SEQ.readyLine - SEQ.terminalFade;
  const throttleStart = SEQ.throttleCmd - SEQ.terminalFade;
  const serialStart = SEQ.serialCmd - SEQ.terminalFade;

  return (
    <TerminalMockup title="deja — tamarack" className="text-[10px] w-[210px] sm:w-[240px]">
      <p className="text-deja-cyan">
        $ <TypeWriter text="deja start" startAt={typingStart} />
      </p>
      <motion.p
        className="text-green-400"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: readyStart, duration: 0.18, ease: 'easeOut' }}
      >
        ✓ Ready
      </motion.p>
      {/* 🏗️ reserved space — actual content rolls in during phase 2 */}
      <p aria-hidden className="invisible">{'\u00A0'}</p>
      <motion.p
        className="text-yellow-400"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: throttleStart, duration: 0.25, ease: 'easeOut' }}
      >
        ← throttle {'{addr:3, speed:50}'}
      </motion.p>
      <motion.p
        className="text-deja-magenta"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: serialStart, duration: 0.25, ease: 'easeOut' }}
      >
        → {'<t 3 50 1>'}
      </motion.p>
    </TerminalMockup>
  );
}

/** Stadium track — train parked initially, starts orbiting at `trainStartDelay`. */
export function SequenceOvalTrack({ trainStartDelay }: { trainStartDelay: number }) {
  const outerTrack = 'M 60,10 L 140,10 A 30,30 0 0 1 140,70 L 60,70 A 30,30 0 0 1 60,10 Z';
  const innerTrack = 'M 62,14 L 138,14 A 26,26 0 0 1 138,66 L 62,66 A 26,26 0 0 1 62,14 Z';
  const orbitPath = 'M 61,12 L 139,12 A 28,28 0 0 1 139,68 L 61,68 A 28,28 0 0 1 61,12 Z';

  const [moving, setMoving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMoving(true), trainStartDelay * 1000);
    return () => clearTimeout(timer);
  }, [trainStartDelay]);

  const ties: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < 8; i++) { const x = 65 + i * 10; ties.push({ x1: x, y1: 7, x2: x, y2: 17 }); }
  for (let i = 0; i < 8; i++) { const x = 65 + i * 10; ties.push({ x1: x, y1: 63, x2: x, y2: 73 }); }
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i + 1) * (Math.PI / 6);
    ties.push({
      x1: Math.round(140 + 25 * Math.cos(a)),
      y1: Math.round(40 + 25 * Math.sin(a)),
      x2: Math.round(140 + 35 * Math.cos(a)),
      y2: Math.round(40 + 35 * Math.sin(a)),
    });
  }
  for (let i = 0; i < 5; i++) {
    const a = Math.PI / 2 + (i + 1) * (Math.PI / 6);
    ties.push({
      x1: Math.round(60 + 25 * Math.cos(a)),
      y1: Math.round(40 + 25 * Math.sin(a)),
      x2: Math.round(60 + 35 * Math.cos(a)),
      y2: Math.round(40 + 35 * Math.sin(a)),
    });
  }

  return (
    <div className="w-[140px] sm:w-[170px] h-[56px] sm:h-[68px] relative">
      <svg viewBox="0 0 200 80" className="w-full h-full" fill="none">
        {ties.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke="#F97316"
            strokeOpacity={0.2}
            strokeWidth={1.5}
          />
        ))}
        <path d={outerTrack} stroke="#F97316" strokeOpacity={0.35} strokeWidth={1.2} />
        <path d={innerTrack} stroke="#F97316" strokeOpacity={0.25} strokeWidth={1} />

        {moving ? (
          // 🚂 train chain orbiting the path
          [0, 1, 2, 3, 4].map((i) => (
            <circle key={i} r={i === 0 ? 4.5 : 3} fill="#F97316" fillOpacity={i === 0 ? 1 : 0.75 - i * 0.1}>
              <animateMotion dur="3s" repeatCount="indefinite" begin={`${i * 0.1}s`}>
                <mpath href="#stadium-orbit" />
              </animateMotion>
            </circle>
          ))
        ) : (
          // 🛑 train parked at the top-left
          <>
            <circle cx={61} cy={12} r={4.5} fill="#F97316" />
            <circle cx={71} cy={12} r={3} fill="#F97316" fillOpacity={0.75} />
            <circle cx={81} cy={12} r={3} fill="#F97316" fillOpacity={0.65} />
            <circle cx={91} cy={12} r={3} fill="#F97316" fillOpacity={0.55} />
            <circle cx={101} cy={12} r={3} fill="#F97316" fillOpacity={0.45} />
          </>
        )}

        <path id="stadium-orbit" d={orbitPath} fill="none" stroke="none" />
      </svg>
    </div>
  );
}
```

- [ ] **Step 1.2: Refactor `ArchitectureHero.tsx` to import from the new module**

Open `apps/dejajs-www/components/architecture/ArchitectureHero.tsx` and:

1. Delete lines 21–334 (the `SEQ` constant, `EASE_ENTER` constant, and the five helper functions: `Connector`, `TapRipple`, `TypeWriter`, `SequenceTerminal`, `SequenceOvalTrack`). **Leave `StepLabel` (lines 336–394) intact.**
2. Remove the now-unused `TerminalMockup` import from line 6.
3. Add an import at the top of the file (after the existing imports) that brings in the primitives and constants.

The final state of the top of `ArchitectureHero.tsx` (lines 1–20) should look like:

```tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  Connector,
  EASE_ENTER,
  SEQ,
  SequenceOvalTrack,
  SequenceTerminal,
  TapRipple,
} from './animation-primitives';

/*
 * ── ARCHITECTURE HERO — TWO-PHASE ANIMATION ──
 *
 * PHASE 1 — INTRO (on scroll/click):
 *   Phone zooms out → lines draw in → terminal fades in → "deja start" types
 *   → ✓ Ready → connector 2 → DCC-EX → connector 3 → track (train parked)
 *
 * PHASE 2 — STORY (automatic, after phase 1):
 *   Tap ripple → "You tap" label → dot flies conn 1 → "Server routes" label
 *   → throttle command lines roll in → dot flies conn 2 → "Translates" label
 *   → dot flies conn 3 → "Train moves" label → train orbits! 🚂
 */
```

The file should continue immediately with `interface ArchitectureHeroProps { ... }` followed by the `StepLabel` function (unchanged) and then `export default function ArchitectureHero(...)` (unchanged).

- [ ] **Step 1.3: Run type-check to verify the refactor compiles**

```bash
pnpm --filter=dejajs-www exec tsc --noEmit
```

Expected: no errors. If you see `Cannot find module './animation-primitives'` or similar, check the file path in the import statement. If you see unused-import warnings on `TerminalMockup`, you missed removing the import in step 1.2.

- [ ] **Step 1.4: Run lint**

```bash
pnpm lint --filter=dejajs-www
```

Expected: no errors. If an ESLint rule flags the new file (e.g., `import/order`, `unused-vars`), fix inline and rerun.

- [ ] **Step 1.5: Build the app to confirm Next.js is happy**

```bash
pnpm --filter=dejajs-www build
```

Expected: build completes with no errors. This catches issues that `tsc` alone misses (e.g., missing `'use client'` directives, SSR-incompatible code).

- [ ] **Step 1.6: Visually verify `/architecture` still works**

Start the dev server:

```bash
pnpm --filter=dejajs-www dev
```

In a browser, visit `http://localhost:3051/architecture`. Confirm:
1. The hero section renders with the "Tap. / Command. / Move." headline on the left.
2. Clicking anywhere in the hero triggers the animation — phone zooms out, connectors draw, terminal types out `deja start`, DCC-EX board appears, track appears, dot flies along connectors, and the train eventually orbits.
3. Timing and behavior match what the branch looked like before the refactor (reload once more if you're unsure).

Stop the dev server (Ctrl-C).

- [ ] **Step 1.7: Commit**

```bash
git add apps/dejajs-www/components/architecture/animation-primitives.tsx \
        apps/dejajs-www/components/architecture/ArchitectureHero.tsx
git commit -m "$(cat <<'EOF'
refactor(dejajs-www): 🧩 extract architecture hero primitives to shared module

Move Connector, TapRipple, TypeWriter, SequenceTerminal, SequenceOvalTrack,
SEQ constants, and EASE_ENTER easing out of ArchitectureHero.tsx into a new
animation-primitives.tsx module so the upcoming homepage hero animation can
reuse them. StepLabel stays inlined — only ArchitectureHero uses it.

No behavior change to the /architecture page.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Create the HomepageHeroAnimation component (core layout, no replay, no reduced motion)

**Goal:** Build the new `HomepageHeroAnimation.tsx` with the "big phone on the left + vertical pipeline on the right" layout. Autoplays on mount. Skip replay button and reduced-motion handling for now — those land in later tasks.

**Files:**
- Create: `apps/dejajs-www/components/home/HomepageHeroAnimation.tsx`

- [ ] **Step 2.1: Create the component file**

Create `apps/dejajs-www/components/home/HomepageHeroAnimation.tsx` with the following content:

```tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Connector,
  EASE_ENTER,
  SEQ,
  SequenceOvalTrack,
  SequenceTerminal,
  TapRipple,
} from '../architecture/animation-primitives';

/*
 * ── HOMEPAGE HERO ANIMATION ──
 *
 * A compact version of the /architecture hero, composed for the homepage
 * right column. Autoplays on mount. Uses a "big phone on the left + vertical
 * pipeline on the right" layout instead of the zig-zag used on /architecture.
 *
 * Flow encoded in the connectors:
 *   phone → DEJA Server (WebSocket / Firebase)           cyan → cyan
 *   DEJA Server → DCC-EX CommandStation (USB serial)     cyan → purple
 *   DCC-EX → DCC track (DCC signal on the rails)         purple → orange
 *
 * No step labels — the terminal is the narrative. The train keeps orbiting
 * indefinitely after the first pass (SequenceOvalTrack handles that natively
 * via repeatCount="indefinite").
 */

export default function HomepageHeroAnimation() {
  return (
    <div className="relative w-full max-w-[560px] min-h-[520px] lg:min-h-[560px] mx-auto">
      {/* Desktop / tablet: big phone on the left, vertical pipeline on the right.
          Mobile: single column — phone on top, then terminal, DCC-EX, track stacked. */}
      <div className="flex flex-col sm:flex-row sm:items-stretch sm:gap-4 h-full">

        {/* ── Phone column (big, ~55% of the area on sm+) ── */}
        <div className="relative flex items-center justify-center sm:w-[55%] mb-6 sm:mb-0">
          <motion.div
            className="relative w-[180px] sm:w-[240px] lg:w-[260px]"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE_ENTER }}
          >
            <Image
              src="/screenshots/throttle_mobile_throttle.png"
              alt="Throttle app — slide to control speed"
              width={520}
              height={1120}
              className="w-full h-auto rounded-xl shadow-2xl"
              priority
            />
            <TapRipple delay={SEQ.tap} />
          </motion.div>
        </div>

        {/* ── Right stack: terminal → DCC-EX → track, with vertical connectors ── */}
        <div className="relative flex flex-col items-center justify-between sm:w-[45%] gap-4 sm:gap-2">

          {/* Terminal (server) */}
          <motion.div
            className="relative flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: SEQ.terminalFade, duration: SEQ.terminalDur, ease: 'easeOut' }}
          >
            <SequenceTerminal />
          </motion.div>

          {/* Phone → Terminal connector (horizontal S-curve into the top of the stack).
              Rendered as an absolutely-positioned SVG overlaid across both columns on
              sm+ so it can span from the phone's right edge to the terminal's left edge.
              On mobile we render a short vertical connector instead. */}
          <div className="sm:hidden w-full -my-2">
            <Connector
              direction="left-to-right"
              drawDelay={SEQ.conn1Draw}
              drawDuration={SEQ.conn1Dur}
              color1="#00E5FF"
              color2="#00E5FF"
              id="home-conn-1-mobile"
              showDot
              dotDelay={SEQ.dot1}
              dotDuration={SEQ.dotDur}
            />
          </div>

          {/* Terminal → DCC-EX connector (short vertical) */}
          <div className="w-full -my-2">
            <Connector
              direction="right-to-left"
              drawDelay={SEQ.conn2Draw}
              drawDuration={SEQ.conn2Dur}
              color1="#00E5FF"
              color2="#8B5CF6"
              id="home-conn-2"
              showDot
              dotDelay={SEQ.dot2}
              dotDuration={SEQ.dotDur}
            />
          </div>

          {/* DCC-EX CommandStation */}
          <motion.div
            className="relative w-[100px] sm:w-[120px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: SEQ.dccFade, duration: SEQ.dccDur, ease: 'easeOut' }}
          >
            <Image
              src="/images/dcc-ex-commandstation.png"
              alt="DCC-EX CommandStation — Arduino Mega with Motor Shield"
              width={440}
              height={300}
              className="w-full h-auto drop-shadow-[0_0_12px_rgba(139,92,246,0.25)]"
            />
            <Image
              src="/dcc-ex/android-chrome-192x192.png"
              alt="DCC-EX"
              width={32}
              height={32}
              className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-purple-500/30 shadow-lg"
            />
          </motion.div>

          {/* DCC-EX → Track connector (short vertical) */}
          <div className="w-full -my-2">
            <Connector
              direction="left-to-right"
              drawDelay={SEQ.conn3Draw}
              drawDuration={SEQ.conn3Dur}
              color1="#8B5CF6"
              color2="#F97316"
              id="home-conn-3"
              showDot
              dotDelay={SEQ.dot3}
              dotDuration={SEQ.dotDur}
            />
          </div>

          {/* Oval track with train */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: SEQ.trackFade, duration: SEQ.trackDur, ease: 'easeOut' }}
          >
            <SequenceOvalTrack trainStartDelay={SEQ.trainStart} />
          </motion.div>
        </div>
      </div>

      {/* Phone → Terminal connector on sm+ — overlaid SVG that spans from the
          phone's right edge to the terminal's left edge. */}
      <div className="hidden sm:block absolute top-0 left-[45%] w-[20%] h-[28%] pointer-events-none">
        <Connector
          direction="left-to-right"
          drawDelay={SEQ.conn1Draw}
          drawDuration={SEQ.conn1Dur}
          color1="#00E5FF"
          color2="#00E5FF"
          id="home-conn-1-desktop"
          showDot
          dotDelay={SEQ.dot1}
          dotDuration={SEQ.dotDur}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2.2: Type-check**

```bash
pnpm --filter=dejajs-www exec tsc --noEmit
```

Expected: no errors. If you see import resolution errors, verify the relative path `../architecture/animation-primitives` is correct from `apps/dejajs-www/components/home/`.

- [ ] **Step 2.3: Commit**

```bash
git add apps/dejajs-www/components/home/HomepageHeroAnimation.tsx
git commit -m "$(cat <<'EOF'
feat(dejajs-www): 🎬 add HomepageHeroAnimation component

New component composes the shared animation primitives into a "big phone +
vertical pipeline (terminal → DCC-EX → track)" layout for the homepage hero.
Autoplays on mount. Not yet wired into HeroSection — that lands in a follow-up.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Wire `HomepageHeroAnimation` into `HeroSection`

**Goal:** Replace the static architecture SVG + phone overlay in `HeroSection.tsx`'s right column with the new `HomepageHeroAnimation` component.

**Files:**
- Modify: `apps/dejajs-www/components/home/HeroSection.tsx`

- [ ] **Step 3.1: Read the current file**

```bash
cat apps/dejajs-www/components/home/HeroSection.tsx
```

Find the right-column block — an `<AnimateIn delay={0.3} direction="right" …>` wrapping a `<div className="relative aspect-square w-full max-w-[480px]">` that contains an architecture SVG background and a phone mockup overlay. It's currently around lines 79–102.

- [ ] **Step 3.2: Apply the edit**

Replace the entire right-column block. The goal is to change this:

```tsx
          {/* Right: visual column */}
          <AnimateIn delay={0.3} direction="right" className="flex justify-center lg:justify-end">
            <div className="relative aspect-square w-full max-w-[480px]">
              {/* Architecture SVG background */}
              <Image
                src="/ttt-architecture.svg"
                alt="DEJA.js architecture diagram"
                fill
                className="object-contain opacity-40"
              />

              {/* Phone mockup overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[160px] sm:w-[200px] glow-cyan rounded-3xl border border-deja-cyan/30 overflow-hidden">
                  <Image
                    src="/screenshots/throttle_mobile_home.png"
                    alt="DEJA.js Throttle app on mobile"
                    width={200}
                    height={430}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </AnimateIn>
```

…into this:

```tsx
          {/* Right: animated architecture sequence */}
          <AnimateIn delay={0.3} direction="right" className="flex justify-center lg:justify-end">
            <HomepageHeroAnimation />
          </AnimateIn>
```

- [ ] **Step 3.3: Add the import**

At the top of `HeroSection.tsx`, alongside the existing imports (`AnimateIn`, `SectionLabel`, `Logo`), add:

```tsx
import HomepageHeroAnimation from './HomepageHeroAnimation';
```

- [ ] **Step 3.4: Remove the unused `Image` import if applicable**

Check whether `Image` from `next/image` is still used elsewhere in `HeroSection.tsx` after the edit. If it's not, remove the import:

```bash
grep -n "Image" apps/dejajs-www/components/home/HeroSection.tsx
```

If the only remaining matches are `import Image from 'next/image'` on line 1 and nothing else, remove that import line. If `Image` is still used elsewhere (unlikely based on the current file), leave it.

- [ ] **Step 3.5: Type-check + lint + build**

```bash
pnpm --filter=dejajs-www exec tsc --noEmit
pnpm lint --filter=dejajs-www
pnpm --filter=dejajs-www build
```

Expected: all three pass with no errors. Fix any unused-import or ordering issues inline.

- [ ] **Step 3.6: Visual verification**

Start the dev server:

```bash
pnpm --filter=dejajs-www dev
```

In a browser, visit `http://localhost:3051/`. Confirm:
1. The homepage hero loads.
2. The left column (logo, headline "Simple to start. Built to grow.", paragraph, "Get Started" / "See the Docs" CTAs) is unchanged.
3. The right column now shows the animated sequence: phone fades in, connectors draw, terminal appears and types `deja start`, DCC-EX board appears, track appears, dot flies along the connectors, and the train starts orbiting around ~7.65s.
4. The animation autoplays on page load — no scroll or click required.
5. No console errors in the browser devtools.

Also visit `http://localhost:3051/architecture` and confirm that page still works identically (this verifies Task 1 didn't regress).

Stop the dev server.

- [ ] **Step 3.7: Commit**

```bash
git add apps/dejajs-www/components/home/HeroSection.tsx
git commit -m "$(cat <<'EOF'
feat(dejajs-www): 🏠 swap homepage hero static visual for animated sequence

Replaces the static ttt-architecture.svg + phone mockup overlay in the
HeroSection right column with the new HomepageHeroAnimation component.
Headline, paragraph, CTAs, and background orbs are unchanged.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Add the replay button

**Goal:** After the train starts orbiting (~7.65s), fade in a small cyan "Replay" button in the bottom-right corner of the animation area. Clicking it remounts the animated subtree so the whole sequence replays from scratch.

**Files:**
- Modify: `apps/dejajs-www/components/home/HomepageHeroAnimation.tsx`

- [ ] **Step 4.1: Add `useState` and `lucide-react` imports**

At the top of `HomepageHeroAnimation.tsx`, extend the imports:

```tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import {
  Connector,
  EASE_ENTER,
  SEQ,
  SequenceOvalTrack,
  SequenceTerminal,
  TapRipple,
} from '../architecture/animation-primitives';
```

Verify `lucide-react` is already a dependency of the `dejajs-www` app:

```bash
grep -q '"lucide-react"' apps/dejajs-www/package.json && echo "OK" || echo "MISSING"
```

Expected: `OK`. If `MISSING`, install it first:

```bash
pnpm --filter=dejajs-www add lucide-react
```

- [ ] **Step 4.2: Refactor the component to own a `runKey` state and wrap the animated subtree**

Restructure the component so the animated subtree becomes an inner component keyed by `runKey`, and the replay button lives outside it:

```tsx
export default function HomepageHeroAnimation() {
  const [runKey, setRunKey] = useState(0);

  const handleReplay = () => setRunKey((k) => k + 1);

  return (
    <div className="relative w-full max-w-[560px] min-h-[520px] lg:min-h-[560px] mx-auto">
      <AnimatedSequence key={runKey} />

      {/* Replay button — fades in 0.35s after the train starts orbiting */}
      <motion.button
        key={`replay-${runKey}`}
        type="button"
        onClick={handleReplay}
        aria-label="Replay animation"
        className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-deja-cyan/40 text-deja-cyan/80 bg-gray-900/60 backdrop-blur-sm text-xs font-mono hover:border-deja-cyan hover:text-deja-cyan hover:glow-cyan transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: SEQ.trainStart + 0.35, duration: 0.4 }}
      >
        <RefreshCw className="w-3 h-3" aria-hidden="true" />
        Replay
      </motion.button>
    </div>
  );
}
```

Then, extract everything previously inside the top-level `<div>` (the `flex flex-col sm:flex-row ...` and the desktop-overlay connector) into a new non-exported `AnimatedSequence` function **above** `HomepageHeroAnimation`:

```tsx
function AnimatedSequence() {
  return (
    <>
      {/* Desktop / tablet: big phone on the left, vertical pipeline on the right.
          Mobile: single column — phone on top, then terminal, DCC-EX, track stacked. */}
      <div className="flex flex-col sm:flex-row sm:items-stretch sm:gap-4 h-full">

        {/* ── Phone column (big, ~55% of the area on sm+) ── */}
        <div className="relative flex items-center justify-center sm:w-[55%] mb-6 sm:mb-0">
          <motion.div
            className="relative w-[180px] sm:w-[240px] lg:w-[260px]"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE_ENTER }}
          >
            <Image
              src="/screenshots/throttle_mobile_throttle.png"
              alt="Throttle app — slide to control speed"
              width={520}
              height={1120}
              className="w-full h-auto rounded-xl shadow-2xl"
              priority
            />
            <TapRipple delay={SEQ.tap} />
          </motion.div>
        </div>

        {/* ── Right stack: terminal → DCC-EX → track, with vertical connectors ── */}
        <div className="relative flex flex-col items-center justify-between sm:w-[45%] gap-4 sm:gap-2">

          {/* Terminal (server) */}
          <motion.div
            className="relative flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: SEQ.terminalFade, duration: SEQ.terminalDur, ease: 'easeOut' }}
          >
            <SequenceTerminal />
          </motion.div>

          {/* Phone → Terminal (mobile only — short vertical connector) */}
          <div className="sm:hidden w-full -my-2">
            <Connector
              direction="left-to-right"
              drawDelay={SEQ.conn1Draw}
              drawDuration={SEQ.conn1Dur}
              color1="#00E5FF"
              color2="#00E5FF"
              id="home-conn-1-mobile"
              showDot
              dotDelay={SEQ.dot1}
              dotDuration={SEQ.dotDur}
            />
          </div>

          {/* Terminal → DCC-EX connector (short vertical) */}
          <div className="w-full -my-2">
            <Connector
              direction="right-to-left"
              drawDelay={SEQ.conn2Draw}
              drawDuration={SEQ.conn2Dur}
              color1="#00E5FF"
              color2="#8B5CF6"
              id="home-conn-2"
              showDot
              dotDelay={SEQ.dot2}
              dotDuration={SEQ.dotDur}
            />
          </div>

          {/* DCC-EX CommandStation */}
          <motion.div
            className="relative w-[100px] sm:w-[120px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: SEQ.dccFade, duration: SEQ.dccDur, ease: 'easeOut' }}
          >
            <Image
              src="/images/dcc-ex-commandstation.png"
              alt="DCC-EX CommandStation — Arduino Mega with Motor Shield"
              width={440}
              height={300}
              className="w-full h-auto drop-shadow-[0_0_12px_rgba(139,92,246,0.25)]"
            />
            <Image
              src="/dcc-ex/android-chrome-192x192.png"
              alt="DCC-EX"
              width={32}
              height={32}
              className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-purple-500/30 shadow-lg"
            />
          </motion.div>

          {/* DCC-EX → Track connector (short vertical) */}
          <div className="w-full -my-2">
            <Connector
              direction="left-to-right"
              drawDelay={SEQ.conn3Draw}
              drawDuration={SEQ.conn3Dur}
              color1="#8B5CF6"
              color2="#F97316"
              id="home-conn-3"
              showDot
              dotDelay={SEQ.dot3}
              dotDuration={SEQ.dotDur}
            />
          </div>

          {/* Oval track with train */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: SEQ.trackFade, duration: SEQ.trackDur, ease: 'easeOut' }}
          >
            <SequenceOvalTrack trainStartDelay={SEQ.trainStart} />
          </motion.div>
        </div>
      </div>

      {/* Phone → Terminal connector on sm+ — absolute overlay between phone and terminal */}
      <div className="hidden sm:block absolute top-0 left-[45%] w-[20%] h-[28%] pointer-events-none">
        <Connector
          direction="left-to-right"
          drawDelay={SEQ.conn1Draw}
          drawDuration={SEQ.conn1Dur}
          color1="#00E5FF"
          color2="#00E5FF"
          id="home-conn-1-desktop"
          showDot
          dotDelay={SEQ.dot1}
          dotDuration={SEQ.dotDur}
        />
      </div>
    </>
  );
}
```

**Note on the `key={runKey}` pattern:** passing `key` to `AnimatedSequence` causes React to unmount and remount the entire subtree when `runKey` changes, which re-fires every `initial → animate` framer-motion transition and restarts `TypeWriter` and `SequenceOvalTrack` from their initial states. The replay button also uses `key={`replay-${runKey}`}` so its own `initial={{ opacity: 0 }}` fires again on each replay, hiding it during the sequence and re-appearing at the end.

- [ ] **Step 4.3: Type-check + lint + build**

```bash
pnpm --filter=dejajs-www exec tsc --noEmit
pnpm lint --filter=dejajs-www
pnpm --filter=dejajs-www build
```

Expected: all three pass.

- [ ] **Step 4.4: Visual verification**

```bash
pnpm --filter=dejajs-www dev
```

Visit `http://localhost:3051/`. Confirm:
1. Animation autoplays on load.
2. ~8s after load, the "↻ Replay" button fades in at the bottom-right of the animation area.
3. Clicking it restarts the full sequence from the beginning — connectors redraw, terminal retypes `deja start`, train resets to parked position and eventually orbits again.
4. The replay button hides during the replay and reappears ~8s after click.
5. Hover state on the button: border and text go to full cyan opacity with a subtle glow.
6. Keyboard: tab to the button, press Enter/Space — should also trigger replay (native `<button>` behavior).

Stop the dev server.

- [ ] **Step 4.5: Commit**

```bash
git add apps/dejajs-www/components/home/HomepageHeroAnimation.tsx
git commit -m "$(cat <<'EOF'
feat(dejajs-www): 🔁 add replay button to homepage hero animation

A small cyan pill button fades in 0.35s after the train begins orbiting.
Clicking it increments a runKey, remounting the animated subtree to replay
the full sequence from scratch.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Add `prefers-reduced-motion` handling

**Goal:** When the visitor has reduced-motion set in their OS, render the animation in its final state (phone, full terminal, DCC-EX, track with train parked) with no transitions, typing effect, tap ripple, traveling dots, orbiting train, or replay button.

**Files:**
- Modify: `apps/dejajs-www/components/home/HomepageHeroAnimation.tsx`

- [ ] **Step 5.1: Import `useReducedMotion` from framer-motion**

Update the imports at the top:

```tsx
import { motion, useReducedMotion } from 'framer-motion';
```

- [ ] **Step 5.2: Create a static fallback component**

Add a new non-exported function `StaticSequence` immediately above `AnimatedSequence`. It renders the same layout but with no framer-motion transitions, a fully-rendered terminal (no typing), and a parked train. Use plain `<p>`/`<div>` where `AnimatedSequence` uses `<motion.p>`/`<motion.div>`, and render static versions of the primitives inline rather than reusing them (since the primitives themselves animate).

```tsx
function StaticSequence() {
  // Static terminal content — no typewriter, no rolling lines
  const staticTerminal = (
    <div className="rounded-xl border border-gray-700 bg-gray-900 shadow-2xl overflow-hidden text-[10px] w-[210px] sm:w-[240px]">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/80 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-gray-500 font-mono ml-2">deja — tamarack</span>
      </div>
      <div className="p-4 font-mono text-sm leading-relaxed">
        <p className="text-deja-cyan">$ deja start</p>
        <p className="text-green-400">✓ Ready</p>
        <p aria-hidden className="invisible">{'\u00A0'}</p>
        <p className="text-yellow-400">← throttle {'{addr:3, speed:50}'}</p>
        <p className="text-deja-magenta">→ {'<t 3 50 1>'}</p>
      </div>
    </div>
  );

  // Static connector — solid stroke, no animation, no dot
  const staticConnector = (direction: 'left-to-right' | 'right-to-left', color: string) => {
    const d =
      direction === 'left-to-right'
        ? 'M 10,2 C 10,40 90,60 90,98'
        : 'M 90,2 C 90,40 10,60 10,98';
    return (
      <div className="w-full h-10 sm:h-12">
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <path
            d={d}
            stroke={color}
            strokeOpacity={0.5}
            strokeWidth={2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    );
  };

  // Static track — train parked at the top-left, no orbit
  const staticTrack = (
    <div className="w-[140px] sm:w-[170px] h-[56px] sm:h-[68px] relative">
      <svg viewBox="0 0 200 80" className="w-full h-full" fill="none">
        <path
          d="M 60,10 L 140,10 A 30,30 0 0 1 140,70 L 60,70 A 30,30 0 0 1 60,10 Z"
          stroke="#F97316"
          strokeOpacity={0.35}
          strokeWidth={1.2}
        />
        <path
          d="M 62,14 L 138,14 A 26,26 0 0 1 138,66 L 62,66 A 26,26 0 0 1 62,14 Z"
          stroke="#F97316"
          strokeOpacity={0.25}
          strokeWidth={1}
        />
        <circle cx={61} cy={12} r={4.5} fill="#F97316" />
        <circle cx={71} cy={12} r={3} fill="#F97316" fillOpacity={0.75} />
        <circle cx={81} cy={12} r={3} fill="#F97316" fillOpacity={0.65} />
        <circle cx={91} cy={12} r={3} fill="#F97316" fillOpacity={0.55} />
        <circle cx={101} cy={12} r={3} fill="#F97316" fillOpacity={0.45} />
      </svg>
    </div>
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-stretch sm:gap-4 h-full">
        {/* Phone */}
        <div className="relative flex items-center justify-center sm:w-[55%] mb-6 sm:mb-0">
          <div className="relative w-[180px] sm:w-[240px] lg:w-[260px]">
            <Image
              src="/screenshots/throttle_mobile_throttle.png"
              alt="Throttle app — slide to control speed"
              width={520}
              height={1120}
              className="w-full h-auto rounded-xl shadow-2xl"
              priority
            />
          </div>
        </div>

        {/* Right stack */}
        <div className="relative flex flex-col items-center justify-between sm:w-[45%] gap-4 sm:gap-2">
          {staticTerminal}
          <div className="sm:hidden w-full -my-2">{staticConnector('left-to-right', '#00E5FF')}</div>
          <div className="w-full -my-2">{staticConnector('right-to-left', '#8B5CF6')}</div>
          <div className="relative w-[100px] sm:w-[120px]">
            <Image
              src="/images/dcc-ex-commandstation.png"
              alt="DCC-EX CommandStation — Arduino Mega with Motor Shield"
              width={440}
              height={300}
              className="w-full h-auto drop-shadow-[0_0_12px_rgba(139,92,246,0.25)]"
            />
            <Image
              src="/dcc-ex/android-chrome-192x192.png"
              alt="DCC-EX"
              width={32}
              height={32}
              className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-purple-500/30 shadow-lg"
            />
          </div>
          <div className="w-full -my-2">{staticConnector('left-to-right', '#F97316')}</div>
          {staticTrack}
        </div>
      </div>

      {/* Desktop overlay connector (phone → terminal) */}
      <div className="hidden sm:block absolute top-0 left-[45%] w-[20%] h-[28%] pointer-events-none">
        {staticConnector('left-to-right', '#00E5FF')}
      </div>
    </>
  );
}
```

- [ ] **Step 5.3: Update `HomepageHeroAnimation` to select between static and animated based on `useReducedMotion`**

```tsx
export default function HomepageHeroAnimation() {
  const prefersReducedMotion = useReducedMotion();
  const [runKey, setRunKey] = useState(0);

  const handleReplay = () => setRunKey((k) => k + 1);

  return (
    <div className="relative w-full max-w-[560px] min-h-[520px] lg:min-h-[560px] mx-auto">
      {prefersReducedMotion ? (
        <StaticSequence />
      ) : (
        <>
          <AnimatedSequence key={runKey} />
          <motion.button
            key={`replay-${runKey}`}
            type="button"
            onClick={handleReplay}
            aria-label="Replay animation"
            className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-deja-cyan/40 text-deja-cyan/80 bg-gray-900/60 backdrop-blur-sm text-xs font-mono hover:border-deja-cyan hover:text-deja-cyan hover:glow-cyan transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: SEQ.trainStart + 0.35, duration: 0.4 }}
          >
            <RefreshCw className="w-3 h-3" aria-hidden="true" />
            Replay
          </motion.button>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 5.4: Type-check + lint + build**

```bash
pnpm --filter=dejajs-www exec tsc --noEmit
pnpm lint --filter=dejajs-www
pnpm --filter=dejajs-www build
```

Expected: all three pass.

- [ ] **Step 5.5: Visually verify reduced-motion fallback**

On macOS: System Settings → Accessibility → Display → enable "Reduce motion". On Linux/Windows, set the equivalent OS-level preference, or use Chrome DevTools: open the Rendering panel and set "Emulate CSS media feature prefers-reduced-motion" to "reduce".

Then:

```bash
pnpm --filter=dejajs-www dev
```

Visit `http://localhost:3051/` and confirm:
1. The animation **does not** play — no fades, no typing, no tap ripple, no traveling dots.
2. The phone, fully-populated terminal (all four lines visible), DCC-EX board, and track (train parked, not orbiting) are all rendered immediately.
3. The replay button is **not** rendered.
4. Disable the reduced-motion emulation and reload — the full animation should play again as before.

Stop the dev server and turn off the reduced-motion OS setting if you enabled it.

- [ ] **Step 5.6: Commit**

```bash
git add apps/dejajs-www/components/home/HomepageHeroAnimation.tsx
git commit -m "$(cat <<'EOF'
feat(dejajs-www): ♿ honor prefers-reduced-motion in homepage hero animation

When the visitor has reduced-motion set, render a static version of the
hero sequence (fully-populated terminal, parked train, no transitions)
instead of the full animated sequence. The replay button is also hidden
since there is nothing to replay.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Responsive polish

**Goal:** Walk through the desktop, tablet, and mobile layouts in the browser and fix any visual issues (overflow, cramped spacing, misaligned connectors). This is a polish pass — the component was built responsive-first in Tasks 2 and 4, but real layouts usually need tweaks.

**Files:**
- Modify: `apps/dejajs-www/components/home/HomepageHeroAnimation.tsx`

- [ ] **Step 6.1: Start the dev server and open the homepage**

```bash
pnpm --filter=dejajs-www dev
```

Open `http://localhost:3051/` with Chrome devtools. Use the device toolbar (⌘⇧M / Ctrl+Shift+M) to switch between breakpoints.

- [ ] **Step 6.2: Check desktop (≥1024px / `lg`)**

Resize to 1440×900. Confirm:
- Hero is two-column: headline left, animation right.
- Phone is ~260px wide, dominant on the left side of the animation area.
- Terminal, DCC-EX board, and track sit in a vertical column on the right ~45% of the animation area.
- The phone→terminal connector is visible, curving from the phone's right edge into the top of the right column.
- The terminal→DCC-EX and DCC-EX→track connectors are visible between their respective rows.
- Nothing clips, overflows, or overlaps the headline column.

If the phone→terminal overlay connector doesn't sit where you expect, adjust the `absolute top-0 left-[45%] w-[20%] h-[28%]` values in the overlay div until it spans from the phone's right edge to the terminal's left edge. Common tweaks: `left-[40%] w-[25%]` or `top-[5%]`.

- [ ] **Step 6.3: Check tablet (640–1023px / `sm`–`lg`)**

Resize to 900×700 and then 720×700. Confirm:
- Hero stacks to single column (headline above, animation below — this is the existing behavior of `HeroSection`'s `grid-cols-1 lg:grid-cols-2`).
- The animation still uses the "phone on the left + right stack" side-by-side layout (because `sm:flex-row` kicks in at ≥640px).
- Phone is ~240px wide, readable.
- Terminal text is still legible.
- Track fits in its column without overflow.

Fix any cramped spacing by adjusting the `gap-4`, `gap-2`, or the `sm:w-[55%] / sm:w-[45%]` splits.

- [ ] **Step 6.4: Check mobile (<640px)**

Resize to 375×812 (iPhone). Confirm:
- Hero stacks to single column (headline above, animation below).
- The animation itself stacks **vertically**: phone on top, then mobile connector 1, then terminal, then connector 2, then DCC-EX, then connector 3, then track.
- Phone is ~180px wide.
- All connectors are visible and draw correctly.
- Nothing is cut off horizontally.

If the phone→terminal mobile connector looks wrong (wrong direction, too tall/short), tweak the `sm:hidden w-full -my-2` wrapper.

- [ ] **Step 6.5: Check the replay button placement at each breakpoint**

At each breakpoint, confirm the replay button sits at the bottom-right of the animation area without overlapping the track or extending outside the hero visual area. If the track and button collide at small sizes, adjust the button's `bottom-2 right-2` to `bottom-3 right-3` or use responsive classes (`bottom-2 sm:bottom-4`).

- [ ] **Step 6.6: Fix any issues found**

Make edits inline in `HomepageHeroAnimation.tsx`. Iterate quickly: save, let Next.js Fast Refresh update the browser, check again.

If you needed to make meaningful responsive tweaks, run:

```bash
pnpm --filter=dejajs-www exec tsc --noEmit
pnpm lint --filter=dejajs-www
pnpm --filter=dejajs-www build
```

Expected: all pass.

Stop the dev server.

- [ ] **Step 6.7: Commit (only if there were changes)**

```bash
git status
```

If `HomepageHeroAnimation.tsx` shows modifications from the responsive polish:

```bash
git add apps/dejajs-www/components/home/HomepageHeroAnimation.tsx
git commit -m "$(cat <<'EOF'
fix(dejajs-www): 📐 responsive polish for homepage hero animation

Adjustments to spacing, connector placement, and replay button positioning
across desktop, tablet, and mobile breakpoints.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

If there are no changes, skip the commit and move on.

---

## Task 7: Final verification and PR

**Goal:** Run the full verification suite, visually confirm both the homepage and `/architecture` one last time, then open a PR targeting `preview`.

- [ ] **Step 7.1: Run the full verification loop**

```bash
pnpm lint --filter=dejajs-www
pnpm --filter=dejajs-www exec tsc --noEmit
pnpm --filter=dejajs-www build
```

Expected: all three pass with no errors.

- [ ] **Step 7.2: Visual smoke test — homepage**

```bash
pnpm --filter=dejajs-www dev
```

Visit `http://localhost:3051/` and confirm:
1. Homepage hero autoplays on load.
2. Headline + CTAs on the left are unchanged.
3. Full sequence plays: phone → connectors draw → terminal types `deja start` → DCC-EX fades in → track fades in → dot flies through all three connectors → train orbits.
4. Replay button fades in ~8s after load.
5. Clicking replay restarts the full sequence.
6. No console errors.

- [ ] **Step 7.3: Visual smoke test — `/architecture`**

Visit `http://localhost:3051/architecture` and confirm the `/architecture` hero still behaves identically to how it did before the refactor (same two-phase intro + story sequence, same timing, same click-to-start and scroll-lock behavior). This verifies that Task 1's refactor didn't regress.

Stop the dev server.

- [ ] **Step 7.4: Confirm the clean branch state**

```bash
git status
git log --oneline preview..HEAD
```

Expected: working tree clean, and the log should show (in order) the commits from Tasks 1, 2, 3, 4, 5, and optionally 6, all on top of the `preview` merge.

- [ ] **Step 7.5: Push and open a PR**

Use the `/commit-push-pr` slash command — it detects the `www-homepage` branch and targets `preview` automatically. Alternatively run manually:

```bash
git push -u origin www-homepage
gh pr create --base preview --title "feat(dejajs-www): animated hero on homepage" --body "$(cat <<'EOF'
## Summary
- Extracts the animation primitives (Connector, TapRipple, TypeWriter, SequenceTerminal, SequenceOvalTrack, SEQ, EASE_ENTER) from `ArchitectureHero.tsx` into a new shared `animation-primitives.tsx` module so both heroes can consume them.
- Adds a new `HomepageHeroAnimation` component that composes those primitives into a "big phone + vertical pipeline (terminal → DCC-EX → track)" layout.
- Wires it into `HeroSection.tsx` replacing the static `ttt-architecture.svg` + phone overlay.
- Autoplays on mount, honors `prefers-reduced-motion`, and includes a replay button that fades in after the train starts orbiting.
- No behavioral change to the `/architecture` page.

## Test plan
- [ ] Homepage hero autoplays correctly on load.
- [ ] Full sequence plays: phone → connectors → terminal types `deja start` → DCC-EX → track → dot flies along connectors → train orbits.
- [ ] Replay button fades in ~8s after load and restarts the sequence on click.
- [ ] Reduced-motion OS preference shows the static fallback with no transitions.
- [ ] `/architecture` page is visually and temporally identical to before.
- [ ] Desktop, tablet, and mobile breakpoints all render correctly.

Spec: `docs/superpowers/specs/2026-04-10-homepage-hero-animation-design.md`
Plan: `docs/superpowers/plans/2026-04-10-homepage-hero-animation.md`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 7.6: Return the PR URL**

After `gh pr create` succeeds, capture the URL it prints and report it back.

---

## Self-Review — completed during plan authoring

**Spec coverage:**
- ✅ "big phone + vertical pipeline" layout → Task 2
- ✅ Reuse of `Connector`, `SequenceTerminal`, `SequenceOvalTrack`, `TapRipple` primitives → Task 1 extraction, Task 2 consumption
- ✅ `SEQ` and `EASE_ENTER` shared constants → Task 1
- ✅ `ArchitectureHero.tsx` refactor without behavior change → Task 1 steps 1.2 and 1.6
- ✅ New `HomepageHeroAnimation.tsx` component → Task 2
- ✅ `HeroSection.tsx` wiring → Task 3
- ✅ Autoplay on mount → Task 2 (no gating on scroll or click)
- ✅ No step labels on homepage → Task 2 (no `StepLabel` import)
- ✅ No scroll clamping → Task 2 (no scroll handlers)
- ✅ Connector colors encode phone→server (cyan), server→DCC-EX (cyan→purple), DCC-EX→track (purple→orange) → Task 2
- ✅ Train orbits indefinitely after first pass → inherited from `SequenceOvalTrack`'s `repeatCount="indefinite"`
- ✅ Replay button at 8.0s with remount pattern → Task 4
- ✅ Responsive (desktop, tablet, mobile) → Task 2 base implementation, Task 6 polish
- ✅ `prefers-reduced-motion` fallback → Task 5
- ✅ `StepLabel` stays in `ArchitectureHero.tsx` → Task 1 step 1.2

**Placeholder scan:** No `TBD`, `TODO`, or vague "add error handling" instructions. All code blocks are complete and paste-ready.

**Type consistency:** Function names, prop shapes, and import paths are consistent across all tasks. `runKey`, `handleReplay`, `AnimatedSequence`, `StaticSequence`, `HomepageHeroAnimation` are all used consistently.

**Ambiguity check:** The desktop phone→terminal connector overlay (Task 2 step 2.1, Task 6 step 6.2) is the riskiest positioning — it's an absolutely-positioned SVG whose exact coordinates may need adjustment in the browser. This is intentionally called out as a polish task (6.2) with specific example tweaks.
