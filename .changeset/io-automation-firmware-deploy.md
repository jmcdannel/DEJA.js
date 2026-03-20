---
"deja-cloud": minor
---

added: **[cloud]** Firmware deploy dialog with config preview, WiFi credential input (Pico W), and ZIP download for Arduino and Pico W devices
added: **[io]** Automated firmware config generation from Firebase device data — Arduino config.h and Pico W settings.toml/config.json
added: **[io]** Interactive deploy CLI (`pnpm deploy`) with device selection, compile & upload (Arduino), and CIRCUITPY copy (Pico W)
fixed: **[io]** Fix hardcoded empty turnouts array and sensor pins in Arduino config.h generation
fixed: **[io]** Fix stray `*-` syntax error on line 201 of Pico W code.py
fixed: **[io]** Fix typo "daja-arduino" → "deja-arduino" in config.default.h
