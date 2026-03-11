---
"@repo/modules": minor
"deja-cloud": minor
"deja-serverts": minor
"deja-monitor": minor
"@repo/ui": minor
---

Add sensor and block occupancy system

- New `packages/modules/sensors/` module with composables for sensors, blocks, and automations CRUD
- Cloud app Sensors management UI: list, add, edit, delete sensors with advanced config
- Cloud app Automation builder: trigger actions on sensor state changes
- Server-side sensor handling: debounce, cooldown, retry limits, effect/automation triggering
- Server-side block occupancy computation from sensor states
- DCC-EX sensor commands: define, query sensors on command station
- Server processes incoming sensor data from serial and updates Firestore
- Monitor app SensorLogs panel with type icons and block info
- Shared UI sensor components: SensorList, SensorItem, SensorCard, SensorSwitch, SensorTable
- Sensors menu item in cloud app navigation
