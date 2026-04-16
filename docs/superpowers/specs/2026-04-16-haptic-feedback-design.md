# 🎯 Haptic Feedback Across DEJA.js Apps

**Date:** 2026-04-16
**Status:** Approved
**Scope:** `@repo/ui`, `apps/throttle`

---

## Summary

Add haptic tick feedback to interactive controls across the DEJA.js apps. Move `useHaptics` from the throttle app into `@repo/ui` so both throttle and cloud (and future mobile-friendly apps) benefit from tactile feedback on supported devices.

## Motivation

The throttle app already has haptic feedback on button controls and the Dashboard notch view, but the slider-based speed control and all turnout/effect/signal/route interactions have no haptic feedback. Moving haptics to the shared UI package enables consistent tactile feedback across apps.

## Design

### 1. Move `useHaptics` to `@repo/ui`

- **From:** `apps/throttle/src/composables/useHaptics.ts`
- **To:** `packages/ui/src/composables/useHaptics.ts`
- Export from `@repo/ui` package index
- Update existing imports in throttle app:
  - `apps/throttle/src/throttle/Dashboard.vue`
  - `apps/throttle/src/throttle/ThrottleButtonControls.vue`
  - `apps/throttle/src/composables/usePageSwipe.ts`

### 2. Throttle Slider — Tick Feedback

**File:** `apps/throttle/src/throttle/SliderControls.vue`

- Set v-slider `step` to `1`
- Watch for speed value changes during slider interaction
- Fire `vibrate('light')` on each unit change (every tick from 0–126)
- No change to existing debounce behavior for committing speed to Firestore

### 3. Turnouts — Toggle Feedback

**Files:** `packages/ui/src/ModuleList/ItemSwitch.vue`, `ItemButton.vue`, `ItemCard.vue`

- `vibrate('light')` on state toggle (throw/close)

### 4. Effects — Toggle Feedback

**Files:** `packages/ui/src/Effects/EffectButton.vue`, `EffectSwitch.vue`, `EffectCard.vue`

- `vibrate('light')` on state toggle (on/off)

### 5. Signals — Aspect Tap Feedback

**File:** `packages/ui/src/SignalList.vue`

- `vibrate('light')` on aspect button tap (red/yellow/green)

### 6. Routes — Action Feedback

**File:** `apps/throttle/src/routes/Routes.vue`

- `vibrate('medium')` on Run Route (confirming action)
- `vibrate('light')` on map point selection

## Haptic Pattern Convention

| Pattern | Duration | Use for |
|---------|----------|---------|
| `light` | 10ms | Standard taps, toggles, slider ticks |
| `medium` | 25ms | Confirming actions (run route, direction change) |
| `heavy` | 50ms | Warnings, destructive actions, emergency stop |

The `useHaptics` composable checks `navigator.vibrate` support — unsupported devices silently skip all calls.

## Out of Scope

- No new composables or abstractions beyond the move
- No changes to `useThrottle`, Firebase data flow, or debounce timing
- No haptic feedback on search inputs, list filters, or navigation
- No changes to existing haptic calls in `Dashboard.vue` or `ThrottleButtonControls.vue` beyond updating the import path
