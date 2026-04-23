# WLED Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add WLED device support to DEJA.js — a new `@repo/wled` package with WebSocket client, Vue composables, and Neon Studio effect form UI, plus server and Cloud app integration.

**Architecture:** Self-contained `@repo/wled` package exports types, a framework-agnostic WebSocket client, Vue 3 composables, and Vue 3 components. The server imports only the client; the Cloud app imports the components. The effect form communicates WLED config via a `wled` field on the existing `Effect` interface.

**Tech Stack:** TypeScript, Vue 3 (Composition API, `<script setup>`), WebSocket (`ws`), Vuetify 3, Tailwind CSS, Firebase/Firestore

**Spec:** `docs/superpowers/specs/2026-04-16-wled-integration-design.md`

---

## File Map

### New files (create)

| File | Responsibility |
|------|---------------|
| `packages/wled/package.json` | Package manifest for `@repo/wled` |
| `packages/wled/tsconfig.json` | TypeScript config extending vue-library |
| `packages/wled/index.ts` | Barrel export for all public API |
| `packages/wled/src/types/state.ts` | `WledState`, `WledSegment`, `WledInfo` interfaces |
| `packages/wled/src/types/device.ts` | `WledDevice` interface |
| `packages/wled/src/types/config.ts` | `WledEffectConfig`, `WledSegmentConfig` interfaces |
| `packages/wled/src/types/index.ts` | Type barrel export |
| `packages/wled/src/constants/effects.ts` | `WLED_EFFECTS` array (all ~190 built-in effect names) |
| `packages/wled/src/constants/palettes.ts` | `WLED_PALETTES` array (all ~70 palette names + gradients) |
| `packages/wled/src/constants/index.ts` | Constants barrel export |
| `packages/wled/src/client/WledClient.ts` | Framework-agnostic WebSocket client |
| `packages/wled/src/composables/useWled.ts` | Vue composable wrapping WledClient with reactive state |
| `packages/wled/src/composables/useWledEffects.ts` | Effect list search/filter composable |
| `packages/wled/src/composables/useWledSegments.ts` | Segment CRUD composable |
| `packages/wled/src/composables/index.ts` | Composables barrel export |
| `packages/wled/src/components/WledSlider.vue` | Reusable neon-glow slider component |
| `packages/wled/src/components/WledStripPreview.vue` | LED strip color bar preview |
| `packages/wled/src/components/WledColorPicker.vue` | HSV color wheel + color slots |
| `packages/wled/src/components/WledEffectList.vue` | Searchable effect selector (pill tags) |
| `packages/wled/src/components/WledPaletteList.vue` | Palette selector with gradient previews |
| `packages/wled/src/components/WledSegmentEditor.vue` | Segment list + visual strip editor |
| `packages/wled/src/components/WledEffectForm.vue` | Main orchestrator form |
| `packages/wled/src/components/index.ts` | Components barrel export |
| `apps/server/src/modules/wled.ts` | Server WLED device connection manager |

### Modified files

| File | Change |
|------|--------|
| `packages/modules/layouts/types.ts:147-157` | Add `'wled'` to Device type union |
| `packages/modules/layouts/constants.ts:17-21` | Add `'wled'` to `WIFI_DEVICE_TYPES` |
| `packages/modules/layouts/constants.ts:67-117` | Add WLED entry to `deviceTypes` array |
| `packages/modules/effects/types.ts:1-22` | Add `wled?: WledEffectConfig` to `Effect` interface |
| `packages/modules/effects/constants.ts:3-74` | Add WLED entry to `efxTypes` array |
| `apps/server/src/modules/effects.ts:54-83` | Add `'wled'` case to `getEffectCommand()` |
| `apps/server/src/modules/effects.ts:150-241` | Add WLED handling to `handleEffect()` |
| `apps/server/src/modules/layout.ts:271-276` | Add `'wled'` case to `connectDevice()` |
| `apps/server/package.json` | Add `@repo/wled` dependency |
| `apps/cloud/package.json` | Add `@repo/wled` dependency |
| `apps/cloud/src/Effects/EffectForm.vue:1-9` | Add WledEffectForm import |
| `apps/cloud/src/Effects/EffectForm.vue:150-186` | Add WLED config to submit handler |
| `apps/cloud/src/Effects/EffectForm.vue:367-388` | Add WledEffectForm template block |

---

## Task 1: Create `@repo/wled` Package Scaffold

**Files:**
- Create: `packages/wled/package.json`
- Create: `packages/wled/tsconfig.json`
- Create: `packages/wled/index.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@repo/wled",
  "version": "0.1.0",
  "private": true,
  "license": "MIT",
  "type": "module",
  "main": "./index.ts",
  "exports": {
    ".": "./index.ts",
    "./types": "./src/types/index.ts",
    "./constants": "./src/constants/index.ts",
    "./client": "./src/client/WledClient.ts",
    "./composables": "./src/composables/index.ts",
    "./components": "./src/components/index.ts"
  },
  "dependencies": {
    "vue": "^3.5.17"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "latest"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "extends": "@repo/typescript-config/vue-library.json",
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.vue", "index.ts"]
}
```

- [ ] **Step 3: Create placeholder index.ts**

```typescript
export * from './src/types/index'
export * from './src/constants/index'
export { WledClient } from './src/client/WledClient'
```

Note: composables and components are exported from their own subpaths, not the root barrel. This keeps the root import tree-shakeable for Node.js consumers (server) that don't need Vue.

- [ ] **Step 4: Run pnpm install to register the new package**

Run: `pnpm install`
Expected: `@repo/wled` appears in the workspace packages.

- [ ] **Step 5: Commit**

```bash
git add packages/wled/
git commit -m "feat(wled): scaffold @repo/wled package"
```

---

## Task 2: WLED Types

**Files:**
- Create: `packages/wled/src/types/state.ts`
- Create: `packages/wled/src/types/device.ts`
- Create: `packages/wled/src/types/config.ts`
- Create: `packages/wled/src/types/index.ts`

- [ ] **Step 1: Create state.ts — WLED JSON API types**

```typescript
/** Mirrors WLED JSON API /json/state response */
export interface WledState {
  on: boolean
  bri: number
  transition: number
  seg: WledSegment[]
}

/** Mirrors a single WLED segment object */
export interface WledSegment {
  id: number
  start: number
  stop: number
  col: [number, number, number][]
  fx: number
  pal: number
  sx: number
  ix: number
  bri: number
  on: boolean
  rev: boolean
  mi: boolean
}

/** Mirrors WLED JSON API /json/info response */
export interface WledInfo {
  ver: string
  name: string
  leds: {
    count: number
    rgbw: boolean
    fps: number
    maxseg: number
  }
  mac: string
  ip: string
  wifi: { signal: number; channel: number }
  fxcount: number
  palcount: number
  arch: string
  freeheap: number
  uptime: number
}
```

- [ ] **Step 2: Create device.ts — WLED device interface**

```typescript
/** A WLED device registered in DEJA.js */
export interface WledDevice {
  id: string
  type: 'wled'
  name: string
  connection: 'wifi'
  host: string
  port: number
  isConnected: boolean
}

/** Default WebSocket port for WLED (standard HTTP port) */
export const WLED_DEFAULT_PORT = 80
```

- [ ] **Step 3: Create config.ts — DEJA effect config for WLED**

```typescript
/** Stored on Effect.wled — the full WLED animation configuration */
export interface WledEffectConfig {
  brightness: number
  transition: number
  segments: WledSegmentConfig[]
}

/** Configuration for a single WLED segment (stored in Firestore) */
export interface WledSegmentConfig {
  start: number
  stop: number
  effectId: number
  effectName: string
  paletteId: number
  paletteName: string
  colors: [number, number, number][]
  speed: number
  intensity: number
  brightness: number
  on: boolean
  reverse: boolean
  mirror: boolean
}

/** Creates a default segment config */
export function createDefaultSegmentConfig(
  start = 0,
  stop = 30
): WledSegmentConfig {
  return {
    start,
    stop,
    effectId: 0,
    effectName: 'Solid',
    paletteId: 0,
    paletteName: 'Default',
    colors: [[255, 0, 128], [0, 0, 0], [0, 0, 0]],
    speed: 128,
    intensity: 128,
    brightness: 255,
    on: true,
    reverse: false,
    mirror: false,
  }
}

/** Creates a default WLED effect config */
export function createDefaultWledConfig(): WledEffectConfig {
  return {
    brightness: 128,
    transition: 7,
    segments: [createDefaultSegmentConfig()],
  }
}
```

- [ ] **Step 4: Create types barrel export**

```typescript
export * from './state'
export * from './device'
export * from './config'
```

- [ ] **Step 5: Verify types compile**

Run: `cd packages/wled && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add packages/wled/src/types/
git commit -m "feat(wled): add WLED types — state, device, config"
```

---

## Task 3: WLED Constants (Effects & Palettes)

**Files:**
- Create: `packages/wled/src/constants/effects.ts`
- Create: `packages/wled/src/constants/palettes.ts`
- Create: `packages/wled/src/constants/index.ts`

- [ ] **Step 1: Create effects.ts — all WLED built-in effects**

Fetch the effect list from a running WLED device at `http://192.168.86.35/json/eff` to get the current list. If unreachable, use the standard WLED 0.14.x list. The array is indexed by effect ID.

```typescript
export interface WledEffectMeta {
  id: number
  name: string
}

/** All built-in WLED effects. Index = effect ID. */
export const WLED_EFFECTS: WledEffectMeta[] = [
  { id: 0, name: 'Solid' },
  { id: 1, name: 'Blink' },
  { id: 2, name: 'Breathe' },
  { id: 3, name: 'Wipe' },
  { id: 4, name: 'Wipe Random' },
  { id: 5, name: 'Random Colors' },
  { id: 6, name: 'Sweep' },
  { id: 7, name: 'Dynamic' },
  { id: 8, name: 'Colorloop' },
  { id: 9, name: 'Rainbow' },
  { id: 10, name: 'Scan' },
  { id: 11, name: 'Scan Dual' },
  { id: 12, name: 'Fade' },
  { id: 13, name: 'Theater' },
  { id: 14, name: 'Theater Rainbow' },
  { id: 15, name: 'Running' },
  { id: 16, name: 'Saw' },
  { id: 17, name: 'Twinkle' },
  { id: 18, name: 'Dissolve' },
  { id: 19, name: 'Dissolve Rnd' },
  { id: 20, name: 'Sparkle' },
  { id: 21, name: 'Sparkle Dark' },
  { id: 22, name: 'Sparkle+' },
  { id: 23, name: 'Strobe' },
  { id: 24, name: 'Strobe Rainbow' },
  { id: 25, name: 'Strobe Mega' },
  { id: 26, name: 'Blink Rainbow' },
  { id: 27, name: 'Android' },
  { id: 28, name: 'Chase' },
  { id: 29, name: 'Chase Random' },
  { id: 30, name: 'Chase Rainbow' },
  { id: 31, name: 'Chase Flash' },
  { id: 32, name: 'Chase Flash Rnd' },
  { id: 33, name: 'Rainbow Runner' },
  { id: 34, name: 'Colorful' },
  { id: 35, name: 'Traffic Light' },
  { id: 36, name: 'Sweep Random' },
  { id: 37, name: 'Chase 2' },
  { id: 38, name: 'Aurora' },
  { id: 39, name: 'Stream' },
  { id: 40, name: 'Scanner' },
  { id: 41, name: 'Lighthouse' },
  { id: 42, name: 'Fireworks' },
  { id: 43, name: 'Rain' },
  { id: 44, name: 'Tetrix' },
  { id: 45, name: 'Fire Flicker' },
  { id: 46, name: 'Gradient' },
  { id: 47, name: 'Loading' },
  { id: 48, name: 'Police' },
  { id: 49, name: 'Fairy' },
  { id: 50, name: 'Two Dots' },
  { id: 51, name: 'Fairytwinkle' },
  { id: 52, name: 'Running Dual' },
  // ... continue for all effects
  // NOTE: The implementor should fetch the full list from
  // http://192.168.86.35/json/eff and generate the complete array.
  // The above covers the first ~50 for reference.
]
```

**Important:** The implementor should use `WebFetch` to fetch `http://192.168.86.35/json/eff` and generate the complete list. If the device is unreachable, use the WLED source code at `https://github.com/WLED/WLED` to find the effect names in `wled00/FX.h`.

- [ ] **Step 2: Create palettes.ts — all WLED built-in palettes**

```typescript
export interface WledPaletteMeta {
  id: number
  name: string
  /** CSS gradient string for preview rendering */
  gradient?: string
}

/** All built-in WLED palettes. Index = palette ID. */
export const WLED_PALETTES: WledPaletteMeta[] = [
  { id: 0, name: 'Default', gradient: 'linear-gradient(90deg, #ff0000, #00ff00, #0000ff)' },
  { id: 1, name: '* Random Cycle' },
  { id: 2, name: '* Color 1' },
  { id: 3, name: '* Colors 1&2' },
  { id: 4, name: '* Color Gradient' },
  { id: 5, name: '* Colors Only' },
  { id: 6, name: 'Party' },
  { id: 7, name: 'Cloud' },
  { id: 8, name: 'Lava', gradient: 'linear-gradient(90deg, #000000, #800000, #ff0000, #ff8c00, #ffd700)' },
  { id: 9, name: 'Ocean', gradient: 'linear-gradient(90deg, #000080, #0000ff, #00bfff, #00ffcc)' },
  { id: 10, name: 'Forest', gradient: 'linear-gradient(90deg, #004400, #008800, #00cc00, #88ff00)' },
  { id: 11, name: 'Rainbow', gradient: 'linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff)' },
  { id: 12, name: 'Rainbow Bands', gradient: 'linear-gradient(90deg, #ff0000, #ff0000 14%, #ff8800 14%, #ff8800 28%, #ffff00 28%, #ffff00 42%, #00ff00 42%, #00ff00 57%, #0088ff 57%, #0088ff 71%, #8800ff 71%, #8800ff)' },
  { id: 13, name: 'Sunset', gradient: 'linear-gradient(90deg, #ff4500, #ff8c00, #ffd700, #ff6347)' },
  { id: 14, name: 'Rivendell' },
  { id: 15, name: 'Breeze' },
  // ... continue for all palettes
  // NOTE: The implementor should fetch the full list from
  // http://192.168.86.35/json/pal and generate the complete array.
]
```

**Important:** Same approach — fetch from device or WLED source for complete list.

- [ ] **Step 3: Create constants barrel export**

```typescript
export * from './effects'
export * from './palettes'
```

- [ ] **Step 4: Commit**

```bash
git add packages/wled/src/constants/
git commit -m "feat(wled): add effect and palette constants"
```

---

## Task 4: WledClient — WebSocket Client

**Files:**
- Create: `packages/wled/src/client/WledClient.ts`

- [ ] **Step 1: Implement WledClient**

```typescript
import type { WledState, WledSegment, WledInfo } from '../types/state'
import { WLED_DEFAULT_PORT } from '../types/device'

type StateChangeCallback = (state: WledState) => void
type DisconnectCallback = () => void

/**
 * Framework-agnostic WebSocket client for WLED devices.
 * Works in Node.js (via `ws` package) and browsers (native WebSocket).
 */
export class WledClient {
  private ws: WebSocket | null = null
  private _host: string
  private _port: number
  private _isConnected = false
  private stateCallbacks: StateChangeCallback[] = []
  private disconnectCallbacks: DisconnectCallback[] = []
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 5
  private readonly reconnectDelayMs = 3000

  constructor(host: string, port: number = WLED_DEFAULT_PORT) {
    this._host = host
    this._port = port
  }

  get host(): string { return this._host }
  get port(): number { return this._port }
  get isConnected(): boolean { return this._isConnected }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = `ws://${this._host}:${this._port}/ws`
        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
          this._isConnected = true
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event: MessageEvent) => {
          try {
            const data = JSON.parse(
              typeof event.data === 'string' ? event.data : event.data.toString()
            )
            if (data.state) {
              this.stateCallbacks.forEach((cb) => cb(data.state))
            } else if (data.seg !== undefined || data.on !== undefined) {
              this.stateCallbacks.forEach((cb) => cb(data as WledState))
            }
          } catch {
            // Non-JSON message, ignore
          }
        }

        this.ws.onclose = () => {
          this._isConnected = false
          this.disconnectCallbacks.forEach((cb) => cb())
          this.attemptReconnect()
        }

        this.ws.onerror = (err) => {
          if (!this._isConnected) {
            reject(new Error(`Failed to connect to WLED at ${this._host}:${this._port}`))
          }
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  disconnect(): void {
    this.clearReconnect()
    if (this.ws) {
      this.ws.onclose = null
      this.ws.close()
      this.ws = null
    }
    this._isConnected = false
  }

  /** Fetch current state via HTTP JSON API */
  async getState(): Promise<WledState> {
    const res = await fetch(`http://${this._host}:${this._port}/json/state`)
    return res.json()
  }

  /** Fetch device info via HTTP JSON API */
  async getInfo(): Promise<WledInfo> {
    const res = await fetch(`http://${this._host}:${this._port}/json/info`)
    return res.json()
  }

  /** Fetch all effect names */
  async getEffects(): Promise<string[]> {
    const res = await fetch(`http://${this._host}:${this._port}/json/eff`)
    return res.json()
  }

  /** Fetch all palette names */
  async getPalettes(): Promise<string[]> {
    const res = await fetch(`http://${this._host}:${this._port}/json/pal`)
    return res.json()
  }

  /** Send partial state update — WLED merges with current state */
  setState(partial: Partial<WledState>): void {
    this.send(partial)
  }

  /** Update a single segment by ID */
  setSegment(id: number, seg: Partial<WledSegment>): void {
    this.send({ seg: [{ id, ...seg }] })
  }

  /** Register callback for state changes pushed by WLED */
  onStateChange(callback: StateChangeCallback): void {
    this.stateCallbacks.push(callback)
  }

  /** Register callback for disconnection */
  onDisconnect(callback: DisconnectCallback): void {
    this.disconnectCallbacks.push(callback)
  }

  private send(data: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return
    this.reconnectAttempts++
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // Will retry via onclose handler
      })
    }, this.reconnectDelayMs)
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}
```

- [ ] **Step 2: Update root index.ts barrel export**

The barrel export created in Task 1 already exports `WledClient`. Verify it compiles.

Run: `cd packages/wled && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/wled/src/client/
git commit -m "feat(wled): add WledClient WebSocket client"
```

---

## Task 5: Register WLED Device Type in `@repo/modules`

**Files:**
- Modify: `packages/modules/layouts/types.ts:147-157`
- Modify: `packages/modules/layouts/constants.ts:17-21,67-117`
- Modify: `packages/modules/effects/types.ts:1-22`
- Modify: `packages/modules/effects/constants.ts:3-74`

- [ ] **Step 1: Add `'wled'` to Device type union**

In `packages/modules/layouts/types.ts`, add `'wled'` to the type union after `'deja-server'`:

```typescript
// Before line 157 ('deja-server'), add:
    | 'deja-server'
    | 'wled'
```

- [ ] **Step 2: Add `'wled'` to WIFI_DEVICE_TYPES**

In `packages/modules/layouts/constants.ts`, add `'wled'` to the `WIFI_DEVICE_TYPES` array:

```typescript
export const WIFI_DEVICE_TYPES: Device['type'][] = [
  'deja-mqtt',
  'deja-mqtt-diy',
  'deja-esp32-wifi',
  'wled',
]
```

- [ ] **Step 3: Add WLED to deviceTypes array**

In `packages/modules/layouts/constants.ts`, add a new entry to the `deviceTypes` array after the `deja-server` entry (before the closing `]` around line 117):

```typescript
  {
    value: 'wled',
    label: 'WLED',
    icon: 'mdi-led-strip-variant',
    color: '#ff0080',
  },
```

- [ ] **Step 4: Add `wled` field to Effect interface**

In `packages/modules/effects/types.ts`, add the import and field. At the top of the file add:

```typescript
import type { WledEffectConfig } from '@repo/wled/types'
```

Then add the field to the `Effect` interface after `allowGuest`:

```typescript
  allowGuest?: boolean
  wled?: WledEffectConfig
  id: string
```

This requires `@repo/wled` as a dev dependency of `@repo/modules`. Add to `packages/modules/package.json`:

```json
"devDependencies": {
  "@repo/wled": "workspace:*",
  // ... existing
}
```

- [ ] **Step 5: Add WLED to efxTypes array**

In `packages/modules/effects/constants.ts`, add a new entry to the `efxTypes` array before the closing `]`:

```typescript
  {
    value: 'wled',
    label: 'WLED',
    icon: 'mdi-led-strip-variant',
    color: '#ff0080',
    require: ['device'],
  },
```

- [ ] **Step 6: Verify types compile across packages**

Run: `pnpm install && pnpm check-types`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add packages/modules/ packages/wled/
git commit -m "feat(wled): register WLED device type and effect type in @repo/modules"
```

---

## Task 6: Vue Composables

**Files:**
- Create: `packages/wled/src/composables/useWled.ts`
- Create: `packages/wled/src/composables/useWledEffects.ts`
- Create: `packages/wled/src/composables/useWledSegments.ts`
- Create: `packages/wled/src/composables/index.ts`

- [ ] **Step 1: Create useWled.ts**

```typescript
import { ref, readonly, onUnmounted } from 'vue'
import { WledClient } from '../client/WledClient'
import type { WledState, WledInfo } from '../types/state'

/**
 * Vue composable for connecting to a WLED device.
 * Wraps WledClient with reactive state.
 */
export function useWled(host: string, port?: number) {
  const client = new WledClient(host, port)
  const state = ref<WledState | null>(null)
  const info = ref<WledInfo | null>(null)
  const isConnected = ref(false)
  const error = ref<string | null>(null)

  client.onStateChange((newState) => {
    state.value = newState
  })

  client.onDisconnect(() => {
    isConnected.value = false
  })

  async function connect() {
    try {
      error.value = null
      await client.connect()
      isConnected.value = true
      const [fetchedState, fetchedInfo] = await Promise.all([
        client.getState(),
        client.getInfo(),
      ])
      state.value = fetchedState
      info.value = fetchedInfo
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Connection failed'
      isConnected.value = false
    }
  }

  function disconnect() {
    client.disconnect()
    isConnected.value = false
  }

  function setState(partial: Partial<WledState>) {
    client.setState(partial)
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    state: readonly(state),
    info: readonly(info),
    isConnected: readonly(isConnected),
    error: readonly(error),
    connect,
    disconnect,
    setState,
    client,
  }
}
```

- [ ] **Step 2: Create useWledEffects.ts**

```typescript
import { ref, computed } from 'vue'
import { WLED_EFFECTS, type WledEffectMeta } from '../constants/effects'

/**
 * Searchable/filterable effect list composable.
 */
export function useWledEffects() {
  const searchQuery = ref('')

  const filteredEffects = computed<WledEffectMeta[]>(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return WLED_EFFECTS
    return WLED_EFFECTS.filter((fx) =>
      fx.name.toLowerCase().includes(query)
    )
  })

  function getEffectName(id: number): string {
    return WLED_EFFECTS.find((fx) => fx.id === id)?.name ?? `Effect ${id}`
  }

  return {
    searchQuery,
    filteredEffects,
    allEffects: WLED_EFFECTS,
    getEffectName,
  }
}
```

- [ ] **Step 3: Create useWledSegments.ts**

```typescript
import { ref } from 'vue'
import type { WledSegmentConfig } from '../types/config'
import { createDefaultSegmentConfig } from '../types/config'

/**
 * Manages WLED segments — CRUD, active selection, validation.
 */
export function useWledSegments(initialSegments: WledSegmentConfig[] = []) {
  const segments = ref<WledSegmentConfig[]>(
    initialSegments.length > 0 ? [...initialSegments] : [createDefaultSegmentConfig()]
  )
  const activeSegmentIndex = ref(0)

  function addSegment() {
    const lastSeg = segments.value[segments.value.length - 1]
    const nextStart = lastSeg ? lastSeg.stop : 0
    segments.value.push(createDefaultSegmentConfig(nextStart, nextStart + 30))
  }

  function removeSegment(index: number) {
    if (segments.value.length <= 1) return
    segments.value.splice(index, 1)
    if (activeSegmentIndex.value >= segments.value.length) {
      activeSegmentIndex.value = segments.value.length - 1
    }
  }

  function updateSegment(index: number, updates: Partial<WledSegmentConfig>) {
    segments.value[index] = { ...segments.value[index], ...updates }
  }

  function setActiveSegment(index: number) {
    activeSegmentIndex.value = index
  }

  return {
    segments,
    activeSegmentIndex,
    addSegment,
    removeSegment,
    updateSegment,
    setActiveSegment,
  }
}
```

- [ ] **Step 4: Create composables barrel export**

```typescript
export { useWled } from './useWled'
export { useWledEffects } from './useWledEffects'
export { useWledSegments } from './useWledSegments'
```

- [ ] **Step 5: Commit**

```bash
git add packages/wled/src/composables/
git commit -m "feat(wled): add Vue composables — useWled, useWledEffects, useWledSegments"
```

---

## Task 7: UI Components — WledSlider & WledStripPreview

**Files:**
- Create: `packages/wled/src/components/WledSlider.vue`
- Create: `packages/wled/src/components/WledStripPreview.vue`

- [ ] **Step 1: Create WledSlider.vue**

Reusable neon-glow slider with label, value badge, gradient fill, and glowing thumb. Each instance accepts its own accent color.

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: number
  label: string
  icon?: string
  min?: number
  max?: number
  accentColor?: string
}>(), {
  min: 0,
  max: 255,
  accentColor: '#ff0080',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const percentage = computed(() =>
  ((props.modelValue - props.min) / (props.max - props.min)) * 100
)
</script>

<template>
  <div class="wled-slider">
    <div class="wled-slider__header">
      <span class="wled-slider__label">
        <span v-if="icon" class="wled-slider__icon">{{ icon }}</span>
        {{ label }}
      </span>
      <span
        class="wled-slider__value"
        :style="{ color: accentColor, backgroundColor: accentColor + '15' }"
      >
        {{ modelValue }}
      </span>
    </div>
    <div class="wled-slider__track">
      <div
        class="wled-slider__fill"
        :style="{
          width: percentage + '%',
          background: `linear-gradient(90deg, #7928ca, ${accentColor})`,
          boxShadow: `0 0 12px ${accentColor}66`,
        }"
      />
      <input
        type="range"
        class="wled-slider__input"
        :min="min"
        :max="max"
        :value="modelValue"
        @input="emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
      />
      <div
        class="wled-slider__thumb"
        :style="{
          left: `calc(${percentage}% - 8px)`,
          backgroundColor: accentColor,
          boxShadow: `0 0 10px ${accentColor}`,
        }"
      />
    </div>
  </div>
</template>

<style scoped>
.wled-slider { display: flex; flex-direction: column; gap: 6px; }
.wled-slider__header { display: flex; justify-content: space-between; align-items: center; }
.wled-slider__label { font: 500 12px/1 system-ui; color: #e2e8f0; display: flex; align-items: center; gap: 6px; }
.wled-slider__icon { font-size: 14px; }
.wled-slider__value { font: 12px/1 monospace; padding: 2px 8px; border-radius: 4px; }
.wled-slider__track { position: relative; height: 8px; background: #1a1a2e; border-radius: 4px; }
.wled-slider__fill { position: absolute; top: 0; left: 0; height: 100%; border-radius: 4px; pointer-events: none; }
.wled-slider__input { position: absolute; top: -4px; left: 0; width: 100%; height: 16px; opacity: 0; cursor: pointer; margin: 0; }
.wled-slider__thumb { position: absolute; top: -4px; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #fff; pointer-events: none; transition: left 0.05s; }
</style>
```

- [ ] **Step 2: Create WledStripPreview.vue**

Horizontal LED strip bar showing segment colors.

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { WledSegmentConfig } from '../types/config'

const props = defineProps<{
  segments: WledSegmentConfig[]
}>()

const totalLeds = computed(() => {
  if (props.segments.length === 0) return 1
  return Math.max(...props.segments.map((s) => s.stop), 1)
})

const segmentStyles = computed(() =>
  props.segments.map((seg) => {
    const width = ((seg.stop - seg.start) / totalLeds.value) * 100
    const primaryColor = seg.colors[0]
      ? `rgb(${seg.colors[0].join(',')})`
      : '#ff0080'
    const secondaryColor = seg.colors[1]
      ? `rgb(${seg.colors[1].join(',')})`
      : primaryColor
    return {
      flex: `0 0 ${width}%`,
      background: seg.on
        ? `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`
        : '#1a1a2e',
      boxShadow: seg.on ? `0 4px 20px ${primaryColor}40` : 'none',
      opacity: seg.on ? 1 : 0.3,
    }
  })
)
</script>

<template>
  <div class="wled-strip">
    <div class="wled-strip__bar">
      <div
        v-for="(style, i) in segmentStyles"
        :key="i"
        class="wled-strip__segment"
        :style="style"
      />
    </div>
    <div class="wled-strip__labels">
      <div
        v-for="(seg, i) in segments"
        :key="i"
        class="wled-strip__label"
        :style="{ flex: segmentStyles[i]?.flex }"
      >
        <span class="wled-strip__label-text">
          Seg {{ i }}: {{ seg.start }}–{{ seg.stop }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wled-strip__bar { display: flex; gap: 2px; height: 14px; border-radius: 4px; overflow: hidden; }
.wled-strip__segment { border-radius: 3px; transition: all 0.3s; }
.wled-strip__labels { display: flex; margin-top: 4px; }
.wled-strip__label { display: flex; justify-content: center; }
.wled-strip__label-text { font: 9px/1 monospace; color: #8b8ba0; background: #0a0a12; padding: 1px 4px; border-radius: 2px; }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add packages/wled/src/components/WledSlider.vue packages/wled/src/components/WledStripPreview.vue
git commit -m "feat(wled): add WledSlider and WledStripPreview components"
```

---

## Task 8: UI Components — WledColorPicker

**Files:**
- Create: `packages/wled/src/components/WledColorPicker.vue`

- [ ] **Step 1: Create WledColorPicker.vue**

HSV color wheel with Fx/Bg/Cs color slot buttons, hex display, and quick swatches. Uses canvas for the color wheel rendering.

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps<{
  /** Up to 3 colors: [Fx, Bg, Cs] — each is [R, G, B] */
  modelValue: [number, number, number][]
}>()

const emit = defineEmits<{
  'update:modelValue': [colors: [number, number, number][]]
}>()

const activeSlot = ref<0 | 1 | 2>(0)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const slotLabels = ['Fx', 'Bg', 'Cs'] as const

const activeColor = computed(() =>
  props.modelValue[activeSlot.value] ?? [255, 0, 128]
)

const hexColor = computed(() => {
  const [r, g, b] = activeColor.value
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
})

const quickSwatches: [number, number, number][] = [
  [255, 0, 64], [255, 107, 0], [255, 208, 0], [0, 255, 136],
  [0, 191, 255], [139, 92, 246], [255, 0, 128], [255, 255, 255],
]

function setColor(color: [number, number, number]) {
  const newColors = [...props.modelValue] as [number, number, number][]
  while (newColors.length < 3) newColors.push([0, 0, 0])
  newColors[activeSlot.value] = [...color]
  emit('update:modelValue', newColors)
}

function handleCanvasClick(event: MouseEvent) {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const pixel = ctx.getImageData(x, y, 1, 1).data
  if (pixel[3] > 0) {
    setColor([pixel[0], pixel[1], pixel[2]])
  }
}

function drawColorWheel() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const size = canvas.width
  const center = size / 2
  const radius = center - 2

  ctx.clearRect(0, 0, size, size)

  for (let angle = 0; angle < 360; angle++) {
    const startAngle = (angle - 1) * (Math.PI / 180)
    const endAngle = (angle + 1) * (Math.PI / 180)
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius)
    gradient.addColorStop(0, '#fff')
    gradient.addColorStop(1, `hsl(${angle}, 100%, 50%)`)
    ctx.beginPath()
    ctx.moveTo(center, center)
    ctx.arc(center, center, radius, startAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()
  }

  // Cut out center for hex display
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(center, center, radius * 0.28, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'
}

onMounted(drawColorWheel)
</script>

<template>
  <div class="wled-color-picker">
    <!-- Color wheel -->
    <div class="wled-color-picker__wheel-wrap">
      <canvas
        ref="canvasRef"
        width="170"
        height="170"
        class="wled-color-picker__wheel"
        @click="handleCanvasClick"
      />
      <div class="wled-color-picker__hex" :style="{ color: hexColor, textShadow: `0 0 10px ${hexColor}60` }">
        {{ hexColor.toUpperCase() }}
      </div>
    </div>

    <!-- Fx / Bg / Cs slots -->
    <div class="wled-color-picker__slots">
      <button
        v-for="(label, i) in slotLabels"
        :key="label"
        class="wled-color-picker__slot"
        :class="{ 'wled-color-picker__slot--active': activeSlot === i }"
        :style="{
          '--slot-color': modelValue[i] ? `rgb(${modelValue[i].join(',')})` : '#1a1a2e',
        }"
        @click="activeSlot = i as 0 | 1 | 2"
      >
        <div class="wled-color-picker__slot-swatch" />
        <span>{{ label }}</span>
      </button>
    </div>

    <!-- Quick swatches -->
    <div class="wled-color-picker__swatches">
      <button
        v-for="(swatch, i) in quickSwatches"
        :key="i"
        class="wled-color-picker__swatch"
        :style="{ backgroundColor: `rgb(${swatch.join(',')})` }"
        @click="setColor(swatch)"
      />
    </div>
  </div>
</template>

<style scoped>
.wled-color-picker { display: flex; flex-direction: column; gap: 12px; }

.wled-color-picker__wheel-wrap { position: relative; width: 170px; height: 170px; margin: 0 auto; }
.wled-color-picker__wheel { border-radius: 50%; cursor: crosshair; box-shadow: 0 0 40px rgba(255, 0, 128, 0.15); }
.wled-color-picker__hex { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font: 700 14px/1 monospace; pointer-events: none; }

.wled-color-picker__slots { display: flex; gap: 8px; justify-content: center; }
.wled-color-picker__slot {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; background: #12121e; border: 1px solid #2d2d44;
  border-radius: 8px; cursor: pointer; color: #8b8ba0; font: 600 11px/1 system-ui;
  transition: all 0.15s;
}
.wled-color-picker__slot--active { background: color-mix(in srgb, var(--slot-color) 15%, transparent); border-color: color-mix(in srgb, var(--slot-color) 40%, transparent); color: #e2e8f0; }
.wled-color-picker__slot-swatch { width: 16px; height: 16px; border-radius: 4px; background: var(--slot-color); box-shadow: 0 0 6px var(--slot-color); }

.wled-color-picker__swatches { display: flex; gap: 5px; justify-content: center; flex-wrap: wrap; }
.wled-color-picker__swatch { width: 22px; height: 22px; border-radius: 5px; border: 1px solid transparent; cursor: pointer; transition: transform 0.1s; }
.wled-color-picker__swatch:hover { transform: scale(1.15); }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add packages/wled/src/components/WledColorPicker.vue
git commit -m "feat(wled): add WledColorPicker component with HSV wheel"
```

---

## Task 9: UI Components — WledEffectList & WledPaletteList

**Files:**
- Create: `packages/wled/src/components/WledEffectList.vue`
- Create: `packages/wled/src/components/WledPaletteList.vue`

- [ ] **Step 1: Create WledEffectList.vue**

```vue
<script setup lang="ts">
import { useWledEffects } from '../composables/useWledEffects'

const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [effectId: number]
}>()

const { searchQuery, filteredEffects } = useWledEffects()
</script>

<template>
  <div class="wled-effect-list">
    <div class="wled-effect-list__search">
      <span class="wled-effect-list__search-icon">🔍</span>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search effects..."
        class="wled-effect-list__search-input"
      />
    </div>
    <div class="wled-effect-list__grid">
      <button
        v-for="fx in filteredEffects"
        :key="fx.id"
        class="wled-effect-list__pill"
        :class="{ 'wled-effect-list__pill--active': modelValue === fx.id }"
        @click="emit('update:modelValue', fx.id)"
      >
        {{ fx.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.wled-effect-list { display: flex; flex-direction: column; gap: 10px; }

.wled-effect-list__search {
  display: flex; align-items: center; gap: 8px;
  background: #12121e; border: 1px solid #2d2d44; border-radius: 8px;
  padding: 10px 14px;
}
.wled-effect-list__search-icon { color: #8b8ba0; }
.wled-effect-list__search-input { background: none; border: none; color: #e2e8f0; font: 13px/1 system-ui; flex: 1; outline: none; }
.wled-effect-list__search-input::placeholder { color: #8b8ba0; }

.wled-effect-list__grid { display: flex; flex-wrap: wrap; gap: 6px; max-height: 200px; overflow-y: auto; }

.wled-effect-list__pill {
  font: 12px/1 system-ui; color: #8b8ba0; background: #12121e;
  padding: 7px 14px; border-radius: 20px; border: 1px solid #2d2d44;
  cursor: pointer; transition: all 0.15s; white-space: nowrap;
}
.wled-effect-list__pill:hover { border-color: #ff008040; color: #e2e8f0; }
.wled-effect-list__pill--active {
  color: #e2e8f0; background: #ff008018;
  border-color: #ff008050; box-shadow: 0 0 8px rgba(255, 0, 128, 0.12);
}
</style>
```

- [ ] **Step 2: Create WledPaletteList.vue**

```vue
<script setup lang="ts">
import { WLED_PALETTES } from '../constants/palettes'

const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [paletteId: number]
}>()
</script>

<template>
  <div class="wled-palette-list">
    <button
      v-for="pal in WLED_PALETTES"
      :key="pal.id"
      class="wled-palette-list__item"
      :class="{ 'wled-palette-list__item--active': modelValue === pal.id }"
      @click="emit('update:modelValue', pal.id)"
    >
      <div
        class="wled-palette-list__gradient"
        :style="{ background: pal.gradient || 'linear-gradient(90deg, #333, #666)' }"
      />
      <span class="wled-palette-list__name">{{ pal.name }}</span>
      <span class="wled-palette-list__id">#{{ pal.id }}</span>
    </button>
  </div>
</template>

<style scoped>
.wled-palette-list { display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto; }

.wled-palette-list__item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 8px;
  cursor: pointer; transition: all 0.15s; border: 1px solid transparent;
}
.wled-palette-list__item:hover { background: #12121e; }
.wled-palette-list__item--active { background: #12121e; border-color: #ff008040; }

.wled-palette-list__gradient { width: 90px; height: 14px; border-radius: 4px; flex-shrink: 0; }
.wled-palette-list__item--active .wled-palette-list__gradient { box-shadow: 0 0 8px rgba(255, 0, 128, 0.2); }

.wled-palette-list__name { font: 12px/1 system-ui; color: #8b8ba0; flex: 1; }
.wled-palette-list__item--active .wled-palette-list__name { color: #e2e8f0; }

.wled-palette-list__id { font: 10px/1 monospace; color: #484f58; }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add packages/wled/src/components/WledEffectList.vue packages/wled/src/components/WledPaletteList.vue
git commit -m "feat(wled): add WledEffectList and WledPaletteList components"
```

---

## Task 10: UI Components — WledSegmentEditor

**Files:**
- Create: `packages/wled/src/components/WledSegmentEditor.vue`

- [ ] **Step 1: Create WledSegmentEditor.vue**

Visual strip with segment cards, on/off toggles, and add/remove.

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { WledSegmentConfig } from '../types/config'
import { WLED_EFFECTS } from '../constants/effects'
import { WLED_PALETTES } from '../constants/palettes'

const props = defineProps<{
  segments: WledSegmentConfig[]
  activeIndex: number
}>()

const emit = defineEmits<{
  select: [index: number]
  add: []
  remove: [index: number]
  toggleOn: [index: number]
}>()

const totalLeds = computed(() =>
  Math.max(...props.segments.map((s) => s.stop), 1)
)

const segmentColors: string[] = [
  '#ff0080', '#00ccff', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#d946ef',
]

function getSegColor(index: number): string {
  return segmentColors[index % segmentColors.length]
}
</script>

<template>
  <div class="wled-seg-editor">
    <!-- Visual strip -->
    <div class="wled-seg-editor__strip">
      <div
        v-for="(seg, i) in segments"
        :key="i"
        class="wled-seg-editor__strip-segment"
        :class="{ 'wled-seg-editor__strip-segment--active': activeIndex === i }"
        :style="{
          flex: `0 0 ${((seg.stop - seg.start) / totalLeds) * 100}%`,
          background: seg.on
            ? `linear-gradient(90deg, ${getSegColor(i)}, ${getSegColor(i)}cc)`
            : '#1a1a2e',
          opacity: seg.on ? 1 : 0.3,
        }"
        @click="emit('select', i)"
      />
    </div>
    <div class="wled-seg-editor__strip-labels">
      <span class="wled-seg-editor__strip-label">0</span>
      <span
        v-for="seg in segments"
        :key="seg.stop"
        class="wled-seg-editor__strip-label"
      >{{ seg.stop }}</span>
    </div>

    <!-- Segment cards -->
    <div class="wled-seg-editor__cards">
      <div
        v-for="(seg, i) in segments"
        :key="i"
        class="wled-seg-editor__card"
        :class="{ 'wled-seg-editor__card--active': activeIndex === i }"
        :style="{ '--seg-color': getSegColor(i) }"
        @click="emit('select', i)"
      >
        <div class="wled-seg-editor__card-dot" />
        <div class="wled-seg-editor__card-info">
          <div class="wled-seg-editor__card-title">Segment {{ i }}</div>
          <div class="wled-seg-editor__card-meta">
            LED {{ seg.start }}–{{ seg.stop }} · {{ seg.effectName }} · {{ seg.paletteName }}
          </div>
        </div>
        <button
          v-if="segments.length > 1"
          class="wled-seg-editor__card-remove"
          @click.stop="emit('remove', i)"
          title="Remove segment"
        >✕</button>
        <button
          class="wled-seg-editor__card-toggle"
          :class="{ 'wled-seg-editor__card-toggle--on': seg.on }"
          @click.stop="emit('toggleOn', i)"
        >
          <div class="wled-seg-editor__card-toggle-dot" />
        </button>
      </div>
    </div>

    <button class="wled-seg-editor__add" @click="emit('add')">
      + Add Segment
    </button>
  </div>
</template>

<style scoped>
.wled-seg-editor { display: flex; flex-direction: column; gap: 10px; }

.wled-seg-editor__strip { display: flex; gap: 2px; height: 20px; border-radius: 6px; overflow: hidden; }
.wled-seg-editor__strip-segment { border-radius: 4px; cursor: pointer; transition: all 0.2s; box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.1); }
.wled-seg-editor__strip-segment--active { outline: 2px solid #fff; outline-offset: 1px; }

.wled-seg-editor__strip-labels { display: flex; justify-content: space-between; }
.wled-seg-editor__strip-label { font: 9px/1 monospace; color: #484f58; }

.wled-seg-editor__cards { display: flex; flex-direction: column; gap: 6px; }

.wled-seg-editor__card {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; background: #12121e; border-radius: 8px;
  border: 1px solid #2d2d44; cursor: pointer; transition: all 0.15s;
}
.wled-seg-editor__card--active { border-color: color-mix(in srgb, var(--seg-color) 40%, transparent); }

.wled-seg-editor__card-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--seg-color); box-shadow: 0 0 8px var(--seg-color); }
.wled-seg-editor__card-info { flex: 1; }
.wled-seg-editor__card-title { font: 500 12px/1 system-ui; color: #e2e8f0; }
.wled-seg-editor__card-meta { font: 10px/1 monospace; color: #8b8ba0; margin-top: 3px; }

.wled-seg-editor__card-remove { background: none; border: none; color: #484f58; cursor: pointer; font: 12px system-ui; padding: 4px; }
.wled-seg-editor__card-remove:hover { color: #ef4444; }

.wled-seg-editor__card-toggle {
  width: 28px; height: 14px; border-radius: 7px; background: #333;
  cursor: pointer; position: relative; border: none; transition: background 0.2s;
}
.wled-seg-editor__card-toggle--on { background: var(--seg-color); box-shadow: 0 0 6px color-mix(in srgb, var(--seg-color) 40%, transparent); }
.wled-seg-editor__card-toggle-dot { width: 10px; height: 10px; border-radius: 50%; background: #888; position: absolute; top: 2px; left: 2px; transition: all 0.2s; }
.wled-seg-editor__card-toggle--on .wled-seg-editor__card-toggle-dot { background: #fff; left: auto; right: 2px; }

.wled-seg-editor__add {
  width: 100%; padding: 8px; background: #12121e;
  border: 1px dashed #2d2d44; border-radius: 8px;
  color: #a78bfa; font: 12px/1 system-ui; cursor: pointer;
}
.wled-seg-editor__add:hover { border-color: #a78bfa; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add packages/wled/src/components/WledSegmentEditor.vue
git commit -m "feat(wled): add WledSegmentEditor component"
```

---

## Task 11: UI Components — WledEffectForm (Main Orchestrator)

**Files:**
- Create: `packages/wled/src/components/WledEffectForm.vue`
- Create: `packages/wled/src/components/index.ts`

- [ ] **Step 1: Create WledEffectForm.vue**

The main orchestrator that wires all sub-components together with the segment-first editing model.

```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { WledEffectConfig, WledSegmentConfig } from '../types/config'
import { createDefaultWledConfig } from '../types/config'
import { useWledSegments } from '../composables/useWledSegments'
import { WLED_EFFECTS } from '../constants/effects'
import { WLED_PALETTES } from '../constants/palettes'
import WledStripPreview from './WledStripPreview.vue'
import WledColorPicker from './WledColorPicker.vue'
import WledSlider from './WledSlider.vue'
import WledEffectList from './WledEffectList.vue'
import WledPaletteList from './WledPaletteList.vue'
import WledSegmentEditor from './WledSegmentEditor.vue'

const props = defineProps<{
  modelValue?: WledEffectConfig
}>()

const emit = defineEmits<{
  'update:modelValue': [config: WledEffectConfig]
}>()

const config = ref<WledEffectConfig>(
  props.modelValue ? { ...props.modelValue, segments: [...props.modelValue.segments] }
    : createDefaultWledConfig()
)

const {
  segments,
  activeSegmentIndex,
  addSegment,
  removeSegment,
  updateSegment,
  setActiveSegment,
} = useWledSegments(config.value.segments)

const activeSeg = computed(() => segments.value[activeSegmentIndex.value])

// Sync segments back to config and emit
watch(
  [segments, () => config.value.brightness, () => config.value.transition],
  () => {
    config.value.segments = [...segments.value]
    emit('update:modelValue', { ...config.value })
  },
  { deep: true }
)

// Initialize from prop changes
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      config.value = { ...newVal, segments: [...newVal.segments] }
      segments.value = [...newVal.segments]
    }
  }
)

function handleEffectChange(effectId: number) {
  const effectName = WLED_EFFECTS.find((fx) => fx.id === effectId)?.name ?? `Effect ${effectId}`
  updateSegment(activeSegmentIndex.value, { effectId, effectName })
}

function handlePaletteChange(paletteId: number) {
  const paletteName = WLED_PALETTES.find((p) => p.id === paletteId)?.name ?? `Palette ${paletteId}`
  updateSegment(activeSegmentIndex.value, { paletteId, paletteName })
}

function handleColorChange(colors: [number, number, number][]) {
  updateSegment(activeSegmentIndex.value, { colors })
}

function handleSpeedChange(speed: number) {
  updateSegment(activeSegmentIndex.value, { speed })
}

function handleIntensityChange(intensity: number) {
  updateSegment(activeSegmentIndex.value, { intensity })
}

function handleSegBrightnessChange(brightness: number) {
  updateSegment(activeSegmentIndex.value, { brightness })
}

function handleToggleOn(index: number) {
  updateSegment(index, { on: !segments.value[index].on })
}
</script>

<template>
  <div class="wled-form">
    <!-- LED Strip Preview -->
    <WledStripPreview :segments="segments" />

    <div class="wled-form__body">
      <!-- Left Column: Color + Sliders -->
      <div class="wled-form__left">
        <div class="wled-form__section">
          <div class="wled-form__section-label">Color</div>
          <WledColorPicker
            v-if="activeSeg"
            :model-value="activeSeg.colors"
            @update:model-value="handleColorChange"
          />
        </div>

        <div class="wled-form__section">
          <div class="wled-form__section-label">Controls</div>
          <div class="wled-form__sliders">
            <WledSlider
              label="Brightness"
              icon="☀️"
              :model-value="config.brightness"
              accent-color="#ff0080"
              @update:model-value="config.brightness = $event"
            />
            <WledSlider
              v-if="activeSeg"
              label="Speed"
              icon="⚡"
              :model-value="activeSeg.speed"
              accent-color="#f59e0b"
              @update:model-value="handleSpeedChange"
            />
            <WledSlider
              v-if="activeSeg"
              label="Intensity"
              icon="💎"
              :model-value="activeSeg.intensity"
              accent-color="#10b981"
              @update:model-value="handleIntensityChange"
            />
          </div>
        </div>
      </div>

      <!-- Right Column: Effects, Palettes, Segments -->
      <div class="wled-form__right">
        <div class="wled-form__section">
          <div class="wled-form__section-label">Effect</div>
          <WledEffectList
            v-if="activeSeg"
            :model-value="activeSeg.effectId"
            @update:model-value="handleEffectChange"
          />
        </div>

        <div class="wled-form__section">
          <div class="wled-form__section-label">Palette</div>
          <WledPaletteList
            v-if="activeSeg"
            :model-value="activeSeg.paletteId"
            @update:model-value="handlePaletteChange"
          />
        </div>

        <div class="wled-form__section">
          <div class="wled-form__section-label">Segments</div>
          <WledSegmentEditor
            :segments="segments"
            :active-index="activeSegmentIndex"
            @select="setActiveSegment"
            @add="addSegment"
            @remove="removeSegment"
            @toggle-on="handleToggleOn"
          />
        </div>

        <div class="wled-form__section">
          <div class="wled-form__section-label">Transition</div>
          <WledSlider
            label="Transition"
            icon="🔄"
            :model-value="config.transition"
            :max="100"
            accent-color="#a78bfa"
            @update:model-value="config.transition = $event"
          />
          <div class="wled-form__transition-hint">
            {{ (config.transition * 0.1).toFixed(1) }}s crossfade
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wled-form { background: #0a0a12; border: 1px solid #1a1a2e; border-radius: 16px; overflow: hidden; }

.wled-form__body { padding: 24px; display: grid; grid-template-columns: 220px 1fr; gap: 24px; }

@media (max-width: 768px) {
  .wled-form__body { grid-template-columns: 1fr; }
}

.wled-form__left,
.wled-form__right { display: flex; flex-direction: column; gap: 20px; }

.wled-form__section { background: #10101a; border: 1px solid #1a1a2e; border-radius: 12px; padding: 16px; }
.wled-form__section-label { font: 600 12px/1 system-ui; color: #a78bfa; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }

.wled-form__sliders { display: flex; flex-direction: column; gap: 14px; }

.wled-form__transition-hint { font: 11px/1 monospace; color: #8b8ba0; margin-top: 4px; text-align: right; }
</style>
```

- [ ] **Step 2: Create components barrel export**

```typescript
export { default as WledEffectForm } from './WledEffectForm.vue'
export { default as WledColorPicker } from './WledColorPicker.vue'
export { default as WledEffectList } from './WledEffectList.vue'
export { default as WledPaletteList } from './WledPaletteList.vue'
export { default as WledSlider } from './WledSlider.vue'
export { default as WledSegmentEditor } from './WledSegmentEditor.vue'
export { default as WledStripPreview } from './WledStripPreview.vue'
```

- [ ] **Step 3: Commit**

```bash
git add packages/wled/src/components/
git commit -m "feat(wled): add WledEffectForm orchestrator and component exports"
```

---

## Task 12: Server WLED Module

**Files:**
- Create: `apps/server/src/modules/wled.ts`
- Modify: `apps/server/src/modules/effects.ts`
- Modify: `apps/server/src/modules/layout.ts`
- Modify: `apps/server/package.json`

- [ ] **Step 1: Add @repo/wled dependency to server**

In `apps/server/package.json`, add to dependencies:

```json
"@repo/wled": "workspace:*"
```

Run: `pnpm install`

- [ ] **Step 2: Create wled.ts — WLED device connection manager**

```typescript
import { WledClient } from '@repo/wled/client'
import type { WledEffectConfig, WledSegmentConfig } from '@repo/wled/types'
import type { Effect } from '@repo/modules'
import { db } from '@repo/firebase-config/firebase-admin-node'
import { log } from '../utils/logger.js'

const layoutId = process.env.LAYOUT_ID || 'betatrack'
const clients = new Map<string, WledClient>()

interface WledDeviceInfo {
  id: string
  host: string
  port: number
}

export async function connectDevice(device: WledDeviceInfo): Promise<void> {
  try {
    if (clients.has(device.id)) {
      log.warn(`[WLED] Device ${device.id} already connected`)
      return
    }

    log.start(`[WLED] Connecting to ${device.host}:${device.port}...`)
    const client = new WledClient(device.host, device.port)

    client.onDisconnect(() => {
      log.warn(`[WLED] Device ${device.id} disconnected`)
      db.doc(`layouts/${layoutId}/devices/${device.id}`).set(
        { isConnected: false },
        { merge: true }
      )
    })

    await client.connect()
    clients.set(device.id, client)

    // Fetch device info and write back to Firestore
    const info = await client.getInfo()
    await db.doc(`layouts/${layoutId}/devices/${device.id}`).set(
      {
        isConnected: true,
        lastConnected: new Date(),
        wledInfo: {
          version: info.ver,
          ledCount: info.leds.count,
          name: info.name,
          mac: info.mac,
          ip: info.ip,
        },
      },
      { merge: true }
    )

    log.success(`[WLED] Connected to ${info.name} (${info.leds.count} LEDs, v${info.ver})`)
  } catch (err) {
    log.error(`[WLED] Failed to connect device ${device.id}:`, err)
  }
}

export async function disconnectDevice(deviceId: string): Promise<void> {
  const client = clients.get(deviceId)
  if (client) {
    client.disconnect()
    clients.delete(deviceId)
    log.log(`[WLED] Disconnected device ${deviceId}`)
  }
}

export function getClient(deviceId: string): WledClient | undefined {
  return clients.get(deviceId)
}

/** Translate a DEJA Effect with wled config into a WLED JSON API payload */
function buildWledPayload(effect: Effect): Record<string, unknown> {
  const wled = effect.wled as WledEffectConfig | undefined
  if (!wled) {
    return { on: effect.state }
  }

  // If just toggling state, send minimal payload
  if (!effect.state) {
    return { on: false }
  }

  return {
    on: true,
    bri: wled.brightness,
    transition: wled.transition,
    seg: wled.segments.map((seg: WledSegmentConfig, i: number) => ({
      id: i,
      start: seg.start,
      stop: seg.stop,
      fx: seg.effectId,
      pal: seg.paletteId,
      col: seg.colors,
      sx: seg.speed,
      ix: seg.intensity,
      bri: seg.brightness,
      on: seg.on,
      rev: seg.reverse,
      mi: seg.mirror,
    })),
  }
}

export async function handleEffectChange(effect: Effect): Promise<void> {
  if (!effect.device) {
    log.error('[WLED] No device specified for WLED effect', effect.id)
    return
  }

  const client = clients.get(effect.device)
  if (!client?.isConnected) {
    log.error(`[WLED] Device ${effect.device} not connected`)
    return
  }

  const payload = buildWledPayload(effect)
  log.log(`[WLED] Sending to ${effect.device}:`, JSON.stringify(payload))
  client.setState(payload as any)
}

export default {
  connectDevice,
  disconnectDevice,
  getClient,
  handleEffectChange,
}
```

- [ ] **Step 3: Add WLED case to effects.ts handleEffect()**

In `apps/server/src/modules/effects.ts`, add an import at the top:

```typescript
import wled from './wled.js'
```

Then add a WLED handler block in `handleEffect()` after the sound effect block (around line 203, before `const conn = payload.device`):

```typescript
  // Handle WLED effects
  if (payload.type === 'wled') {
    try {
      await wled.handleEffectChange(payload)
    } catch (error) {
      log.error('[EFFECTS] Error handling WLED effect:', error)
    }
    return
  }
```

- [ ] **Step 4: Add WLED case to layout.ts connectDevice()**

In `apps/server/src/modules/layout.ts`, add an import at the top:

```typescript
import wled from './wled.js'
```

Then modify the `connectDevice()` function (around line 271) to add a WLED case before the existing USB/WiFi routing:

```typescript
    // WLED devices connect via WebSocket directly (not MQTT)
    if (device.type === 'wled' && device.connection === 'wifi') {
      const host = (device as any).host
      const port = (device as any).port ?? 80
      if (host) {
        await wled.connectDevice({ id: device.id, host, port })
      } else {
        log.error('[LAYOUT] WLED device missing host:', device.id)
      }
      return
    }
```

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/modules/wled.ts apps/server/src/modules/effects.ts apps/server/src/modules/layout.ts apps/server/package.json
git commit -m "feat(wled): add server WLED module with WebSocket connection management"
```

---

## Task 13: Cloud App Integration — EffectForm

**Files:**
- Modify: `apps/cloud/package.json`
- Modify: `apps/cloud/src/Effects/EffectForm.vue`

- [ ] **Step 1: Add @repo/wled dependency to cloud app**

In `apps/cloud/package.json`, add to dependencies:

```json
"@repo/wled": "workspace:*"
```

Run: `pnpm install`

- [ ] **Step 2: Add WledEffectForm import to EffectForm.vue**

In `apps/cloud/src/Effects/EffectForm.vue`, add the import after existing imports (around line 13):

```typescript
import { WledEffectForm } from '@repo/wled/components'
```

- [ ] **Step 3: Add wled config ref**

In the script section, add a ref for the WLED config (near the other refs like `pin`, `pattern`, etc.):

```typescript
const wledConfig = ref(props.efx?.wled ?? undefined)
```

- [ ] **Step 4: Add WLED config to submit handler**

In the `submit()` function (around line 184), add a block to set the wled config before `await setEfx(...)`:

```typescript
  // set wled config
  if (efxType.value === 'wled' && wledConfig.value) {
    newEfx.wled = wledConfig.value
  }
```

- [ ] **Step 5: Add WledEffectForm template block**

In the template, add a WLED form block after the IALED template block (after line 388, before the pin template):

```vue
      <!-- WLED form -->
      <template v-if="efxType === 'wled'">
        <div class="form-section__row form-section__row--block">
          <WledEffectForm v-model="wledConfig" />
        </div>
      </template>
```

- [ ] **Step 6: Verify the Cloud app builds**

Run: `pnpm --filter=deja-cloud build`
Expected: Build succeeds with no errors

- [ ] **Step 7: Commit**

```bash
git add apps/cloud/
git commit -m "feat(wled): integrate WledEffectForm into Cloud app EffectForm"
```

---

## Task 14: Final Verification & Cleanup

- [ ] **Step 1: Run full type check**

Run: `pnpm check-types`
Expected: All packages pass type checking

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: No lint errors (fix any that appear)

- [ ] **Step 3: Verify server builds**

Run: `pnpm --filter=deja-serverts build`
Expected: Build succeeds

- [ ] **Step 4: Verify cloud app builds**

Run: `pnpm --filter=deja-cloud build`
Expected: Build succeeds

- [ ] **Step 5: Start cloud app and verify WledEffectForm renders**

Run: `pnpm --filter=deja-cloud dev`

1. Navigate to Effects → Add New Effect
2. Select "WLED" type
3. Verify the Neon Studio WledEffectForm renders with: color wheel, effect list, palette list, sliders, segment editor
4. Verify form submits without errors

- [ ] **Step 6: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix(wled): address lint and build issues"
```
