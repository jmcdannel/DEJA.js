# 📊 DEJA Monitor

Vue 3 system monitoring and diagnostics dashboard — provides real-time visibility into DCC commands, device connections, serial port activity, and WebSocket status.

**🌐 Production:** [monitor.dejajs.com](https://monitor.dejajs.com)

---

## ⚙️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Vue 3** | UI framework (Composition API, `<script setup lang="ts">`) |
| **Vuetify 3** | Material Design component library |
| **Firebase / VueFire** | Real-time data binding and authentication |
| **WebSocket** | Live communication with DEJA Server |
| **Chart.js / vue-chartjs** | Data visualization |
| **TypeScript** | Type safety throughout |
| **Vite** | Dev server and build tool |

---

## 🔑 Key Features

- 📋 **Real-time DCC command log** — see every command sent to the CommandStation
- 🔌 **Device connection monitoring** — track connected hardware and their status
- 🔧 **Serial port management** — list, select, and monitor USB serial ports
- 🌐 **WebSocket status** — live connection state with the DEJA Server
- 📊 **Dashboard** — system overview with key metrics

---

## 🏃 Development

```bash
pnpm --filter=deja-monitor dev
```

---

## 📦 Package Dependencies

`@repo/modules`, `@repo/ui`, `@repo/dccex`, `@repo/deja`, `@repo/auth`, `@repo/firebase-config`, `@repo/utils`

---

## 📖 Docs

User documentation is available at [dejajs.com/docs](https://dejajs.com/docs).
