# WLED Integration Design

**Date:** 2026-04-16
**Status:** Approved
**Scope:** New `@repo/wled` package, server integration, Cloud app effect form

---

## Overview

Replace custom Arduino LED devices with WLED-powered ESP32s. WLED devices come pre-installed and pre-configured — DEJA.js needs to communicate with them to control LED strip effects, colors, segments, and animations.

This design adds:
1. A new `@repo/wled` package containing types, a WebSocket client, Vue composables, and UI components
2. A new `wled` device type in the DEJA.js device system
3. A server module that manages WebSocket connections to WLED devices
4. A "Neon Studio" themed effect form for configuring WLED animations in the Cloud app

---

## Communication Protocol

**WebSocket** via WLED's JSON API.

- WLED exposes a WebSocket endpoint on port 80 that accepts the same JSON payloads as its HTTP API
- Persistent bidirectional connection — low latency for real-time LED control
- The DEJA.js server already uses `ws` for its own WebSocket server
- WiFi-connected ESP32s only — USB provides power but not runtime control (WLED has no serial command interface at runtime)

**Why not MQTT or HTTP:**
- MQTT would work but adds broker dependency for device-to-device communication that WebSocket handles directly
- HTTP is stateless/request-response — no persistent connection, no push updates
- WebSocket gives the best latency and bidirectional state sync

---

## Package Structure

### `packages/wled/` — `@repo/wled`

```
packages/wled/
├── package.json
├── tsconfig.json
├── index.ts                    # Public API barrel export
├── src/
│   ├── types/
│   │   ├── state.ts            # WledState, WledSegment, WledInfo
│   │   ├── device.ts           # WledDevice (extends DEJA Device)
│   │   └── index.ts
│   ├── constants/
│   │   ├── effects.ts          # WLED_EFFECTS: Array<{id, name}>
│   │   ├── palettes.ts         # WLED_PALETTES: Array<{id, name, gradient?}>
│   │   └── index.ts
│   ├── client/
│   │   └── WledClient.ts       # Framework-agnostic WebSocket client
│   ├── composables/
│   │   ├── useWled.ts           # Connect to WLED device, reactive state
│   │   ├── useWledEffects.ts    # Effect list, search/filter, metadata
│   │   └── useWledSegments.ts   # Segment CRUD, per-segment state
│   └── components/
│       ├── WledEffectForm.vue   # Main form orchestrator
│       ├── WledColorPicker.vue  # HSV color wheel + Fx/Bg/Cs slots + swatches
│       ├── WledEffectList.vue   # Searchable effect selector (pill tags)
│       ├── WledPaletteList.vue  # Palette selector (gradient strip previews)
│       ├── WledSlider.vue       # Neon-glow slider (reusable)
│       ├── WledSegmentEditor.vue # Segment list + visual strip + add/remove
│       └── WledStripPreview.vue  # Live LED strip color bar at top
```

**Future web component path:** Vue 3 components can be exported as web components via `defineCustomElement`. The package is self-contained — no DEJA-specific dependencies leak into the component layer. When ready, wrap components and publish separately.

---

## Types

### WledDevice

```typescript
interface WledDevice {
  id: string
  type: 'wled'
  name: string
  connection: 'wifi'
  host: string                    // IP or hostname (e.g., '192.168.86.35')
  port: number                    // WebSocket port (default 80)
  isConnected: boolean
}
```

### WledState (mirrors WLED JSON API)

```typescript
interface WledState {
  on: boolean
  bri: number                     // Global brightness 0–255
  transition: number              // Crossfade in 100ms units
  seg: WledSegment[]
}

interface WledSegment {
  id: number
  start: number                   // First LED index
  stop: number                    // Last LED (exclusive)
  col: [number, number, number][] // Up to 3 RGB colors [Fx, Bg, Cs]
  fx: number                      // Effect ID
  pal: number                     // Palette ID
  sx: number                      // Speed 0–255
  ix: number                      // Intensity 0–255
  bri: number                     // Segment brightness 0–255
  on: boolean
  rev: boolean                    // Reverse direction
  mi: boolean                     // Mirror
}

interface WledInfo {
  ver: string
  name: string
  leds: { count: number; rgbw: boolean; fps: number }
  mac: string
  ip: string
  wifi: { signal: number }
  fxcount: number
  palcount: number
}
```

### WledEffectConfig (stored on DEJA Effect)

```typescript
interface WledEffectConfig {
  brightness: number              // Global brightness 0–255
  transition: number              // Crossfade in 100ms units
  segments: WledSegmentConfig[]
}

interface WledSegmentConfig {
  start: number
  stop: number
  effectId: number
  effectName: string              // Human-readable, not sent to device
  paletteId: number
  paletteName: string             // Human-readable, not sent to device
  colors: [number, number, number][]  // Up to 3 RGB colors
  speed: number                   // 0–255
  intensity: number               // 0–255
  brightness: number              // Per-segment 0–255
  on: boolean
  reverse: boolean
  mirror: boolean
}
```

---

## WledClient

Framework-agnostic TypeScript WebSocket client. Works in Node.js (via `ws` package) and browsers (native WebSocket).

```typescript
class WledClient {
  constructor(host: string, port?: number)
  connect(): Promise<void>
  disconnect(): void
  getState(): Promise<WledState>
  getInfo(): Promise<WledInfo>
  getEffects(): Promise<string[]>
  getPalettes(): Promise<string[]>
  setState(partial: Partial<WledState>): void
  setSegment(id: number, seg: Partial<WledSegment>): void
  onStateChange(callback: (state: WledState) => void): void
  onDisconnect(callback: () => void): void
  get isConnected(): boolean
}
```

The client sends partial JSON state objects over WebSocket — WLED merges them with current state. Only changed fields need to be sent.

---

## Device Type Registration

### Changes to `packages/modules/layouts/types.ts`

Add `'wled'` to the device type union.

### Changes to `packages/modules/layouts/constants.ts`

- Add `'wled'` to `WIFI_DEVICE_TYPES`
- Add metadata to `deviceTypes` array: `{ value: 'wled', label: 'WLED', icon: 'mdi-led-strip-variant', color: '#ff0080' }`

### Changes to `packages/modules/effects/types.ts`

Add `wled?: WledEffectConfig` field to the `Effect` interface. Only present when `type === 'wled'`.

### Changes to `packages/modules/effects/constants.ts`

Add new effect type: `{ value: 'wled', label: 'WLED', icon: 'mdi-led-strip-variant', color: '#ff0080', require: ['device'] }`

---

## Server Integration

### New module: `apps/server/src/modules/wled.ts`

Manages WebSocket connections to WLED devices, translates DEJA Effect changes to WLED JSON payloads.

```typescript
const clients = new Map<string, WledClient>()

async function connectDevice(device: WledDevice): Promise<void>
async function disconnectDevice(deviceId: string): Promise<void>
async function handleEffectChange(effect: Effect): Promise<void>
function getClient(deviceId: string): WledClient | undefined
```

### Connection lifecycle

1. Server starts → `layout.ts` initializes devices from Firestore
2. For each WLED device → create `WledClient(host, port)`, connect via WebSocket
3. On connect → fetch `/json/info` to verify device, write LED count/version back to Firestore
4. Firestore listener watches for effect changes on WLED-type effects
5. Effect state change → find WledClient for that device → translate and send JSON
6. WledClient state updates → broadcast back to browser clients via existing ws-server

### Integration point in `apps/server/src/modules/layout.ts`

Add case to `initializeDevices()`:

```typescript
case 'wled':
  await wled.connectDevice(device)
  break
```

### Effect → WLED state translation

```
effect.state              → { on: true/false }
effect.wled.brightness    → { bri: 0-255 }
effect.wled.transition    → { transition: value }
effect.wled.segments[]    → { seg: [{ fx, pal, col, sx, ix, bri, ... }] }
```

---

## Cloud App Integration

### Changes to `apps/cloud/src/Effects/EffectForm.vue`

When effect type is `'wled'`, render the `WledEffectForm` component from `@repo/wled` instead of the standard effect fields.

```vue
<WledEffectForm
  v-if="efxType === 'wled'"
  v-model="effect.wled"
  :device-host="deviceHost"
/>
```

The `WledEffectForm` emits `WledEffectConfig` changes. The parent `EffectForm` saves them to Firestore via `setEfx()`.

### Optional live preview

If the WLED device is reachable from the browser (same network), `WledEffectForm` can connect directly via `useWled()` and send changes in real-time as the user edits (debounced). This is a toggle — not required to save the effect.

---

## UI Design: Neon Studio

### Aesthetic

Dark theme with vibrant neon glow effects. Inspired by actual LED lighting — the UI should feel alive.

### Design tokens

| Token | Value | Usage |
|-------|-------|-------|
| Base background | `#0a0a12` | Form container |
| Card background | `#10101a` | Section cards |
| Input background | `#12121e` | Text inputs, dropdowns |
| Border | `#1a1a2e` | Card/section borders |
| Primary accent | `#ff0080` | Active states, brightness slider, selected items |
| Gradient accent | `#7928ca` | Slider gradient start, secondary glow |
| Label color | `#a78bfa` | Section labels, component badges |
| Speed accent | `#f59e0b` | Speed slider |
| Intensity accent | `#10b981` | Intensity slider |
| Text primary | `#e2e8f0` | Headings, values |
| Text secondary | `#8b8ba0` | Labels, descriptions |

### Glow effects

- `box-shadow: 0 0 Npx color` on active/selected elements
- `text-shadow: 0 0 10px color` on hex color values
- Gradient sliders: `#7928ca → accent-color`
- Selected items get border glow + subtle background tint

### Components

1. **WledStripPreview** — Horizontal LED strip bar at top, color-coded by segment, with segment boundary labels
2. **WledColorPicker** — HSV color wheel with picker dot, saturation bar, Fx/Bg/Cs color slot buttons, quick swatch palette
3. **WledEffectList** — Search input + scrollable pill-tag grid of effects, selected effect highlighted with glow
4. **WledPaletteList** — Vertical list with gradient strip previews + palette names
5. **WledSlider** — Reusable slider with label, value badge, neon gradient fill, glowing thumb. Each instance gets its own accent color
6. **WledSegmentEditor** — Visual strip with draggable segment boundaries, segment cards with on/off toggles, "+ Add Segment" button
7. **WledEffectForm** — Two-column layout orchestrating all sub-components. Left: color picker + sliders. Right: effects + palettes + segments + transition

### Interaction model

**Segment-first editing:** Clicking a segment in `WledSegmentEditor` makes it the "active segment." The color picker, effect list, palette list, and sliders all update to show that segment's values. Changes apply to the active segment. The strip preview reflects all segments simultaneously.

---

## Data Flow Summary

```
Cloud App (WledEffectForm)
  → User configures segments, colors, effects, palettes
  → Writes WledEffectConfig to effect.wled
  → setEfx(id, effect) → Firestore layouts/{layoutId}/effects/{id}

Server (effects.ts → wled.ts)
  → handleEffectChange detects type === 'wled'
  → Reads effect.wled, finds WledClient for effect.device
  → Translates WledEffectConfig → WLED JSON API payload
  → Sends via WledClient.setState()

Throttle App (command palette)
  → runEffect({...effect, state: !isOn})
  → Toggles effect.state in Firestore
  → Server sends {on: true/false} to WLED device
```

---

## Out of Scope (V1)

- WLED preset save/recall (use DEJA effects as the source of truth)
- WLED device discovery/mDNS (devices added manually by IP)
- Web component export (architecture supports it, but not built in V1)
- USB serial communication (WLED doesn't support serial control at runtime)
- Custom WLED firmware
- 2D matrix support (1D strips only in V1)
