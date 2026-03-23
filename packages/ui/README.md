# 🎨 @repo/ui -- Shared Vue Components

A library of reusable Vue 3 components shared across all frontend apps. Provides a consistent UI layer for locomotive controls, turnout management, effects, signals, and layout utilities.

> 📐 See [ARCHITECTURE.md](../../ARCHITECTURE.md) for the frontend stack and how apps consume shared packages.

## 📦 Installation

```typescript
import { LocoAvatar, TurnoutList, TrackPower } from '@repo/ui'
```

## 🧩 Components

| Component | Description |
|-----------|-------------|
| `AppHeader` | 📱 Application header bar |
| `LocoAvatar` | 🚂 Locomotive image/icon display |
| `Consist` | 🚃 Multi-locomotive consist display |
| `EditConsist` | ✏️ Editable consist configuration |
| `MiniConsist` | 🔹 Compact consist display |
| `Functions` | 🎛️ Locomotive function button grid |
| `FunctionList` | 📋 Function list display |
| `FunctionsSpeedDial` | ⚡ Speed dial for quick function access |
| `TurnoutList` | 🔀 List of turnouts with state indicators |
| `TurnoutItem` | 🔀 Single turnout list item |
| `TurnoutSwitch` | 🔀 Toggle switch for turnout control |
| `TurnoutCard` | 🔀 Card-style turnout display |
| `TurnoutButton` | 🔀 Button for throwing/closing turnouts |
| `TurnoutRaw` | 🔀 Raw turnout data display |
| `TurnoutTable` | 🔀 Table view of turnouts |
| `TurnoutLabels` | 🏷️ Printable turnout label generator |
| `EffectList` | ✨ List of effects with state indicators |
| `EffectItem` | ✨ Single effect list item |
| `EffectSwitch` | ✨ Toggle switch for effect control |
| `EffectCard` | ✨ Card-style effect display |
| `EffectButton` | ✨ Button for activating/deactivating effects |
| `EffectRaw` | ✨ Raw effect data display |
| `EffectTable` | ✨ Table view of effects |
| `GuestEffectCard` | 🎭 Guest-friendly effect card (used in Tour app) |
| `TrackPower` | 🔋 Track power on/off control |
| `SignalList` | 🚦 Signal state display list |
| `SelectLayout` | 🗺️ Layout selection dropdown |
| `LayoutChip` | 🏷️ Compact layout identifier chip |
| `UserProfile` | 👤 User profile display |
| `SignOut` | 🚪 Sign out button |
| `ViewJson` | 🔍 JSON data viewer for debugging |
| `ListMenu` | 📋 Generic list menu component |
| `DeviceStatusItem` | 🔌 Single device connection status |
| `DeviceStatusList` | 📡 List of device statuses |
| `EmptyState` | 📭 Empty state placeholder |
| `ModuleList` | 📦 Generic module list |
| `LocoList` | 🚂 Locomotive roster list |
| `Menu` | ☰ Application navigation menu |
| `Stat` | 📊 Statistics display card |
| `BackgroundDecor` | 🎨 Decorative background element |
| `BackgroundFallingStars` | ⭐ Animated falling stars background |
| `NotificationContainer` | 🔔 Toast notification container |

## 🎬 Animation Utilities

The `@repo/ui` package also exports animation utilities from `@repo/ui/animations`:

- `DURATION`, `EASING`, `SPRING`, `GLOW` -- ⏱️ Animation timing constants.
- `presets` -- 🎯 Named animation presets.
- `useReducedMotion` -- ♿ Composable that respects the user's reduced motion preference.
- `StatusPulse` -- 💫 Pulsing status indicator component.
- `TransitionFade` -- 🌅 Fade transition wrapper.
- `TransitionSlide` -- ➡️ Slide transition wrapper.
- `TransitionExpand` -- 📏 Expand/collapse transition wrapper.
- `TransitionList` -- 📋 List transition wrapper for animated lists.

## 🔧 Composables

- `useColors()` -- 🎨 Returns color utilities for consistent theming.
- `useNotification()` / `provideNotifications()` -- 🔔 Toast notification system.
