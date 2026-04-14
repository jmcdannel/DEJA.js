# 📚 Cross-Platform Arduino Deployment

The `io` workspace generates **cross-platform deployment bundles** for every Arduino-family device on your layout. Each bundle is a self-contained directory you can flash with **PlatformIO**, **Arduino CLI**, **Arduino IDE**, or the guided `deja deploy` CLI — your choice.

---

## 🎯 Supported firmware targets

DEJA.js ships three Arduino-family firmware variants. Each has its own sketch source, FQBN, and PlatformIO env, all wired through the same `io/scripts/lib/bundle.ts` builder:

| Device type | Sketch source | Transport | FQBN | PIO env |
|---|---|---|---|---|
| `deja-arduino` | `io/src/deja-arduino/` | USB serial @ 115200 | `arduino:avr:mega:cpu=atmega2560` | `megaatmega2560` |
| `deja-esp32` | `io/src/deja-arduino/` (same sketch, ESP32 board) | USB serial @ 115200 | `esp32:esp32:esp32` (uploads at 460800) | `esp32dev` |
| `deja-esp32-wifi` | `io/src/deja-esp32-wifi/` | WiFi + MQTT | `esp32:esp32:esp32` (uploads at 460800) | `esp32dev` |

> 🛜 `deja-esp32-wifi` is the wireless variant — same ESP32 hardware, but WiFi/MQTT instead of USB serial. Configured via `WIFI_*` and `MQTT_*` defines that the build wizard prompts for and bakes into `config.h` at build time.

Pico W (`deja-mqtt`) and DCC-EX (`dcc-ex`) bundles use different toolchains and are documented separately in the `deja-pico-w/` and DCC-EX upstream docs.

---

## 📁 Generated structure

When you build any Arduino-family device, you get this layout:

```
io/dist/<layoutId>/arduino/<deviceId>/
├── <sketchName>/                    # Arduino IDE expects .ino in matching folder
│   ├── <sketchName>.ino             # Main sketch
│   ├── config.h                     # Generated configuration (gitignored)
│   └── config.default.h             # Fallback defaults
├── platformio.ini                   # ⭐ PlatformIO configuration
├── .arduino-cli.yaml                # ⭐ Arduino CLI configuration
├── .gitignore                       # Build artifacts excluded
└── DEPLOYMENT.md                    # ⭐ Per-device deployment guide
```

`<sketchName>` is `deja-arduino` for both `deja-arduino` and `deja-esp32` (they share the sketch), and `deja-esp32-wifi` for the WiFi variant.

---

## 🚀 Building a bundle

### Option 1: Interactive wizard (recommended)

```bash
cd io
pnpm deploy
```

The wizard walks you through:
1. 🗺️ Pick a layout
2. 📟 Pick a device (auto-filtered to Arduino-family types)
3. 📶 For `deja-mqtt` and `deja-esp32-wifi`: enter WiFi SSID, password, and MQTT broker IP
4. 📦 Build the bundle
5. 🚀 Optionally compile + upload via arduino-cli (auto-installs the right core, libraries, and toolchain)

### Option 2: Non-interactive build

```bash
cd io
pnpm build -- --layout <layoutId> --device <deviceId>
```

Builds the bundle without prompts. Skips WiFi/MQTT credential entry — those defaults come from `MQTT_BROKER` env var or stay empty (you'll need to edit `config.h` before flashing).

---

## 🔨 Flashing — three CLI options per device

Once the bundle is built at `io/dist/<layoutId>/arduino/<deviceId>/`, navigate into it and pick your tool. The exact command depends on which firmware target you're flashing — these are the same commands the `deja deploy` CLI runs under the hood, and the same commands shown on the **Cloud app device details page**.

### 🟢 deja-arduino (Arduino Mega)

```bash
cd io/dist/<layoutId>/arduino/<deviceId>

# Option A: PlatformIO
platformio run -e megaatmega2560 --target upload --upload-port /dev/cu.usbserial-*

# Option B: Arduino CLI
arduino-cli compile --fqbn arduino:avr:mega:cpu=atmega2560 deja-arduino && \
  arduino-cli upload -p /dev/cu.usbserial-* --fqbn arduino:avr:mega:cpu=atmega2560 deja-arduino

# Option C: Arduino IDE
# File → Open → deja-arduino/deja-arduino.ino
# Tools → Board → Arduino AVR Boards → Arduino Mega or Mega 2560
# Tools → Processor → ATmega2560 (Mega 2560)
```

### 🟠 deja-esp32 (ESP32 over USB)

```bash
cd io/dist/<layoutId>/arduino/<deviceId>

# Option A: PlatformIO
platformio run -e esp32dev --target upload --upload-port /dev/cu.usbserial-*

# Option B: Arduino CLI
arduino-cli compile --fqbn esp32:esp32:esp32 \
  --build-property "compiler.cpp.extra_flags=-std=c++17" deja-arduino && \
  arduino-cli upload -p /dev/cu.usbserial-* \
  --fqbn esp32:esp32:esp32:UploadSpeed=460800 deja-arduino

# Option C: Arduino IDE
# File → Open → deja-arduino/deja-arduino.ino
# Tools → Board → ESP32 Arduino → ESP32 Dev Module
# Tools → Upload Speed → 460800
```

> 🤝 Note: `deja-esp32` reuses the `deja-arduino` sketch — same JSON-over-serial protocol, just compiled for ESP32 hardware.

### 🛜 deja-esp32-wifi (ESP32 over WiFi/MQTT)

```bash
cd io/dist/<layoutId>/arduino/<deviceId>

# Option A: PlatformIO
platformio run -e esp32dev --target upload --upload-port /dev/cu.usbserial-*

# Option B: Arduino CLI
arduino-cli compile --fqbn esp32:esp32:esp32 \
  --build-property "compiler.cpp.extra_flags=-std=c++17" deja-esp32-wifi && \
  arduino-cli upload -p /dev/cu.usbserial-* \
  --fqbn esp32:esp32:esp32:UploadSpeed=460800 deja-esp32-wifi

# Option C: Arduino IDE
# File → Open → deja-esp32-wifi/deja-esp32-wifi.ino
# Tools → Board → ESP32 Arduino → ESP32 Dev Module
# Tools → Upload Speed → 460800
```

> 🛜 Before flashing: confirm `WIFI_SSID`, `WIFI_PASSWORD`, `MQTT_BROKER`, `DEVICE_ID`, `LAYOUT_ID`, and `TOPIC_ID` are set correctly in `deja-esp32-wifi/config.h`. The `deja deploy` wizard prompts for these and bakes them in automatically; if you ran `pnpm build` non-interactively you'll need to edit `config.h` by hand.

---

## 📦 Library dependencies

All three firmware targets share the same library list, declared in `io/scripts/lib/bundle.ts` `ARDUINO_LIB_DEPS`:

| Library | Used by | Purpose |
|---|---|---|
| `Adafruit PWM Servo Driver Library` | All Arduino-family | PCA9685 servo control (gated on `ENABLE_PWM`) |
| `ArduinoJson` | All Arduino-family | Parse incoming JSON commands |
| `TurnoutPulser` | All Arduino-family | Servo-driven turnouts (gated on `ENABLE_TURNOUTS`) |
| `PubSubClient` | `deja-esp32-wifi` only | MQTT client over WiFi |

The `deja deploy` CLI runs `arduino-cli lib install` for any missing libs automatically. PlatformIO picks them up from `lib_deps` in `platformio.ini`. If you're using Arduino IDE, install them manually via **Sketch → Include Library → Manage Libraries**.

---

## 🔧 Generated files explained

### `platformio.ini`
- `default_envs` set to the device's primary platform (`megaatmega2560` or `esp32dev`)
- For `deja-esp32-wifi`: only emits the `[env:esp32dev]` env (no Mega target)
- For `deja-arduino` / `deja-esp32`: emits both `[env:megaatmega2560]` and `[env:esp32dev]` so you can swap targets without rebuilding the bundle
- Shared `lib_deps` block includes all four libraries above
- Serial monitor at 115200 baud

### `.arduino-cli.yaml`
- Adds the ESP32, ESP8266, and Adafruit board manager URLs so `arduino-cli core install esp32:esp32` works without extra flags
- Standard logging + metric defaults

### `.gitignore`
- Excludes build artifacts (`*.hex`, `*.elf`, `.pio/`, `build/`)
- Excludes `config.h` (per-device, generated) but keeps `config.default.h` (template, gitignored elsewhere)
- IDE noise excluded too (`.vscode/`, `.DS_Store`, `*.swp`)

### `DEPLOYMENT.md`
- Auto-generated per device with the exact CLI commands for that device's FQBN + sketch folder
- Lists effects/turnouts/sensors/signals counts for the bundle
- For `deja-esp32-wifi`: documents the MQTT subscribe/publish topics

---

## 💡 Single source of truth

Every place that emits an Arduino CLI command (`bundle.ts` → `DEPLOYMENT.md`, the Cloud app's device-details page, this README) pulls from `packages/modules/device-config/cli-commands.ts` `getCliDeployCommands()`. If you ever need to change a FQBN, upload speed, or sketch folder name, change it there once and every consumer picks it up.

The actual board configs that the deploy pipeline runs at compile time live in `io/scripts/lib/bundle.ts` `BOARD_CONFIGS` — `cli-commands.ts` mirrors those values exactly. Keep them in sync; future hardening could collapse them into one shared map.

---

## ✅ Cross-platform support matrix

| Tool | `deja-arduino` | `deja-esp32` | `deja-esp32-wifi` |
|---|---|---|---|
| `deja deploy` (interactive CLI) | ✅ | ✅ | ✅ |
| `pnpm build` (non-interactive) | ✅ | ✅ | ✅ |
| PlatformIO | ✅ | ✅ | ✅ |
| Arduino CLI | ✅ | ✅ | ✅ |
| Arduino IDE | ✅ | ✅ | ✅ |

No additional setup needed — every bundle drops out ready to flash. 🎉
