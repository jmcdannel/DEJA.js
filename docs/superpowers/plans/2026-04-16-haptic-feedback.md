# 📳 Haptic Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add haptic tick feedback to interactive controls across DEJA.js apps by moving `useHaptics` to `@repo/ui` and wiring it into slider, turnout, effect, signal, and route components.

**Architecture:** Move the existing `useHaptics` composable from `apps/throttle` into `packages/ui/src/composables/` so it's shared across all apps. Then add `vibrate('light')` calls to each interactive component's state-change handler. The composable already handles feature detection — unsupported devices silently skip.

**Tech Stack:** Vue 3, TypeScript, Vuetify 3, Navigator Vibration API

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `packages/ui/src/composables/useHaptics.ts` | Shared haptics composable (moved from throttle) |
| Modify | `packages/ui/src/index.ts` | Export `useHaptics` from package |
| Modify | `packages/ui/package.json` | Add `./composables/useHaptics` export path |
| Delete | `apps/throttle/src/composables/useHaptics.ts` | Remove original (replaced by shared) |
| Modify | `apps/throttle/src/throttle/Dashboard.vue:11` | Update import path |
| Modify | `apps/throttle/src/throttle/ThrottleButtonControls.vue:3` | Update import path |
| Modify | `apps/throttle/src/composables/usePageSwipe.ts:4` | Update import path |
| Modify | `apps/throttle/src/throttle/SliderControls.vue` | Add haptic tick on speed change, ensure step=1 |
| Modify | `packages/ui/src/ModuleList/ItemSwitch.vue` | Add haptic on toggle |
| Modify | `packages/ui/src/ModuleList/ItemButton.vue` | Add haptic on click |
| Modify | `packages/ui/src/ModuleList/ItemCard.vue` | Add haptic on switch toggle |
| Modify | `packages/ui/src/Effects/EffectButton.vue` | Add haptic on click |
| Modify | `packages/ui/src/Effects/EffectSwitch.vue` | Add haptic on toggle |
| Modify | `packages/ui/src/Effects/EffectCard.vue` | Add haptic on toggle |
| Modify | `packages/ui/src/SignalList.vue` | Add haptic on aspect tap |
| Modify | `apps/throttle/src/routes/Routes.vue` | Add haptic on run route + map click |

---

### Task 1: Move `useHaptics` to `@repo/ui`

**Files:**
- Create: `packages/ui/src/composables/useHaptics.ts`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/package.json`
- Delete: `apps/throttle/src/composables/useHaptics.ts`

- [ ] **Step 1: Create the composable in `@repo/ui`**

Create `packages/ui/src/composables/useHaptics.ts` with the exact existing content:

```typescript
const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator

export type HapticPattern = 'light' | 'medium' | 'heavy'

const patterns: Record<HapticPattern, number> = {
  light: 10,
  medium: 25,
  heavy: 50,
}

export function useHaptics() {
  function vibrate(pattern: HapticPattern = 'light') {
    if (!isSupported) return
    try {
      navigator.vibrate(patterns[pattern])
    } catch {
      // Silently fail on unsupported devices
    }
  }

  function vibrateRaw(ms: number) {
    if (!isSupported) return
    try {
      navigator.vibrate(ms)
    } catch {
      // no-op
    }
  }

  return {
    isSupported,
    vibrate,
    vibrateRaw,
  }
}
```

- [ ] **Step 2: Export from `packages/ui/src/index.ts`**

Add this line after the existing composable exports (after line 109 — `export { useListControls }`):

```typescript
export { useHaptics } from './composables/useHaptics'
export type { HapticPattern } from './composables/useHaptics'
```

- [ ] **Step 3: Add export path to `packages/ui/package.json`**

Add to the `"exports"` object:

```json
"./composables/useHaptics": "./src/composables/useHaptics.ts"
```

- [ ] **Step 4: Delete the original file**

Delete `apps/throttle/src/composables/useHaptics.ts`.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/composables/useHaptics.ts packages/ui/src/index.ts packages/ui/package.json
git rm apps/throttle/src/composables/useHaptics.ts
git commit -m "📳 refactor: move useHaptics composable to @repo/ui"
```

---

### Task 2: Update throttle app imports

**Files:**
- Modify: `apps/throttle/src/throttle/Dashboard.vue:11`
- Modify: `apps/throttle/src/throttle/ThrottleButtonControls.vue:3`
- Modify: `apps/throttle/src/composables/usePageSwipe.ts:4`

- [ ] **Step 1: Update `Dashboard.vue` import**

Change line 11 from:
```typescript
import { useHaptics } from '@/composables/useHaptics'
```
to:
```typescript
import { useHaptics } from '@repo/ui'
```

- [ ] **Step 2: Update `ThrottleButtonControls.vue` import**

Change line 3 from:
```typescript
import { useHaptics } from '@/composables/useHaptics'
```
to:
```typescript
import { useHaptics } from '@repo/ui'
```

- [ ] **Step 3: Update `usePageSwipe.ts` import**

Change line 4 from:
```typescript
import { useHaptics } from './useHaptics'
```
to:
```typescript
import { useHaptics } from '@repo/ui'
```

- [ ] **Step 4: Verify type-check passes**

```bash
pnpm --filter=deja-throttle exec vue-tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add apps/throttle/src/throttle/Dashboard.vue apps/throttle/src/throttle/ThrottleButtonControls.vue apps/throttle/src/composables/usePageSwipe.ts
git commit -m "📳 refactor: update throttle haptics imports to @repo/ui"
```

---

### Task 3: Add haptic tick to throttle slider

**Files:**
- Modify: `apps/throttle/src/throttle/SliderControls.vue`

- [ ] **Step 1: Add import and watcher**

In the `<script setup>` block, add the import alongside the existing imports (after line 3):

```typescript
import { useHaptics } from '@repo/ui'
```

After the `const log` line (line 6), add:

```typescript
const { vibrate } = useHaptics()
```

After the `sliderModel` computed (after line 177), add a watcher that fires haptic on each tick:

```typescript
watch(sliderModel, () => {
  vibrate('light')
})
```

- [ ] **Step 2: Verify the v-slider already has `step="1"`**

The slider at line 208 already has `step="1"` — confirm it's present. No change needed.

- [ ] **Step 3: Commit**

```bash
git add apps/throttle/src/throttle/SliderControls.vue
git commit -m "📳 feat: add haptic tick feedback on throttle slider"
```

---

### Task 4: Add haptic feedback to turnout components (ModuleList)

**Files:**
- Modify: `packages/ui/src/ModuleList/ItemSwitch.vue`
- Modify: `packages/ui/src/ModuleList/ItemButton.vue`
- Modify: `packages/ui/src/ModuleList/ItemCard.vue`

- [ ] **Step 1: Add haptics to `ItemSwitch.vue`**

Add import after line 2 (`import type { DocumentData } from 'firebase/firestore'`):

```typescript
import { useHaptics } from '../composables/useHaptics'
```

Add after `const accent` (after line 14):

```typescript
const { vibrate } = useHaptics()
```

Add a watcher on state to fire haptic:

```typescript
import { computed, watch } from 'vue'
```

(Update the existing `import { computed } from 'vue'` on line 1 to include `watch`.)

Then add after `const { vibrate } = useHaptics()`:

```typescript
watch(state, () => {
  vibrate('light')
})
```

- [ ] **Step 2: Add haptics to `ItemButton.vue`**

Add import after line 1 (`import type { DocumentData } from 'firebase/firestore'`):

```typescript
import { useHaptics } from '../composables/useHaptics'
```

Add after `const state = defineModel(...)` (after line 11):

```typescript
const { vibrate } = useHaptics()
```

In the template, change line 22:

From:
```html
@click="state = !state"
```
To:
```html
@click="state = !state; vibrate('light')"
```

- [ ] **Step 3: Add haptics to `ItemCard.vue`**

Add import after line 2 (`import type { DocumentData } from 'firebase/firestore'`):

```typescript
import { useHaptics } from '../composables/useHaptics'
```

Add after `const state = defineModel(...)` (after line 17):

```typescript
const { vibrate } = useHaptics()
```

Add a watcher (add `watch` to the vue import on line 1):

```typescript
import { computed, watch } from 'vue'
```

Then after `const { vibrate } = useHaptics()`:

```typescript
watch(state, () => {
  vibrate('light')
})
```

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/ModuleList/ItemSwitch.vue packages/ui/src/ModuleList/ItemButton.vue packages/ui/src/ModuleList/ItemCard.vue
git commit -m "📳 feat: add haptic feedback to turnout toggle controls"
```

---

### Task 5: Add haptic feedback to effect components

**Files:**
- Modify: `packages/ui/src/Effects/EffectButton.vue`
- Modify: `packages/ui/src/Effects/EffectSwitch.vue`
- Modify: `packages/ui/src/Effects/EffectCard.vue`

- [ ] **Step 1: Add haptics to `EffectButton.vue`**

Add import after line 3 (`import { useEfx, efxTypes, type Effect } from '@repo/modules'`):

```typescript
import { useHaptics } from '../composables/useHaptics'
```

Add after `const state = defineModel(...)` (after line 15):

```typescript
const { vibrate } = useHaptics()
```

In the template, change line 28:

From:
```html
@click="state = !state"
```
To:
```html
@click="state = !state; vibrate('light')"
```

- [ ] **Step 2: Add haptics to `EffectSwitch.vue`**

Add import after line 3 (`import { useEfx, efxTypes, type Effect } from '@repo/modules'`):

```typescript
import { useHaptics } from '../composables/useHaptics'
```

Add `watch` to the vue import on line 1:

```typescript
import { ref, computed, watch } from 'vue'
```

Add after `const state = defineModel(...)` (after line 15):

```typescript
const { vibrate } = useHaptics()

watch(state, () => {
  vibrate('light')
})
```

- [ ] **Step 3: Add haptics to `EffectCard.vue`**

Add import after line 3 (`import { efxTypes, type Effect } from '@repo/modules'`):

```typescript
import { useHaptics } from '../composables/useHaptics'
```

Add `watch` to the vue import on line 1:

```typescript
import { computed, watch } from 'vue'
```

Add after `const state = defineModel(...)` (after line 17):

```typescript
const { vibrate } = useHaptics()

watch(state, () => {
  vibrate('light')
})
```

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/Effects/EffectButton.vue packages/ui/src/Effects/EffectSwitch.vue packages/ui/src/Effects/EffectCard.vue
git commit -m "📳 feat: add haptic feedback to effect toggle controls"
```

---

### Task 6: Add haptic feedback to signal aspect buttons

**Files:**
- Modify: `packages/ui/src/SignalList.vue`

- [ ] **Step 1: Add haptics to `SignalList.vue`**

Add import after line 3 (`import { useSignals, type Signal, type SignalAspect } from '@repo/modules/signals'`):

```typescript
import { useHaptics } from './composables/useHaptics'
```

Add after the `const layout = getLayout()` line (after line 15):

```typescript
const { vibrate } = useHaptics()
```

In the `toggleAspect` function (line 67), add the vibrate call at the top of the function body:

```typescript
async function toggleAspect(signal: Signal, aspect: Exclude<SignalAspect, null>) {
  if (!canToggle(signal, aspect)) return
  vibrate('light')
  const nextAspect: SignalAspect = signal.aspect === aspect ? null : aspect
  await setSignalAspect(signal.id, nextAspect)
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/SignalList.vue
git commit -m "📳 feat: add haptic feedback to signal aspect buttons"
```

---

### Task 7: Add haptic feedback to route controls

**Files:**
- Modify: `apps/throttle/src/routes/Routes.vue`

- [ ] **Step 1: Add haptics import and setup**

Add import after line 6 (`import { PageHeader } from '@repo/ui'`):

```typescript
import { useHaptics } from '@repo/ui'
```

Add after the destructuring of `useLayoutRoutesMap()` (after line 23):

```typescript
const { vibrate } = useHaptics()
```

- [ ] **Step 2: Add haptic to map tab buttons**

On line 37, change the map tab `@click`:

From:
```html
@click="activeMap = map"
```
To:
```html
@click="activeMap = map; vibrate('light')"
```

On line 44, change the Routes List button `@click`:

From:
```html
@click="activeMap = 'RoutesList'"
```
To:
```html
@click="activeMap = 'RoutesList'; vibrate('light')"
```

- [ ] **Step 3: Add haptic to point selection chips**

On line 57, change the p1 chip `@click`:

From:
```html
@click="p1 = undefined"
```
To:
```html
@click="p1 = undefined; vibrate('light')"
```

On line 109, change the p2 chip `@click`:

From:
```html
@click="p2 = undefined"
```
To:
```html
@click="p2 = undefined; vibrate('light')"
```

- [ ] **Step 4: Add haptic to Run Route button**

On line 160, change the Run button `@click`:

From:
```html
@click="runRoute(r)"
```
To:
```html
@click="runRoute(r); vibrate('medium')"
```

- [ ] **Step 5: Add haptic to map click handler**

In the `<script setup>`, wrap `handleMapClick` with haptic feedback. Add after `const { vibrate } = useHaptics()`:

```typescript
const handleMapClickWithHaptic = (event: Event) => {
  vibrate('light')
  handleMapClick(event)
}
```

Then update the template map click handlers:

On line 128 (`TamarackJunction`), change:
```html
@click="handleMapClick"
```
To:
```html
@click="handleMapClickWithHaptic"
```

On line 130 (`PayetteSub`), change:
```html
@click="handleMapClick"
```
To:
```html
@click="handleMapClickWithHaptic"
```

- [ ] **Step 6: Commit**

```bash
git add apps/throttle/src/routes/Routes.vue
git commit -m "📳 feat: add haptic feedback to route controls"
```

---

### Task 8: Final verification

- [ ] **Step 1: Run type-check across monorepo**

```bash
pnpm check-types
```

Expected: No errors.

- [ ] **Step 2: Run lint**

```bash
pnpm lint
```

Expected: No errors (or only pre-existing ones).

- [ ] **Step 3: Verify no remaining references to old haptics path**

```bash
grep -r "composables/useHaptics" apps/throttle/src/
```

Expected: No results (all imports now point to `@repo/ui`).
