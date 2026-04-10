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
│   ├── deja-arduino/          🔧 Arduino sketch (.ino) for IO effect boards
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
3. 🔐 Enter WiFi credentials (Pico W only)
4. 📦 Build firmware package
5. ⬆️ Auto-detect USB and deploy

`arduino-cli` is **auto-installed** if not found on your system.

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
| `generateArduinoConfig()` | `config.h` (C++ preprocessor directives) | Arduino |
| `generatePicoSettings()` | `settings.toml` (WiFi, MQTT, device ID) | Pico W |
| `generatePicoConfig()` | `config.json` (pin → GPIO mapping) | Pico W |

These generators are shared between:
- **Cloud app** — wraps them in Vue `computed()` for preview + ZIP download
- **IO build/deploy scripts** — calls them directly for automated builds
- **deja deploy** — uses them for CLI-based deployment

---

## 🔧 Arduino Firmware (`deja-arduino`)

The Arduino sketch runs on standard Arduino boards (Uno, Mega, Nano, etc.) and provides:

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

1. 🔥 **Register the device** in the Cloud app under your layout's Devices section
2. ⚡ **Assign effects and turnouts** to the device in the Cloud app
3. 📟 **Deploy firmware** with `deja deploy` — it auto-generates all config files
4. 📬 **Enable MQTT** on the server (`ENABLE_MQTT=true`) if using Pico W devices
