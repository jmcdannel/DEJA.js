# Quick Throttle Design 🚂

**Date:** 2026-04-10
**Branch:** `feature/quick-throttle`
**Status:** Design approved, pending implementation plan

## Problem

Users need to open a throttle for an arbitrary DCC address quickly, without hunting through the roster or curating a loco entry first. Today, every "add throttle" flow in the throttle app (`ThrottleList.vue`, `QuickMenuThrottles.vue`) forces the user to pick a pre-existing roster loco. There is no way to simply type `42` and start driving address 42.

## Goals

- Let users acquire and drive any DCC address (1–9999) with a single compact UI surface.
- Surface that UI on the Loco page, Throttle List, Conductor page, Throttle page, and QuickMenu.
- Provide a global keyboard shortcut so power users can open a throttle without mousing to a button.
- Support mobile / touch operation with a numpad variant.
- Respect existing roster metadata when it happens to exist, but don't require it.
- Offer a lightweight path to save a quick-acquired address to the roster after the fact.

## Non-Goals

- Recent-addresses MRU dropdown
- Bulk / consist acquisition through the quick form
- Replacing existing "add from roster" pickers — this feature is additive

## UX Behavior

### Input

- Compact icon button (`mdi-numeric` or `mdi-train-variant`) opens a `v-menu` popover anchored to the button.
- Popover body is `QuickThrottleForm.vue`, which renders one of two variants depending on pointer type:
  - **Fine pointer (desktop):** `v-text-field` with `type="number"`, `inputmode="numeric"`, autofocus on open, `min=1 max=9999`. Enter submits. Small "Go" button (`mdi-arrow-right`) as alternate submit.
  - **Coarse pointer (mobile/tablet):** `QuickThrottleNumpad.vue` — large readout at the top, 3×4 grid of `1–9`, `0`, `⌫`, `Go`. Selection detected via `useMediaQuery('(pointer: coarse)')`.
- Submit is disabled when the input is empty, non-integer, or out of range. Inline helper text on invalid input.

### Post-submit

Always:
1. `await acquireThrottle(address)` (idempotent — see _Acquire semantics_ below)
2. `router.push({ name: 'throttle', params: { address }})`
3. Popover / dialog closes

If `acquireThrottle` throws, a snackbar surfaces the error and navigation is skipped.

### Roster matching (smart merge)

- On load, `useThrottle(address)` already performs a lookup against `useLocos()` — if a roster entry with a matching `address` exists, its `name`, `meta.roadname`, functions, etc. flow into the throttle view automatically.
- If no roster entry exists, the throttle still runs — it just shows as `Loco #{address}` with no art.

### "Save to roster" affordance

When `ThrottleView` is showing an address whose `loco` computed lookup returns `undefined`, render a small non-blocking chip in `ThrottleHeader.vue`:

> 🏷️ **Not in roster** · `[Save to roster]`

Tapping opens a tiny dialog prefilled with `address`, with optional fields for `name` and `meta.roadname`. On save, `setDoc` into `layouts/{layoutId}/locos/{address}`. The chip disappears because the `loco` computed becomes defined. Placing the chip in `ThrottleHeader.vue` makes it visible across all three throttle variants (buttons, slider, dashboard).

## Architecture

### File layout

```
apps/throttle/src/throttle/
├── QuickThrottleButton.vue         # icon + v-menu popover host
├── QuickThrottleGlobalDialog.vue   # mounted once in App.vue, keyboard-triggered
├── QuickThrottleForm.vue           # shared: text-field or numpad, emits submit
├── QuickThrottleNumpad.vue         # mobile numpad body
└── useQuickThrottle.ts             # open(addr), openGlobal(), global shortcut
```

### `useQuickThrottle()` — logic composable

```ts
// apps/throttle/src/throttle/useQuickThrottle.ts
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocos } from '@repo/modules/locos'

const globalDialogOpen = ref(false)

export function useQuickThrottle() {
  const router = useRouter()
  const { acquireThrottle } = useLocos()

  async function open(address: number) {
    if (!Number.isInteger(address) || address < 1 || address > 9999) return
    try {
      await acquireThrottle(address)
    } catch (err) {
      // surface via snackbar; do not navigate
      throw err
    }
    await router.push({ name: 'throttle', params: { address } })
  }

  function openGlobal() {
    globalDialogOpen.value = true
  }

  function registerGlobalShortcut() {
    function handler(e: KeyboardEvent) {
      if (e.key !== 't') return
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      const target = e.target as HTMLElement | null
      if (!target) return
      const tag = target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return
      e.preventDefault()
      openGlobal()
    }
    onMounted(() => window.addEventListener('keydown', handler))
    onUnmounted(() => window.removeEventListener('keydown', handler))
  }

  return { open, openGlobal, registerGlobalShortcut, globalDialogOpen }
}
```

- `globalDialogOpen` lives at module scope so the `QuickThrottleGlobalDialog` (rendered once in `App.vue`) and any component that calls `openGlobal()` share the same state.
- `registerGlobalShortcut` is called from `QuickThrottleGlobalDialog.vue`'s `setup`, which is mounted exactly once in `App.vue`. This keeps the listener lifecycle tied to a single component.
- Idempotency lives in `acquireThrottle` — see next section.

### `acquireThrottle` merge fix 🛠️

**Current behavior (`packages/modules/locos/useLocos.ts`):**

```ts
async function acquireThrottle(address: number) {
  // ...
  const data = { address, speed: 0, direction: false, timestamp: serverTimestamp() }
  await setDoc(doc(db, `layouts/${layoutId.value}/throttles`, address.toString()), data)
}
```

This unconditionally zeros out `speed` and `direction` — which means quick-throttling an address that's already running at speed 40 would clobber it.

**Fix:** change to `setDoc(..., { merge: true })` and only set `speed`/`direction` on first creation by using a field-level conditional:

```ts
async function acquireThrottle(address: number) {
  if (!address) { log.warn('No throttle address provided for acquisition'); return }
  const ref = doc(db, `layouts/${layoutId.value}/throttles`, address.toString())
  const existing = await getDoc(ref)
  const data = existing.exists()
    ? { address, timestamp: serverTimestamp() }
    : { address, speed: 0, direction: false, timestamp: serverTimestamp() }
  await setDoc(ref, data, { merge: true })
}
```

The `getDoc` + conditional approach is strictly safer than a blanket merge because it preserves `speed`/`direction` for already-running throttles while still initializing them to zero on first acquire. Existing callers (`ThrottleList.vue`, `QuickMenuThrottles.vue`) benefit from the same safety automatically.

### `QuickThrottleForm.vue` — responsive body

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import QuickThrottleNumpad from './QuickThrottleNumpad.vue'

const emit = defineEmits<{ submit: [address: number]; cancel: [] }>()

const isCoarse = useMediaQuery('(pointer: coarse)')
const value = ref<string>('')
const parsed = computed(() => {
  const n = Number(value.value)
  return Number.isInteger(n) && n >= 1 && n <= 9999 ? n : null
})
const canSubmit = computed(() => parsed.value !== null)

function submit() {
  if (parsed.value !== null) emit('submit', parsed.value)
}
</script>

<template>
  <div class="quick-throttle-form">
    <QuickThrottleNumpad
      v-if="isCoarse"
      v-model="value"
      :can-submit="canSubmit"
      @submit="submit"
    />
    <v-text-field
      v-else
      v-model="value"
      type="number"
      inputmode="numeric"
      :min="1"
      :max="9999"
      label="DCC Address"
      autofocus
      @keyup.enter="submit"
    >
      <template #append-inner>
        <v-btn
          icon="mdi-arrow-right"
          size="small"
          variant="text"
          :disabled="!canSubmit"
          @click="submit"
        />
      </template>
    </v-text-field>
  </div>
</template>
```

### `QuickThrottleButton.vue` — per-page host

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useQuickThrottle } from './useQuickThrottle'
import QuickThrottleForm from './QuickThrottleForm.vue'

defineProps<{
  size?: 'small' | 'default' | 'large'
  variant?: 'icon' | 'text'
}>()

const { open } = useQuickThrottle()
const menu = ref(false)

async function handleSubmit(address: number) {
  menu.value = false
  try {
    await open(address)
  } catch (err) {
    // TODO: snackbar
    console.error('Quick throttle failed', err)
  }
}
</script>

<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="bottom end">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon="mdi-numeric"
        :size="size ?? 'default'"
        :variant="variant === 'text' ? 'tonal' : undefined"
        aria-label="Quick throttle by DCC address"
      />
    </template>
    <v-card width="240" class="pa-2">
      <QuickThrottleForm @submit="handleSubmit" @cancel="menu = false" />
    </v-card>
  </v-menu>
</template>
```

### `QuickThrottleGlobalDialog.vue` — keyboard-shortcut host

Mounted once in `App.vue`. Shows the same `QuickThrottleForm` inside a centered `v-dialog` when `globalDialogOpen` flips true.

```vue
<script setup lang="ts">
import { useQuickThrottle } from './useQuickThrottle'
import QuickThrottleForm from './QuickThrottleForm.vue'

const { open, globalDialogOpen, registerGlobalShortcut } = useQuickThrottle()
registerGlobalShortcut()

async function handleSubmit(address: number) {
  globalDialogOpen.value = false
  try {
    await open(address)
  } catch (err) {
    console.error('Quick throttle failed', err)
  }
}
</script>

<template>
  <v-dialog v-model="globalDialogOpen" max-width="320">
    <v-card class="pa-3">
      <div class="text-subtitle-2 mb-2">Quick Throttle</div>
      <QuickThrottleForm @submit="handleSubmit" @cancel="globalDialogOpen = false" />
    </v-card>
  </v-dialog>
</template>
```

`App.vue` mounts `<QuickThrottleGlobalDialog />` once, alongside the existing `<QuickMenu />`.

## Placements

| Page | File | Host location |
|---|---|---|
| **Roster** | `apps/throttle/src/views/RosterView.vue` | `PageHeader` `#controls` slot, right of `ListControlBar` |
| **Throttle List** | `apps/throttle/src/throttle/ThrottleList.vue` | Second FAB stacked above the existing `+` FAB (smaller) |
| **Throttle page** | `apps/throttle/src/throttle/ThrottleView.vue` | Leading end of the footer `v-slide-group`, left of the throttle nav items |
| **Conductor** | `apps/throttle/src/conductor/ConductorLayout.vue` | Top-right corner (exact placement confirmed during impl) |
| **QuickMenu** | `apps/throttle/src/quick-menu/QuickMenuThrottles.vue` | Inline icon button next to the existing "Add Loco" button |
| **Global** | `apps/throttle/src/App.vue` | `<QuickThrottleGlobalDialog />` mounted once |

## Error Handling

- **Invalid input** → submit disabled, no side effects
- **No layout selected** → not possible in practice; every placement is on a `requireLayout` route. `acquireThrottle` already early-returns on falsy `layoutId`
- **Firestore write failure** → `useQuickThrottle.open()` re-throws; host component catches and shows a snackbar; navigation is skipped
- **Address already running** → `acquireThrottle` merge fix preserves existing speed/direction; navigation takes the user to the live throttle view

## Testing

### Unit tests

- **`useQuickThrottle.test.ts`** (new)
  - Rejects `0`, `-1`, `10000`, `3.5`, `NaN`, non-numbers — no writes, no navigation
  - Valid address: calls `acquireThrottle` once and navigates with correct params
  - When `acquireThrottle` throws: propagates error and does not navigate
  - Global dialog state flips on `openGlobal()`
- **`acquireThrottle.test.ts`** (new or extend existing)
  - First acquire: creates doc with `speed: 0, direction: false`
  - Second acquire on a running throttle: preserves `speed` and `direction`

### Component tests

- **`QuickThrottleForm.test.ts`**: empty submit disabled, Enter triggers submit, out-of-range disables submit, numpad variant emits correctly
- **`QuickThrottleButton.test.ts`**: popover opens on click, submit closes menu, invalid input doesn't close menu

### Keyboard shortcut

- Manual test: `t` from home page opens global dialog
- Manual test: `t` inside a focused `v-text-field` does NOT open the dialog
- Manual test: `Cmd+T` still opens a new browser tab (we don't hijack it)

## Scope

### In scope

- `QuickThrottleButton`, `QuickThrottleForm`, `QuickThrottleNumpad`, `QuickThrottleGlobalDialog`, `useQuickThrottle`
- Placement in all 5 pages + global dialog in `App.vue`
- `acquireThrottle` merge fix + regression test
- "Save to roster" chip in `ThrottleHeader.vue`
- Global keyboard shortcut (`t`)
- Mobile numpad variant

### Out of scope

- Recent-addresses MRU
- Bulk / consist acquisition
- Rebindable keyboard shortcut
- Auto-creation of roster stubs on acquire (explicit "Save to roster" action only)
