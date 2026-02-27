# CLAUDE.md — DEJA.js Codebase Guide

This file provides AI assistants with the context needed to work effectively in this repository.

---

## Project Overview

**DEJA.js** (*DCC-EX JavaScript API*) is a monorepo for a model railroad control system. It interfaces with [DCC-EX](https://dcc-ex.com/) command stations via USB serial, coordinating real-time train control through WebSockets, MQTT, and Firebase. The system is built entirely in TypeScript, using Vue 3 on the frontend and Node.js on the backend.

---

## Monorepo Structure

```
DEJA.js/
├── apps/
│   ├── cloud/        Vue 3 + Firebase — layout management hub (port 3011)
│   ├── monitor/      Vue 3 + Firebase — system monitoring dashboard (port 3021)
│   ├── server/       Node.js + TypeScript — WebSocket API → DCC-EX serial bridge
│   ├── sound-api/    Next.js 14 — sound effects API (port 3001, Vercel Blob)
│   ├── throttle/     Vue 3 + MQTT — train throttle control app (port 3041)
│   └── tour/         Vue 3 — interactive tour / effects app (port 3031)
├── io/               Arduino / Pico W device firmware and layout configs
└── packages/
    ├── @repo/auth            Authentication & user management utilities
    ├── @repo/config-eslint   Shared ESLint flat config (base, vue, node, nextjs)
    ├── @repo/config-prettier Shared Prettier config (+ Tailwind plugin)
    ├── @repo/dccex           DCC-EX command station protocol library
    ├── @repo/deja            Core DEJA composables and utilities
    ├── @repo/firebase-config Firebase initialization (browser, Node, Admin)
    ├── @repo/modules         Shared business logic (effects, layouts, locos, signals, turnouts, routes)
    ├── @repo/sounds          Sound assets + Vercel Blob utilities
    ├── @repo/typescript-config TypeScript config presets
    ├── @repo/ui              Shared Vue component library (Consist, Turnouts, Effects, etc.)
    └── @repo/utils           Common utility functions
```

---

## Tech Stack

### Vue apps (cloud, monitor, throttle, tour)
- **Vue 3** with Composition API and `<script setup lang="ts">` syntax
- **Vuetify 3** for UI components (Material Design)
- **Pinia** for state management
- **Vue Router 4** for routing
- **Vite** for dev server and builds
- **TypeScript** throughout
- **Tailwind CSS** for utility classes
- **Firebase / Vuefire** for real-time data (cloud, monitor)
- **MQTT** via `mqtt-vue-hook` (throttle)

### Server (`apps/server`)
- **Node.js 20+** + **TypeScript** running via `tsx`
- **WebSockets** (`ws`) for browser ↔ server communication
- **SerialPort** for USB communication with DCC-EX CommandStation
- **MQTT** for broker communication
- **Firebase Admin SDK**

### Sound API (`apps/sound-api`)
- **Next.js 14** / React 18
- **Vercel Blob** for audio asset storage

---

## Key Commands

```bash
# Run all at once
pnpm dev              # Start all apps in development mode
pnpm build            # Build all packages
pnpm lint             # Lint all packages (ESLint, auto-fix)
pnpm format           # Format all .ts, .tsx, .md files (Prettier)
pnpm check-types      # TypeScript type check across monorepo

# Run server + monitor only
pnpm deja

# Filtered runs
pnpm --filter=deja-throttle dev
pnpm --filter=deja-cloud dev
pnpm --filter=deja-serverts dev

# Unit tests (throttle app only — Vitest)
pnpm --filter=deja-throttle test:unit

# Dependency management
pnpm deps:check       # syncpack: list version mismatches
pnpm deps:fix         # syncpack: fix mismatches
```

---

## Coding Conventions

### Vue Components
- Always use `<script setup lang="ts">` (Composition API, no Options API)
- Use `defineProps`, `defineEmits`, `defineExpose` with TypeScript types
- Component files are `.vue`, named in PascalCase
- Use Vuetify components (`v-btn`, `v-card`, etc.) for all UI — avoid raw HTML for common elements

### TypeScript
- Strict mode is on — no `any` unless absolutely unavoidable
- Prefer `interface` over `type` for object shapes
- Shared types live in `@repo/modules` or the relevant package

### Imports
- Always use workspace imports for shared packages: `@repo/ui`, `@repo/modules`, etc.
- Never use relative paths that cross package boundaries (e.g., `../../packages/...`)
- Vite apps have an `@/` alias pointing to `src/`

### State Management
- Use **Pinia** stores (not Vuex, not raw composables for global state)
- Firebase Realtime Database is accessed via **Vuefire** composables

### MQTT / WebSocket
- MQTT topics and payloads are defined in `@repo/modules`
- WebSocket protocol is documented in `apps/server/WEBSOCKET_PROTOCOL.md`

---

## Development Workflow

1. **Plan before coding** — Use Plan Mode (Shift+Tab twice) for non-trivial changes
2. **Lint and type-check before committing** — run `pnpm lint && pnpm check-types`
3. **Use the `/verify-changes` slash command** to confirm nothing is broken
4. **Add a changelog entry** — run `/changelog` for any user-facing changes
5. **Use the `/commit-push-pr` slash command** to commit, push, and open a PR

---


## Environment Variables

Copy `.env.example` to `.env` at the root. Key variables:

| Variable | Purpose |
|----------|---------|
| `LAYOUT_ID` | Your DEJA Cloud layout ID |
| `VITE_FIREBASE_*` | Firebase project configuration |
| `VITE_MQTT_BROKER` | MQTT broker URL (default: `mqtt://localhost`) |
| `VITE_MQTT_PORT` | MQTT port (default: `1883`) |
| `ENABLE_MQTT` | Toggle MQTT communication |
| `ENABLE_WS` | Toggle WebSocket communication |
| `VITE_WS_PORT` | WebSocket server port (default: `8082`) |

App-specific env files go in `apps/<app>/.env.local`.

---

## Rules — Things Claude Should NOT Do

> This section grows over time. Every mistake becomes a rule.

- **Do not modify `pnpm-lock.yaml` manually** — it is auto-generated by pnpm
- **Do not use relative imports across package boundaries** — always use `@repo/*` workspace imports
- **Do not use the Options API** in Vue components — use `<script setup lang="ts">`
- **Do not add `any` types** without a clear comment explaining why
- **Do not create new packages** without updating `pnpm-workspace.yaml`
- **Do not run `npm install` or `yarn`** — this is a pnpm workspace; always use `pnpm`
- **Do not commit `.env` files** — only `.env.example` belongs in git
- **Do not bypass ESLint with `// eslint-disable`** without a specific reason in the comment
Managed with **pnpm workspaces** + **Turborepo**. Package manager is `pnpm@9.0.0`. Node.js >= 20 required.

```
DEJA.js/
├── apps/
│   ├── cloud/          # Vue 3 layout management & device monitoring UI
│   ├── monitor/        # Vue 3 diagnostics & logging dashboard
│   ├── server/         # Node.js backend: WebSocket + Serial + MQTT + Firebase
│   ├── sound-api/      # Next.js API for sound effect management
│   ├── throttle/       # Vue 3 train control interface (primary user app)
│   └── tour/           # Vue 3 interactive tour / special effects UI
├── io/
│   ├── src/
│   │   ├── deja-arduino/   # Arduino (.ino) firmware for IO devices
│   │   └── deja-pico-w/    # CircuitPython code for Raspberry Pi Pico W
│   └── layouts/            # Per-layout device configs (JSON)
└── packages/
    ├── auth/               # Firebase auth guards & Vue components
    ├── config-eslint/      # Shared ESLint flat configs
    ├── config-prettier/    # Shared Prettier config
    ├── dccex/              # DCC-EX command integration (useDcc composable)
    ├── deja/               # Core DEJA composable (useDejaJS, Firebase RTDB writes)
    ├── firebase-config/    # Firebase client & admin SDK initialization
    ├── modules/            # Business logic modules (locos, turnouts, effects, etc.)
    ├── sounds/             # Sound effect metadata & utilities
    ├── typescript-config/  # Shared tsconfig base files
    ├── ui/                 # Shared Vue components (LocoAvatar, TurnoutList, etc.)
    └── utils/              # Shared utilities (slugify, etc.)
```

Internal packages use the `@repo/` scope (e.g. `@repo/modules`, `@repo/ui`). They are referenced as `workspace:*` in package.json files.

---

## Key Commands

Run from the repo root using `turbo` (or `pnpm`):

```bash
# Start all apps in dev mode
turbo dev

# Start only specific apps
turbo dev --filter=deja-throttle
turbo dev --filter=deja-cloud

# Start DEJA Server + Monitor (production-style, used with pm2)
pnpm deja                          # runs turbo deja --filter=deja-serverts --filter=deja-monitor

# Build everything
turbo build

# Type checking
turbo check-types                  # or turbo type-check in some packages

# Linting & formatting
turbo lint
turbo format                       # root: prettier --write "**/*.{ts,tsx,md}"

# Dependency management (syncpack)
pnpm deps:check                    # list mismatched versions
pnpm deps:fix                      # fix mismatches
pnpm deps:format                   # format package.json files

# Sound scanning
pnpm scan-sounds                   # runs in @repo/sounds
```

### Per-App Commands

Each app in `apps/` has its own dev/build/start scripts:

| App | Name in package.json | dev port | notes |
|-----|---------------------|----------|-------|
| throttle | `deja-throttle` | Vite default | `npm run test:unit` runs vitest |
| cloud | `deja-cloud` | Vite default | `dev:mock` for mock mode |
| server | `deja-serverts` | — | `tsx watch index.ts` in dev |
| monitor | `deja-monitor` | Vite default | also has `deja` alias for start |
| tour | — | Vite default | Vue 3 |

---

## Architecture & Communication

### Data Flow

```
Frontend apps (Throttle, Cloud, Monitor, Tour)
        │
        ├─ Firebase Firestore/RTDB  ──► Server listens, sends DCC commands via Serial
        └─ WebSocket (ws://host:8082) ◄─► Server (real-time bidirectional)
                                         │
                                    Serial USB (115200 baud)
                                         │
                                  DCC-EX CommandStation (Arduino)
                                         │
                                    DCC track power & decoders
```

**Optional MQTT layer** (`ENABLE_MQTT=true`): Broker runs via Mosquitto. The throttle app connects using `mqtt-vue-hook`.

### Server Entry Point (`apps/server/index.ts`)

Three independently togglable subsystems, controlled by env vars:

1. **`ENABLE_DEJACLOUD`** — connects to Firebase (Firestore + RTDB), listens to layout changes, dispatches DCC/serial commands
2. **`ENABLE_MQTT`** — connects MQTT broker
3. **`ENABLE_WS`** (default true) — starts WebSocket server on `VITE_WS_PORT` (default 8082)

### Firebase Collections

Data is scoped to a `LAYOUT_ID`. Common Firestore paths:
- `layouts/{layoutId}/throttles` — active throttle sessions (speed, direction, address)
- `layouts/{layoutId}/turnouts` — turnout states
- `layouts/{layoutId}/effects` — special effects (sounds, lights, signals)
- `layouts/{layoutId}/signals` — signal states
- `layouts/{layoutId}/devices` — connected hardware devices
- `dccCommands/{layoutId}` — RTDB: raw DCC commands queue
- `dejaCommands/{layoutId}` — RTDB: DEJA system commands queue

### WebSocket Protocol

Messages are JSON with `{ action, payload }` shape. Default port: **8082**.

Key actions (broadcast to all clients):
- `ack` — connection acknowledgment with `{ layoutId, serverId }`
- `wsconnected` — client IP + server ID
- `dcc` — DCC commands
- `portList` — available serial ports
- `serial-data` — serial I/O for a specific device

Device serial monitoring (subscribe/unsubscribe pattern):
```json
{ "action": "subscribe-device", "deviceId": "device-123" }
{ "action": "unsubscribe-device", "deviceId": "device-123" }
```
See `apps/server/WEBSOCKET_PROTOCOL.md` for the full protocol spec.

---

## Package Details

### `@repo/modules` — Core Business Logic

The central package. Organized by domain:

```
packages/modules/
├── effects/     useEfx, effect types & constants
├── layouts/     useLayout, layout types & constants
├── locos/       useLocos, useFunctions, useFunctionIcon, loco types
├── routes/      useLayoutRoutes, useRoutes, route types
├── signals/     useSignals, signal types
└── turnouts/    useTurnouts, turnout types
```

All composables are Vue 3 composables (Composition API). Import from `@repo/modules`:
```typescript
import { useLocos, useTurnouts, useLayout } from '@repo/modules'
```

### `@repo/dccex` — DCC-EX Integration

`useDcc()` composable — the primary way frontend apps send DCC commands:
```typescript
const { setFunction, setPower, sendOutput, sendDccCommand } = useDcc()
```

`defaultCommands` — predefined command objects for power, reset, status, etc.

### `@repo/deja` — DEJA Core

`useDejaJS()` composable — writes commands to Firebase RTDB (`dejaCommands/{layoutId}`), which the server picks up and processes.

### `@repo/ui` — Shared Vue Components

Key components: `LocoAvatar`, `Consist`, `MiniConsist`, `Functions`, `TurnoutList`, `TurnoutSwitch`, `TurnoutCard`, `SelectLayout`, `LayoutChip`, `TrackPower`, `SignalList`, `UserProfile`, `EmergencyStop`.

### `@repo/auth` — Authentication

Firebase Auth integration. Route guards: `requireAuth`, `requireDccEx`, `requireLayout`.

### `@repo/firebase-config`

Exports both browser client (`firebase`) and server-side admin SDK (`firebase-admin-node`) initializations.

---

## Frontend Apps (Vue 3)

All Vue apps use:
- **Vue 3** with Composition API (`<script setup>`)
- **Vuetify 3** for UI components
- **Tailwind CSS** for utility classes
- **Pinia** for state (throttle app)
- **VueFire** for reactive Firebase bindings
- **VueUse** for composable utilities
- **vue-router** for client-side routing

### Throttle App (`apps/throttle/`)

The primary user-facing app. Key views:
- `ThrottleView` / `ThrottleListView` — train speed/direction/function controls
- `TurnoutsView` — throw/close turnouts
- `RoutesView` — preset route management
- `RosterView` — loco roster
- `EffectsView`, `SignalsView` — effects & signals management
- `ConductorView` — conductor layout view
- `SelectLayoutView` — layout selection

State is driven by Firebase Firestore via `useThrottle(address)` composable (`apps/throttle/src/throttle/useThrottle.ts`). Speed updates write to `layouts/{layoutId}/throttles/{address}`.

### Cloud App (`apps/cloud/`)

Layout management and device configuration UI. Source organized by feature:
- `DCCEX/` — DCC command console & log
- `Dashboard/` — system overview
- `DejaDirectConnect/` — direct server connection
- `Effects/` — effects management
- `Layout/` — layout config
- `Roster/` — locomotive roster management
- `Routes/` — route config
- `Signals/` — signal wiring
- `Turnouts/` — turnout config

Supports `--mode mock` for development without a live connection.

---

## Server App (`apps/server/`)

Pure TypeScript, run with `tsx`. **ESM modules** (`"type": "module"` in package.json).

Key source files:
```
apps/server/
├── index.ts                      # Entry point, wires up all subsystems
└── src/
    ├── dejaCloud.ts              # Firebase listeners & lifecycle management
    ├── broadcast.ts              # Broadcasts to WebSocket clients
    ├── lib/
    │   ├── dcc.ts                # DCC command handler (serial write dispatch)
    │   ├── deja.ts               # DEJA command handler
    │   ├── mqtt.ts               # MQTT client
    │   ├── serial.ts             # SerialPort wrapper (connect/send/disconnect)
    │   ├── sound.ts              # Sound playback via play-sound
    │   ├── ws-server.ts          # WebSocket server (general + device-specific)
    │   └── AudioCacheService.ts  # Audio file caching
    ├── modules/
    │   ├── effects.ts            # Effect handling (sounds, lights)
    │   ├── layout.ts             # Layout initialization
    │   ├── sensors.ts            # Sensor data handling
    │   ├── signals.ts            # Signal state handling
    │   ├── throttles.ts          # Throttle/speed command handling
    │   └── turnouts.ts           # Turnout command handling
    └── utils/
        └── logger.ts             # Signale-based logger (log.start, log.error, etc.)
```

Serial baud rate: **115200**. DCC-EX commands are wrapped in angle brackets: `<t 3 50 1>` (throttle address 3, speed 50, forward).

---

## DCC-EX Command Reference

DCC-EX uses a simple text protocol over serial. Every command is wrapped in angle brackets and terminated with a newline: `<command>\n`. The server's `send()` function in `apps/server/src/lib/dcc.ts` performs this wrapping automatically — callers pass only the inner string.

> Full upstream docs: https://dcc-ex.com/reference/software/command-reference.html

### Serial Commands (as sent by DEJA.js)

| Operation | DCC-EX format | DEJA.js source |
|---|---|---|
| Track power ON | `<1>` | `dcc.power('1')` |
| Track power OFF | `<0>` | `dcc.power('0')` |
| Main track power ON/OFF | `<1 MAIN>` / `<0 MAIN>` | `dcc.send('1 MAIN')` |
| Prog track power ON/OFF | `<1 PROG>` / `<0 PROG>` | `dcc.send('1 PROG')` |
| Throttle (speed+direction) | `<t addr speed dir>` | `dcc.sendSpeed({ address, speed })` |
| Throw/close turnout | `<T idx state>` | `dcc.sendTurnout({ turnoutIdx, state })` |
| Loco function | `<F addr func state>` | `dcc.sendFunction({ address, func, state })` |
| Accessory output | `<Z pin state>` | `dcc.sendOutput({ pin, state })` |
| Hardware reset | `<D RESET>` | `dcc.send('D RESET')` |
| Status query | `<=>` | `dcc.send('=')` / `dcc.getStatus()` |
| Save EEPROM | `<E>` | `dcc.send('E')` |
| List outputs | `<Z>` | `dcc.send('Z')` |

**Parameter notes:**
- `addr` — DCC decoder address (1–9999)
- `speed` — 0–126 (DEJA.js uses signed speed: positive = forward, negative = reverse; direction bit is derived server-side)
- `dir` — `1` = forward, `0` = reverse
- `idx` — turnout index as configured on the CommandStation
- `state` (turnout) — `1` = thrown, `0` = closed
- `func` / `state` (function) — function number 0–28, `1` = on, `0` = off
- `pin` / `state` (output) — Arduino pin number, `1` = on, `0` = off

### How Commands Flow from Frontend to Serial

```
Frontend (Vue app)
  │
  │  useDcc().setFunction(addr, func, state)     // packages/dccex/useDcc.ts
  │  useDcc().setPower(payload)
  │  useDcc().sendOutput(pin, state)
  │
  ▼
  send('function' | 'dcc' | 'output', payload)   // writes to Firebase RTDB
  │
  ▼
Firebase RTDB: dccCommands/{layoutId}             // push + set with serverTimestamp
  │
  ▼
Server: dejaCloud.ts  rtdb.ref.on('child_added')  // apps/server/src/dejaCloud.ts
  │
  ▼
handleDccChange(snapshot) → handleMessage(json)   // apps/server/src/lib/dcc.ts
  │
  ├── 'throttle'  → sendSpeed()   → send('t addr speed dir')
  ├── 'turnout'   → sendTurnout() → send('T idx state')
  ├── 'function'  → sendFunction()→ send('F addr func state')
  ├── 'output'    → sendOutput()  → send('Z pin state')
  ├── 'dcc'       → send()        → raw command passthrough
  └── 'power'     → power()       → send('1' | '0' | ...)
  │
  ▼
serial.send(port, '<cmd>\n')                      // apps/server/src/lib/serial.ts
  │
  ▼
DCC-EX CommandStation (Arduino, 115200 baud)
```

DEJA commands (device connect, port listing, status) use a **separate** RTDB queue (`dejaCommands/{layoutId}`) handled by `apps/server/src/lib/deja.ts` — they never go to serial.

Firestore change listeners (`layouts/{layoutId}/throttles`, `/turnouts`, `/signals`, `/effects`) are handled in `apps/server/src/modules/` and also ultimately call `dcc.sendSpeed()` / `dcc.sendTurnout()` etc.

---

## IO / Device Firmware (`io/`)

Hardware device code — not part of the Node.js/pnpm workspace (no `io/` in `pnpm-workspace.yaml`):

- **`io/src/deja-arduino/`** — Arduino sketch (`.ino`) for effect/output boards communicating over MQTT
- **`io/src/deja-pico-w/`** — CircuitPython for Raspberry Pi Pico W (WiFi MQTT, servo/LED animation via Adafruit libraries)
- **`io/layouts/`** — Per-layout per-device JSON config files

---

## Environment Variables

Copy `.env.example` to `.env` (or `.env.local`) at the repo root. Turborepo reads `.env` as a global dependency.

| Variable | Description |
|---|---|
| `LAYOUT_ID` | Unique identifier for the layout in Firebase |
| `VITE_FIREBASE_*` | Firebase project credentials (API key, auth domain, project ID, etc.) |
| `VITE_MQTT_BROKER` | MQTT broker URL (default: `mqtt://localhost`) |
| `VITE_MQTT_PORT` | MQTT broker port (default: `1883`) |
| `ENABLE_MQTT` | `true`/`false` — enable MQTT on server |
| `ENABLE_WS` | `true`/`false` — enable WebSocket server (default true) |
| `ENABLE_DEJACLOUD` | `true`/`false` — enable Firebase cloud integration |
| `VITE_WS_PORT` | WebSocket server port (default: `8082`) |
| `VITE_WS_ID` | Server identifier string (default: `DEJA.js`) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for sound file storage |

---

## TypeScript Configuration

Shared base configs in `packages/typescript-config/`:
- `base.json` — general TypeScript strictness settings
- `node.json` — Node.js server apps
- `react-library.json` — React packages
- `vue-library.json` — Vue packages
- `nextjs.json` — Next.js apps

Each package/app extends from these via `@repo/typescript-config`.

---

## Code Quality

### ESLint

Shared flat configs in `packages/config-eslint/`. Includes: `@eslint/js`, `typescript-eslint`, `eslint-config-turbo`, `eslint-plugin-import`, `eslint-plugin-unicorn`, and custom rule sets for best practices, comments, ES6, stylistic, and TypeScript-specific rules.

Each app has its own `eslint.config.mjs` extending the shared config.

### Prettier

Shared config in `packages/config-prettier/`. Applied via `turbo format` (root) or `prettier --write src/` per-package.

### syncpack

`syncpack.config.cjs` at root enforces consistent dependency versions across all packages. Internal `@repo/` packages are excluded from version checks (workspace protocol). Run `pnpm deps:check` / `pnpm deps:fix`.

---

## Key Conventions

### Vue Component Patterns

- Use `<script setup lang="ts">` (Composition API)
- Import composables from `@repo/modules`, `@repo/dccex`, `@repo/deja`, `@repo/auth`
- Use `useStorage` from `@vueuse/core` for persistent local state (e.g., `@DEJA/layoutId`)
- Firebase reactive bindings via `vuefire` (`useDocument`, `useCollection`)

### Server-Side Patterns

- All modules export an object interface (e.g., `export const wsServer = { connect, disconnect, send }`)
- Async functions return `Promise<void>` or typed promises
- Logging uses `signale` via the logger utility (`log.start`, `log.error`, `log.success`, `log.fatal`)
- Environment toggles guard each subsystem startup

### Command Flow

1. Frontend writes a command to Firebase (RTDB `dccCommands/` or Firestore `throttles/`)
2. Server Firebase listener fires (`dejaCloud.ts`)
3. Server dispatches to appropriate module handler (`throttles.ts`, `turnouts.ts`, etc.)
4. Module handler calls `serial.send(port, dccCommand)` to write to DCC-EX hardware
5. Server broadcasts status back to WebSocket clients via `broadcast.ts`

### Naming Conventions

- Vue composables: `use<Name>` (camelCase)
- Vue components: PascalCase
- Types/interfaces: PascalCase
- Constants: camelCase (objects) or SCREAMING_SNAKE_CASE for primitives
- Internal packages: `@repo/<name>` scope

---

## Production Deployment

Use **pm2** to manage long-running server processes:

```bash
# Start server + monitor under pm2
pm2 start bash --name deja-start -- -lc "pnpm turbo run start --filter=apps/server --filter=apps/monitor"

# Persist and auto-start on boot
pm2 save
pm2 startup
```

Frontend apps (throttle, cloud) are deployed to **Vercel** (see `vercel.json` in each app). The sound-api app also deploys to Vercel.

---

## Testing

- Throttle app uses **Vitest** with `@vue/test-utils` and `jsdom`
- Run: `pnpm test:unit` in `apps/throttle/` or `vitest` directly
- No test files exist in other packages currently (see `TODO.md`)

---

## Relevant Documentation Files

| File | Purpose |
|---|---|
| `README.md` | Project overview, setup, quick start |
| `API_DOCUMENTATION.md` | Public APIs, composables, types, usage examples |
| `CHANGELOG.md` | Version history (Keep a Changelog format) |
| `ROADMAP.md` | Planned features |
| `TODO.md` | Short-term task list |
| `apps/server/WEBSOCKET_PROTOCOL.md` | WebSocket message format & device subscription protocol |
| `apps/*/README.md` | Per-app documentation |
