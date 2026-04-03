# 🚂 DEJA.js — DCC-EX JavaScript API

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D" />
  <img src="https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Turborepo-000000?style=for-the-badge&logo=turborepo&logoColor=white" />
  <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" />
</p>

**DEJA.js** (*DCC-EX JavaScript API*) is a TypeScript monorepo for model railroad control. It bridges [DCC-EX](https://dcc-ex.com/) command stations to a suite of modern web applications — giving you real-time train control, layout management, system monitoring, and visitor experiences from any browser.

The system communicates over USB serial, Firebase (Firestore + RTDB), WebSocket, and MQTT, coordinating everything from a single Node.js backend to the electrical signals on your track. Vue 3 frontends provide the operator and visitor interfaces.

---

## 📂 Monorepo Structure

### 🖥️ Apps (`apps/`)

| Directory | Description |
|-----------|-------------|
| [`apps/throttle`](apps/throttle/) | 🚂 Vue 3 train control interface — the primary operator app |
| [`apps/cloud`](apps/cloud/) | ☁️ Vue 3 layout management and configuration hub |
| [`apps/server`](apps/server/) | ⚙️ Node.js backend — bridges browsers to DCC-EX hardware over USB serial |
| [`apps/monitor`](apps/monitor/) | 📊 Vue 3 system monitoring and diagnostics dashboard |
| [`apps/tour`](apps/tour/) | 🎭 Vue 3 interactive visitor experience and effects runner |
| [`apps/sound-api`](apps/sound-api/) | 🔊 Next.js API for sound effect asset management |

### 📦 Packages (`packages/`)

| Package | Purpose |
|---------|---------|
| `@repo/modules` | 🧠 Core business logic — composables and types for locos, turnouts, effects, signals, routes, layouts |
| `@repo/ui` | 🎨 Shared Vue component library (LocoAvatar, TurnoutSwitch, EmergencyStop, TrackPower, etc.) |
| `@repo/dccex` | 🔧 DCC-EX command protocol — the `useDcc()` composable for sending DCC commands |
| `@repo/deja` | 🔥 Core DEJA composable — writes commands to Firebase Realtime Database |
| `@repo/firebase-config` | 🗄️ Firebase client SDK and Admin SDK initialization |
| `@repo/auth` | 🔐 Firebase Authentication integration and Vue Router guards |
| `@repo/sounds` | 🎵 Sound effect metadata and Vercel Blob utilities |
| `@repo/utils` | 🛠️ Common utility functions |
| `@repo/config-eslint` | 📏 Shared ESLint flat configuration |
| `@repo/config-prettier` | ✨ Shared Prettier configuration |
| `@repo/typescript-config` | 📘 Shared TypeScript base configurations |

### 🔌 Device Firmware (`io/`)

| Directory | Description |
|-----------|-------------|
| `io/src/deja-arduino/` | Arduino sketch for USB-connected IO boards (Serial/MQTT) |
| `io/src/deja-pico-w/` | CircuitPython for WiFi-connected Pico W / ESP32 nodes (MQTT) |
| `io/layouts/` | Per-layout, per-device JSON configuration files |

---

## 🚂 User Install

If you just want to run the DEJA Server (no source code needed):

```bash
curl -fsSL https://install.dejajs.com | bash
```

This downloads the server, installs it to `~/.deja/`, and starts it. No GitHub access required. See the [Quick Start](https://dejajs.com/docs/quick-start) guide for the full walkthrough.

---

## 🚀 Quick Dev Setup

```bash
git clone https://github.com/jmcdannel/DEJA.js.git
cd DEJA.js
pnpm install
pnpm dev
```

> **Prerequisites:** Node.js 20+, pnpm 9+

Copy `.env.example` to `.env` at the root and fill in your Firebase credentials. See [CONTRIBUTING.md](CONTRIBUTING.md) for full environment setup.

To test the production CLI from local source: `./install.sh --dev` (builds with tsup and installs to `~/.deja/`).

---

## 🛠️ Key Commands

```bash
pnpm dev                # 🚀 Start all apps in dev mode
pnpm build              # 🏗️ Build all packages
pnpm lint               # 🔍 Lint all packages (ESLint, auto-fix)
pnpm format             # 💄 Format all .ts, .tsx, .md files (Prettier)
pnpm check-types        # 🔬 TypeScript type checking across the monorepo

pnpm deja               # ⚙️📊 Start Server + Monitor together

pnpm deps:check         # 📋 List dependency version mismatches (syncpack)
pnpm deps:fix           # 🔧 Auto-fix dependency mismatches
```

Run a single app:

```bash
pnpm --filter=deja-throttle dev     # 🚂 Throttle
pnpm --filter=deja-cloud dev        # ☁️ Cloud
pnpm --filter=deja-serverts dev     # ⚙️ Server
pnpm --filter=deja-monitor dev      # 📊 Monitor
pnpm --filter=deja-tour dev         # 🎭 Tour
```

---

## ⚙️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Vue 3, Vuetify 3, Pinia, Vue Router 4, VueFire, Tailwind CSS, Vite |
| **Backend** | Node.js 20+, TypeScript, WebSocket (`ws`), SerialPort, Firebase Admin SDK |
| **Communication** | Firebase (Firestore + RTDB), WebSocket, MQTT, USB Serial (115200 baud) |
| **Build** | Turborepo, pnpm 9 workspaces, Vite, tsx, tsup |
| **Quality** | ESLint, Prettier, syncpack, Vitest |

---

## 📚 Further Reading

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | 🏗️ System design, communication layers, data flow, and server subsystems |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 🤝 Development workflow, coding conventions, and environment setup |
| [CHANGELOG.md](CHANGELOG.md) | 📝 Version history (Keep a Changelog format) |
| [ROADMAP.md](ROADMAP.md) | 🗺️ Planned features and current focus areas |
| [dejajs.com/docs](https://dejajs.com/docs) | 📖 User documentation — install guides, setup, and usage |

---

## 🚀 Release Process

Releases are managed via [Changesets](https://github.com/changesets/changesets). Feature PRs target the `preview` branch; only `preview → main` PRs require a changeset. Tag a release with `git tag v1.x.x && git push --tags` — CI builds the server tarball and creates a GitHub Release. Users update via `deja update`.

---

## 📄 License

DEJA.js is proprietary software distributed under a subscription license. See your subscription terms at [dejajs.com](https://dejajs.com).

---

<p align="center">
  <strong>🚂 Happy Railroading!</strong><br>
  <em>Built with ❤️ for the model railroad community</em>
</p>
