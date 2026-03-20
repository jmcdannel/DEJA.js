# 🎭 DEJA Tour

Vue 3 interactive visitor experience app for exhibitions, open houses, and museum displays. Provides guest-friendly controls for triggering effects, sounds, and layout interactions without requiring operator-level access.

**🌐 Production:** [tour.dejajs.com](https://tour.dejajs.com)

---

## ⚙️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Vue 3** | UI framework (Composition API, `<script setup lang="ts">`) |
| **Vuetify 3** | Material Design component library, touch-optimized |
| **Firebase / VueFire** | Real-time data binding |
| **Web Audio API** | Sound effect playback |
| **TypeScript** | Type safety throughout |
| **Vite** | Dev server and build tool |

---

## 🔑 Key Features

- 🎮 **Guest-friendly effect controls** — simplified touch interfaces for visitors of all ages
- 🔊 **Audio and sound triggers** — realistic train sounds and ambient audio via Web Audio API
- 📱 **QR code integration** — visitors scan QR codes to interact with layout features from their phones
- 💡 **Lighting and visual effects** — trigger synchronized lighting scenes

---

## 🏃 Development

```bash
pnpm --filter=deja-tour dev
```

---

## 📦 Package Dependencies

`@repo/modules`, `@repo/ui`, `@repo/dccex`, `@repo/deja`, `@repo/auth`, `@repo/firebase-config`, `@repo/utils`

---

## 📖 Docs

User documentation is available at [dejajs.com/docs](https://dejajs.com/docs).
