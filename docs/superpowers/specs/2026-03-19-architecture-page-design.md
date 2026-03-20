# Architecture Page — Design Spec

**Date:** 2026-03-19
**Branch:** `feat/architecture-content`
**Location:** `/guides/architecture` (new page in dejajs-www)

---

## Overview

A rich, animated Architecture page under the Guides section of dejajs.com. The page tells the story of how DEJA.js works — from a tap on a phone to a train moving on the track — through cinematic scroll animations, interactive diagrams, and an embedded walkthrough video.

## Page Structure: Hybrid

Cinematic hero with a "Tap. Command. Move." narrative, followed by structured reference sections that explain each layer of the architecture with animated illustrations.

---

## Hero Section — Diagonal Story Cascade

Three elements flow diagonally top-left to bottom-right, each sliding in from alternate sides via Progressive Build scroll animation:

1. **Phone** — Throttle app screenshot in a phone frame mockup. Label: "You tap →"
2. **DEJA CLI** — Terminal window showing `$ deja start` with animated checkmarks. Label: "Server routes →"
3. **DCC-EX** — Stylized Arduino Mega + Motor Shield. Label: "→ Train moves"

**Headline:** "Tap. Command. Move."
**Subhead:** "From the app in your hand to the track under your trains — every layer connected."

All three use placeholder graphics initially. The progressive build animation draws elements in as the user scrolls past the hero viewport.

---

## Sections (in order below the hero)

### Section 1: DEJA.js Apps

**Illustration:** Animated phone frame (Throttle UI) + tablet frame (Cloud dashboard), side by side.
**Copy angle:** "Control from any device. Throttle, Cloud, Monitor — all connected, all in sync."
**Animation:** Scroll-triggered reveal with staggered delays. Phone slides in from left, tablet from right.
**Layout:** Text left, illustrations right (or stacked on mobile).

### Section 2: DEJA Server & CLI

**Illustration:** Terminal window with animated CLI output — `deja start` → checkmarks appearing for each subsystem (WebSocket ✓, Firebase ✓, Serial ✓). Glowing connection lines radiating outward.
**Copy angle:** "One command. Everything connects. WebSocket, Firebase, serial — the server bridges your apps to your layout."
**Animation:** Progressive Build — terminal text types out as user scrolls, checkmarks appear one by one.
**Layout:** Text right, illustration left (alternating from Section 1).

### Section 3: DEJA IO Devices

**Illustration:** Arduino + Pico W device icons with peripheral connections fanning out — LEDs, servos, signals, relays. MQTT connection line back to server.
**Copy angle:** "Expand endlessly. Arduino and Pico W devices bring your layout to life — lights, signals, servos, sounds, and more."
**Animation:** Scroll-triggered reveal. Devices appear first, then peripherals cascade in.
**Layout:** Text left, illustration right.

### Section 4: Interactive Architecture Diagram

**Illustration:** The existing SVG `ArchitectureDiagram` component with a config switcher.
**Copy angle:** "See the full picture. Choose your configuration."

**Switcher behavior:**
- **Desktop:** Segmented pill toggle — `Minimal | Standard | Full`
- **Mobile:** Swipeable carousel with dot indicators
- **Transition:** Diagram Morphing via Framer Motion `layout` + `AnimatePresence` — nodes animate into position, connections draw/retract, areas expand/shrink. Configs: Minimal, Standard, Full (no WiThrottle).

**Layout:** Full-width section. Toggle/carousel above, diagram below.

### Section 5: Architecture Video

**Illustration:** Embedded video player with cinematic placeholder thumbnail.
**Copy angle:** "See it in action."
**Animation:** Scroll-triggered reveal.
**Layout:** Full-width, centered. Video plan at `docs/superpowers/specs/2026-03-19-architecture-video-plan.md`.

---

## Animation Approach

Three animation techniques, layered across sections:

| Technique | Usage | Implementation |
|-----------|-------|----------------|
| **Scroll-Triggered Reveal** | Text, headings, cards, device illustrations | Existing `AnimateIn` component (Framer Motion `useInView`) |
| **Progressive Build** | Hero cascade, CLI terminal output, connection lines | Framer Motion `useScroll` + `useTransform` driving SVG path `strokeDashoffset` and opacity |
| **Diagram Morphing** | Config toggle transitions in Section 4 | Framer Motion `layout` prop on nodes + `AnimatePresence` for enter/exit |

No ambient/continuous animations. All motion is scroll-driven or interaction-driven.

---

## Navigation & Routing

- **Route:** `/guides/architecture`
- **Page file:** `app/guides/architecture/page.tsx`
- **Nav update:** Add "Architecture" to the guides sidebar in `app/guides/layout.tsx`, remove "Coming Soon" badge
- **Component directory:** `components/architecture/` for all section components

---

## Component Architecture

```
components/architecture/
├── ArchitectureHero.tsx          # Diagonal cascade hero
├── AppsSection.tsx               # Phone + tablet frames
├── ServerSection.tsx             # CLI terminal animation
├── IoDevicesSection.tsx          # Arduino/Pico + peripherals
├── DiagramSection.tsx            # Interactive SVG diagram + switcher
├── VideoSection.tsx              # Embedded video player
├── DiagramSwitcher.tsx           # Toggle (desktop) + carousel (mobile)
├── PhoneMockup.tsx               # Reusable phone frame with screenshot
├── TerminalMockup.tsx            # Reusable terminal window
└── ArduinoMockup.tsx             # Stylized Arduino Mega placeholder
```

All sections use the existing `AnimateIn` wrapper for scroll-triggered reveals. Progressive build sections use Framer Motion hooks directly.

---

## Brand Voice

Per brand guidelines:
- **Warm but precise.** Clear sentences. Friendly tone.
- **Confident without intimidating.** Technical terms used naturally, never to impress.
- **Platform positioning.** "The modern DCC platform" — not just a throttle.
- **No competitor attacks.** DCC-EX and JMRI positioned as complementary ecosystem partners.
- **No hype.** Let the architecture speak for itself.

---

## Existing Assets & Dependencies

- `components/diagrams/` — ArchitectureDiagram, DiagramNode, DiagramArrow, DiagramArea (existing, reused in Section 4)
- `components/home/AnimateIn.tsx` — Scroll-triggered reveal wrapper (reused across all sections)
- `framer-motion` — Already installed in dejajs-www
- `@mdi/js` — Already installed for diagram icons
- App screenshots in `public/screenshots/` — Can be used for phone/tablet mockups
- Architecture video plan at `docs/superpowers/specs/2026-03-19-architecture-video-plan.md`

---

## Out of Scope

- WiThrottle diagram variant (not ready)
- Actual screen recordings for video (placeholder only)
- Live hardware photography (placeholder Arduino graphic)
- Sound design / music for video
