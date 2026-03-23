# 🔌 IO Devices & Firmware

The `io/` directory contains firmware for physical hardware devices that extend your layout beyond what the DCC-EX CommandStation handles directly. These devices control effects like lighting, servo-driven turnouts, sensors, and animated elements. They communicate with the DEJA.js server over MQTT or USB serial.

> ⚠️ This directory is **not part of the pnpm workspace** -- it contains embedded firmware, not Node.js packages.
>
> 📐 See [ARCHITECTURE.md](../ARCHITECTURE.md) for how IO devices fit into the overall system communication layers.

## 🗂️ Directory Structure

```
io/
|-- src/
|   |-- deja-arduino/       🔧 Arduino sketch (.ino) for IO effect boards
|   |-- deja-pico-w/        🍓 CircuitPython code for Raspberry Pi Pico W
|       |-- code.py          📄 Main application entry point
|       |-- config.json       ⚙️ Pin mapping configuration
|       |-- lib/              📚 Adafruit libraries (MQTT, servo, bus device)
|-- layouts/
    |-- tam/                 🏔️ Tamarack Junction layout configs
        |-- deja-pico-w/
            |-- tj-eagle-nest-pico/config.json
            |-- tj-thunder-city-pico/config.json
```

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

Feature flags in `config.h` (or `config.default.h`) control which subsystems are compiled:

| Flag | Purpose |
|------|---------|
| `ENABLE_PWM` | 🎛️ Enable PCA9685 servo driver |
| `ENABLE_OUTPUTS` | 💡 Enable digital output pins |
| `ENABLE_SIGNALS` | 🚦 Enable signal head outputs |
| `ENABLE_SENSORS` | 📡 Enable sensor input pins |

Pin arrays (`OUTPINS`, `SIGNALPINS`, `SENSORPINS`) and the `DEVICE_ID` are defined in the config header. Each device has a unique ID that the server uses to route commands.

### 🚀 Startup Sequence

On startup, the sketch:

1. 📡 Initializes serial communication at 115200 baud.
2. 🏷️ Prints its `DEVICE_ID` for identification.
3. 📌 Configures output, signal, and sensor pins.
4. 🔀 Initializes turnout servos.
5. 🎛️ Starts the PWM servo driver (if enabled).

The main loop processes incoming serial commands and updates turnout servo positions.

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

## 🗺️ Per-Layout Device Configurations

The `io/layouts/` directory contains per-layout, per-device JSON configuration files. These files define the pin mapping for each device in a specific layout installation.

For example, the Eagle Nest Pico W device for the Tamarack Junction layout (`io/layouts/tam/deja-pico-w/tj-eagle-nest-pico/config.json`) maps logical pin numbers to physical GPIO pins:

```json
{
  "pins": {
    "6": "GP6",
    "7": "GP7",
    "8": "GP8",
    "9": "GP9"
  }
}
```

The default config (`io/src/deja-pico-w/config.json`) provides a broader set of pins (GP8 through GP17) that can be customized per installation.

To deploy a device, copy the appropriate layout config to the device filesystem as `config.json` before flashing.

---

## ➕ Adding a New Device

1. 🔧 **Choose the hardware platform** -- Arduino or Pico W.
2. 📄 **Create a config file** in `io/layouts/{layoutId}/deja-{platform}/{deviceId}/config.json` with the pin mapping for your device.
3. 🔧 **For Arduino:** Set the `DEVICE_ID` and pin arrays in `config.h`.
4. 🍓 **For Pico W:** Set environment variables in `settings.toml` on the device and copy the config file.
5. 🔥 **Register the device** in Firestore under `layouts/{layoutId}/devices` so the server and Monitor app can track its connection status.
6. 📬 **Enable MQTT** on the server (`ENABLE_MQTT=true`) if using Pico W devices.
