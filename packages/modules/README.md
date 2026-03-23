# 🧠 @repo/modules -- Core Business Logic

The central package for domain-specific composables and types. All shared business logic for locomotives, turnouts, effects, signals, routes, and layouts lives here, organized by feature domain.

> 📐 See [ARCHITECTURE.md](../../ARCHITECTURE.md) for how this package fits into the overall system.

```typescript
import { useLocos, useTurnouts, useEfx, useSignals, useLayout, useRoutes } from '@repo/modules'
```

## 🔧 Composables

### `useLocos()`

🚂 Locomotive management. Returns functions for reading and managing the locomotive roster.

- `getThrottles()` -- Returns reactive throttle data from Firestore.

### `useFunctions()`

🎛️ Locomotive function management (headlights, horns, bells, etc.).

### `useFunctionIcon()`

🎨 Maps DCC function numbers to Material Design icon names for UI rendering.

### `useTurnouts()`

🔀 Turnout state management.

- `getTurnouts()` -- Returns reactive turnout collection from Firestore.

### `useEfx()`

✨ Effect management for lights, sounds, animations, and relays.

- `getEffects()` -- Returns reactive effects collection from Firestore.
- `getGuestEffects()` -- Returns only guest-accessible effects (used by the Tour app).

### `useSignals()`

🚦 Signal state management.

- `getSignals()` -- Returns reactive signal collection from Firestore.

### `useLayout()`

🗺️ Layout configuration and device management.

- `getLayout()` -- Returns reactive layout document from Firestore.
- `getDevices()` -- Returns reactive devices collection from Firestore.

### `useRoutes()`

🛤️ Route preset management for saved turnout configurations.

### `useLayoutRoutes()`

🗺️🛤️ Layout-specific route management that ties routes to the current layout.

## 📘 Exported Types

Each domain exports its TypeScript types and interfaces:

| Module | Exports |
|--------|---------|
| `effects/types` | ✨ Effect interfaces and enums |
| `effects/constants` | ✨ Effect category constants |
| `layouts/types` | 🗺️ Layout, device, and configuration interfaces |
| `layouts/constants` | 🗺️ Layout-related constants |
| `locos/types` | 🚂 Locomotive, throttle, and function interfaces |
| `locos/constants` | 🚂 Loco-related constants |
| `turnouts/types` | 🔀 Turnout state interfaces |
| `signals/types` | 🚦 Signal state interfaces |
| `routes/types` | 🛤️ Route and route step interfaces |
| `routes/constants` | 🛤️ Route-related constants |

## 🗂️ Directory Structure

```
packages/modules/
├── effects/     ✨ useEfx, effect types & constants
├── layouts/     🗺️ useLayout, layout types & constants
├── locos/       🚂 useLocos, useFunctions, useFunctionIcon, loco types
├── routes/      🛤️ useLayoutRoutes, useRoutes, route types
├── signals/     🚦 useSignals, signal types
└── turnouts/    🔀 useTurnouts, turnout types
```
