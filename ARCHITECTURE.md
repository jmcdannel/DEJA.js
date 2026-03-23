# 🏗️ Architecture

DEJA.js is a monorepo that combines multiple frontend applications, a backend server, shared packages, and device firmware into a single coordinated system. This page explains how the pieces connect and how data flows from a browser tap to electrical signals on the track.

## 🗂️ System Overview

The repository is divided into three top-level directories:

```
DEJA.js/
├── apps/           🖥️ Frontend applications and the backend server
├── packages/       📦 Shared libraries used across apps
└── io/             🔌 Arduino and Raspberry Pi Pico W firmware
```

### 🖥️ Apps

| Directory | What It Is |
|-----------|------------|
| `apps/throttle` | 🚂 Vue 3 train control interface (the primary operator app) |
| `apps/cloud` | ☁️ Vue 3 layout management and configuration hub |
| `apps/monitor` | 📊 Vue 3 diagnostics and logging dashboard |
| `apps/tour` | 🎭 Vue 3 interactive tour and effects runner |
| `apps/server` | ⚙️ Node.js backend that bridges browsers to DCC-EX hardware |
| `apps/sound-api` | 🔊 Next.js API for managing sound effect assets |

### 📦 Packages

All internal packages use the `@repo/` scope and are referenced as `workspace:*` dependencies in each app's `package.json`.

| Package | Purpose | Docs |
|---------|---------|------|
| `@repo/modules` | 🧠 Core business logic -- composables and types for locos, turnouts, effects, signals, routes, and layouts | [README](packages/modules/README.md) |
| `@repo/ui` | 🎨 Shared Vue component library (LocoAvatar, TurnoutSwitch, EmergencyStop, TrackPower, and more) | [README](packages/ui/README.md) |
| `@repo/dccex` | 🔧 DCC-EX command protocol -- the `useDcc()` composable for sending DCC commands | [README](packages/dccex/README.md) |
| `@repo/deja` | 🔥 Core DEJA composable -- writes commands to Firebase Realtime Database | [README](packages/deja/README.md) |
| `@repo/firebase-config` | 🗄️ Firebase client SDK and Admin SDK initialization | [README](packages/firebase-config/README.md) |
| `@repo/auth` | 🔐 Firebase Authentication integration and Vue Router guards | [README](packages/auth/README.md) |
| `@repo/sounds` | 🎵 Sound effect metadata and Vercel Blob utilities | — |
| `@repo/utils` | 🛠️ Common utility functions (slugify, helpers) | [README](packages/utils/README.md) |
| `@repo/config-eslint` | 📏 Shared ESLint flat configuration | — |
| `@repo/config-prettier` | ✨ Shared Prettier configuration | — |
| `@repo/typescript-config` | 📘 Shared TypeScript base configurations | — |

### 🔗 Package Dependency Graph

The following shows how packages depend on each other. Arrows point from the consumer to the dependency.

```
apps/throttle ──> @repo/modules
              ──> @repo/ui
              ──> @repo/dccex ──> @repo/deja ──> @repo/firebase-config
              ──> @repo/auth ──> @repo/firebase-config

apps/cloud ────> @repo/modules
              ──> @repo/ui
              ──> @repo/dccex ──> @repo/deja
              ──> @repo/auth

apps/monitor ──> @repo/modules
              ──> @repo/ui
              ──> @repo/firebase-config

apps/server ───> @repo/modules
              ──> @repo/firebase-config (Admin SDK)

apps/sound-api ─> @repo/sounds
```

All Vue apps also depend on `@repo/config-eslint`, `@repo/config-prettier`, and `@repo/typescript-config` as dev dependencies.

## 📡 Communication Layers

DEJA.js uses four communication layers, each serving a different purpose. Three of them are independently toggleable on the server via environment variables.

![Communication layers diagram](/images/docs/architecture/communication-layers.png)

### 1. 🔥 Firebase (Firestore + Realtime Database)

Firebase is the primary data synchronization layer. It provides:

- **Cloud Firestore** -- Stores layout configuration, locomotive rosters, turnout definitions, effects, signals, and throttle state. Frontend apps bind to these collections reactively using VueFire.
- **Realtime Database (RTDB)** -- Used as a command queue. Frontend apps push DCC commands to `dccCommands/{layoutId}` and DEJA system commands to `dejaCommands/{layoutId}`. The server listens for new entries and processes them.

Key Firestore paths (scoped to a layout):

```
layouts/{layoutId}/throttles    -- 🚂 Active throttle sessions
layouts/{layoutId}/turnouts     -- 🔀 Turnout states
layouts/{layoutId}/effects      -- ✨ Effect definitions
layouts/{layoutId}/signals      -- 🚦 Signal states
layouts/{layoutId}/devices      -- 🔌 Connected hardware devices
```

Key RTDB paths:

```
dccCommands/{layoutId}          -- ⚡ DCC command queue (throttle, turnout, function, output, power)
dejaCommands/{layoutId}         -- 🎛️ System command queue (device connect, port list, status)
```

**Server toggle:** `ENABLE_DEJACLOUD=true`

### 2. 🌐 WebSocket

A WebSocket server (`ws://host:8082` by default) provides real-time bidirectional communication between the browser apps and the server. It is used for:

- ✅ Connection acknowledgment and status broadcasts
- 📋 Serial port listing and device monitoring
- ⚡ DCC command passthrough
- 📡 Device-specific serial data subscriptions

Messages follow a `{ action, payload }` JSON format. See the [WebSocket Protocol](apps/server/WEBSOCKET_PROTOCOL.md) documentation for the full specification.

**Server toggle:** `ENABLE_WS=true`

### 3. 📬 MQTT

An optional MQTT layer supports IoT device communication. The Throttle app connects to an MQTT broker using `mqtt-vue-hook`, and the server can publish and subscribe to topics for device coordination.

MQTT is primarily used for communication with Arduino and Raspberry Pi Pico W hardware defined in the `io/` directory.

**Server toggle:** `ENABLE_MQTT=true`

### 4. 🔌 USB Serial

The server communicates with the DCC-EX CommandStation over a USB serial connection at 115200 baud. All DCC-EX commands are text strings wrapped in angle brackets (for example, `<t 3 50 1>` to set locomotive 3 to speed 50, forward).

This is the final leg of the command pipeline -- serial is how digital commands reach the track.

## 🔄 Data Flow

The following diagram traces a command from the moment a user taps a control in their browser to the electrical signal on the track.

```
  👆 User taps speed slider in Throttle app (browser)
       |
       v
  🖥️ Vue component calls useDcc().sendSpeed({ address, speed })
       |
       v
  🔥 useDcc() calls send() which writes to Firebase RTDB
  Path: dccCommands/{layoutId}
  Payload: { action: "throttle", address: 3, speed: 50 }
       |
       v
  📡 Firebase RTDB triggers child_added event
       |
       v
  ⚙️ Server: dejaCloud.ts listener fires
  Calls handleDccChange(snapshot) --> handleMessage(json)
       |
       v
  🔧 Server: dcc.ts routes the message by action type
  "throttle" --> sendSpeed({ address: 3, speed: 50 })
       |
       v
  📤 sendSpeed() computes direction from signed speed
  Calls serial.send(port, "<t 3 50 1>\n")
       |
       v
  🔌 USB Serial (115200 baud) --> DCC-EX CommandStation
       |
       v
  ⚡ CommandStation generates DCC signal on the track
       |
       v
  🚂 Locomotive decoder receives signal, motor responds
```

There is also a parallel path for **Firestore-driven changes**. When a document changes in Firestore (for example, a turnout state update at `layouts/{layoutId}/turnouts/{id}`), the server's module listeners in `apps/server/src/modules/` detect the change and call the appropriate DCC handler.

Both paths converge at the DCC command handler (`apps/server/src/lib/dcc.ts`), which formats and sends the serial command.

## ⚙️ Server Subsystems

The DEJA.js server (`apps/server`) is the central hub. It consists of three independently togglable subsystems, each activated by an environment variable:

### ☁️ DEJACLOUD (`ENABLE_DEJACLOUD`)

Connects to Firebase using the Admin SDK. Sets up listeners on:

- **RTDB command queues** (`dccCommands/`, `dejaCommands/`) -- processes incoming commands from frontend apps.
- **Firestore collections** (`throttles`, `turnouts`, `signals`, `effects`) -- reacts to state changes and sends corresponding DCC commands.

This subsystem also handles layout initialization, device registration, and sensor data.

### 🌐 WebSocket Server (`ENABLE_WS`)

Starts a WebSocket server on the port specified by `VITE_WS_PORT` (default 8082). Handles:

- 🤝 Client connection and acknowledgment
- 📢 Broadcasting status updates to all connected clients
- 📡 Device-specific serial data subscriptions (subscribe/unsubscribe pattern)
- ⚡ Direct DCC command passthrough from browser clients

### 📬 MQTT Client (`ENABLE_MQTT`)

Connects to the MQTT broker specified by `VITE_MQTT_BROKER`. Used for communication with IoT devices (Arduino boards, Pico W controllers) running firmware from the `io/` directory.

### 🗂️ Server Module Architecture

Within the server, domain-specific logic is organized into modules:

```
apps/server/src/
├── lib/
│   ├── dcc.ts          ⚡ Command handler -- routes messages to serial
│   ├── deja.ts         🎛️ System command handler (non-DCC)
│   ├── serial.ts       🔌 USB serial port management
│   ├── ws-server.ts    🌐 WebSocket server
│   ├── mqtt.ts         📬 MQTT client
│   └── sound.ts        🔊 Sound playback
└── modules/
    ├── throttles.ts    🚂 Locomotive speed/direction handling
    ├── turnouts.ts     🔀 Turnout state handling
    ├── signals.ts      🚦 Signal state handling
    ├── effects.ts      ✨ Effects (sounds, lights) handling
    ├── sensors.ts      📡 Sensor data handling
    └── layout.ts       🗺️ Layout initialization
```

Each module in `modules/` listens for Firestore document changes and translates them into DCC commands via the shared `dcc.ts` library.

## 🎨 Frontend Stack

All Vue frontend apps share the same technology stack:

| Technology | Purpose |
|------------|---------|
| **Vue 3** | 🖥️ UI framework (Composition API with `<script setup lang="ts">`) |
| **Vuetify 3** | 🎨 Material Design component library (buttons, cards, dialogs, navigation) |
| **Pinia** | 📦 State management (used in the Throttle app) |
| **Vue Router 4** | 🧭 Client-side routing |
| **VueFire** | 🔥 Reactive Firebase bindings for Vue |
| **VueUse** | 🧰 Collection of Vue composable utilities |
| **Tailwind CSS** | 💨 Utility-first CSS framework |
| **Vite** | ⚡ Build tool and dev server |
| **TypeScript** | 📘 Type safety throughout |

### 🔗 Frontend Data Binding

Frontend apps use **VueFire** to create reactive bindings to Firestore collections. When a document changes in Firebase (whether from another browser, the server, or an external system), the Vue component automatically re-renders with the new data.

For example, the Throttle app binds to the `throttles` collection. When a speed change is written to Firestore (even from a different browser tab), the throttle slider updates in real time.

### 📊 State Management Pattern

- **Firebase Firestore** is the source of truth for layout data (locos, turnouts, effects, signals).
- **Firebase RTDB** is used for transient command queues (commands are processed and removed).
- **Pinia stores** manage local UI state that does not need to be persisted (selected loco, UI preferences).
- **VueUse `useStorage`** persists small values to `localStorage` (for example, the selected layout ID at `@DEJA/layoutId`).

## 🔨 Build Tooling

The monorepo is managed with:

- **pnpm 9** -- ⚡ Fast, disk-efficient package manager with workspace support.
- **Turborepo** -- 🔄 Build orchestration. Handles task dependency graphs so packages build in the correct order.
- **Vite** -- 🛠️ Dev server and production bundler for all Vue and Next.js apps.
- **tsx** -- 🏃 Runs the TypeScript server directly without a separate compile step.

Build and development commands are defined in the root `package.json` and orchestrated by Turborepo through `turbo.json`.
