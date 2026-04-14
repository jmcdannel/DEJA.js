# Homepage Hero Animation Design

**Date:** 2026-04-10
**Branch:** `www-homepage`
**Status:** Design — awaiting implementation plan

## Summary

Replace the static right-column visual on the `dejajs.com` homepage hero with a compact animated sequence that demonstrates how DEJA.js works end-to-end: a tap on the throttle app flows through the DEJA Server, gets translated to a DCC-EX command, and makes the train move on the track. The animation reuses (and extracts) primitives already built for the `/architecture` page hero.

The homepage headline, paragraph, CTAs, scroll indicator, and background glow orbs are **unchanged**.

## Goals

- Bring the "tap → command → train moves" story onto the homepage hero so first-time visitors immediately understand what DEJA.js does.
- Reuse the animation primitives already built on the `feature/architecture-animation` branch (currently uncommitted in the `architecture-animation` worktree).
- Preserve the current homepage hero's marketing hierarchy: headline + CTAs remain the primary focus, the animation is a supporting visual on the right.
- Keep the phone visually dominant — it's the most recognizable prop and the thing visitors will actually hold.
- Encode the **real** DEJA.js architecture in the visual: the phone talks directly to DEJA Server (not DCC-EX), the server translates and forwards to DCC-EX over serial, DCC-EX drives the track.

## Non-goals

- Redesigning the left column (headline, paragraph, CTAs, logo) — untouched.
- Redesigning `ArchitectureHero.tsx` or the `/architecture` page — only refactored to import from a shared primitives module. Behavior is identical after the refactor.
- Adding step labels ("You tap", "Server routes", etc.) — homepage version is visual-only; the terminal carries the narrative.
- Scroll-locking or click-to-start behavior — the homepage animation autoplays on mount.
- Changing homepage copy or CTAs.

## Context

### Current homepage hero

`apps/dejajs-www/components/home/HeroSection.tsx` renders a two-column grid:

- **Left column:** Logo, headline ("Simple to start. Built to grow. The cloud platform for DCC-EX."), paragraph, two CTAs ("Get Started" / "See the Docs"), fine-print.
- **Right column:** A static `ttt-architecture.svg` background at 40% opacity with a phone mockup (`throttle_mobile_home.png`) overlaid in the center, inside a ~480px square container.

The right-column visual is decorative — it doesn't explain the architecture; it just shows a phone on top of a diagram.

### Architecture-animation work (source of the primitives)

The animation primitives we're reusing live in the **uncommitted working tree** of the `architecture-animation` worktree (branch `feature/architecture-animation`) at `apps/dejajs-www/components/architecture/ArchitectureHero.tsx`. That file is 683 lines. The **committed** version on `preview` (and therefore on this `www-homepage` branch) is an older 415-line version **without** the primitives we need. `feature/architecture-animation` has not been merged and has no PR.

**Dependency implication:** the implementation plan for this homepage work must **also bring in** the new animation primitives (either by copying the relevant helpers into the new shared primitives module directly from the `architecture-animation` worktree, or by first merging/cherry-picking the animation work onto this branch). The homepage hero animation cannot ship without the primitives existing on the `www-homepage` branch.

The new 683-line version in the `architecture-animation` worktree defines one exported component (`ArchitectureHero`) and several private helpers that we want to extract:

- `Connector` — SVG S-curve between two grid slots, optionally with a traveling "command dot" that animates along the path using `<animateMotion>`. Supports gradient strokes and configurable delay/duration.
- `SequenceTerminal` — A `TerminalMockup` containing a typed `$ deja start` line, a `✓ Ready` line, and two rolling command lines (`← throttle {addr:3, speed:50}` and `→ <t 3 50 1>`).
- `SequenceOvalTrack` — An SVG stadium-shaped track with ties. Starts with the train parked top-left, switches to a 5-circle orbit chain after a configurable delay.
- `TapRipple` — A ripple effect overlaid on the phone to simulate a tap.
- `TypeWriter` — Character-by-character typing effect, used by `SequenceTerminal`.
- `StepLabel` — A two-line label (title + subtitle) that fades in next to each stage. **Only used by `ArchitectureHero`; not reused on the homepage.**
- `SEQ` — A constant object of animation delays and durations (all in seconds, relative to mount).
- `EASE_ENTER` — Shared cubic-bezier easing.

The `/architecture` page uses these primitives to play a full two-phase story: a reveal phase (phone zooms out, connectors draw, terminal appears, DCC-EX appears, track appears with train parked), followed by a narrative phase (tap ripple → dot flies along connectors → terminal scrolls commands → dot continues → train orbits). Total runtime ~7.7 seconds.

## Design

### Layout

Inside the existing `HeroSection` right column (~480–560px wide on desktop), render a new component `HomepageHeroAnimation`. It uses a "big phone + vertical pipeline" composition:

```
┌──────────────┬─────────────┐
│              │  ┌────────┐ │
│              │  │Terminal│ │  ← Server (SequenceTerminal)
│              │  └────┬───┘ │
│   PHONE      │       │     │
│  (big, ~55%) │       ▼     │
│              │  ┌────────┐ │
│              │  │DCC-EX  │ │  ← DCC-EX CommandStation (Image)
│     (phone)──┤──┘        │ │
│              │  └────┬───┘ │
│              │       │     │
│              │       ▼     │
│              │  ┌────────┐ │
│              │  │🚂 track│ │  ← SequenceOvalTrack
│              │  └────────┘ │
│              │             │
│              │    [↻ Replay]← fades in after train orbits
└──────────────┴─────────────┘
    ~55%            ~45%
```

- Phone fills the left ~55% of the animation area and stays big throughout — it's the hero prop.
- The right ~45% stacks Terminal → DCC-EX → Track vertically.
- **Phone → Terminal** connector is a horizontal S-curve that exits the phone's right edge near the top and enters the terminal's left edge.
- **Terminal → DCC-EX** connector is a short vertical S-curve in the right column.
- **DCC-EX → Track** connector is a short vertical S-curve in the right column.

### Connector colors (encode the real architecture)

Each connector represents a real protocol in the DEJA.js stack:

| Connector | Real protocol | Gradient |
|---|---|---|
| phone → server | WebSocket + Firebase | `#00E5FF` → `#00E5FF` (cyan solid) |
| server → DCC-EX | USB serial (DCC-EX text protocol) | `#00E5FF` → `#8B5CF6` (cyan to purple) |
| DCC-EX → track | DCC signal on the rails | `#8B5CF6` → `#F97316` (purple to orange) |

These match the colors already used by `ArchitectureHero`.

### Component structure

**New file:** `apps/dejajs-www/components/architecture/animation-primitives.tsx` (`'use client'`)

Exports — extracted verbatim from the private helpers currently inside `ArchitectureHero.tsx`:

- `Connector`
- `TapRipple`
- `TypeWriter`
- `SequenceTerminal`
- `SequenceOvalTrack`
- `SEQ` (timing constants)
- `EASE_ENTER`

`StepLabel` **stays** in `ArchitectureHero.tsx` — only that file uses it.

**Refactored file:** `apps/dejajs-www/components/architecture/ArchitectureHero.tsx`

- Remove the inlined helper definitions.
- Import from `./animation-primitives`.
- No behavioral change. The `/architecture` page is visually and temporally identical after the refactor.

**New file:** `apps/dejajs-www/components/home/HomepageHeroAnimation.tsx` (`'use client'`, ~150–180 lines)

- Composes `Connector`, `SequenceTerminal`, `SequenceOvalTrack`, `TapRipple` into the layout described above.
- Owns its own `<Image>` tags for the phone (`/screenshots/throttle_mobile_throttle.png`) and DCC-EX board (`/images/dcc-ex-commandstation.png`).
- Autoplays on mount — no `autoStart` prop, no scroll trigger, no click trigger.
- Does **not** apply scroll-clamping behavior (unlike `ArchitectureHero`).
- Does **not** render `StepLabel`s.
- Owns a `runKey` state for the replay button (see Replay section).
- Honors `useReducedMotion()` (see Reduced Motion section).

**Modified file:** `apps/dejajs-www/components/home/HeroSection.tsx`

- Replace the right-column block (the `<AnimateIn delay={0.3} direction="right" …>` wrapping the architecture SVG and phone overlay, currently lines 79–102) with `<HomepageHeroAnimation />`.
- Left column, background orbs, scroll indicator — all untouched.

### Animation choreography & timing

Same `SEQ` constants as `ArchitectureHero`, imported from the shared primitives module. All times are in seconds, relative to mount.

**Phase 1 — Intro (0 → 2.15s):** Everything fades in around the already-big phone. The phone does **not** do the zoom-out `layout` animation that `ArchitectureHero` uses — on the homepage it stays at its final size from frame 1.

| Time | Event |
|---|---|
| 0.35 → 0.70 | Connector 1 (phone → terminal) draws |
| 0.60 → 0.80 | Terminal fades in |
| 0.75 → ~1.15 | `$ deja start` types out character-by-character |
| 1.20 | `✓ Ready` fades in |
| 1.30 → 1.65 | Connector 2 (terminal → DCC-EX) draws |
| 1.55 → 1.75 | DCC-EX board fades in |
| 1.70 → 2.05 | Connector 3 (DCC-EX → track) draws |
| 1.95 → 2.15 | Track fades in (train parked at top-left of oval) |

**Phase 2 — Story (2.25 → 7.65s):**

| Time | Event |
|---|---|
| 2.25 | Tap ripple on phone |
| 2.95 → 3.75 | Command dot travels connector 1 (phone → terminal) |
| 4.35 | `← throttle {addr:3, speed:50}` rolls in |
| 4.70 | `→ <t 3 50 1>` rolls in |
| 5.25 → 6.05 | Dot travels connector 2 (terminal → DCC-EX) |
| 6.65 → 7.45 | Dot travels connector 3 (DCC-EX → track) |
| 7.65 | 🚂 Train begins orbiting the oval track |

**Loop (7.65s → ∞):** Train keeps orbiting indefinitely. Nothing else re-animates. The `SequenceOvalTrack`'s orbit uses `<animateMotion … repeatCount="indefinite">`, so this is free.

**Total runtime to first orbit: ~7.65 seconds.**

### Replay button

After the train starts orbiting, a small replay button fades in so visitors can re-watch the sequence on demand.

- **Placement:** absolutely positioned at the bottom-right corner of the animation container, outside the phone, below the track slot. Does not affect layout.
- **Styling:** pill shape, cyan ghost — `border border-deja-cyan/40 text-deja-cyan/80 bg-gray-900/60 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-mono`. Icon: lucide `refresh-cw` (or a ↻ character) + text "Replay". Hover state: full opacity border and text, `glow-cyan` glow.
- **Fade-in:** opacity 0 → 1 starting at **8.0s** (0.35s after train orbits), duration 0.4s. Wrapped in a `motion.button` with `initial={{opacity: 0}}`, `animate={{opacity: 1}}`, `transition={{delay: 8.0, duration: 0.4}}`.
- **Click behavior:**
    - Increments an internal `runKey` state (`setRunKey(k => k + 1)`).
    - The entire animated subtree (the phone, right stack, connectors, terminal, DCC-EX, track, replay button) is wrapped with `key={runKey}`, so React unmounts and remounts it. All framer-motion `initial → animate` transitions re-fire from scratch, and the `TypeWriter` effect restarts.
    - The replay button itself re-enters its `initial={{opacity: 0}}` state on remount, so it hides during the replay and re-appears at 8.0s.
- **Accessibility:** `<button type="button" aria-label="Replay animation">`.

### Responsive behavior

| Breakpoint | Layout |
|---|---|
| **`lg` and up (≥1024px)** | Two-column hero (current). Animation in right column (~480–560px). Full "big phone + right stack" layout. |
| **`sm`–`lg` (640–1023px)** | Single-column hero (current — the `grid-cols-1 lg:grid-cols-2` already handles this). Animation centered, ~560px max width. Same "big phone + right stack" layout, slightly scaled. |
| **Below `sm` (<640px)** | Single-column hero. Animation container is full-width minus page padding. Layout switches to a **compact vertical stack**: phone (~180px wide, centered) → terminal → DCC-EX → track, with **vertical** connectors between each row. |

The mobile switch uses Tailwind responsive classes (`flex-col sm:flex-row` or equivalent grid classes) rather than two separate JSX trees. `Connector` already supports vertical routing natively (its `direction` prop flips the S-curve tangent), so the same component works in both orientations.

Container has `min-h-[520px] lg:min-h-[560px]` to prevent collapse during image loading.

### Reduced motion

Use framer-motion's `useReducedMotion()` hook at the top of `HomepageHeroAnimation`. When it returns `true`:

- Render the **final state** directly — no framer-motion entrance transitions, no typing effect, no tap ripple, no traveling dots.
- Phone, terminal (with all four lines fully visible), DCC-EX board, and track are all rendered immediately.
- Connectors render as static solid strokes at full `pathLength`.
- Train is rendered in its **parked** position (no orbiting). The continuous orbit could be disorienting under reduced motion.
- The replay button is **hidden entirely** under reduced motion — there's nothing to replay.

This is a **new** accessibility behavior. The existing `ArchitectureHero` does not honor `prefers-reduced-motion`; we intentionally scope this addition to the homepage (a higher-impact surface) and leave the `/architecture` page as-is per the user's direction.

## Data flow

No data flow changes. No network calls, no state management, no props passed in from parent components. `HomepageHeroAnimation` is entirely self-contained:

- Images are loaded via `next/image` from `/public/screenshots/throttle_mobile_throttle.png` and `/public/images/dcc-ex-commandstation.png` (both already exist in the repo).
- Animation state is local React state (`runKey`).
- `useReducedMotion()` reads the user's system preference.

## Testing

**Manual visual verification:**

1. Load the homepage (`pnpm --filter=dejajs-www dev`) in a desktop browser. Confirm the animation autoplays on mount and reaches the train-orbit state around 7.65s. Confirm the replay button fades in at ~8.0s.
2. Click "Replay". Confirm the full intro + story re-plays from scratch.
3. Resize the browser across the `lg`, `sm`, and mobile breakpoints. Confirm the layout switches appropriately and nothing overflows or clips.
4. Enable "Reduce motion" in the OS accessibility settings. Reload. Confirm the animation renders in final state with no transitions and no replay button.
5. Navigate to `/architecture`. Confirm the page is visually and temporally identical to before the refactor (same timing, same choreography, same behavior).

**Build verification:**

1. `pnpm --filter=dejajs-www build` — confirm no TypeScript errors, no unused imports, no missing `'use client'` directives.
2. `pnpm lint` — confirm the new files pass the shared ESLint config.

**No unit tests.** This is a visual component with no logic worth isolating in tests, following the existing `dejajs-www` pattern (no test suite in that app).

## Branch dependency & coordination

The animation work in the `architecture-animation` worktree is **uncommitted** and has no open PR. Three options for how this homepage work picks up the new primitives:

1. **Bring the primitives directly onto `www-homepage`.** Copy the new helpers (`Connector`, `TapRipple`, `TypeWriter`, `SequenceTerminal`, `SequenceOvalTrack`, `SEQ`, `EASE_ENTER`) from the `architecture-animation` working tree into the new `animation-primitives.tsx` on this branch. Also update `ArchitectureHero.tsx` on this branch to use the new primitives (effectively bringing the animation work here too). The `architecture-animation` branch would then be either abandoned or rebased to consume the shared module. **Recommended** — unblocks the homepage work immediately, and the primitives are what this work is really about.
2. **Commit `architecture-animation` first, merge to `preview`, rebase `www-homepage`.** Cleaner history but adds a serialization dependency. Slower.
3. **Cherry-pick the one file from `architecture-animation`'s working tree.** Middle ground — brings in the new `ArchitectureHero.tsx` as a prerequisite commit on `www-homepage`, then the refactor + homepage work happens on top.

The implementation plan should pick one of these and run with it. **Recommendation: option 1.**

## Out of scope

- Changing the `/architecture` page's hero behavior.
- Adding step labels to the homepage animation.
- Adding scroll-lock or click-to-start on the homepage.
- Redesigning any other homepage section (`PromoHeroSection`, `QuickStartSection`, etc.).
- Updating screenshots or MDX docs — the homepage is not in `docs/apps/`.
- Changeset — this is a feature PR to `preview`, not `preview → main`, so no changeset required per `CLAUDE.md`.
