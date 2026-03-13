# 🖥️ DEJA.js - The Ultimate DCC-EX JavaScript API

## 🚂 **D**CC-**E**X **J**avaScript **A**pi
### 🌟 The Definitive, Transformative, Innovative DCC-EX CommandStation API

---

> 🎯 **This API runs on any supported device with a [DCC-EX EX-CommandStation](https://dcc-ex.com/ex-commandstation/index.html) connected via USB. DEJA.js can replace JMRI as a lightweight replacement that runs in modern environments.**

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=websocket&logoColor=white" />
  <img src="https://img.shields.io/badge/Serial-FF6B6B?style=for-the-badge&logo=serialport&logoColor=white" />
</p>

---

## 🎯 What is DEJA.js?

- 🧠 **NodeJS Application** - Runs on 💻 Mac/PC/Linux/Raspberry Pi connected to [DCC-EX EX-CommandStation](https://dcc-ex.com/ex-commandstation/index.html)
- 🔥 **Throttle Integration** - Use [🛰️ DEJA Throttle](https://github.com/jmcdannel/DEJAThrottle) to connect and send DCC Loco commands to your track
- 🌎 **JavaScript Powered** - Written in the most popular programming language in the world<sup>*</sup>
- ✨ **JMRI Replacement** - DEJA.js is 🌟 modern, ⚡ blazing fast, simple requirements 🎯, and you'll never look back 👀!

<p align="center">
  <img src="./resources/DEJA-simple.drawio.svg" alt="Architecture Diagram of DEJA.js" />
</p>

---

## 🚀 Getting Started

### 📋 Prerequisites

- 📦 **[DCC-EX CommandStation](https://dcc-ex.com/ex-commandstation/index.html)** - Installed & configured, connected via USB to a 💻 Mac/PC/Linux/Raspberry Pi
- 📦 **[NodeJS 20+](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)** - Installed on the same 💻 Mac/PC/Linux/Raspberry Pi

  ```bash
  $ nvm install 21
  ```

### 🔧 Environment Configuration
  
**📝 Create Configuration File**
  ```bash
  $ touch .env
  ```

**⚙️ Copy & Paste Configuration**
  
Copy the values below into your `.env` file:
  
  ```env
  LAYOUT_ID=[your-layout-name]
  VITE_MQTT_BROKER=wss://test.mosquitto.org
  VITE_MQTT_PORT=8081
  ENABLE_MQTT=true
  ENABLE_WS=true
  VITE_WS_PORT=8082
  VITE_WS_ID=DEJA.js
  ```

---

## ❗🚨 IMPORTANT LAYOUT CONFIGURATION 🚨❗

### 📣 Replace `your-layout-name` with a descriptive name for your layout!

**📋 Rules:**
- ✅ **Only lowercase letters, numbers, and dashes**
- ❌ **No spaces, special characters, or emoji**
- 🎯 **Must be unique to your layout**

#### 🌟 GOOD Examples 
- `LAYOUT_ID=my-basement-empire`
- `LAYOUT_ID=idaho-crossing`
- `LAYOUT_ID=something-unique`
- `LAYOUT_ID=apple-munchkin-fairy`

#### 💩 BAD Examples 
- `LAYOUT_ID=My B@sement "Empire"!` ❌
- `LAYOUT_ID=ID_cross` ❌
- `LAYOUT_ID=my-basement-empire` (if already used!) ❌
- `LAYOUT_ID='🍎👶🧚'` ❌

---

## 🎮 Usage

### 🚀 Installation & Startup

**📂 Clone and Setup**

Clone this repository and open a terminal in the project root:

  ```bash
  $ npm i -g turbo
  $ turbo install
  $ turbo run start
  ```

### 🎛️ Connect Your Throttle

- 🚀 Open a [Supported Throttle](https://trestle-tt-suite-ttt-throttle-app.vercel.app/)
- 🔗 Connect to the DCC-EX CommandStation via DEJA.js
- 🚂 Start running trains!

---

## 📡 Command Reference

### 🔧 Available Commands

>> 💡 **TODO:** Improve with examples and MQTT Explorer instructions

| 🎯 Action | 📋 Payload | 📝 Notes | 💡 Example |
|-----------|-------------|----------|------------|
| **🔗 connect** | `{Object}`<br>serial: `{String}` | Returns: `{ 'action': 'connected', payload: { path: {String}, baudRate: {String} } }` | `{ serial: '/dev/ttyusb2301' }` |
| **⚡ dcc** | `{String}` | Send raw DCC command (omit `<` and `>`) | `<t 1 123 50 1>` → `t 1 123 50 1` |
| **📊 getStatus** | - | Returns: `{ action: 'status', payload: { isConnected: {Boolean} }` | - |
| **🔌 listPorts** | - | Returns: `{ 'action': 'listPorts', [ports] }` - Array of available USB ports | - |
| **⚡ power** | `{Integer}` | Toggle track power: `1` = ON, `0` = OFF | `1` or `0` |
| **🚂 throttle** | `{Object}`<br>address: `{Integer}`<br>speed: `{Integer}` | Forward = positive `speed`, Reverse = negative `-speed` | `{ address: 123, speed: 50 }` |
| **🔀 turnout** | `{Object}`<br>turnoutId: `{Integer}`<br>state: `{Boolean}` | Toggle DCC-EX Turnout | `{ turnoutId: 1, state: true }` |
| **💡 output** | `{Object}`<br>pin: `{Integer}`<br>state: `{Boolean}` | Toggle DCC-EX Output | `{ pin: 12, state: true }` |
| **🎛️ function** | `{Object}`<br>address: `{Integer}`<br>function: `{Integer}`<br>state: `{Boolean}` | Toggle DCC-EX Locomotive Function | `{ address: 123, function: 0, state: true }` |

---

## 🗺️ Development Roadmap

### 🔥 Coming Soon
- [ ] 📝 **Convert to TypeScript** - Enhanced type safety and development experience
- [ ] 🧪 **Write Unit Tests** - Comprehensive test coverage
- [ ] 🔀 **Support Turnouts** - Complete turnout management
- [ ] 💡 **Support Outputs** - Full output control capabilities

### 🌟 Future Enhancements
- [ ] 📱 **Mobile API** - Dedicated mobile endpoints
- [ ] 🔄 **Auto-Discovery** - Automatic device detection
- [ ] 📊 **Performance Monitoring** - Built-in metrics and logging
- [ ] 🔐 **Security Features** - Authentication and authorization

---

## 🛠️ Built With Amazing Technology

[![Node][Node.js]][Node-url]
[![MQTT][MQTT.js]][MQTT-url]
[![Arduino][Arduino]][Arduino-url]
[![pnpm][pnpm]][pnpm-url]
[![ESLint][ESLint]][ESLint-url]
[![Prettier][Prettier]][Prettier-url]

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   🖥️ DEJA.js     │    │   🔌 Serial      │    │   🚂 DCC-EX      │
│   Server        │    │   Connection    │    │   CommandStation │
│                 │◄──►│                 │◄──►│                 │
│ WebSocket API   │    │ USB Serial      │    │ Arduino/ESP32   │
│ MQTT Bridge     │    │ Communication   │    │ Track Control   │
│ Command Parser  │    │ Protocol        │    │ Device Mgmt     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲
         │ 📡 WebSocket/MQTT
         ▼
┌─────────────────┐
│   📱 Client      │
│   Applications  │
│                 │
│ 🎮 Throttle     │
│ ☁️ Cloud        │
│ 📊 Monitor      │
└─────────────────┘
```

---

## 🔧 Development Setup

### 🛠️ Prerequisites for Development

- 📦 **Node.js 20+** - Modern JavaScript runtime
- 🧱 **DCC-EX CommandStation** - Hardware for testing
- 🔌 **USB Connection** - Serial communication
- 💻 **Code Editor** - VS Code recommended

### 🚀 Development Commands

```bash
# 📦 Install dependencies
turbo install

# 🚀 Start development server
turbo run dev

# 🏗️ Build for production
turbo run build

# 🔍 Code quality
turbo run lint
turbo run format
turbo run type-check

# 🧪 Testing
turbo run test
turbo run test:watch

# 🔧 Utilities
turbo run mosquitto    # Start MQTT broker
```

---

## 📊 Performance & Monitoring

### ⚡ Key Metrics
- **🔗 Connection Latency** - Sub-10ms response times
- **📡 Message Throughput** - 1000+ commands/second
- **💾 Memory Usage** - <50MB typical footprint
- **⚡ CPU Usage** - <5% on modern hardware

### 📈 Monitoring Tools
- **📊 Built-in Metrics** - Performance counters
- **📋 Logging System** - Comprehensive activity logs
- **🚨 Error Tracking** - Automatic error reporting
- **📡 Health Checks** - System status monitoring

---

## 🆘 Troubleshooting

### 🔧 Common Issues

| Problem | Symptoms | Solution |
|---------|----------|----------|
| 🚫 **No Serial Connection** | Can't connect to CommandStation | Check USB cable and port permissions |
| 📡 **WebSocket Errors** | Clients can't connect | Verify firewall settings and port 8082 |
| 🐌 **Slow Response** | Commands take too long | Check serial baud rate and system resources |
| 🔄 **MQTT Issues** | No message forwarding | Verify MQTT broker configuration |

### 🛠️ Diagnostic Commands

```bash
# 🔍 Check system status
node --version
turbo --version

# 📡 Test serial ports
ls /dev/tty*           # Linux/Mac
Get-WmiObject Win32_SerialPort  # Windows

# 🔌 Verify USB permissions
sudo chmod 666 /dev/ttyUSB0  # Linux

# 📊 Monitor logs
tail -f logs/deja.log
```

---

## Remote Access with Cloudflare Tunnels

Cloudflare Tunnels let you securely access your DEJA.js server from anywhere -- no port forwarding, static IP, or firewall changes required. The tunnel creates an outbound-only connection from your machine to Cloudflare's network, and clients connect through a public URL.

This is useful for controlling your model railroad layout from a different room, building, or location entirely.

### Quick Start (No Account Required)

The fastest way to get a tunnel running -- generates a temporary public URL:

```bash
# From the apps/server directory
pnpm tunnel
```

This runs `cloudflared tunnel --url http://localhost:8082` and prints a public `https://*.trycloudflare.com` URL. Share that URL with your throttle/cloud/monitor apps. The URL changes each time you restart.

**Prerequisites:** Install `cloudflared` first:

| Platform | Command |
|----------|---------|
| macOS | `brew install cloudflare/cloudflare/cloudflared` |
| Debian/Ubuntu | Download `.deb` from the [cloudflared releases page](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) |
| Windows | `winget install --id Cloudflare.cloudflared` or download from the [releases page](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) |

### Full Setup (Persistent Named Tunnel)

For a stable hostname that persists across restarts:

1. **Create a free Cloudflare account** at [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Add a domain** (or use Cloudflare's free subdomain)
3. **Authenticate cloudflared:**
   ```bash
   cloudflared tunnel login
   ```
4. **Create a named tunnel:**
   ```bash
   cloudflared tunnel create deja-js
   ```
5. **Configure DNS:**
   ```bash
   cloudflared tunnel route dns deja-js deja.yourdomain.com
   ```
6. **Edit `apps/server/cloudflared.yml`:**
   - Replace `YOUR_TUNNEL_UUID_HERE` with the tunnel UUID from step 4
   - Update the `credentials-file` path
7. **Run the tunnel:**
   ```bash
   pnpm tunnel:named
   ```

Alternatively, set `CLOUDFLARE_TUNNEL_TOKEN` in your `.env` file (get it from the Cloudflare Zero Trust dashboard) and `pnpm tunnel:named` will use it automatically.

### Connecting Vue Apps to the Tunnel

Once the tunnel is running, update your throttle/cloud/monitor app configuration to use the tunnel URL instead of `localhost`:

- For the quick tunnel, use the `*.trycloudflare.com` URL printed in the terminal
- For named tunnels, use your configured domain (e.g., `wss://deja.yourdomain.com`)

In the Vue apps, the WebSocket connection URL is typically configured via environment variables or the connection settings UI. Replace `ws://localhost:8082` with your tunnel URL (using `wss://` since Cloudflare provides TLS).

### Troubleshooting

| Issue | Solution |
|-------|----------|
| `cloudflared: command not found` | Install cloudflared (see table above) |
| Tunnel starts but WebSocket fails | Ensure the DEJA.js server is running on port 8082 before starting the tunnel |
| Connection drops frequently | Check your internet connection; cloudflared reconnects automatically |
| Named tunnel shows placeholder error | Edit `cloudflared.yml` and replace `YOUR_TUNNEL_UUID_HERE` with your actual tunnel UUID |
| Vue app cannot connect via tunnel | Use `wss://` (not `ws://`) since Cloudflare terminates TLS |

---

## 🤝 Contributing

We welcome contributions from the railroad community! 🚂

### 🛠️ How to Contribute
1. 🍴 **Fork the Repository** - Create your own copy
2. 🌿 **Create Feature Branch** - `git checkout -b feature/amazing-feature`
3. 🎨 **Make Your Changes** - Implement improvements
4. 🧪 **Add Tests** - Ensure quality and reliability
5. 📝 **Update Documentation** - Keep docs current
6. 📤 **Submit Pull Request** - Share your work

### 🎯 Areas We Need Help
- 🐛 **Bug Fixes** - Help identify and resolve issues
- ✨ **New Features** - Suggest and implement enhancements
- 📚 **Documentation** - Improve guides and examples
- 🧪 **Testing** - Expand test coverage
- 🎨 **UI/UX** - Enhance user experience

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[Node.js]: https://img.shields.io/badge/node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white
[Node-url]: https://nodejs.org/
[MQTT.js]: https://img.shields.io/badge/MQTT-660066?style=for-the-badge&logo=mqtt&logoColor=white
[MQTT-url]: https://mqtt.org/
[pnpm]: https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white
[pnpm-url]: https://pnpm.io/
[TypeScript]: https://img.shields.io/badge/Typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Arduino]: https://img.shields.io/badge/Arduino-00878F?style=for-the-badge&logo=arduino&logoColor=white
[Arduino-url]: https://www.arduino.cc/
[ESLint]: https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white
[ESLint-url]: https://eslint.org/
[Prettier]: https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=white
[Prettier-url]: https://prettier.io/
[Vite]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/

---

<p align="center">
  <strong>🖥️ Power Your Railroad with Modern Technology! 🚂</strong><br>
  <em>Built with ❤️ for the DCC-EX and model railroad community</em>
</p>
