# ☁️ DEJA Cloud

Vue 3 layout management and configuration hub — the central admin interface for setting up and managing your model railroad.

**🌐 Production:** [cloud.dejajs.com](https://cloud.dejajs.com)

---

## ⚙️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Vue 3** | UI framework (Composition API, `<script setup lang="ts">`) |
| **Vuetify 3** | Material Design component library |
| **Firebase / VueFire** | Real-time data binding, authentication, Firestore |
| **TypeScript** | Type safety throughout |
| **Vite** | Dev server and build tool |

---

## 🗂️ Feature Areas

| Module | Description |
|--------|-------------|
| `Dashboard/` | 📊 System overview and layout status |
| `DCCEX/` | ⚡ DCC command console and log |
| `Roster/` | 🚂 Locomotive roster management |
| `Turnouts/` | 🔀 Turnout configuration |
| `Routes/` | 🛤️ Route configuration |
| `Effects/` | ✨ Sound and lighting effects |
| `Signals/` | 🚦 Signal wiring and state |
| `Layout/` | 🗺️ Layout configuration and settings |
| `DejaDirectConnect/` | 🔌 Direct server connection interface |
| `Onboarding/` | 🧭 New user setup wizard |
| `Sensors/` | 📡 Sensor data and configuration |
| `TrackDiagram/` | 🖼️ Visual track diagram editor |
| `Sounds/` | 🔊 Sound effect management |

---

## 🏃 Development

```bash
pnpm --filter=deja-cloud dev
```

### 🧪 Mock Mode

Run without a live Firebase or server connection:

```bash
pnpm --filter=deja-cloud dev:mock
```

---

## 📦 Package Dependencies

`@repo/modules`, `@repo/ui`, `@repo/dccex`, `@repo/deja`, `@repo/auth`, `@repo/firebase-config`, `@repo/sounds`, `@repo/utils`

---

## 📖 Docs

User documentation is available at [dejajs.com/docs](https://dejajs.com/docs).
