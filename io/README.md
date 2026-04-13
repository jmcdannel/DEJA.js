# 🔌 IO Devices & Firmware

The `io/` directory contains firmware for physical hardware devices that extend your layout beyond what the DCC-EX CommandStation handles directly. These devices control effects like lighting, servo-driven turnouts, sensors, and animated elements. They communicate with the DEJA.js server over MQTT or USB serial.

> 📦 This directory is part of the **pnpm workspace** and imports shared config generators from `@repo/modules`.
>
> 📐 See [ARCHITECTURE.md](../ARCHITECTURE.md) for how IO devices fit into the overall system communication layers.

## 🗂️ Directory Structure

```
io/
├── scripts/
│   ├── build.ts              🔧 Build firmware packages
│   ├── deploy.ts             🚀 Interactive deploy wizard
│   └── lib/
│       ├── detect.ts          🔍 Device and mount detection, arduino-cli auto-install
│       ├── deploy-arduino.ts  ⬆️ Arduino compile & upload via arduino-cli
│       ├── deploy-pico.ts     🍓 Pico W copy-to-CIRCUITPY
│       ├── firebase.ts        🔥 Fetch device config from Firestore
│       └── prompts.ts         💬 Interactive CLI prompts
├── src/
│   ├── deja-arduino/          🔧 Arduino sketch (.ino) — used by deja-arduino (Mega) AND deja-esp32 (USB)
│   ├── deja-esp32-wifi/       🛜 ESP32 WiFi+MQTT sketch (.ino) — used by deja-esp32-wifi
│   └── deja-pico-w/           🍓 CircuitPython code for Raspberry Pi Pico W
│       ├── code.py             📄 Main application entry point
│       ├── config.json          ⚙️ Pin mapping configuration
│       └── lib/                 📚 Adafruit libraries (MQTT, servo, bus device)
├── tests/
│   └── esp01-wifi-test/       🛜 ESP-01 WiFi connectivity test (PlatformIO)
└── dist/                      📦 Build output (gitignored)
```

---

## 🚀 Deploy Firmware

The easiest way to deploy firmware to a device:

### Option 1: `deja deploy` (recommended)

```bash
deja deploy
```

This launches the interactive deploy wizard:
1. 🗺️ Select your layout
2. 📟 Select a device
3. 🔐 Enter WiFi credentials + MQTT broker (`deja-mqtt` and `deja-esp32-wifi` only)
4. 📦 Build firmware package
5. ⬆️ Auto-detect USB and deploy

`arduino-cli` and the `esp32:esp32` core are **auto-installed** if not found on your system. Required Arduino libraries (`Adafruit PWM Servo Driver Library`, `ArduinoJson`, `TurnoutPulser`, `PubSubClient`) are also auto-installed.

### Option 2: Cloud App Download

1. Configure your device in the **Cloud app** (assign effects, turnouts, pins)
2. Click **Download Firmware** → get a ZIP with `config.h` (Arduino) or `settings.toml` + `config.json` (Pico W)
3. Flash manually using Arduino IDE or copy to CIRCUITPY drive

### Option 3: Build scripts (developer)

```bash
# Interactive deploy
pnpm --filter=@deja/io deploy

# Build only (no deploy)
pnpm --filter=@deja/io build -- --layout tam --device my-mega
```

---

## 🔧 Shared Config Generation

Device configurations are generated from Firebase data using shared pure functions in `@repo/modules/device-config`:

| Function | Output | Platform |
|----------|--------|----------|
| `generateArduinoConfig()` | `config.h` (C++ preprocessor directives, pin arrays, feature flags) | `deja-arduino`, `deja-esp32` |
| `generateEsp32WifiConfig()` | `config.h` with baked WiFi/MQTT credentials + pin arrays | `deja-esp32-wifi` |
| `generatePicoSettings()` | `settings.toml` (WiFi, MQTT, device ID) | `deja-mqtt` (Pico W) |
| `generatePicoConfig()` | `config.json` (pin → GPIO mapping) | `deja-mqtt` (Pico W) |
| `generateDccExAutomation()` | `myAutomation.h` (EXRAIL roster + automation) | `dcc-ex` |
| `getCliDeployCommands()` | `{ build, cd, platformio, arduinoCli }` command strings | All Arduino-family |

These generators are shared between:
- **Cloud app** — wraps them in Vue `computed()` for preview + ZIP download + CLI command display on the device details page
- **IO build/deploy scripts** — calls them directly for automated builds and per-bundle `DEPLOYMENT.md` generation
- **deja deploy CLI** — uses them for CLI-based deployment

> 🛠️ `getCliDeployCommands()` is the single source of truth for the platformio + arduino-cli commands shown in `io/dist/<layoutId>/arduino/<deviceId>/DEPLOYMENT.md` and on the Cloud app device details page. See [CROSS_PLATFORM_DEPLOYMENT.md](./CROSS_PLATFORM_DEPLOYMENT.md) for the full per-device-type command matrix.

---

## 🔧 Arduino Firmware (`deja-arduino` / `deja-esp32`)

The same Arduino sketch in `src/deja-arduino/` powers two device types:

- **`deja-arduino`** — runs on Arduino boards (Mega 2560 and friends), connected via USB serial
- **`deja-esp32`** — runs on ESP32 boards, also connected via USB serial. Same JSON-over-serial protocol; the only differences are the FQBN (`esp32:esp32:esp32`) and a faster upload speed (460800 baud)

The sketch provides:

- 🎛️ **PWM servo control** via an Adafruit PCA9685 16-channel servo driver board. Used for servo-driven turnout motors and animated elements.
- 💡 **Digital outputs** for LEDs, relays, and other on/off devices.
- 🚦 **Signal outputs** for model railroad signal heads.
- 📡 **Sensor inputs** for detecting train presence (block detection, occupancy sensors).

### ⚙️ How It Works

The sketch communicates over serial at **115200 baud**. It receives JSON-formatted commands, parses them with ArduinoJson, and dispatches actions to the appropriate pins or servo channels.

### 🏗️ Config Flags

Feature flags in `config.h` control which subsystems are compiled:

| Flag | Purpose |
|------|---------|
| `ENABLE_PWM` | 🎛️ Enable PCA9685 servo driver |
| `ENABLE_OUTPUTS` | 💡 Enable digital output pins |
| `ENABLE_SIGNALS` | 🚦 Enable signal head outputs |
| `ENABLE_SENSORS` | 📡 Enable sensor input pins |

Pin arrays (`OUTPINS`, `SIGNALPINS`, `SENSORPINS`) and the `DEVICE_ID` are defined in the config header. Each device has a unique ID that the server uses to route commands.

---

## 🛜 ESP32 WiFi Firmware (`deja-esp32-wifi`)

The `src/deja-esp32-wifi/` sketch runs on ESP32 boards and connects to your WiFi network instead of using USB serial. Use it when you need wireless connectivity — for example, an ESP32 mounted inside scenery or under benchwork where USB cabling is impractical. Functionally equivalent to the Pico W path but on ESP32 hardware with the C++/Arduino toolchain.

### ✨ Features

- 📶 **WiFi connectivity** via the ESP32 core's built-in `WiFi.h`
- 📬 **MQTT client** via `PubSubClient` for subscribing to commands and publishing sensor events
- 💡 **Digital outputs** for LEDs, relays, and on/off devices
- 🎛️ **PWM servo control** via Adafruit PCA9685 (gated on `ENABLE_PWM`)
- 🚦 **Signal outputs** for model railroad signal heads
- 📡 **Sensor inputs** with debounced state changes published over MQTT
- 🔧 **Servo-driven turnouts** via `TurnoutPulser` (gated on `ENABLE_TURNOUTS`)

### 📬 MQTT Topics

Same convention as Pico W — the DEJA.js server treats both device types identically on the wire:

- **Subscribe:** `{TOPIC_ID}/{LAYOUT_ID}/{DEVICE_ID}` — receives commands from the server
- **Publish:** `{TOPIC_ID}/{LAYOUT_ID}/{DEVICE_ID}/messages` — publishes sensor events back to the server

The default `TOPIC_ID` is `DEJA`, which matches the topic the server hardcodes in `apps/server/src/modules/layout.ts`. Sensor events flow through the same Firestore pipeline as USB serial sensors via the server's `writeSensorState()` helper.

### 🔐 Configuration (`config.h`)

Unlike the Pico W (which reads `settings.toml` at runtime), the ESP32 WiFi firmware bakes credentials into `config.h` at build time. The `deja deploy` wizard prompts for these and `generateEsp32WifiConfig()` writes them in:

| Define | Description |
|--------|-------------|
| `WIFI_SSID` | 📶 WiFi network name |
| `WIFI_PASSWORD` | 🔑 WiFi password |
| `MQTT_BROKER` | 🌐 MQTT broker IP / hostname |
| `MQTT_PORT` | 📡 MQTT broker port (default 1883) |
| `MQTT_USERNAME` | 🔐 Optional MQTT username |
| `MQTT_PASSWORD` | 🔐 Optional MQTT password |
| `DEVICE_ID` | 🏷️ Unique device identifier (matches the Firestore device doc) |
| `LAYOUT_ID` | 🗺️ Layout identifier |
| `TOPIC_ID` | 📡 MQTT topic prefix (default `DEJA`) |
| `ENABLE_PWM` / `ENABLE_OUTPUTS` / `ENABLE_SIGNALS` / `ENABLE_SENSORS` / `ENABLE_TURNOUTS` | Feature flags — same semantics as the deja-arduino sketch |

### 📨 Command Format

Single JSON object per MQTT message, matching the Pico W format the server publishes:

```json
{ "action": "pin", "device": "betatrack-esp-wifi", "payload": { "pin": 18, "state": 1 } }
```

The firmware filters by the `device` field and ignores messages intended for other devices on the same topic. Supported actions: `pin`, `servo`, `turnout`/`turnouts`, `ialed`/`effects`. The firmware also accepts the JSON-array shape used by the deja-arduino sketch (`[{ action, payload }, ...]`) so the same handlers work for both transports.

---

## 🍓 Raspberry Pi Pico W Firmware (`deja-pico-w`)

The Pico W firmware is written in **CircuitPython** and connects to your WiFi network to communicate with the DEJA.js server over MQTT. This is ideal for devices that need wireless connectivity -- for example, lighting controllers placed inside scenery where running USB cables is impractical.

### ✨ Features

- 📶 **WiFi connectivity** using CircuitPython's built-in `wifi` module.
- 📬 **MQTT client** using the Adafruit MiniMQTT library for subscribing to command topics and publishing status.
- 💡 **Digital pin control** for LEDs, relays, and other outputs.
- 🎛️ **PWM servo control** using the Adafruit ServoKit library over I2C (GP0/GP1 for SDA/SCL).
- ⚙️ **JSON configuration** for pin mapping, loaded from `config.json` on the device filesystem.

### 📬 MQTT Topics

Each Pico W device subscribes to a command topic and can publish to a messages topic:

- **Subscribe:** `{topicId}/{layoutId}/{deviceId}` -- 📥 Receives commands from the server.
- **Publish:** `{topicId}/{layoutId}/{deviceId}/messages` -- 📤 Sends status and sensor data back to the server.

### 🔐 Environment Variables (`settings.toml`)

Environment variables are read from CircuitPython's `settings.toml` (or `os.getenv`):

| Variable | Description |
|----------|-------------|
| `CIRCUITPY_WIFI_SSID` | 📶 WiFi network name |
| `CIRCUITPY_WIFI_PASSWORD` | 🔑 WiFi password |
| `ENABLE_CONFIG` | ⚙️ Load pin config from `config.json` |
| `ENABLE_PWM` | 🎛️ Enable PCA9685 servo driver |
| `ENABLE_MQTT` | 📬 Enable MQTT connection |
| `MQTT_BROKER` | 🌐 MQTT broker IP address |
| `LAYOUT_ID` | 🗺️ Layout identifier |
| `DEVICE_ID` | 🏷️ Unique device identifier |
| `TOPIC_ID` | 📡 MQTT topic prefix |

### 📨 Command Format

Commands arrive as JSON messages on the MQTT subscription topic:

```json
{
  "action": "pin",
  "payload": { "pin": 8, "state": 1 },
  "device": "tj-eagle-nest-pico"
}
```

The firmware checks the `device` field against its own `DEVICE_ID` and ignores messages intended for other devices on the same topic. Supported actions include pin control and servo positioning.

---

## 🛜 Tests (`io/tests/`)

### ESP-01 WiFi Test

PlatformIO project for testing ESP-01 WiFi connectivity from an Arduino Nano via SoftwareSerial. Runs a full diagnostic sequence: AT check → firmware info → station mode → WiFi connect → IP address → HTTP GET.

```bash
cd io/tests/esp01-wifi-test
pio run --target upload
```

---

## ➕ Adding a New Device

1. 🔥 **Register the device** in the Cloud app under your layout's Devices section. Pick the device type that matches your hardware:
   - `deja-arduino` — Arduino Mega 2560 over USB serial
   - `deja-esp32` — ESP32 board over USB serial
   - `deja-esp32-wifi` — ESP32 board over WiFi/MQTT
   - `deja-mqtt` — Raspberry Pi Pico W over WiFi/MQTT
2. ⚡ **Assign effects, turnouts, sensors, and signals** to the device in the Cloud app. The Cloud form auto-defaults the connection type (`usb` or `wifi`) based on the device type, and surfaces WiFi/MQTT credential fields for `deja-mqtt` and `deja-esp32-wifi`.
3. 📟 **Deploy firmware** with `deja deploy` — the wizard auto-fetches sensors/signals from Firestore, prompts for WiFi/MQTT credentials when needed, generates `config.h`/`config.json`/`settings.toml`, and compiles + uploads via arduino-cli.
4. 📬 **Enable MQTT** on the server (`ENABLE_MQTT=true`) if using any wifi-connected devices (`deja-mqtt` or `deja-esp32-wifi`).
