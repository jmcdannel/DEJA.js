# Storybook Testing for packages/ui — Design Spec

**Date:** 2026-03-12
**Status:** Approved
**Scope:** Add full Storybook coverage (stories + interaction tests + a11y) to all 77 components in `packages/ui`

---

## 1. Context

DEJA.js has 77 Vue 3 `.vue` files in `packages/ui/src/`. Storybook 8.0.0 is already installed and configured with Vue 3 + Vite + Vuetify 3. Only 2 story files exist (`LocoAvatar.stories.ts`, `TurnoutCard.stories.ts`), giving ~3% coverage. **75 new story files** are needed.

### Goal

Bring Storybook coverage to 100% of components with:
- Visual stories showing all key states/variants
- Interaction tests via `@storybook/test` play functions
- Accessibility checks via `@storybook/addon-a11y`

### Out of Scope

- Visual regression testing (Chromatic/Percy)
- Stories for `packages/auth` components (separate package)
- Snapshot tests

---

## 2. Shared Mock Infrastructure

All shared mocks live in `packages/ui/.storybook/mocks/`.

### 2.1 Mocking Strategy — Vite Aliases (NOT vi.mock)

**Critical:** The existing `TurnoutCard.stories.ts` uses `vi.mock()` which is a Vitest API. This does NOT work in Storybook 8.x without a vitest integration plugin. Storybook 8.x's recommended approach for module mocking is **Vite resolve aliases** in `.storybook/main.ts` via `viteFinal`.

**How it works:**
1. Create mock files that re-export everything from the original module but replace composables with `fn()`-based stubs
2. Configure `.storybook/main.ts` `viteFinal` to alias `@repo/modules`, `@repo/dccex`, `@repo/deja`, and `vuefire` to the mock files
3. Individual stories import from the mock files to customize return values per-story via `beforeEach`

**`.storybook/main.ts` additions:**
```typescript
import path from 'node:path'

const config: StorybookConfig = {
  // ... existing config
  async viteFinal(config) {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@repo/modules': path.resolve(__dirname, './mocks/modules.ts'),
          '@repo/dccex': path.resolve(__dirname, './mocks/dccex.ts'),
          '@repo/deja': path.resolve(__dirname, './mocks/deja.ts'),
          'vuefire': path.resolve(__dirname, './mocks/firebase.ts'),
        },
      },
    }
  },
}
```

**Mock file pattern (`mocks/modules.ts`):**
```typescript
import { fn } from '@storybook/test'
import { ref, computed } from 'vue'

// Each composable returns fn()-wrapped stubs
export const useTurnouts = () => ({
  setTurnout: fn().mockName('setTurnout'),
  getTurnouts: fn().mockName('getTurnouts').mockReturnValue({ value: [] }),
  switchTurnout: fn().mockName('switchTurnout'),
  // ... all methods
})

// Re-export non-composable items (types, constants) from original
export type { Turnout, Loco, Effect /* ... */ } from '../../packages/modules/src/types'
```

**Per-story customization via `beforeEach`:**
```typescript
import { mocked } from '@storybook/test'
import { useTurnouts } from '@repo/modules' // resolves to mock

export const WithTurnouts: Story = {
  beforeEach: () => {
    mocked(useTurnouts().getTurnouts).mockReturnValue({
      value: [createTurnout(), createTurnout({ name: 'Siding' })]
    })
  },
}
```

The existing `TurnoutCard.stories.ts` will be updated to remove `vi.mock()` and use this pattern instead.

### 2.2 Mock Files

| File | Purpose |
|------|---------|
| `mocks/modules.ts` | Mock all `@repo/modules` composables: `useTurnouts`, `useEfx`, `useLocos`, `useLayout`, `useFunctions`, `useSignals`, `useLayoutRoutes`, `useRoutes`, `useSensors`, `useUserPreferences` |
| `mocks/dccex.ts` | Mock `useDcc()` with `fn()` stubs for `setFunction`, `setPower`, `sendOutput`, `sendDccCommand` |
| `mocks/deja.ts` | Mock `useDejaJS()` with stubbed Firebase RTDB writes |
| `mocks/firebase.ts` | Mock Vuefire composables: `useDocument`, `useCollection`, `useCurrentUser` |
| `mocks/router.ts` | Shared `createRouter({ history: createMemoryHistory(), routes })` with all app routes stubbed |
| `mocks/data.ts` | Factory functions for realistic mock data (see 2.3) |
| `mocks/index.ts` | Barrel export for all mocks |

**Note on composable coverage:** The `@repo/modules` mock must include all composables that UI components import. The full list includes: `useTurnouts`, `useEfx`, `useLocos`, `useLayout`, `useFunctions`, `useSignals`, `useLayoutRoutes`, `useRoutes`, `useSensors`, `useUserPreferences`. If additional composables are discovered during implementation (e.g., `useBlocks`, `useAutomations`, `useServerStatus`), add them to the mock file.

### 2.3 Factory Functions (`mocks/data.ts`)

Each factory returns a realistic default and accepts partial overrides. Factories must include all required fields from their respective type interfaces.

```typescript
import type { Turnout } from '@repo/modules'

export function createTurnout(overrides?: Partial<Turnout>): Turnout {
  return {
    id: 'turnout-1',
    name: 'Yard Entry',
    desc: 'Controls the yard entry track switch',
    type: 'servo',
    state: false,
    color: 'blue',
    device: 'arduino-01',
    tags: ['yard', 'mainline'],
    order: 1,
    turnoutIdx: 100,  // DCC-EX turnout index
    ...overrides,
  }
}

export function createSensor(overrides?: Partial<Sensor>): Sensor {
  return {
    id: 'sensor-1',
    name: 'Block 1 Detector',
    index: 1,
    type: 'digital',
    enabled: true,
    state: false,
    ...overrides,
  }
}
```

Factory functions needed: `createLoco()`, `createTurnout()`, `createEffect()`, `createSignal()`, `createSensor()`, `createDevice()`, `createLayout()`. Each must be verified against the actual type interfaces in `@repo/modules` before implementation.

### 2.4 Tailwind CSS Setup

**Problem:** Tailwind CSS is configured in the consuming apps (throttle, cloud) but NOT in the UI package's Storybook. Components using Tailwind classes will render unstyled.

**Solution:** Create a Tailwind entry point for Storybook:

1. Create `packages/ui/.storybook/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['../src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

2. Create `packages/ui/.storybook/tailwind.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

3. Create `packages/ui/.storybook/postcss.config.cjs`:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

4. Import in `.storybook/preview.ts`:
```typescript
import './tailwind.css'
```

5. Add PostCSS config to `viteFinal` in `.storybook/main.ts`:
```typescript
css: {
  postcss: path.resolve(__dirname, './postcss.config.cjs'),
},
```

### 2.5 New Dependencies

```
@storybook/addon-a11y ^8.0.0
tailwindcss (devDep — for Storybook PostCSS)
autoprefixer (devDep — for Storybook PostCSS)
```

Added via `pnpm --filter @repo/ui add -D @storybook/addon-a11y tailwindcss autoprefixer`.

### 2.6 Self-Import Pattern

`CTCSwitch.vue` imports `useColors` from `@repo/ui` (the package importing itself). This circular dependency may fail in Storybook. **Solution:** Add an alias in `viteFinal` that resolves `@repo/ui` to the local `src/` directory:

```typescript
'@repo/ui': path.resolve(__dirname, '../src'),
```

---

## 3. Story File Conventions

### 3.1 File Location

Co-located with components:
```
src/Turnouts/TurnoutCard.vue
src/Turnouts/TurnoutCard.stories.ts   <-- here
```

### 3.2 Story Structure

Every story file follows this template (NO `vi.mock` — mocking is handled globally via Vite aliases):

```typescript
import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, fn, userEvent, within } from '@storybook/test'
import ComponentName from './ComponentName.vue'
import { createTurnout } from '../../.storybook/mocks/data'

const meta: Meta<typeof ComponentName> = {
  title: 'Category/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
  argTypes: { /* controls */ },
}

export default meta
type Story = StoryObj<typeof ComponentName>

export const Default: Story = {
  args: { /* default props using factory functions */ },
}

// Variant stories for key states
export const Loading: Story = { args: { /* ... */ } }
export const Empty: Story = { args: { /* ... */ } }

// Interaction test
export const Interactive: Story = {
  args: { /* ... */ },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggle = canvas.getByRole('switch')
    await expect(toggle).toBeInTheDocument()
    await userEvent.click(toggle)
  },
}
```

### 3.3 Required Per Story File

- `tags: ['autodocs']` on every meta
- At least a `Default` story
- 2-4 variant stories for key states
- At least one story with a `play` function for interactive components
- Proper `argTypes` for Storybook controls panel

### 3.4 Complete Title Hierarchy (all 77 components)

```
Locos/LocoAvatar                          (existing story)
Locos/LocoList

Consist/Consist
Consist/MiniConsist
Consist/LeadLoco
Consist/ConsistLoco
Consist/EditConsist
Consist/AddConsistLoco

Turnouts/TurnoutCard                      (existing story — update to remove vi.mock)
Turnouts/TurnoutList
Turnouts/TurnoutItem
Turnouts/TurnoutSwitch
Turnouts/TurnoutButton
Turnouts/TurnoutRaw
Turnouts/TurnoutTable
Turnouts/CTCSwitch
Turnouts/CTCSwitchSvg

Effects/EffectCard
Effects/EffectList
Effects/EffectItem
Effects/EffectSwitch
Effects/EffectButton
Effects/EffectRaw
Effects/EffectTable
Effects/GuestEffectCard

Functions/Functions
Functions/FunctionButton
Functions/FunctionList
Functions/EditFunction
Functions/SpeedDial

Sensors/SensorList
Sensors/SensorItem
Sensors/SensorCard
Sensors/SensorSwitch
Sensors/SensorTable

ModuleList/List
ModuleList/Table
ModuleList/Item
ModuleList/ItemButton
ModuleList/ItemCard
ModuleList/ItemSwitch

DeviceConnection/DeviceConnectionCard
DeviceConnection/DeviceConnectionList

DeviceStatus/DeviceStatus                 (root-level chip/menu component)
DeviceStatus/DeviceStatusItem
DeviceStatus/DeviceStatusList

Dashboard/CommandActivityChart
Dashboard/DeviceConnectionChart
Dashboard/SystemOverviewStats

Backgrounds/PageBackground
Backgrounds/BackgroundSettings
Backgrounds/BackgroundThumbnail
Backgrounds/BackgroundDecor
Backgrounds/BackgroundFallingStars

Animations/StatusPulse
Animations/TransitionExpand
Animations/TransitionFade
Animations/TransitionList
Animations/TransitionSlide

Chrome/AppHeader
Chrome/Logo
Chrome/ThemeSwitcher
Chrome/SelectLayout
Chrome/LayoutChip
Chrome/SignalList
Chrome/Signout
Chrome/UserProfile
Chrome/TrackPower
Chrome/Power
Chrome/EmergencyStop

Navigation/Menu
Navigation/ListMenu

Notifications/NotificationContainer
Print/TurnoutLabels
Debug/ViewJson
Stats/Stat
EmptyState/EmptyState
```

---

## 4. Component Groups & Special Handling

### 4.1 Standard Pattern Components (Turnouts, Effects, Sensors)

These follow identical List/Item/Card/Switch/Table/Button patterns. Stories test:
- Default state
- Active/toggled state
- Loading/running state
- Empty/no-data state
- Click/toggle interaction via `play`

### 4.2 Dialog Components (EditConsist, AddConsistLoco, EditFunction)

Play functions must open the dialog first:
```typescript
play: async ({ canvasElement }) => {
  const canvas = within(canvasElement)
  await userEvent.click(canvas.getByRole('button', { name: /edit/i }))
  await expect(canvas.getByRole('dialog')).toBeVisible()
}
```

### 4.3 Animation Components (StatusPulse, Transition*)

- Stories show before/after states
- No interaction tests (animations are passive)
- Transition components wrap slotted content to demonstrate the effect

### 4.4 Chart Components (Dashboard/*)

- Use mock time-series data from `data.ts`
- Stories show populated and empty states
- No interaction tests

### 4.5 Background Components

- `BackgroundFallingStars` — animation-heavy, story uses reduced motion or paused state
- `PageBackground` — wraps child content, story shows with sample page content
- `BackgroundSettings` / `BackgroundThumbnail` — need mock `useUserPreferences` (included in mock aliases)

### 4.6 Components Needing Router

These components use `useRouter()` or `<router-link>` and need the shared mock router as a global decorator:
- `LocoAvatar` (existing story — already uses inline router)
- `AppHeader`
- `SelectLayout`
- `Menu`
- `ListMenu`

### 4.7 CTCSwitch vs ctc-switch-svg

These are two distinct components:
- `CTCSwitch.vue` — interactive wrapper, imports `useTurnouts` and `useColors` from `@repo/ui`, has click handlers. **Needs a full story with interaction tests.**
- `ctc-switch-svg.vue` — pure SVG presentation, used internally by CTCSwitch. **Needs a visual story only (no interactions).**

### 4.8 Root-Level DeviceStatus

`src/DeviceStatus.vue` is a root-level chip/menu component, distinct from `src/DeviceStatus/DeviceStatusItem.vue` and `src/DeviceStatus/DeviceStatusList.vue`. It gets its own story under `DeviceStatus/DeviceStatus`.

---

## 5. Agent Team Implementation Plan

### Phase 1: Infrastructure (blocking — must complete first)

**Agent: infrastructure**
1. Install `@storybook/addon-a11y`, `tailwindcss`, `autoprefixer`
2. Create `packages/ui/.storybook/mocks/data.ts` — all factory functions (verify against actual types in `@repo/modules`)
3. Create `packages/ui/.storybook/mocks/modules.ts` — mock all composables with `fn()` stubs
4. Create `packages/ui/.storybook/mocks/dccex.ts` — mock `useDcc()`
5. Create `packages/ui/.storybook/mocks/deja.ts` — mock `useDejaJS()`
6. Create `packages/ui/.storybook/mocks/firebase.ts` — mock Vuefire
7. Create `packages/ui/.storybook/mocks/router.ts` — shared memory router
8. Create `packages/ui/.storybook/mocks/index.ts` — barrel export
9. Create `packages/ui/.storybook/tailwind.config.js` + `tailwind.css` + `postcss.config.cjs`
10. Update `.storybook/main.ts` — add a11y addon, add `viteFinal` with Vite aliases for mocks + `@repo/ui` self-import + PostCSS config
11. Update `.storybook/preview.ts` — add Tailwind CSS import, add shared router decorator
12. Update existing `TurnoutCard.stories.ts` — remove `vi.mock()`, use factory data from `mocks/data.ts`

### Phase 2: Component Stories (parallel — 4 agents)

**Agent: agent-turnouts-effects** (21 new stories)
- Turnouts: TurnoutList, TurnoutItem, TurnoutSwitch, TurnoutButton, TurnoutRaw, TurnoutTable, CTCSwitch, ctc-switch-svg (TurnoutCard already done)
- Effects: EffectList, EffectItem, EffectSwitch, EffectCard, EffectButton, EffectRaw, EffectTable, GuestEffectCard
- Sensors: SensorList, SensorItem, SensorCard, SensorSwitch, SensorTable
- (Total: 8 Turnouts + 8 Effects + 5 Sensors = 21)

**Agent: agent-locos-consist** (12 new stories)
- Locos: LocoList (LocoAvatar already done)
- Consist: Consist, EditConsist, LeadLoco, ConsistLoco, AddConsistLoco, MiniConsist
- Functions: Functions, FunctionButton, FunctionList, EditFunction, SpeedDial
- (Total: 1 + 6 + 5 = 12)

**Agent: agent-layout-system** (16 new stories)
- ModuleList: List, Table, Item, ItemButton, ItemCard, ItemSwitch
- DeviceConnection: DeviceConnectionCard, DeviceConnectionList
- DeviceStatus: DeviceStatusItem, DeviceStatusList
- Dashboard: CommandActivityChart, DeviceConnectionChart, SystemOverviewStats
- Other: NotificationContainer, TurnoutLabels, EmptyState
- (Total: 6 + 2 + 2 + 3 + 3 = 16)

**Agent: agent-chrome-ui** (27 new stories)
- Chrome: AppHeader, Logo, ThemeSwitcher, SelectLayout, LayoutChip, SignalList, Signout, UserProfile, TrackPower, Power, DeviceStatus (root-level), EmergencyStop
- Backgrounds: BackgroundSettings, BackgroundThumbnail, PageBackground, BackgroundDecor, BackgroundFallingStars
- Navigation: Menu, ListMenu
- Animations: StatusPulse, TransitionExpand, TransitionFade, TransitionList, TransitionSlide
- Other: ViewJson, Stat
- (Total: 12 + 5 + 2 + 5 + 2 + 1 (existing LocoAvatar update to use shared router) = 27)

**Grand total: 21 + 12 + 16 + 27 = 76 new stories + 1 existing updated (TurnoutCard) = 77 components covered.** (LocoAvatar's existing story is updated in-place by agent-chrome-ui to use shared router decorator.)

---

## 6. Verification

After all agents complete:
1. Run `pnpm --filter @repo/ui storybook` — verify all stories render
2. Run `pnpm --filter @repo/ui build-storybook` — verify build succeeds
3. Check Storybook Interactions panel — verify play functions pass
4. Check Storybook Accessibility panel — review any a11y violations
5. Run `pnpm lint` and `pnpm check-types` — no regressions
