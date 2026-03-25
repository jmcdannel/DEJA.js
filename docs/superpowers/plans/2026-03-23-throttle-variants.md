# Throttle UI Variants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users choose between Buttons, Slider, or ProtoThrottle UI variants via a system-wide setting persisted in Firebase, with toggleable optional sections (functions, speedometer, consist).

**Architecture:** Each variant is a standalone layout component receiving shared props. A thin `useThrottleSettings()` composable wraps the existing `useUserPreferences()` Firestore/localStorage pattern. `ThrottleView.vue` dynamically renders the selected variant via `<component :is>`.

**Tech Stack:** Vue 3 Composition API, Vuetify 3, Tailwind CSS, Firebase Firestore, VueUse, Vuefire, Vitest

**Spec:** `docs/superpowers/specs/2026-03-23-throttle-variants-design.md`

**Monorepo root:** `/Users/jmcdannel/TTT/worktrees/main`
**Throttle app:** `/Users/jmcdannel/TTT/worktrees/main/apps/throttle`

---

## File Map

### New Files
| File | Responsibility |
|------|---------------|
| `apps/throttle/src/throttle/useThrottleSettings.ts` | Thin wrapper over `useUserPreferences` for throttle-specific settings |
| `apps/throttle/src/throttle/ButtonsThrottle.vue` | Buttons variant layout (refactored from `Throttle.vue`) |
| `apps/throttle/src/throttle/SliderThrottle.vue` | Slider variant layout |
| `apps/throttle/src/throttle/ProtoThrottle.vue` | ProtoThrottle skeuomorphic variant layout |

### Modified Files
| File | Change |
|------|--------|
| `packages/modules/preferences/types.ts` | Add `ThrottleVariant` type and `ThrottleSettings` interface |
| `apps/throttle/src/views/ThrottleView.vue` | Dynamic component based on variant setting |
| `apps/throttle/src/views/SettingsView.vue` | Replace Speed Steps with variant picker + section toggles |

### Removed
| File | Reason |
|------|--------|
| `apps/throttle/src/throttle/Throttle.vue` | Replaced by `ButtonsThrottle.vue` |
| `apps/throttle/src/throttle/SimpleThrottle.vue` | Replaced by `ButtonsThrottle.vue` (mobile-responsive) |

---

## Task 1: Extend UserPreferences Types

**Files:**
- Modify: `packages/modules/preferences/types.ts`

- [ ] **Step 1: Add throttle settings types**

In `packages/modules/preferences/types.ts`, add the `ThrottleVariant` type and `ThrottleSettings` interface, then add the optional `throttleSettings` field to `UserPreferences`:

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

Keep the existing `AppBackgroundPrefs` interface unchanged.

- [ ] **Step 2: Verify build**

Run: `cd /Users/jmcdannel/TTT/worktrees/main && pnpm --filter throttle build`
Expected: Build succeeds with no type errors.

- [ ] **Step 3: Commit**

```bash
git add packages/modules/preferences/types.ts
git commit -m "feat(modules): add ThrottleVariant and ThrottleSettings types to UserPreferences"
```

---

## Task 2: Create useThrottleSettings Composable

**Files:**
- Create: `apps/throttle/src/throttle/useThrottleSettings.ts`

- [ ] **Step 1: Create the composable**

Create `apps/throttle/src/throttle/useThrottleSettings.ts`:

```ts
import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { useUserPreferences, type ThrottleSettings, type ThrottleVariant } from '@repo/modules'

const DEFAULTS: ThrottleSettings = {
  variant: 'buttons',
  showFunctions: true,
  showSpeedometer: true,
  showConsist: true,
}

export function useThrottleSettings() {
  const { getPreference, setPreference } = useUserPreferences()

  const settings: ComputedRef<ThrottleSettings> = getPreference('throttleSettings', DEFAULTS)

  const variant = computed(() => settings.value.variant)
  const showFunctions = computed(() => settings.value.showFunctions)
  const showSpeedometer = computed(() => settings.value.showSpeedometer)
  const showConsist = computed(() => settings.value.showConsist)

  async function setVariant(value: ThrottleVariant) {
    await setPreference('throttleSettings', { ...settings.value, variant: value })
  }

  async function setShowFunctions(value: boolean) {
    await setPreference('throttleSettings', { ...settings.value, showFunctions: value })
  }

  async function setShowSpeedometer(value: boolean) {
    await setPreference('throttleSettings', { ...settings.value, showSpeedometer: value })
  }

  async function setShowConsist(value: boolean) {
    await setPreference('throttleSettings', { ...settings.value, showConsist: value })
  }

  return {
    variant,
    showFunctions,
    showSpeedometer,
    showConsist,
    setVariant,
    setShowFunctions,
    setShowSpeedometer,
    setShowConsist,
  }
}

export default useThrottleSettings
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/jmcdannel/TTT/worktrees/main && pnpm --filter throttle build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add apps/throttle/src/throttle/useThrottleSettings.ts
git commit -m "feat(throttle): add useThrottleSettings composable"
```

---

## Task 3: Create ButtonsThrottle Variant

**Files:**
- Create: `apps/throttle/src/throttle/ButtonsThrottle.vue`
- Reference: `apps/throttle/src/throttle/Throttle.vue` (source for refactoring)

This is a refactor of the existing `Throttle.vue`. The key changes:
1. Accept `showFunctions`, `showSpeedometer`, `showConsist` props
2. Remove the slider column (left column in current layout)
3. Add `Speedometer` to the layout (conditional on `showSpeedometer`)
4. Make `Consist` and `FunctionsSpeedDial` conditional
5. Ensure mobile responsiveness (no hidden sections — everything flows vertically on mobile)

- [ ] **Step 1: Create ButtonsThrottle.vue**

Create `apps/throttle/src/throttle/ButtonsThrottle.vue`. Base it on the existing `Throttle.vue` structure but:

- Remove `SliderControls` import and usage entirely
- Add props: `showFunctions: Boolean`, `showSpeedometer: Boolean`, `showConsist: Boolean`
- Add `Speedometer` component: show on desktop when `showSpeedometer` is true, hide on small mobile screens
- Wrap `Consist` section in `v-if="showConsist"`
- Wrap `FunctionsSpeedDial` section in `v-if="showFunctions"`
- Keep `ThrottleHeader`, `ThrottleButtonControls`, `CurrentSpeed`, `RoadnameLogo`, `LocoAvatar`, `MiniConsist`, `ThrottleActionMenu` as-is

Desktop layout (2 columns instead of 3):
- Left: `Speedometer` (conditional) + `Consist` (conditional) + `RoadnameLogo` + `FunctionsSpeedDial` (conditional)
- Right: `CurrentSpeed` + `ThrottleButtonControls`

Mobile layout (single column):
- `CurrentSpeed` + `ThrottleButtonControls` stacked
- Optional sections below

```vue
<script setup lang="ts">
import { toRef } from 'vue'
import { useRouter } from 'vue-router'
import type { Loco } from '@repo/modules/locos'
import ThrottleButtonControls from '@/throttle/ThrottleButtonControls.vue'
import CurrentSpeed from '@/throttle/CurrentSpeed.vue'
import Speedometer from '@/throttle/Speedometer.vue'
import ThrottleHeader from '@/throttle/ThrottleHeader.vue'
import ThrottleActionMenu from '@/throttle/ThrottleActionMenu.vue'
import RoadnameLogo from '@/throttle/RoadnameLogo.vue'
import { Consist, LocoAvatar, MiniConsist, FunctionsSpeedDial } from '@repo/ui'
import { useThrottle } from '@/throttle/useThrottle'

const props = defineProps({
  address: { type: Number, required: true },
  showFunctions: { type: Boolean, default: true },
  showSpeedometer: { type: Boolean, default: true },
  showConsist: { type: Boolean, default: true },
})

const address = toRef(props, 'address')
const {
  adjustSpeed: handleAdjustSpeed,
  currentSpeed,
  setSpeed,
  loco,
  releaseThrottle,
  stop: handleStop,
  throttle,
} = useThrottle(address)

const $router = useRouter()

async function clearLoco() {
  handleStop()
  releaseThrottle()
  $router.push({ name: 'throttle-list' })
}
</script>

<template>
  <main v-if="throttle" class="flex flex-col gap-2 p-2 overflow-hidden w-full h-full flex-1 shadow-xl relative">
    <ThrottleHeader class="bg-gradient-to-r from-purple-300/10 to-pink-600/10 text-purple-400/10">
      <template v-slot:left>
        <div class="flex flex-row items-center justify-center gap-1 px-4 bg-gray-900">
          <LocoAvatar v-if="loco" :loco="loco as Loco" :size="48" @park="clearLoco" @stop="handleStop" variant="flat" />
          <MiniConsist v-if="loco" :loco="loco" />
          <v-spacer class="w-2 md:w-6" />
          <h1 class="text-xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 drop-shadow-lg">
            {{ loco?.name }}
          </h1>
          <v-spacer class="w-2 md:w-6" />
          <RoadnameLogo class="hidden sm:flex" v-if="loco" :roadname="loco.meta?.roadname" size="md" />
        </div>
      </template>
      <template v-slot:right>
        <ThrottleActionMenu @park="clearLoco" />
      </template>
    </ThrottleHeader>

    <section class="w-full h-full flex flex-col sm:flex-row justify-around flex-grow relative z-10">
      <!-- Left column: Speedometer + loco info (desktop) -->
      <section v-if="loco" class="hidden sm:flex flex-col gap-2 mb-2 items-center justify-between flex-1">
        <Speedometer v-if="showSpeedometer" :speed="currentSpeed" :address="address" :size="160" />
        <Consist v-if="showConsist" :loco="loco" />
        <v-spacer />
        <RoadnameLogo :roadname="loco.meta?.roadname" size="xl" />
        <v-spacer />
        <FunctionsSpeedDial v-if="showFunctions" :loco="loco" />
      </section>

      <!-- Right column: Speed display + buttons -->
      <section class="flex flex-col gap-2 mb-2 items-center justify-between flex-1">
        <CurrentSpeed :speed="currentSpeed" />
        <ThrottleButtonControls @update:currentSpeed="handleAdjustSpeed" @stop="handleStop" />
      </section>

      <!-- Mobile-only optional sections -->
      <section v-if="loco" class="flex sm:hidden flex-col gap-2 items-center">
        <FunctionsSpeedDial v-if="showFunctions" :loco="loco" />
      </section>
    </section>
  </main>

  <main v-else>
    <div class="flex flex-col items-center justify-center h-full w-full gap-4">
      <h2 class="text-2xl font-bold text-gray-700">No Throttle Assigned</h2>
      <v-btn color="pink" variant="outlined" @click="$router.push({ name: 'throttle-list' })">
        Go to Throttle List
      </v-btn>
    </div>
  </main>
</template>
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/jmcdannel/TTT/worktrees/main && pnpm --filter throttle build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add apps/throttle/src/throttle/ButtonsThrottle.vue
git commit -m "feat(throttle): add ButtonsThrottle variant layout"
```

---

## Task 4: Create SliderThrottle Variant

**Files:**
- Create: `apps/throttle/src/throttle/SliderThrottle.vue`
- Reference: `apps/throttle/src/throttle/SliderControls.vue` (used as primary control)

- [ ] **Step 1: Create SliderThrottle.vue**

Create `apps/throttle/src/throttle/SliderThrottle.vue`. Layout:

Desktop: `Speedometer` (conditional, left) | `SliderControls` (center) | loco info + functions (right)
Mobile: `SliderControls` full-width, optional sections below.

```vue
<script setup lang="ts">
import { toRef } from 'vue'
import { useRouter } from 'vue-router'
import type { Loco } from '@repo/modules/locos'
import SliderControls from '@/throttle/SliderControls.vue'
import Speedometer from '@/throttle/Speedometer.vue'
import ThrottleHeader from '@/throttle/ThrottleHeader.vue'
import ThrottleActionMenu from '@/throttle/ThrottleActionMenu.vue'
import RoadnameLogo from '@/throttle/RoadnameLogo.vue'
import { Consist, LocoAvatar, MiniConsist, FunctionsSpeedDial } from '@repo/ui'
import { useThrottle } from '@/throttle/useThrottle'

const props = defineProps({
  address: { type: Number, required: true },
  showFunctions: { type: Boolean, default: true },
  showSpeedometer: { type: Boolean, default: true },
  showConsist: { type: Boolean, default: true },
})

const address = toRef(props, 'address')
const {
  currentSpeed,
  setSpeed,
  loco,
  releaseThrottle,
  stop: handleStop,
  throttle,
} = useThrottle(address)

const $router = useRouter()

async function handleAdjustSliderSpeed(val: number) {
  if (currentSpeed.value === val) return
  setSpeed(val)
}

async function clearLoco() {
  handleStop()
  releaseThrottle()
  $router.push({ name: 'throttle-list' })
}
</script>

<template>
  <main v-if="throttle" class="flex flex-col gap-2 p-2 overflow-hidden w-full h-full flex-1 shadow-xl relative">
    <ThrottleHeader class="bg-gradient-to-r from-purple-300/10 to-pink-600/10 text-purple-400/10">
      <template v-slot:left>
        <div class="flex flex-row items-center justify-center gap-1 px-4 bg-gray-900">
          <LocoAvatar v-if="loco" :loco="loco as Loco" :size="48" @park="clearLoco" @stop="handleStop" variant="flat" />
          <MiniConsist v-if="loco" :loco="loco" />
          <v-spacer class="w-2 md:w-6" />
          <h1 class="text-xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 drop-shadow-lg">
            {{ loco?.name }}
          </h1>
          <v-spacer class="w-2 md:w-6" />
          <RoadnameLogo class="hidden sm:flex" v-if="loco" :roadname="loco.meta?.roadname" size="md" />
        </div>
      </template>
      <template v-slot:right>
        <ThrottleActionMenu @park="clearLoco" />
      </template>
    </ThrottleHeader>

    <section class="w-full h-full flex flex-col sm:flex-row justify-around flex-grow relative z-10">
      <!-- Left: Speedometer (desktop) -->
      <section v-if="showSpeedometer" class="hidden sm:flex flex-col items-center justify-center flex-1">
        <Speedometer :speed="currentSpeed" :address="address" :size="180" />
        <Consist v-if="showConsist && loco" :loco="loco" class="mt-4" />
      </section>

      <!-- Center: Slider controls -->
      <section class="flex flex-col gap-2 items-center justify-center flex-1">
        <SliderControls @update:currentSpeed="handleAdjustSliderSpeed" @stop="handleStop" :speed="currentSpeed" />
      </section>

      <!-- Right: Loco info + functions (desktop) -->
      <section v-if="loco" class="hidden sm:flex flex-col gap-2 mb-2 items-center justify-between flex-1">
        <v-spacer />
        <RoadnameLogo :roadname="loco.meta?.roadname" size="xl" />
        <v-spacer />
        <FunctionsSpeedDial v-if="showFunctions" :loco="loco" />
      </section>

      <!-- Mobile-only optional sections -->
      <section v-if="loco" class="flex sm:hidden flex-col gap-2 items-center">
        <FunctionsSpeedDial v-if="showFunctions" :loco="loco" />
      </section>
    </section>
  </main>

  <main v-else>
    <div class="flex flex-col items-center justify-center h-full w-full gap-4">
      <h2 class="text-2xl font-bold text-gray-700">No Throttle Assigned</h2>
      <v-btn color="pink" variant="outlined" @click="$router.push({ name: 'throttle-list' })">
        Go to Throttle List
      </v-btn>
    </div>
  </main>
</template>
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/jmcdannel/TTT/worktrees/main && pnpm --filter throttle build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add apps/throttle/src/throttle/SliderThrottle.vue
git commit -m "feat(throttle): add SliderThrottle variant layout"
```

---

## Task 5: Create ProtoThrottle Variant

**Files:**
- Create: `apps/throttle/src/throttle/ProtoThrottle.vue`

This is the largest task. Build a skeuomorphic UI replicating the ISE ProtoThrottle physical device. All controls are must-have for V1:

- LCD screen (monospace green-on-dark: speed, direction, loco address/name)
- Throttle notch (8 positions + IDLE via vertical slider/draggable)
- Reverser (FWD/REV toggle styled as lever)
- Horn (press-and-hold, maps to F2)
- Bell (toggle, maps to F1)
- Brake (0-10 slider/draggable)
- Up/Down buttons
- Menu/Select buttons
- Front/Rear headlight switches (OFF/DIM/BRT/DITCH LTS, maps to F0 + lighting functions)
- Status light (connection indicator)
- Auxiliary button (configurable function)

**Design notes:**
- Portrait-oriented (natural phone form factor)
- Mobile-first — centers with max-width on desktop
- Dark blue-gray body (`#2a3a5c`), inset LCD, tactile-looking buttons/knobs
- When `showFunctions` is true, `FunctionsSpeedDial` appears below the device for F3+ access
- `showSpeedometer` has no visual effect (LCD serves as speed display)
- `showConsist` conditionally renders consist info in the LCD or below the device

- [ ] **Step 1: Create ProtoThrottle.vue**

Create `apps/throttle/src/throttle/ProtoThrottle.vue`. This is a design playground — iterate on the visual design until it feels right. The component structure should be:

```vue
<script setup lang="ts">
import { ref, toRef, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Loco } from '@repo/modules/locos'
import ThrottleHeader from '@/throttle/ThrottleHeader.vue'
import ThrottleActionMenu from '@/throttle/ThrottleActionMenu.vue'
import { Consist, LocoAvatar, MiniConsist, FunctionsSpeedDial } from '@repo/ui'
import { useThrottle } from '@/throttle/useThrottle'
import { useHaptics } from '@/composables/useHaptics'

const props = defineProps({
  address: { type: Number, required: true },
  showFunctions: { type: Boolean, default: true },
  showSpeedometer: { type: Boolean, default: true },
  showConsist: { type: Boolean, default: true },
})

const address = toRef(props, 'address')
const {
  adjustSpeed: handleAdjustSpeed,
  currentSpeed,
  setSpeed,
  loco,
  releaseThrottle,
  stop: handleStop,
  throttle,
  direction,
} = useThrottle(address)

const $router = useRouter()
const { vibrate } = useHaptics()

// Notch positions: IDLE=0, 1-8 map to speed ranges
const NOTCH_SPEEDS = [0, 16, 32, 48, 64, 80, 96, 112, 126]
const throttleNotch = ref(0)
const brakeLevel = ref(0)
const hornActive = ref(false)
const bellActive = ref(false)

// Map notch to speed
const notchSpeed = computed(() => NOTCH_SPEEDS[throttleNotch.value] ?? 0)

// Reverser state: 'fwd' | 'rev'
const reverser = ref<'fwd' | 'rev'>('fwd')

function setNotch(notch: number) {
  throttleNotch.value = notch
  const speed = NOTCH_SPEEDS[notch] ?? 0
  const signedSpeed = reverser.value === 'fwd' ? speed : -speed
  setSpeed(signedSpeed)
  vibrate('light')
}

function toggleReverser() {
  if (Math.abs(currentSpeed.value) > 0) return // Can't reverse while moving
  reverser.value = reverser.value === 'fwd' ? 'rev' : 'fwd'
  vibrate('medium')
}

function handleHornDown() {
  hornActive.value = true
  vibrate('heavy')
  // TODO: trigger F2 on
}

function handleHornUp() {
  hornActive.value = false
  // TODO: trigger F2 off
}

function toggleBell() {
  bellActive.value = !bellActive.value
  vibrate('light')
  // TODO: toggle F1
}

async function clearLoco() {
  handleStop()
  releaseThrottle()
  $router.push({ name: 'throttle-list' })
}
</script>
```

The template should render a skeuomorphic device body with all controls laid out to match the physical ProtoThrottle (reference image in spec). Use Tailwind for styling with custom CSS for the device-specific elements (LCD glow, knob gradients, etc.).

**This component is a design playground** — the implementer should iterate on the visual design. The script logic above provides the functional foundation; the template/styling will require creative iteration.

- [ ] **Step 2: Verify build**

Run: `cd /Users/jmcdannel/TTT/worktrees/main && pnpm --filter throttle build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add apps/throttle/src/throttle/ProtoThrottle.vue
git commit -m "feat(throttle): add ProtoThrottle skeuomorphic variant"
```

---

## Task 6: Wire Up ThrottleView Dynamic Rendering

**Files:**
- Modify: `apps/throttle/src/views/ThrottleView.vue`

- [ ] **Step 1: Update ThrottleView to use dynamic component**

Modify `apps/throttle/src/views/ThrottleView.vue`:

1. Remove the static `import Throttle from '@/throttle/Throttle.vue'`
2. Import the three variant components and `useThrottleSettings`
3. Create a variant map and computed component
4. Replace `<Throttle :address="routeAddr" />` with `<component :is="variantComponent" :address="routeAddr" v-bind="settingsProps" />`

```ts
// Add these imports (replace the Throttle import)
import ButtonsThrottle from '@/throttle/ButtonsThrottle.vue'
import SliderThrottle from '@/throttle/SliderThrottle.vue'
import ProtoThrottle from '@/throttle/ProtoThrottle.vue'
import { useThrottleSettings } from '@/throttle/useThrottleSettings'

// Add after existing composable calls
const { variant, showFunctions, showSpeedometer, showConsist } = useThrottleSettings()

const variantMap = {
  buttons: ButtonsThrottle,
  slider: SliderThrottle,
  protothrottle: ProtoThrottle,
} as const

const variantComponent = computed(() => variantMap[variant.value] ?? ButtonsThrottle)

const settingsProps = computed(() => ({
  showFunctions: showFunctions.value,
  showSpeedometer: showSpeedometer.value,
  showConsist: showConsist.value,
}))
```

In the template, replace:
```html
<Throttle :address="routeAddr" />
```
with:
```html
<component :is="variantComponent" :address="routeAddr" v-bind="settingsProps" />
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/jmcdannel/TTT/worktrees/main && pnpm --filter throttle build`
Expected: Build succeeds.

- [ ] **Step 3: Smoke test in browser**

Run: `cd /Users/jmcdannel/TTT/worktrees/main && pnpm --filter throttle dev`

Navigate to `/throttle/:address`. Verify:
- Default variant (buttons) renders
- Layout looks correct on desktop and mobile viewport
- Swipe navigation between throttles still works

- [ ] **Step 4: Commit**

```bash
git add apps/throttle/src/views/ThrottleView.vue
git commit -m "feat(throttle): wire ThrottleView to dynamic variant rendering"
```

---

## Task 7: Update Settings UI

**Files:**
- Modify: `apps/throttle/src/views/SettingsView.vue`

- [ ] **Step 1: Replace Speed Steps with variant picker and toggles**

In `apps/throttle/src/views/SettingsView.vue`:

1. Import `useThrottleSettings`:
```ts
import { useThrottleSettings } from '@/throttle/useThrottleSettings'

const {
  variant, showFunctions, showSpeedometer, showConsist,
  setVariant, setShowFunctions, setShowSpeedometer, setShowConsist,
} = useThrottleSettings()
```

2. Remove the speed steps code (lines 65-70):
```ts
// DELETE these lines:
const speedSteps = ref('128')
const speedStepOptions = [
  { title: '14 steps', value: '14' },
  { title: '28 steps', value: '28' },
  { title: '128 steps', value: '128' },
]
```

3. Replace the Throttle Settings section in the template (the `<div id="throttle">` block). Replace the Speed Steps row with four new rows:

**Row 1 — Throttle Type** (`v-btn-toggle`, 3 options):
```html
<div class="settings-row">
  <div class="settings-row__label">
    <span class="settings-row__name">Throttle Type</span>
    <span class="settings-row__desc">Choose your preferred throttle control style</span>
  </div>
  <div class="settings-row__value">
    <v-btn-toggle :model-value="variant" @update:model-value="(v) => setVariant(v)" mandatory divided density="compact" variant="outlined" color="primary">
      <v-btn value="buttons" size="small" class="text-none">
        <v-icon start size="16">mdi-gesture-tap-button</v-icon>
        <span class="hidden sm:inline">Buttons</span>
      </v-btn>
      <v-btn value="slider" size="small" class="text-none">
        <v-icon start size="16">mdi-tune-vertical</v-icon>
        <span class="hidden sm:inline">Slider</span>
      </v-btn>
      <v-btn value="protothrottle" size="small" class="text-none">
        <v-icon start size="16">mdi-train</v-icon>
        <span class="hidden sm:inline">ProtoThrottle</span>
      </v-btn>
    </v-btn-toggle>
  </div>
</div>
```

**Row 2 — Functions Panel** (`v-switch`):
```html
<div class="settings-row">
  <div class="settings-row__label">
    <span class="settings-row__name">Functions Panel</span>
    <span class="settings-row__desc">Show DCC function buttons (F0-F28)</span>
  </div>
  <div class="settings-row__value">
    <v-switch :model-value="showFunctions" @update:model-value="(v) => setShowFunctions(v)" color="primary" density="compact" hide-details />
  </div>
</div>
```

**Row 3 — Speedometer** (`v-switch`):
```html
<div class="settings-row">
  <div class="settings-row__label">
    <span class="settings-row__name">Speedometer</span>
    <span class="settings-row__desc">Show speed gauge on desktop, auto-hide on small screens</span>
  </div>
  <div class="settings-row__value">
    <v-switch :model-value="showSpeedometer" @update:model-value="(v) => setShowSpeedometer(v)" color="primary" density="compact" hide-details />
  </div>
</div>
```

**Row 4 — Consist Info** (`v-switch`):
```html
<div class="settings-row">
  <div class="settings-row__label">
    <span class="settings-row__name">Consist Info</span>
    <span class="settings-row__desc">Show coupled locomotive information</span>
  </div>
  <div class="settings-row__value">
    <v-switch :model-value="showConsist" @update:model-value="(v) => setShowConsist(v)" color="primary" density="compact" hide-details />
  </div>
</div>
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/jmcdannel/TTT/worktrees/main && pnpm --filter throttle build`
Expected: Build succeeds.

- [ ] **Step 3: Smoke test in browser**

Navigate to `/settings`. Verify:
- Throttle Type toggle shows 3 options and persists selection
- Three switches toggle and persist
- Speed Steps row is gone
- Settings section looks correct on mobile

- [ ] **Step 4: Commit**

```bash
git add apps/throttle/src/views/SettingsView.vue
git commit -m "feat(throttle): replace Speed Steps with variant picker and section toggles in settings"
```

---

## Task 8: Clean Up Old Throttle Components

**Files:**
- Delete: `apps/throttle/src/throttle/Throttle.vue`
- Delete: `apps/throttle/src/throttle/SimpleThrottle.vue`

- [ ] **Step 1: Search for remaining imports of old components**

Run a search for any remaining imports of `Throttle.vue` or `SimpleThrottle.vue` across the codebase:

```bash
cd /Users/jmcdannel/TTT/worktrees/main
grep -r "import.*from.*['\"].*Throttle.vue['\"]" apps/throttle/src/ --include="*.vue" --include="*.ts"
grep -r "import.*from.*['\"].*SimpleThrottle.vue['\"]" apps/throttle/src/ --include="*.vue" --include="*.ts"
```

If any imports remain (other than the variant components themselves), update them.

- [ ] **Step 2: Delete old files**

```bash
rm apps/throttle/src/throttle/Throttle.vue
rm apps/throttle/src/throttle/SimpleThrottle.vue
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/jmcdannel/TTT/worktrees/main && pnpm --filter throttle build`
Expected: Build succeeds with no missing import errors.

- [ ] **Step 4: Commit**

```bash
git add -u apps/throttle/src/throttle/Throttle.vue apps/throttle/src/throttle/SimpleThrottle.vue
git commit -m "refactor(throttle): remove old Throttle.vue and SimpleThrottle.vue (replaced by variants)"
```

---

## Task 9: End-to-End Verification

- [ ] **Step 1: Full build**

```bash
cd /Users/jmcdannel/TTT/worktrees/main && pnpm --filter throttle build
```

- [ ] **Step 2: Run existing tests**

```bash
cd /Users/jmcdannel/TTT/worktrees/main && pnpm --filter throttle test
```

Fix any failures.

- [ ] **Step 3: Manual verification checklist**

Start dev server: `cd /Users/jmcdannel/TTT/worktrees/main && pnpm --filter throttle dev`

Test matrix:

| Test | Expected |
|------|----------|
| `/settings` → Throttle Type = Buttons | Buttons variant renders at `/throttle/:address` |
| `/settings` → Throttle Type = Slider | Slider variant renders |
| `/settings` → Throttle Type = ProtoThrottle | ProtoThrottle variant renders |
| Toggle Functions off | FunctionsSpeedDial hidden on all variants |
| Toggle Speedometer off | Speedometer hidden on Buttons/Slider |
| Toggle Consist off | Consist hidden on Buttons/Slider |
| Mobile viewport (375px) — Buttons | Single column, buttons stack, no overflow |
| Mobile viewport (375px) — Slider | Sliders usable, no overflow |
| Mobile viewport (375px) — ProtoThrottle | Device fills screen, all controls accessible |
| Swipe between throttles | Works on all variants |
| Reload page | Setting persists (localStorage) |

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix(throttle): address verification issues"
```
