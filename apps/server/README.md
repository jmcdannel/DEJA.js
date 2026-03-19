# ⚙️ DEJA Server

The DEJA Server is the Node.js backend that bridges browser-based frontend apps to DCC-EX CommandStation hardware. It listens for commands from Firebase, WebSocket clients, and MQTT, translates them into DCC-EX serial protocol, and sends them over USB to the CommandStation at 115200 baud.

---

## 📂 Source Structure

```
apps/server/
├── index.ts                      # 🚀 Entry point — wires up all subsystems
└── src/
    ├── dejaCloud.ts              # ☁️ Firebase listeners & lifecycle management
    ├── broadcast.ts              # 📢 Broadcasts to WebSocket clients
    ├── lib/
    │   ├── dcc.ts                # ⚡ DCC command handler — routes messages to serial
    │   ├── deja.ts               # 🎛️ System command handler (non-DCC)
    │   ├── serial.ts             # 🔌 USB serial port management
    │   ├── ws-server.ts          # 🌐 WebSocket server
    │   ├── mqtt.ts               # 📬 MQTT client
    │   ├── sound.ts              # 🔊 Sound playback
    │   └── AudioCacheService.ts  # 💾 Audio file caching
    ├── modules/
    │   ├── throttles.ts          # 🚂 Locomotive speed/direction handling
    │   ├── turnouts.ts           # 🔀 Turnout state handling
    │   ├── signals.ts            # 🚦 Signal state handling
    │   ├── effects.ts            # ✨ Effects (sounds, lights) handling
    │   ├── sensors.ts            # 📡 Sensor data handling
    │   └── layout.ts             # 🗺️ Layout initialization
    └── utils/
        └── logger.ts             # 📋 Signale-based structured logger
```

---

## 🧩 Three Subsystems

The server is composed of three independently togglable subsystems, each controlled by an environment variable. Enable any combination depending on your setup.

| Subsystem | Env Flag | Description |
|-----------|----------|-------------|
| ☁️ **DEJACLOUD** | `ENABLE_DEJACLOUD` | Connects to Firebase (Firestore + RTDB). Listens to command queues and Firestore collection changes, dispatches DCC commands to serial. |
| 📬 **MQTT** | `ENABLE_MQTT` | Connects to an MQTT broker for IoT device communication (Arduino, Pico W firmware in `io/`). |
| 🌐 **WebSocket** | `ENABLE_WS` | Starts a WebSocket server for real-time bidirectional communication with browser clients. Enabled by default. |

---

## 🏃 Running the Server

### Development

```bash
pnpm --filter=deja-serverts dev
```

This runs `tsx watch index.ts` — the server auto-restarts on source file changes.

### Production

The server is distributed as a self-contained bundle managed by the `deja` CLI:

```bash
deja start      # 🚀 Launch the server
deja status     # 📊 Check status
deja stop       # 🛑 Stop the server
```

---

## 🔑 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LAYOUT_ID` | `betatrack` | 🗺️ Layout identifier in Firebase |
| `ENABLE_DEJACLOUD` | `false` | ☁️ Enable Firebase Cloud integration |
| `ENABLE_MQTT` | `false` | 📬 Enable MQTT broker connection |
| `ENABLE_WS` | `true` | 🌐 Enable WebSocket server |
| `VITE_WS_PORT` | `8082` | 🔌 WebSocket server port |
| `VITE_WS_ID` | `DEJA.js` | 🏷️ Server identifier string |
| `SENTRY_DSN` | — | 🐛 Sentry error tracking DSN |

---

## 📋 Logging

The server uses [signale](https://github.com/klaussinani/signale) for structured logging via `src/utils/logger.ts`:

- `log.start()` — Process startup
- `log.success()` — Successful operations
- `log.error()` / `log.fatal()` — Errors and fatal conditions
- `log.note()` / `log.info()` — Informational messages
- `log.star()` — Highlighted command logs
- `log.warn()` — Warnings

---

## 📚 Related Docs

| Document | Description |
|----------|-------------|
| [WEBSOCKET_PROTOCOL.md](WEBSOCKET_PROTOCOL.md) | 🌐 Full WebSocket message format and device subscription protocol |
| [packages/dccex/README.md](../../packages/dccex/README.md) | 🔧 DCC-EX command protocol reference |
| [ARCHITECTURE.md](../../ARCHITECTURE.md) | 🏗️ System overview, communication layers, and data flow |
