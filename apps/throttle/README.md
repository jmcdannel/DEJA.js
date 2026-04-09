# 🚂 DEJA Throttle

Vue 3 train control interface — the primary operator app for driving locomotives, throwing turnouts, managing routes, and controlling effects.

**🌐 Production:** [throttle.dejajs.com](https://throttle.dejajs.com)

---

## ⚙️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Vue 3** | UI framework (Composition API, `<script setup lang="ts">`) |
| **Vuetify 3** | Material Design component library |
| **Pinia** | State management |
| **MQTT** | Real-time communication via `mqtt-vue-hook` |
| **TypeScript** | Type safety throughout |
| **Vite** | Dev server and build tool |
| **Tailwind CSS** | Utility-first styling |

---

## 🗂️ Key Views

| View | Description |
|------|-------------|
| `ThrottleView` / `ThrottleListView` | 🎛️ Speed, direction, and function controls |
| `TurnoutsView` | 🔀 Throw/close turnouts |
| `RoutesView` | 🛤️ Preset route management |
| `RosterView` | 🚂 Locomotive roster |
| `EffectsView` | ✨ Sound and lighting effects |
| `SignalsView` | 🚦 Signal management |
| `ConductorView` | 👷 Conductor layout overview |

### 🎯 Quick Menu

A draggable floating action button (FAB) available on every page when logged in with a layout selected. Tap the DEJA.js "D" logo to open a drill-down panel for browsing and controlling layout entities:

- **🚂 Locos** — browse roster, tap 🎮 gamepad to open throttle
- **🚀 Effects / 🔀 Turnouts / 🚦 Signals** — filter by device, type, or tag; toggle on/off
- **🛤️ Routes** — filter by waypoint; tap to activate
- **➕ New** — opens Cloud app in a new tab to create items

Server-dependent actions (toggles, route activation) are automatically disabled when the DEJA server is offline. The FAB position is persisted across sessions.

### 🎯 Key Composable

`useThrottle(address)` — manages speed, direction, and function state for a locomotive. Writes to `layouts/{layoutId}/throttles/{address}` in Firestore.

---

## 🏃 Development

```bash
pnpm --filter=deja-throttle dev
```

### 🧪 Tests

```bash
pnpm --filter=deja-throttle test:unit
```

Uses **Vitest** with `@vue/test-utils` and `jsdom`.

---

## 📦 Package Dependencies

`@repo/modules`, `@repo/ui`, `@repo/dccex`, `@repo/deja`, `@repo/auth`, `@repo/firebase-config`, `@repo/utils`

---

## 📖 Docs

User documentation is available at [dejajs.com/docs](https://dejajs.com/docs).

<!-- build: trigger rebuild -->
