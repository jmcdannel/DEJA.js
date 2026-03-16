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
- 🚀 **Easy Deployment** - One-command install and cloud-ready
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

### 👤 Step 1 — Sign Up & Choose a Plan

Create your free DEJA Cloud account and pick a tier. It takes one click.

1. Go to [DEJA Cloud](https://cloud.dejajs.com) and click **Sign Up** (Google, GitHub, or email)
2. The onboarding wizard starts automatically — **Choose a Plan**:

| | Hobbyist | Engineer | Conductor |
|---|---|---|---|
| **Price** | Free | $7/mo or $67/yr | $18/mo or $173/yr |
| **Locomotives** | 5 | 25 | Unlimited |
| **Layouts** | 1 | 2 | Unlimited |
| **Turnouts / Signals / Effects** | — | 15 each | Unlimited |

- **Hobbyist** is completely free — no credit card required.
- Paid plans include a **14-day free trial** — no charge until the trial ends.

3. If you chose Engineer or Conductor, enter your card details to start the free trial

**Verify:** You're signed in to DEJA Cloud.

---

### 🧭 Step 2 — Register Your Layout

Give your layout a name and a unique ID (lowercase letters, numbers, and hyphens only). This scopes all your data — locomotives, turnouts, effects, and commands.

After this step the wizard shows your `LAYOUT_ID` and all `VITE_FIREBASE_*` credentials. **Copy these values** — you'll need them in Step 4.

> You can find these credentials later in [DEJA Cloud](https://cloud.dejajs.com) under **Settings > View Local Environment Configuration**.

**Verify:** You can see your layout dashboard in [DEJA Cloud](https://cloud.dejajs.com).

---

### 📦 Step 3 — Install the DEJA Server

The DEJA Server runs on your computer (or Raspberry Pi) as a native Node.js process. One command handles everything.

The fastest way to get set up. Open a terminal on the machine connected to your DCC-EX Command Station and run one command — it downloads the DEJA.js server, installs dependencies, and walks you through configuration.

#### Prerequisites

| Requirement | Get it |
|---|---|
| Node.js 20+ | [Install Node.js](https://nodejs.org/) (or use [nvm](https://github.com/nvm-sh/nvm)) |

#### Install

From your [DEJA Cloud](https://cloud.dejajs.com) dashboard, go to **Settings > Install** to find your install command and credentials. Then run:

**macOS / Linux / Raspberry Pi**

```bash
curl -fsSL https://install.dejajs.com | bash
```

The install script will:
1. Check for Node.js 20+ (provides install instructions if missing)
2. Prompt for your account credentials (from the Install page)
3. Detect your serial ports for the DCC-EX CommandStation
4. Download the DEJA Server and install dependencies
5. Start the server

**Windows**

Windows users should install via [WSL](https://learn.microsoft.com/en-us/windows/wsl/install), then run the install command from a WSL terminal.

> Need help? See the [Install Guide](https://dejajs.com/docs/install) for detailed instructions and troubleshooting.

**Verify:** The install script prints a success message with your local server URL. Open [DEJA Monitor](https://monitor.dejajs.com) — you should see the server connected.

---

### 🧱 Step 4 — Register Your CommandStation

Tell DEJA Cloud that a DCC-EX CommandStation will connect via USB from this computer.

1. In [DEJA Cloud](https://cloud.dejajs.com), open your layout
2. Go to **Devices** and click **Add**
3. Select **DCC-EX CommandStation** → connection type **USB** → click **Submit**

The device will appear in the list with a "disconnected" status — that is expected until the server is running.

**Verify:** Your DCC-EX CommandStation appears in the Devices list in DEJA Cloud.

---

### 🖥️ Step 5 — Manage the Server

The DEJA Server runs as a native Node.js process. Use the `deja` CLI to manage it:

```bash
deja status    # Check server status, subscription, and serial connection
deja logs      # View server logs
deja update    # Pull the latest server version
deja restart   # Restart the server
deja stop      # Stop the server
```

**Verify:** `deja status` shows the server running and connected. Open [DEJA Monitor](https://monitor.dejajs.com) in a browser — you should see the server connected.

---

### 🔌 Step 6 — Connect Hardware

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

### 🚂 Step 7 — Drive Trains

1. In [DEJA Cloud](https://cloud.dejajs.com), navigate to **Roster** and click **Add Loco** — enter the DCC address and a name
2. Open [DEJA Throttle](https://throttle.dejajs.com) in any browser on your network
3. Click the track power button to energize the track
4. Select your locomotive and use the speed slider and direction controls to drive

**Verify:** The locomotive moves on the track and responds to speed, direction, and function controls.

---

### 📖 Quick Reference

**Server Commands**

| Task | Command |
|---|---|
| Check server status | `deja status` |
| View server logs | `deja logs` |
| Update to latest version | `deja update` |
| Restart the server | `deja restart` |
| Stop the server | `deja stop` |

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

### 🔧 Device Firmware (`/firmware`)

DEJA.js provides generic firmware templates for your layout nodes that configure themselves dynamically. Rather than recompiling and flashing your devices every time your layout changes, these templates parse configurations sent instantly by the DEJA Server.

| Firmware | Description | Protocol |
|---------|-------------|----------|
| **🔌 [deja-arduino](firmware/deja-arduino/)** | Generic sketch for USB-connected Arduino boards | Serial (USB) |
| **📡 [deja-pico-w](firmware/deja-pico-w/)** | Generic sketch for WiFi-connected Pico W and ESP32 nodes | MQTT (WiFi) |

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

The DEJA Server runs as a native Node.js process managed by the `deja` CLI. Use `deja start` to launch and `deja stop` to shut down. No additional process manager (pm2) is needed.

```bash
# Check everything is running
deja status

# Update to the latest release
deja update

# View logs for troubleshooting
deja logs
```

Configuration files are stored in `~/.deja/` — see `~/.deja/.env` for environment configuration and `~/.deja/config.json` for account settings.

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

## 🤝 Feedback & Support

Have a feature request or found a bug? Contact us through the [DEJA Cloud](https://cloud.dejajs.com) support channel or email support@dejajs.com.

---

## 📄 License

DEJA.js is proprietary software distributed under a subscription license. See your subscription terms at [dejajs.com](https://dejajs.com).

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