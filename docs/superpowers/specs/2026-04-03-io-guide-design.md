# 🔌 DEJA IO Guide & Shared Guide Components — Design Spec

**Date:** 2026-04-03
**Branch:** `io-guide`
**Status:** Draft

---

## 1. Goals

1. **Create the DEJA IO Guide** — a showcase page targeting DCC hobbyists evaluating DEJA.js, positioning it as a full layout automation platform (not just a throttle app).
2. **Extract shared guide components** — deduplicate ~9 components currently defined inline across 4 existing guides into a shared library under `components/guides/shared/`.
3. **Refactor all existing guides** (Getting Started, Throttle, Server, Cloud) to consume the shared components.
4. **Standardize doc links** — all guides and site pages use the existing `DocLink` component consistently (ServerGuide and GettingStartedGuide currently use plain `<Link>` elements).
5. **Create IO MDX docs** — detailed reference documentation for setup, commands, protocols, and custom device integration.

---

## 2. Target Audience

**Primary (Guide):** DCC hobbyists evaluating DEJA.js who want to see what IO capabilities set it apart from competing throttle apps.

**Secondary (Docs):** Existing users setting up devices (Audience A) and tinkerers building custom integrations (Audience D) — served by linked MDX docs, not the guide itself.

**Core message:** "DEJA.js is a full layout automation platform, not just a throttle — IO devices make your whole layout smart."

---

## 3. Shared Guide Components

### 3.1 Components to Extract

All components below are currently defined inline in 2–4 guide files. Extract each into `components/guides/shared/` with a barrel export via `index.ts`.

| Component | Source Guides | Props |
|---|---|---|
| **`VideoPlaceholder`** | Cloud, Throttle, Server | `title: string`, `subtitle?: string`, `aspectRatio?: string` |
| **`FeatureCard`** | Cloud, Throttle | `emoji: string`, `title: string`, `description: string`, `accentColor?: string` |
| **`FeatureGrid`** | Cloud, Throttle | `children: ReactNode`, `columns?: number` |
| **`FeatureSection`** | Cloud, Throttle | `title: string`, `description: string`, `screenshot?: string`, `features?: string[]`, `docHref?: string`, `docLabel?: string`, `accentColor: string`, `flip?: boolean`, `children?: ReactNode` |
| **`Callout`** | Server, Getting Started | `variant: 'info' \| 'warning' \| 'tip' \| 'success'`, `title?: string`, `children: ReactNode` |
| **`CommandBlock`** | Server, Getting Started | `command: string`, `description?: string`, `copyable?: boolean` |
| **`Step`** | Server, Getting Started | `number: number`, `title: string`, `children: ReactNode` |
| **`MdiIcon`** | Server, Getting Started | `icon: string`, `size?: number`, `className?: string` |
| **`GuideFeatureCarousel`** | Cloud, Throttle | `features: FeatureItem[]`, `accentColor: string` |

### 3.2 File Structure

```
components/guides/shared/
├── VideoPlaceholder.tsx
├── FeatureCard.tsx
├── FeatureGrid.tsx
├── FeatureSection.tsx
├── Callout.tsx
├── CommandBlock.tsx
├── Step.tsx
├── MdiIcon.tsx
├── GuideFeatureCarousel.tsx
└── index.ts
```

### 3.3 `DocLink` Standardization

The existing `DocLink` component (`components/DocLink.tsx`) — book icon + "docs" label — is already used correctly in ThrottleGuide and CloudGuide. **ServerGuide and GettingStartedGuide** currently use plain `<Link>` elements with inline classes for doc references. Refactor these to use `DocLink` for visual consistency across all guides and the site.

### 3.4 Feature Data Shape

Standardize the carousel feature data structure used by `GuideFeatureCarousel`:

```typescript
interface GuideFeature {
  id: string
  emoji: string
  title: string
  tagline: string
  description: string
  screenshot?: string
  features: string[]
  docHref?: string
  docLabel?: string
  accentColor: string
  accentBg: string
  accentBorder: string
}
```

---

## 4. Existing Guide Refactors

Each existing guide gets updated to import from `components/guides/shared/` instead of defining components inline. No content changes — purely mechanical extraction.

| Guide | Components to Replace | DocLink Fix |
|---|---|---|
| **ThrottleGuide** | FeatureCard, FeatureGrid, FeatureSection, VideoPlaceholder, GuideFeatureCarousel | Already using DocLink ✅ |
| **CloudGuide** | FeatureCard, FeatureGrid, FeatureSection, VideoPlaceholder, GuideFeatureCarousel | Already using DocLink ✅ |
| **ServerGuide** | Callout, CommandBlock, Step, MdiIcon, VideoPlaceholder | Replace plain `<Link>` with `DocLink` |
| **GettingStartedGuide** | Callout, CommandBlock, Step, MdiIcon | Replace plain `<Link>` with `DocLink` |

---

## 5. IO Guide Design

### 5.1 Page Location

- Route: `/guides/io`
- Page: `apps/dejajs-www/app/guides/io/page.tsx`
- Component: `apps/dejajs-www/components/guides/IoGuide.tsx`

### 5.2 Content Structure

#### Hero Section
- **Headline:** Positions DEJA IO as "beyond the throttle" — full layout automation
- **Subline:** Turnouts, signals, lights, effects, sensors — all from your phone
- **Visual:** High-level architecture diagram showing phone → DEJA server → devices → physical layout hardware

#### Protocol Architecture Diagram
- Animated/interactive diagram showing the 3 communication paths converging at the DEJA server:
  - **Serial USB** — Arduino, direct wired connection
  - **MQTT over WiFi** — Pico W, wireless throughout the layout
  - **WebSocket** — real-time browser monitoring & control
- Shows how all protocols feed into the unified DEJA server, which coordinates everything

#### Protocol Comparison Cards
- 3 side-by-side cards (Serial / MQTT / WebSocket), each showing:
  - Protocol name + icon
  - "Best for" one-liner
  - Hardware it pairs with
  - Connection type (wired/wireless)
  - Key characteristic (latency, range, simplicity)
- Evaluator-focused — "which fits my layout" not "how to configure"

#### Supported Devices Section
- **Arduino** card — Serial USB connection, supports turnouts, signals, digital outputs, sensors. Compile-time configuration. Cheap, reliable, wired.
- **Raspberry Pi Pico W** card — MQTT over WiFi, supports turnouts, digital outputs. Runtime configuration via `settings.toml` + `config.json`. Wireless, flexible placement.
- **Build Your Own** teaser — "Use Serial, MQTT, or WebSocket with your own hardware. Full command reference in the docs." Links to `custom-devices.mdx` via `DocLink`.

#### Deploy Flow Video/Animation (Showpiece Section)
- Short walkthrough video or animated sequence showing the end-to-end deploy experience:
  1. Configure device + effects in the Cloud app
  2. Run deploy command
  3. Device comes online and responds to commands
- Uses `VideoPlaceholder` initially, replaced with actual video content when available
- This is the primary "wow" moment for evaluators

#### Docs Links Section
- Grid of `DocLink` components linking to all IO MDX docs
- Organized by audience: "Get Started" (setup guides) and "Go Deeper" (reference/custom)

### 5.3 Update Guides Index & Homepage

- Add IO to the guides index page (`app/guides/page.tsx`) — remove "Coming Soon" status
- Update `GuidesGrid.tsx` on homepage to include IO guide card
- Update `GuidesSidebar.tsx` to include IO navigation entry

---

## 6. IO MDX Documentation

Detailed docs for setup and reference audiences, linked from the IO Guide via `DocLink`.

### 6.1 Docs Structure

```
docs/io/
├── overview.mdx              # Updated — align with guide messaging
├── arduino-setup.mdx         # NEW — hardware, wiring, flashing firmware
├── pico-w-setup.mdx          # NEW — hardware, WiFi config, CircuitPython deploy
├── command-reference.mdx     # NEW — full JSON command format for all protocols
├── protocols.mdx             # NEW — Serial, MQTT, WebSocket connection details
├── configuration.mdx         # NEW — config.h, settings.toml, config.json format
├── deploy.mdx                # NEW — deploy script, Firebase → device flow
└── custom-devices.mdx        # NEW — build your own device integration guide
```

### 6.2 Doc Content Summaries

**`arduino-setup.mdx`** — Hardware requirements (Arduino Uno/Mega, PCA9685 servo driver, wiring diagrams). Installing firmware. Configuring `config.h` feature flags and pin arrays. Connecting via USB.

**`pico-w-setup.mdx`** — Hardware requirements (Raspberry Pi Pico W, PCA9685). Installing CircuitPython. Configuring `settings.toml` (WiFi, MQTT broker, device ID). Pin mapping via `config.json`. Deploying files to the device.

**`command-reference.mdx`** — Complete JSON command specification for all actions:
- `pin` — digital output control (`{ "action": "pin", "payload": { "pin": 8, "state": 1 } }`)
- `servo` — servo position (`{ "action": "servo", "payload": { "servo": 0, "value": 90 } }`)
- `turnout` — turnout throw/close (`{ "action": "turnout", "payload": { "turnout": 0, "state": true } }`)
- `ialed` — addressable LED strip (planned)
- Format differences: Arduino receives JSON arrays, Pico W receives JSON objects with `device` field

**`protocols.mdx`** — Connection details for each protocol:
- Serial: baud rate (115200), port detection, JSON framing
- MQTT: broker config, topic format (`{topicId}/{layoutId}/{deviceId}`), subscribe/publish patterns, device filtering
- WebSocket: port (8082), `subscribe-device`/`unsubscribe-device` actions, `serial-data` event format

**`configuration.mdx`** — All config file formats:
- Arduino `config.h`: feature flags (`ENABLE_PWM`, `ENABLE_OUTPUTS`, etc.), pin arrays, turnout definitions
- Pico W `settings.toml`: environment variables (WiFi, MQTT, device identity)
- Pico W `config.json`: logical-to-physical pin mapping
- Layout-specific overrides under `io/layouts/{layoutId}/`

**`deploy.mdx`** — Using the deploy toolchain:
- `io/scripts/deploy.ts` interactive deploy flow
- Firebase → device config fetch (device + effects + turnouts)
- Arduino: generates `config.h`, compiles, uploads via USB
- Pico W: generates `settings.toml` + `config.json`, copies to CircuitPython mount
- Auto-detection of connected boards

**`custom-devices.mdx`** — Integration guide for custom hardware:
- Supported protocols and when to use each
- Message format specification (JSON schema for each action)
- MQTT topic conventions and device filtering
- WebSocket handshake and subscription protocol
- Example: minimal Arduino sketch that responds to `pin` commands
- Example: minimal Python script that connects via MQTT

---

## 7. Future Protocol/Device Considerations

Not included in the guide or docs — captured here for roadmap planning.

### 7.1 High Value

| Protocol/Device | Why | Effort |
|---|---|---|
| **WiFi Arduino (ESP32)** | Already in progress. Cheap, WiFi+BLE, huge maker community. Bridges wired Arduino and wireless Pico W. | Medium |
| **DCC-EX EX-IOExpander** | DCC-EX's own IO expansion protocol. Existing hardware compatibility with the DCC-EX user base. | Medium |
| **LCC/OpenLCB (NMRA S-9.7)** | NMRA standard layout bus. Serious model railroaders invest in LCC nodes. Major credibility signal. | High |
| **JMRI Integration** | Bridge/import path from the most-used DCC software. Lowers switching cost for evaluators. | Medium |
| **Bluetooth Low Energy (BLE)** | No WiFi network needed. Direct phone-to-device for simple or portable layouts. | Medium |
| **LocoNet (Digitrax)** | Widely used proprietary bus. Many existing layouts have LocoNet infrastructure. | High |

### 7.2 Lower Priority

| Protocol/Device | Why |
|---|---|
| **XpressNet (Lenz/Roco)** | European market equivalent of LocoNet |
| **BiDiB** | German-origin, gaining EU traction, excellent feedback capabilities |
| **Home Assistant / MQTT Bridge** | Smart home crossover audience — layout-as-smart-home |

---

## 8. Approach & Phasing

**Approach A: Components-First Refactor**

1. **Phase 1 — Extract shared components** into `components/guides/shared/`
2. **Phase 2 — Refactor existing guides** to consume shared components + standardize `DocLink` usage
3. **Phase 3 — Build IO Guide** page and component using the shared library
4. **Phase 4 — Create IO MDX docs** with full reference content
5. **Phase 5 — Update site navigation** (guides index, homepage grid, sidebar)

---

## 9. Out of Scope

- Video/animation production for the deploy flow (use `VideoPlaceholder` for now)
- Actual ESP32/WiFi Arduino firmware
- Implementation of any future protocols from Section 7
- Changes to the DEJA server, IO firmware, or deploy scripts
- Storybook stories for shared components (nice to have, not required)
