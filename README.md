# 🚂 DEJA - DCC-EX JavaScript API Suite

> **🌟 The Modern, Comprehensive Model Railroad Control System**

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D" />
  <img src="https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Turborepo-000000?style=for-the-badge&logo=turborepo&logoColor=white" />
  <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" />
</p>

---

## 🎯 What is DEJA?

**DEJA** (*DCC-EX JavaScript API*) is a modern, comprehensive suite of applications that transforms your model railroad into a connected, intelligent system. Built as a monorepo with multiple specialized applications, DEJA provides everything you need to control, monitor, and interact with your DCC-EX CommandStation.

### 🌟 Key Features

- 🎮 **Multiple Control Interfaces** - Throttle, Cloud management, and monitoring apps
- 🔥 **Modern Web Technologies** - Vue 3, TypeScript, and real-time communication
- 📱 **Cross-Platform** - Works on desktop, tablet, and mobile devices
- 🛰️ **Real-Time Sync** - MQTT and WebSocket communication
- 🎨 **Beautiful UI** - Dark/light themes with responsive design
- 🚀 **Easy Deployment** - Containerized and cloud-ready
- 🔧 **Developer Friendly** - TypeScript throughout with comprehensive tooling

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   🎮 Throttle   │    │   ☁️ Cloud      │    │   📊 Monitor    │
│                 │    │                 │    │                 │
│ Train Control   │    │ Layout Mgmt     │    │ System Logs     │
│ Speed & Dir     │    │ Device Status   │    │ Performance     │
│ Functions       │    │ Multi-User      │    │ Diagnostics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   🎪 Tour       │    │   🖥️ Server     │    │   📦 Packages   │
│                 │    │                 │    │                 │
│ Interactive     │    │ WebSocket API   │    │ Shared UI       │
│ Experiences     │    │ Serial Comm     │    │ Utilities       │
│ Effects         │    │ MQTT Bridge     │    │ Auth System     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │  🔌 DCC-EX      │
                    │ CommandStation  │
                    │                 │
                    │ Arduino/ESP32   │
                    │ USB Connection  │
                    └─────────────────┘
```

---

## 📁 Repository Structure

### 🎮 Applications (`/apps`)

| App | Description | Technologies |
|-----|-------------|--------------|
| **🚂 [Throttle](apps/throttle/)** | Train control interface with speed, direction, and function controls | Vue 3, Vuetify, MQTT |
| **☁️ [Cloud](apps/cloud/)** | Layout management, device monitoring, and multi-user coordination | Vue 3, Firebase, Vuetify |
| **🖥️ [Server](apps/server/)** | NodeJS API server that communicates with DCC-EX CommandStation | Node.js, WebSocket, Serial |
| **📊 [Monitor](apps/monitor/)** | System monitoring, logging, and diagnostics dashboard | Vue 3, Real-time charts |
| **🎪 [Tour](apps/tour/)** | Interactive tour experiences and special effects control | Vue 3, Audio/Visual effects |

### 📦 Packages (`/packages`)

| Package | Description | Usage |
|---------|-------------|-------|
| **🎨 UI** | Shared Vue components and design system | All Vue apps |
| **🔧 Utils** | Common utilities and helper functions | All apps |
| **🔐 Auth** | Authentication and user management | Cloud, Monitor |
| **📡 Modules** | Core DEJA modules and communication logic | All apps |
| **⚙️ Config** | Shared configuration for ESLint, Prettier, TypeScript | All packages |

### 🔧 Infrastructure (`/io`)

| Component | Description | Purpose |
|-----------|-------------|---------|
| **📄 Layouts** | Layout configuration templates | Design patterns |
| **📝 Scripts** | Build and deployment scripts | Automation |

---

## 🚀 Quick Start

### 📋 Prerequisites

- 📦 **Node.js 20+** - [Install via nvm](https://github.com/nvm-sh/nvm)
- 🧱 **DCC-EX CommandStation** - [Setup guide](https://dcc-ex.com/ex-commandstation/index.html)
- 🔌 **USB Connection** - Between computer and CommandStation

### ⚡ Installation

```bash
# Clone the repository
git clone https://github.com/jmcdannel/deja.git
cd deja

# Install dependencies (uses pnpm workspaces)
npm install -g pnpm
pnpm install

# Start all applications in development mode
pnpm dev
```

### 🌍 Application URLs

After running `pnpm dev`, access the applications at:

- 🚂 **Throttle**: http://localhost:5173
- ☁️ **Cloud**: http://localhost:5174  
- 📊 **Monitor**: http://localhost:5175
- 🎪 **Tour**: http://localhost:5176
- 🖥️ **Server**: http://localhost:8082 (WebSocket)

---

## ⚙️ Configuration

### 🔧 Environment Setup

Create a `.env` file in the root directory:

```env
# Layout Configuration
LAYOUT_ID=your-unique-layout-name

# MQTT Configuration
ENABLE_MQTT=true
VITE_MQTT_BROKER=wss://test.mosquitto.org
VITE_MQTT_PORT=8081

# WebSocket Configuration
ENABLE_WS=true
VITE_WS_PORT=8082
VITE_WS_ID=DEJA.js

# Firebase (for Cloud features)
ENABLE_DEJACLOUD=true
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
# ... other Firebase config
```

### 🛠️ Development Commands

```bash
# Development
pnpm dev              # 🚀 Start all apps in development mode
pnpm dev:throttle     # 🎮 Start only throttle app
pnpm dev:cloud        # ☁️ Start only cloud app

# Building
pnpm build            # 🏗️ Build all applications
pnpm build:throttle   # 📦 Build only throttle app

# Code Quality
pnpm lint             # 🔍 Lint all packages
pnpm format          # 💄 Format all code
pnpm type-check      # 🔬 TypeScript type checking

# Dependencies
pnpm deps:check      # 📋 Check dependency versions
pnpm deps:fix        # 🔧 Fix dependency mismatches
```

---

## 🎯 Usage Scenarios

### 🏠 Home Layout Control
1. 🚀 Start the server: `pnpm run start:server`
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

## 🗺️ Roadmap

### 🔥 Current Focus
- ✅ **Multi-throttle support** - Multiple simultaneous operators
- ✅ **Enhanced cloud features** - Better device management
- ⏳ **Mobile optimizations** - Improved touch interfaces
- ⏳ **Audio/visual effects** - Tour app enhancements

### 🌟 Future Plans
- 🎯 **AI-powered automation** - Smart train scheduling
- 📱 **Native mobile apps** - iOS and Android versions
- 🎮 **VR/AR integration** - Immersive experiences
- 🌐 **Multi-layout networking** - Connect multiple layouts

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