# 🚂 DEJA.js - DCC-EX JavaScript API

> **🌟 The Modern, Comprehensive Model Railroad Control System**

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D" />
  <img src="https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Turborepo-000000?style=for-the-badge&logo=turborepo&logoColor=white" />
  <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" />
</p>

---

## 🎯 What is DEJA.js?

**DEJA.js** (*DCC-EX JavaScript API*) is a modern, comprehensive suite of applications that transforms your model railroad into a connected, intelligent system. Built as a monorepo with multiple specialized applications, DEJA.js provides everything you need to control, monitor, and interact with your DCC-EX CommandStation.

### 🌟 Key Features

- 🎮 **Multiple Control Interfaces** - Throttle, Cloud management, and monitoring apps
- 🔥 **Modern Web Technologies** - Vue 3, TypeScript, and real-time communication
- 📱 **Cross-Platform** - Works on desktop, tablet, and mobile devices
- 🛰️ **Real-Time Sync** - MQTT and WebSocket communication
- 🎨 **Beautiful UI** - Dark/light themes with responsive design
- 🚀 **Easy Deployment** - Containerized and cloud-ready
- 🔧 **Developer Friendly** - TypeScript throughout with comprehensive tooling

---

## 🚀 Getting Started

By the end of this guide your DCC-EX CommandStation will be connected to DEJA.js running on your computer, and you'll be driving trains from any browser on your network.

### 🔧 How It Works

```
[DCC-EX CommandStation] --USB--> [DEJA Server] <--WiFi/LAN--> [Throttle App]
       (your hardware)          (your computer)               (any device)
                                      |
                               [DEJA Cloud]
                          (layout config & roster)
```

The **DEJA Server** is the only piece you install locally. It bridges your CommandStation over USB to the rest of the system. The Throttle, Cloud, and Monitor apps are hosted web apps you open in a browser.

---

### 📋 Prerequisites

| Requirement | Minimum | Get it |
|---|---|---|
| 📦 Node.js | v22+ | [Install via nvm](https://github.com/nvm-sh/nvm) |
| 📦 pnpm | v9+ | `npm install -g pnpm` |
| 📦 Git | Any recent | [git-scm.com](https://git-scm.com/install/) |
| <img src="assets/dcc-ex-favicon-32x32.png" width="16" height="16" alt="DCC-EX Logo" /> DCC-EX CommandStation | Any supported board | [DCC-EX setup guide](https://dcc-ex.com/ex-commandstation/index.html) |
| 🔌 USB cable | — | Connecting CommandStation to this computer |

> Confirm Node.js is ready before continuing: `node --version` should print `v22.x.x` or higher.

---

### 👤 Step 1 — Create Your Account

You need a DEJA.js account before anything else — your account provides the layout configuration and Firebase credentials required to run the system locally.

1. Go to [DEJA Cloud](https://cloud.dejajs.com/signup) and create an account (email/password, Google, or GitHub)
2. Your account will be **pending approval** — you'll see a "Pending Approval" page after signing up
3. Once an admin approves your account, you'll be redirected to the **onboarding wizard**

---

### 🧭 Step 2 — Complete Onboarding

After your account is approved, the onboarding wizard walks you through initial setup:

1. **Welcome** — overview of the system
2. **Create Layout** — give your layout a name and ID (lowercase letters, numbers, and hyphens only)
3. **Environment Setup** — this page shows your `LAYOUT_ID` and all `VITE_FIREBASE_*` credentials. **Copy these values** — you'll need them in Step 4
4. **Completion** — you're ready to go

**Verify:** You can log in to [DEJA Cloud](https://cloud.dejajs.com) and see your layout dashboard.

---

### 📦 Step 3 — Install

#### ⚡ Quick Install

The fastest way to get set up. Open a terminal and run one command — it checks your prerequisites, clones the repo, installs dependencies, and walks you through configuration.

**macOS / Linux**

```bash
curl -fsSL https://raw.githubusercontent.com/jmcdannel/DEJA.js/main/install.sh | bash
```

**Windows (PowerShell)**

```powershell
irm https://raw.githubusercontent.com/jmcdannel/DEJA.js/main/install.ps1 | iex
```

After the script finishes, skip ahead to [Step 5 — Register Your CommandStation](#-step-5--register-your-commandstation).

> Prefer to set things up manually? Continue with the steps below.

#### Manual Install

Clone the repository and install dependencies.

```bash
git clone https://github.com/jmcdannel/deja.git
cd deja
pnpm install
```

**Verify:** Install completes without errors and you can see an `apps/` directory in the project root.

---

### ⚙️ Step 4 — Configure

Copy the environment template and fill in the values from your onboarding (Step 2).

```bash
cp .env.example .env.local
```

Open `.env.local` in a text editor and paste your credentials. If you need to find them again:

1. Log in to [DEJA Cloud](https://cloud.dejajs.com)
2. Select your layout
3. Click **"View Local Environment Configuration"**
4. Copy the displayed values into your `.env.local`

Your completed `.env.local` will look like this:

```env
LAYOUT_ID=my-layout-name

VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

VITE_MQTT_BROKER=mqtt://localhost
VITE_MQTT_PORT=1883
ENABLE_MQTT=true
ENABLE_WS=true
ENABLE_DEJACLOUD=true
VITE_WS_PORT=8082
VITE_WS_ID=DEJA.js
```

**Verify:** `.env.local` exists at the project root and contains your `LAYOUT_ID` and all `VITE_FIREBASE_*` values.

---

### 🧱 Step 5 — Register Your CommandStation

Tell DEJA Cloud that a DCC-EX CommandStation will connect via USB from this computer.

1. In [DEJA Cloud](https://cloud.dejajs.com), open your layout
2. Go to **Devices** and click **Add**
3. Select **DCC-EX CommandStation** → connection type **USB** → click **Submit**

The device will appear in the list with a "disconnected" status — that is expected until the server is running.

**Verify:** Your DCC-EX CommandStation appears in the Devices list in DEJA Cloud.

---

### 🖥️ Step 6 — Start the Server

```bash
pnpm deja
```

This starts the DEJA Server (USB serial communication) and the Monitor app (diagnostics) together via Turborepo.

**Verify:** Terminal output shows the WebSocket server listening on port `8082`. Open [DEJA Monitor](https://monitor.dejajs.com) in a browser — you should see the server connected.

---

### 🔌 Step 7 — Connect Hardware

Select the USB port for your CommandStation in the Monitor app.

1. Open [DEJA Monitor](https://monitor.dejajs.com) on this computer
2. Find the **DCC-EX CommandStation** device card
3. Select the USB port from the dropdown
4. Click **Connect**

> **Finding your port:**
> Linux / macOS — `ls /dev/tty*` and look for `/dev/ttyUSB0` or `/dev/ttyACM0`
> Windows — Device Manager > Ports (COM & LPT) — note the `COMx` number

**Verify:** The device card shows a green "connected" status and displays DCC-EX firmware version information.

---

### 🚂 Step 8 — Drive Trains

1. In [DEJA Cloud](https://cloud.dejajs.com), navigate to **Roster** and click **Add Loco** — enter the DCC address and a name
2. Open [DEJA Throttle](https://throttle.dejajs.com) in any browser on your network
3. Click the track power button to energize the track
4. Select your locomotive and use the speed slider and direction controls to drive

**Verify:** The locomotive moves on the track and responds to speed, direction, and function controls.

---

### 📖 Quick Reference

**Commands**

| Task | Command |
|---|---|
| Install dependencies | `pnpm install` |
| Start server + monitor | `pnpm deja` |
| Start server only | `pnpm start` |
| Start all apps (dev mode) | `pnpm dev` |
| Build all apps | `pnpm build` |
| Lint all packages | `pnpm lint` |
| Check dependency versions | `pnpm deps:check` |

**App URLs**

| App | URL |
|---|---|
| ☁️ DEJA Cloud (layout config & roster) | https://cloud.dejajs.com |
| 🚂 DEJA Throttle (train control) | https://throttle.dejajs.com |
| 📊 DEJA Monitor (diagnostics) | https://monitor.dejajs.com |

---

## 📁 Repository Structure

### 🎮 Applications (`/apps`)

| App | Description | Technologies |
|-----|-------------|--------------|
| **🚂 [Throttle](apps/throttle/)** | Train control interface with speed, direction, and function controls | Vue 3, Vuetify, MQTT |
| **☁️ [Cloud](apps/cloud/)** | Layout management, device monitoring, and multi-user coordination | Vue 3, Firebase, Vuetify |
| **🖥️ [Server](apps/server/)** | NodeJS API server that communicates with <img src="assets/dcc-ex-favicon-32x32.png" width="16" height="16" alt="DCC-EX Logo" /> DCC-EX CommandStation | Node.js, WebSockets, Serial |
| **📊 [Monitor](apps/monitor/)** | System monitoring, logging, and diagnostics dashboard | Vue 3, MQTT, WebSockets |
| **🎪 [Tour](apps/tour/)** | Interactive tour experiences and special effects control | Vue 3, Audio/Visual effects |

### 📦 Packages (`/packages`)

| Package | Description |
|---------|-------------|
| **🎨 UI** | Shared Vue components and design system |
| **🔧 Utils** | Common utilities and helper functions |
| **🔐 Auth** | Authentication and user management |
| **📡 Modules** | Core DEJA.js modules and communication logic |
| **⚙️ Config** | Shared configuration for ESLint, Prettier, TypeScript |

### 🔧 Device Apps (`/io`)

// TODO: complete build scripts, devcie sync and deploy

---

## ⚙️ Configuration

### 🔧 Environment Setup

### 🛠️ Development Commands

```bash
# Development
turbo dev              # 🚀 Start all apps in development mode
turbo dev:throttle     # 🎮 Start only throttle app
turbo dev:cloud        # ☁️ Start only cloud app

# Building
turbo build            # 🏗️ Build all applications
turbo build:throttle   # 📦 Build only throttle app

# Code Quality
turbo lint             # 🔍 Lint all packages
turbo format          # 💄 Format all code
turbo type-check      # 🔬 TypeScript type checking

# Dependencies
turbo deps:check      # 📋 Check dependency versions
turbo deps:fix        # 🔧 Fix dependency mismatches
```

---

## 🏗️ Architecture



## 🎯 Usage Scenarios

### 🏠 Home Layout Control
1. 🚀 Start the server: `turbo deja`
2. 🎮 Open throttle app for train control
3. ☁️ Use cloud app for layout management

### 👥 Club or Exhibition Setup
1. 📊 Set up monitor app for system oversight
2. 🎪 Configure tour app for visitor experiences
3. ☁️ Use cloud app for multi-operator coordination

### 🧪 Development & Testing
1. 🔍 Use monitor app for debugging
2. 🎮 Test features with throttle app
3. 📈 Monitor performance metrics

---

## 🧰 Production Runbook

### Keep the server running robustly (pm2 + turbo)

Use pm2 to manage the turbo start process so it restarts on crashes and can boot on startup:

```bash
# Start server + monitor via turbo under pm2
pm2 start --name deja-start --interpreter bash -- turbo run start --filter=apps/server --filter=apps/monitor
pm2 start bash --name deja-start -- -lc "pnpm turbo run start --filter=apps/server --filter=apps/monitor"

# For all apps
pm2 start --name deja-start-all --interpreter bash -- turbo run start

# Persist the pm2 process list and enable on boot
pm2 save
pm2 startup
```

Notes:
- The root `package.json` is configured so `pnpm start` maps to the filtered turbo start.
- `turbo.json` marks `start` and `start:all` as persistent to work well under pm2.

---

## 🗺️ Roadmap

### 🔥 Current Focus
- ✅ **Multi-throttle support** - Multiple simultaneous operators
- ⏳ **Mobile optimizations** - Improved touch interfaces
- ⏳ **Audio/visual effects** - Tour app enhancements

### 🌟 Future Plans
- 🎯 **AI-powered automation** - Smart train scheduling
- 📱 **Native mobile apps** - iOS and Android versions
- 🎮 **VR/AR integration** - Immersive experiences

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### 🛠️ Development Setup
1. 🍴 Fork the repository
2. 🌿 Create a feature branch
3. 🧪 Write tests for new features
4. 📝 Update documentation
5. 🚀 Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- 🚂 **DCC-EX Team** - For the amazing CommandStation platform
- 🌍 **Vue.js Community** - For the fantastic framework
- 👥 **Contributors** - Everyone who helps make DEJA better

---

<p align="center">
  <strong>🌟 Happy Railroading! 🚂</strong><br>
  <em>Built with ❤️ for the model railroad community</em>
</p>