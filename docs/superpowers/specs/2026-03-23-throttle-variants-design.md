# Throttle UI Variants — Design Spec

**Date:** 2026-03-23
**Status:** Approved
**Scope:** DEJA.js Throttle App (`apps/throttle/`)

## Overview

Add a system-wide setting that lets users choose which throttle UI they use: **Buttons**, **Slider**, or **ProtoThrottle**. Each variant is a full layout component that composes shared building blocks. Users can also toggle optional sections (functions panel, speedometer, consist info).

## Requirements

- Three throttle variants: buttons, slider, protothrottle
- System-wide setting persisted in Firebase (Firestore `users/{uid}` document)
- localStorage cache for offline/fast access (existing pattern via `useUserPreferences`)
- Configurable optional sections: functions panel, speedometer, consist info
- All variants must render well on mobile
- Remove the unused "Speed Steps" setting
- Speedometer component visible on desktop; on mobile only when space permits

## Architecture

### Variant-as-Layout

Each variant owns its entire layout. Shared logic lives in composables and shared display components.

```
ThrottleView.vue
  └─ useThrottleSettings() → { variant, showFunctions, showSpeedometer, showConsist }
  └─ <component :is="variantMap[variant]" v-bind="settingsProps" />
       ├─ ButtonsThrottle.vue
       ├─ SliderThrottle.vue
       └─ ProtoThrottle.vue
```

### Props Interface

All variants receive the same props:

```ts
interface ThrottleVariantProps {
  address: number
  showFunctions: boolean
  showSpeedometer: boolean
  showConsist: boolean
}
```

Each variant uses `useThrottle(address)` internally for speed/direction/loco state.

## Settings Storage

### Firestore Document Shape

Extends the existing `users/{uid}` document used by `useUserPreferences()`:

```
users/{uid}
├── backgrounds: { ... }              // existing, untouched
├── throttleSettings:
│   ├── variant: "buttons"            // "buttons" | "slider" | "protothrottle"
│   ├── showFunctions: true           // boolean
│   ├── showSpeedometer: true         // boolean
│   └── showConsist: true             // boolean
└── updatedAt: Timestamp
```

### Type Changes

Extend `UserPreferences` interface in `packages/modules/preferences/types.ts`:

```ts
export type ThrottleVariant = 'buttons' | 'slider' | 'protothrottle'

export interface ThrottleSettings {
  variant: ThrottleVariant
  showFunctions: boolean
  showSpeedometer: boolean
  showConsist: boolean
}

export interface UserPreferences {
  backgrounds: {
    [appName: string]: AppBackgroundPrefs
  }
  throttleSettings?: ThrottleSettings
}
```

### `useThrottleSettings()` Composable

Thin wrapper over `useUserPreferences()`:

- Calls `getPreference('throttleSettings', defaults)` for reactive read
- Exposes: `variant`, `showFunctions`, `showSpeedometer`, `showConsist` as computed refs
- Provides setter functions that call `setPreference('throttleSettings', ...)`
- Follows same optimistic update pattern as backgrounds (immediate localStorage, async Firestore)

**Defaults:**
- `variant`: `'buttons'`
- `showFunctions`: `true`
- `showSpeedometer`: `true`
- `showConsist`: `true`

**Location:** `apps/throttle/src/throttle/useThrottleSettings.ts`

## Variant Layouts

### Shared Components (used by all variants)

- `useThrottle(address)` — speed, direction, loco, stop, adjustSpeed, setSpeed
- `ThrottleHeader` — loco name, avatar, roadname logo, park action
- `Speedometer` — SVG gauge with animated needle (when `showSpeedometer` is true)
- `FunctionsSpeedDial` — DCC function buttons F0-F28 (when `showFunctions` is true)
- `Consist` — coupled locomotive info (when `showConsist` is true)

### ButtonsThrottle.vue

Refactored from existing `Throttle.vue`. No design changes to `ThrottleButtonControls` itself.

**Desktop layout:**
- Left: `Speedometer` (conditional)
- Center: `Consist`, `RoadnameLogo`, `FunctionsSpeedDial` (each conditional)
- Right: `CurrentSpeed` display + `ThrottleButtonControls`

**Mobile layout:**
- `CurrentSpeed` + `ThrottleButtonControls` stacked vertically
- Optional sections (`Consist`, `FunctionsSpeedDial`) below controls
- `Speedometer` shown only if sufficient viewport height

### SliderThrottle.vue

New layout component using existing `SliderControls`.

**Desktop layout:**
- Left: `Speedometer` (conditional)
- Center: `SliderControls` (speed, direction, brake sliders)
- Right: loco info + `FunctionsSpeedDial` (conditional)

**Mobile layout:**
- `SliderControls` adapted for full-width horizontal or stacked vertical
- Polish pass on alignment within `SliderControls`
- Optional sections below

### ProtoThrottle.vue

New skeuomorphic component replicating the Iowa Scaled Engineering ProtoThrottle physical device.

**Controls (all must-have for V1):**
- **LCD screen** — monospace green-on-dark showing speed, direction, loco address/name
- **Throttle notch** — 8 positions + IDLE (vertical slider or draggable handle)
- **Reverser** — FWD/REV toggle (styled as lever)
- **Horn** — press-and-hold button (maps to DCC function, typically F2)
- **Bell** — toggle button (maps to DCC function, typically F1)
- **Brake** — vertical slider or draggable handle (0-10 range)
- **Up/Down buttons** — speed fine-tune / menu navigation
- **Menu/Select buttons** — future loco selection within throttle
- **Front/Rear headlight switches** — rotary knobs (OFF/DIM/BRT/DITCH LTS, maps to F0 + lighting functions)
- **Status light** — green dot showing connection status
- **Auxiliary button** — maps to configurable DCC function

**Layout approach:**
- Portrait-oriented (natural phone form factor)
- Mobile-first — the physical device shape maps perfectly to phone screens
- On desktop, centers with appropriate max-width
- Skeuomorphic styling: dark blue-gray body, inset LCD, tactile-looking buttons and knobs

**Functions integration:**
- ProtoThrottle maps DCC functions directly to its physical controls (horn=F2, bell=F1, headlights=F0)
- When `showFunctions` is true, `FunctionsSpeedDial` appears below the device body for F3+ access
- `showSpeedometer` has no effect on ProtoThrottle (LCD screen serves as speed display)

## Settings UI

### SettingsView.vue Changes

Replace the "Speed Steps" row in the Throttle section with:

**Row 1 — Throttle Type:**
- Label: "Throttle Type" / "Choose your preferred throttle control style"
- Control: `v-btn-toggle` (3 options, same pattern as theme picker)
- Options: Buttons (`mdi-gesture-tap-button`) | Slider (`mdi-tune-vertical`) | ProtoThrottle (`mdi-train`)

**Row 2 — Functions Panel:**
- Label: "Functions Panel" / "Show DCC function buttons (F0-F28)"
- Control: `v-switch`

**Row 3 — Speedometer:**
- Label: "Speedometer" / "Show speed gauge on desktop, auto-hide on small screens"
- Control: `v-switch`

**Row 4 — Consist Info:**
- Label: "Consist Info" / "Show coupled locomotive information"
- Control: `v-switch`

All changes save immediately via `setPreference()` (optimistic update, no save button). Matches existing theme picker UX.

## File Changes Summary

### Modified Files
- `packages/modules/preferences/types.ts` — add `ThrottleSettings`, `ThrottleVariant` types
- `apps/throttle/src/views/ThrottleView.vue` — dynamic component based on variant setting
- `apps/throttle/src/views/SettingsView.vue` — replace Speed Steps with variant picker + toggles; remove `speedSteps` ref and options
- `apps/throttle/src/throttle/SliderControls.vue` — polish pass, better alignment, mobile support

### New Files
- `apps/throttle/src/throttle/useThrottleSettings.ts` — thin wrapper over `useUserPreferences`
- `apps/throttle/src/throttle/ButtonsThrottle.vue` — refactored from `Throttle.vue`
- `apps/throttle/src/throttle/SliderThrottle.vue` — new slider-primary layout
- `apps/throttle/src/throttle/ProtoThrottle.vue` — new skeuomorphic layout

### Deprecated/Removed
- `apps/throttle/src/throttle/Throttle.vue` — replaced by `ButtonsThrottle.vue`
- Speed Steps setting (ref + options in SettingsView.vue)

## Testing

- Verify all three variants render correctly on mobile (375px) and desktop (1280px+)
- Verify settings persist across page reloads (localStorage cache)
- Verify settings sync to Firestore when authenticated
- Verify settings load from Firestore on fresh login (no localStorage)
- Verify default variant (buttons) loads when no setting exists
- Verify `ThrottleView` swipe navigation works with all variants
- Verify optional sections (functions, speedometer, consist) toggle on/off correctly
- ProtoThrottle: verify all controls map to correct DCC functions
