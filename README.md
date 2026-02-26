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

## 🚀 Quick Start

### 📋 Prerequisites

- 👤 **DEJA.js Account** - [Requst account](https://www.dejajs.com)
- 📦 **Node.js 22+** - [Install via nvm](https://github.com/nvm-sh/nvm)
- 📦 **Git** - [Install](https://git-scm.com/install/)
- <img src="assets/dcc-ex-favicon-32x32.png" width="16" height="16" alt="DCC-EX Logo" /> **DCC-EX CommandStation** - [Setup guide](https://dcc-ex.com/ex-commandstation/index.html)
- 🔌 **USB Connection** - Between computer and DCC-EX CommandStation

### ⚡ Installation

```bash
# Clone the repository
git clone https://github.com/jmcdannel/deja.git
cd deja

# Install dependencies (uses turbo for monorepo management)
npm install -g turbo
turbo install

# Create local environment file
cp .env.example to .env.local

```

### 🧱 Setup

You'll first need to login to your DEJA.js account in the [DEJA Cloud app](http://cloud.dejajs.com) and confiure your <img src="assets/dcc-ex-favicon-32x32.png" width="16" height="16" alt="DCC-EX Logo" /> DCC-EX CommandStation to communicate with DEJA SERVER.

1. Login to [DEJA Cloud](http://cloud.dejajs.com)
2. Select your Layout
3. Click "View Local Environemnt Configuration", copy and paste the configuration into `.env.local` using a text editor or IDE. [Need more help?](#-environment-setup)
4. From the [Layout](https://cloud.dejajs.com/layout) page, click "add" from the Devices list.
5. Select <img src="assets/dcc-ex-favicon-32x32.png" width="16" height="16" alt="DCC-EX Logo" /> DCC-EX Command Station, USB. Click "Submit".
6. Start DEJA Server

```bash
# Start DEJA Server
turbo deja
```
7. Select the USB Port ofr the <img src="assets/dcc-ex-favicon-32x32.png" width="16" height="16" alt="DCC-EX Logo" /> DCC-EX CommandStation and click "Connect".

#### 🌍 First Steps

1. Add a Loco to your [Roster](http://cloud.dejajs.com/roster)
2. Launch the [Throttle App](http://throttle.dejajs.com)
3. Click the <img src="assets/dcc-ex-favicon-32x32.png" width="16" height="16" alt="DCC-EX Logo" /> DCC-EX Command Station Power Button (<img style="border: 50%; padding: 2px; color: white; fill: white; path: white; background: #666" src="https://cdn.jsdelivr.net/npm/@mdi/svg@latest/svg/fence-electric.svg" width="16" height="16" alt="electric fence" />) to turn on your tracks.
3. Select your loco.
4. Drive your loco.

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

## 🤖 Developing with Claude Code

This project is set up to work well with [Claude Code](https://claude.ai/code) following the workflow practices shared by Boris Cherny (creator of Claude Code).

### Always Start in Plan Mode

For any non-trivial task, press **Shift+Tab twice** before Claude writes a single line of code to enter Plan Mode. Go back and forth with Claude refining the plan until it looks right, then switch to auto-accept edits mode. Claude can typically 1-shot the implementation from a solid plan.

> "A good plan is really important!" — Boris Cherny

Skip Plan Mode only for trivial, isolated changes (typo fixes, one-liners, simple renames).

### Run Multiple Claude Instances in Parallel

Boris runs **5 Claudes in parallel** in numbered terminal tabs (1–5) and uses macOS/system notifications to know when one needs input. This lets a single developer produce the output of an entire team.

- Number your terminal tabs 1–5 so you can orient yourself quickly
- Enable Claude Code notifications (Settings → Notifications) so you can switch tabs reactively rather than polling
- Assign independent tasks across tabs: e.g. tab 1 works on `apps/throttle`, tab 2 on `apps/cloud`, tab 3 on a package refactor
- Hand off long-running tasks (full builds, linting the whole monorepo) to a background tab while you work elsewhere

### Use Subagents for Repeated Workflows

Boris uses dedicated subagents that are reused across many PRs — they encode complex, multi-step tasks into a single slash command. Subagent ideas for this project:

- **`/verify-app`** — start the dev server for a specific app, open it in a browser, and confirm expected behavior end-to-end (especially useful after changes to `apps/throttle` or `apps/cloud`)
- **`/code-simplifier`** — after a feature is done, run a second pass to simplify, remove dead code, and clean up rough edges introduced during implementation

Add your own by creating a `.md` file in `.claude/commands/` and invoking it with `/filename`.

### Keep CLAUDE.md Up to Date — Every Mistake Becomes a Rule

When Claude does something wrong (wrong import style, wrong Vue syntax, incorrect command), **immediately add a rule to the "Rules" section of `CLAUDE.md`**. Over time this file becomes a self-correcting system: the longer you work in this repo with Claude, the fewer mistakes it makes.

During PR review, add a comment tagging `@.claude` to have Claude update `CLAUDE.md` as part of the PR. Install the GitHub Action with the `/install-github-action` slash command to enable this.

### Permissions — Skip `--dangerously-skip-permissions`

Do not use `--dangerously-skip-permissions`. Instead, use `/permissions` (or edit `.claude/settings.json` directly) to pre-allow specific bash commands that are safe in your environment. Common commands for this project are already pre-allowed in `.claude/settings.json`.

### Model Choice

Boris uses **Opus with extended thinking** for all coding work. It is larger and slower than Sonnet, but because it requires less steering and is better at tool use, it ends up being faster end-to-end. If a task is taking many correction rounds with a smaller model, switch to Opus.

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