📚 # Cross-Platform Arduino Deployment System

## 🎯 What Changed

The `io` workspace now automatically generates **cross-platform deployment files** whenever you run `pnpm build` or `pnpm deploy`, enabling seamless Arduino deployment across:
- ✅ PlatformIO
- ✅ Arduino CLI  
- ✅ Arduino IDE

---

## 📁 Generated Structure

When you build or deploy an Arduino device, each device gets this structure:

```
dist/<layoutId>/arduino/<deviceId>/
├── deja-arduino/                    # Arduino IDE expects .ino in matching folder
│   ├── deja-arduino.ino             # Main sketch
│   ├── config.h                     # Generated configuration
│   └── config.default.h             # Fallback defaults
├── platformio.ini                   # ⭐ PlatformIO configuration
├── .arduino-cli.yaml                # ⭐ Arduino CLI configuration
├── .gitignore                       # Proper git ignores for all three tools
└── DEPLOYMENT.md                    # ⭐ User-friendly deployment guide
```

---

## 🚀 Deployment Workflow

### 1️⃣ Build (Generates Everything)

```bash
cd io

# Build device for a layout
pnpm build -- --layout <layout-id>

# Or build with deploy prompt
pnpm deploy
```

**Output:**
```
✅ arduino "device-id" → dist/<layout-id>/arduino/<device-id>/deja-arduino/
   📄 deja-arduino.ino + config.h (5 effects, 2 turnouts)
   ⚙️  platformio.ini, .arduino-cli.yaml, DEPLOYMENT.md
```

### 2️⃣ Deploy From Any Location

Navigate to the generated folder and use whatever tool you prefer:

```bash
cd dist/<layout-id>/arduino/<device-id>

# Option A: PlatformIO
platformio run -e megaatmega2560
platformio run -e megaatmega2560 --target upload

# Option B: Arduino CLI
arduino-cli compile --fqbn arduino:avr:mega:cpu=atmega2560 deja-arduino
arduino-cli upload -p /dev/cu.usbserial-* --fqbn arduino:avr:mega:cpu=atmega2560 deja-arduino

# Option C: Arduino IDE
# Just open deja-arduino/deja-arduino.ino directly
```

---

## 🔧 Files Generated

### `platformio.ini`
- Board: Arduino Mega 2560 (ATmega2560)
- Libraries: Adafruit PWM Servo Driver, ArduinoJson
- Serial: 115200 baud
- Upload speed: 115200 baud

### `.arduino-cli.yaml`
- User directory configured to project root
- Board manager URLs for ESP8266 and Adafruit boards
- Logging and metric settings

### `.gitignore`
- Build artifacts (.pio/, build/, *.hex, *.elf, etc.)
- IDE files (.vscode/, .DS_Store)
- Generated config.h (but keeps config.default.h in git)

### `DEPLOYMENT.md`
- Quick start for all three tools
- Serial communication format (JSON)
- Generated stats (effects, turnouts)
- Troubleshooting tips

---

## 📦 Library Management

All three tools automatically find libraries because they're specified in `platformio.ini`:

```ini
lib_deps =
    adafruit/Adafruit PWM Servo Driver Library @ ^2.4.1
    bblanchon/ArduinoJson @ ^7.0.0
```

**Manual library installation (if needed):**

```bash
# Arduino CLI
arduino-cli lib install "Adafruit PWM Servo Driver Library"
arduino-cli lib install "ArduinoJson"

# Arduino IDE: Sketch → Include Library → Manage Libraries (search for each)
```

---

## 💡 Implementation Details

### In `scripts/lib/bundle.ts`:

1. **New function:** `generateArduinoCrossPlatformFiles()`
   - Generates all four files (platformio.ini, .arduino-cli.yaml, .gitignore, DEPLOYMENT.md)
   - Called automatically during Arduino bundle write

2. **Modified:** `writeDeviceBundle()` for Arduino
   - After copying source files, calls the new generator
   - Logs confirmation of cross-platform file generation

### Design Advantages:

✨ **Single source of truth** — config generated once, used by all tools  
✨ **No duplication** — shared platformio.ini, not per-tool variants  
✨ **Reproducible** — every build generates identical configs  
✨ **Documented** — DEPLOYMENT.md auto-generated with device-specific stats  
✨ **Git-friendly** — proper .gitignore prevents build artifacts leaking into version control  

---

## 🔄 Next Build/Deploy

```bash
cd ~/TTT/DEJA.js.git/preview/io

# Build specific device
pnpm build -- --layout my-layout --device my-device

# Or interactive deploy
pnpm deploy

# Device outputs to:
# dist/my-layout/arduino/my-device/
# ├── deja-arduino/
# ├── platformio.ini ← Ready for any tool
# ├── .arduino-cli.yaml ← Ready for any tool
# ├── .gitignore
# └── DEPLOYMENT.md ← User guide
```

---

## ✅ Cross-Platform Ready

Each generated device folder is now **deployment-ready** for:

| Tool | Command | Works |
|------|---------|-------|
| PlatformIO | `platformio run` | ✅ |
| Arduino CLI | `arduino-cli compile` | ✅ |
| Arduino IDE | File → Open → .ino | ✅ |

No additional setup needed! 🎉
