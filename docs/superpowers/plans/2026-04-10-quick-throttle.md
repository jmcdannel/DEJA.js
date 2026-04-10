# Quick Throttle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users acquire and drive any DCC address (1–9999) from any throttle-app page via a shared compact popover, a global `t` keyboard shortcut, and a mobile numpad variant, while preserving existing throttle state.

**Architecture:** One shared `useQuickThrottle` composable encapsulates validation + acquire + navigate. A shared `QuickThrottleForm` renders either a `v-text-field` (desktop) or a `QuickThrottleNumpad` (mobile) based on `(pointer: coarse)`. Two hosts render the form: `QuickThrottleButton` (per-page `v-menu` popover) and `QuickThrottleGlobalDialog` (mounted once in `App.vue`, keyboard-triggered). The shared `acquireThrottle()` in `@repo/modules` is updated to preserve running throttles via a `getDoc` existence check before writing speed/direction defaults. A `SaveToRosterChip` appears on the throttle view when the current address has no roster entry.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, Vuetify 3, Vue Router 4, Vuefire + Firestore, VueUse, Vitest, Firebase modular SDK.

**Spec:** `docs/superpowers/specs/2026-04-10-quick-throttle-design.md`

---

## File Structure

**Create:**
- `packages/modules/locos/useLocos.test.ts` — regression tests for `acquireThrottle` merge behavior (mocks Firebase)
- `apps/throttle/src/throttle/useQuickThrottle.ts` — composable: `open(address)`, `openGlobal()`, `registerGlobalShortcut()`, shared `globalDialogOpen` ref
- `apps/throttle/src/throttle/useQuickThrottle.test.ts` — unit tests
- `apps/throttle/src/throttle/QuickThrottleNumpad.vue` — leaf component: 3×4 numpad + readout
- `apps/throttle/src/throttle/QuickThrottleForm.vue` — responsive form body
- `apps/throttle/src/throttle/QuickThrottleButton.vue` — v-menu popover host
- `apps/throttle/src/throttle/QuickThrottleGlobalDialog.vue` — centered dialog host + keyboard listener
- `apps/throttle/src/throttle/SaveToRosterChip.vue` — "Not in roster" chip + save dialog

**Modify:**
- `packages/modules/locos/useLocos.ts` (`acquireThrottle` function, lines 86–106) — add `getDoc` existence check, use `merge: true`
- `apps/throttle/src/App.vue` — mount `<QuickThrottleGlobalDialog />` once
- `apps/throttle/src/views/RosterView.vue` — add button in `PageHeader` controls
- `apps/throttle/src/throttle/ThrottleList.vue` — add second FAB
- `apps/throttle/src/views/ThrottleView.vue` — add button in footer slide-group area + `SaveToRosterChip` overlay
- `apps/throttle/src/conductor/ConductorLayout.vue` — add button top-right
- `apps/throttle/src/quick-menu/QuickMenuThrottles.vue` — add button inline with "Add Loco"

---

## Task 1: `acquireThrottle` merge-safe fix

**Files:**
- Modify: `packages/modules/locos/useLocos.ts:86-106`
- Create: `packages/modules/locos/useLocos.acquireThrottle.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/modules/locos/useLocos.acquireThrottle.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Firebase before any import that uses it
const setDocMock = vi.fn().mockResolvedValue(undefined)
const getDocMock = vi.fn()
const docRef = { __type: 'docRef' }
const docFnMock = vi.fn(() => docRef)

vi.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => docFnMock(...args),
  collection: vi.fn(() => ({ __type: 'collection' })),
  getDoc: (...args: unknown[]) => getDocMock(...args),
  getDocs: vi.fn(),
  setDoc: (...args: unknown[]) => setDocMock(...args),
  deleteDoc: vi.fn(),
  where: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: () => 'SERVER_TIMESTAMP',
}))

vi.mock('@repo/firebase-config', () => ({ db: { __type: 'db' } }))

vi.mock('vuefire', () => ({
  useCollection: () => ({ value: [] }),
  useDocument: () => ({ value: null }),
}))

vi.mock('@vueuse/core', () => ({
  useStorage: (_key: string, initial: unknown) => ({ value: initial === '' ? 'layout-1' : initial }),
}))

vi.mock('@repo/utils', () => ({
  createLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}))

import { useLocos } from './useLocos'

describe('acquireThrottle', () => {
  beforeEach(() => {
    setDocMock.mockClear()
    getDocMock.mockClear()
    docFnMock.mockClear()
  })

  it('creates a new throttle with speed 0 / direction false when doc does not exist', async () => {
    getDocMock.mockResolvedValueOnce({ exists: () => false })
    const { acquireThrottle } = useLocos()
    await acquireThrottle(42)

    expect(setDocMock).toHaveBeenCalledTimes(1)
    const [, data, options] = setDocMock.mock.calls[0]
    expect(data).toMatchObject({ address: 42, speed: 0, direction: false })
    expect(options).toEqual({ merge: true })
  })

  it('preserves existing speed and direction on re-acquire', async () => {
    getDocMock.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ address: 42, speed: 55, direction: true }),
    })
    const { acquireThrottle } = useLocos()
    await acquireThrottle(42)

    expect(setDocMock).toHaveBeenCalledTimes(1)
    const [, data, options] = setDocMock.mock.calls[0]
    expect(data).toMatchObject({ address: 42 })
    expect(data).not.toHaveProperty('speed')
    expect(data).not.toHaveProperty('direction')
    expect(options).toEqual({ merge: true })
  })

  it('no-ops when address is falsy', async () => {
    const { acquireThrottle } = useLocos()
    await acquireThrottle(0)
    expect(setDocMock).not.toHaveBeenCalled()
    expect(getDocMock).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter=@repo/modules test useLocos.acquireThrottle
```

Expected: FAIL — current implementation sets `speed: 0, direction: false` on every call, second test will fail because `data` will have `speed`/`direction` keys.

- [ ] **Step 3: Update `acquireThrottle` implementation**

In `packages/modules/locos/useLocos.ts`, replace the existing `acquireThrottle` (lines 86–106):

```ts
  async function acquireThrottle(address: number) {
    try {
      if (!address) {
        log.warn('No throttle address provided for acquisition')
        return
      }
      const throttleRef = doc(
        db,
        `layouts/${layoutId.value}/throttles`,
        address.toString(),
      )
      const existing = await getDoc(throttleRef)
      const data = existing.exists()
        ? { address, timestamp: serverTimestamp() }
        : { address, speed: 0, direction: false, timestamp: serverTimestamp() }
      await setDoc(throttleRef, data, { merge: true })
    } catch (e) {
      log.error('Error adding throttle: ', e)
    }
  }
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter=@repo/modules test useLocos.acquireThrottle
```

Expected: 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add packages/modules/locos/useLocos.ts packages/modules/locos/useLocos.acquireThrottle.test.ts
git commit -m "$(cat <<'EOF'
fix(modules): 🛡️ preserve running throttle state on re-acquire

acquireThrottle now checks doc existence and only seeds speed/direction
defaults on first creation. Re-acquiring an address preserves the live
speed and direction, which is required for the upcoming quick throttle
feature but also fixes a latent bug in the existing add-from-roster
flows.
EOF
)"
```

---

## Task 2: `useQuickThrottle` composable

**Files:**
- Create: `apps/throttle/src/throttle/useQuickThrottle.ts`
- Create: `apps/throttle/src/throttle/useQuickThrottle.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/throttle/src/throttle/useQuickThrottle.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const acquireThrottleMock = vi.fn().mockResolvedValue(undefined)
const pushMock = vi.fn().mockResolvedValue(undefined)

vi.mock('@repo/modules/locos', () => ({
  useLocos: () => ({ acquireThrottle: acquireThrottleMock }),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

import { useQuickThrottle } from './useQuickThrottle'

describe('useQuickThrottle.open', () => {
  beforeEach(() => {
    acquireThrottleMock.mockClear()
    pushMock.mockClear()
  })

  it('acquires throttle and navigates on a valid address', async () => {
    const { open } = useQuickThrottle()
    await open(42)
    expect(acquireThrottleMock).toHaveBeenCalledWith(42)
    expect(pushMock).toHaveBeenCalledWith({ name: 'throttle', params: { address: 42 } })
  })

  it('rejects non-integer addresses', async () => {
    const { open } = useQuickThrottle()
    await open(3.5)
    expect(acquireThrottleMock).not.toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('rejects address 0 and negatives', async () => {
    const { open } = useQuickThrottle()
    await open(0)
    await open(-1)
    expect(acquireThrottleMock).not.toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('rejects addresses above 9999', async () => {
    const { open } = useQuickThrottle()
    await open(10000)
    expect(acquireThrottleMock).not.toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('propagates acquire errors and does not navigate', async () => {
    acquireThrottleMock.mockRejectedValueOnce(new Error('firestore down'))
    const { open } = useQuickThrottle()
    await expect(open(42)).rejects.toThrow('firestore down')
    expect(pushMock).not.toHaveBeenCalled()
  })
})

describe('useQuickThrottle.openGlobal', () => {
  it('flips globalDialogOpen to true', () => {
    const { openGlobal, globalDialogOpen } = useQuickThrottle()
    globalDialogOpen.value = false
    openGlobal()
    expect(globalDialogOpen.value).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm --filter=deja-throttle test:unit useQuickThrottle
```

Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Create the composable**

Create `apps/throttle/src/throttle/useQuickThrottle.ts`:

```ts
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocos } from '@repo/modules/locos'

const globalDialogOpen = ref(false)

export function useQuickThrottle() {
  const router = useRouter()
  const { acquireThrottle } = useLocos()

  async function open(address: number) {
    if (!Number.isInteger(address) || address < 1 || address > 9999) return
    await acquireThrottle(address)
    await router.push({ name: 'throttle', params: { address } })
  }

  function openGlobal() {
    globalDialogOpen.value = true
  }

  function closeGlobal() {
    globalDialogOpen.value = false
  }

  function registerGlobalShortcut() {
    function handler(e: KeyboardEvent) {
      if (e.key !== 't') return
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      const target = e.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return
      }
      e.preventDefault()
      openGlobal()
    }
    onMounted(() => window.addEventListener('keydown', handler))
    onUnmounted(() => window.removeEventListener('keydown', handler))
  }

  return { open, openGlobal, closeGlobal, registerGlobalShortcut, globalDialogOpen }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter=deja-throttle test:unit useQuickThrottle
```

Expected: 6 tests passing.

- [ ] **Step 5: Commit**

```bash
git add apps/throttle/src/throttle/useQuickThrottle.ts apps/throttle/src/throttle/useQuickThrottle.test.ts
git commit -m "$(cat <<'EOF'
feat(throttle): ⚡ add useQuickThrottle composable

Provides open(address) for validated acquire + navigate, openGlobal()
for the keyboard-triggered dialog, and registerGlobalShortcut() that
wires up the global 't' keybinding with input-focus guarding. Shared
globalDialogOpen ref lets any component trigger the global dialog.
EOF
)"
```

---

## Task 3: `QuickThrottleNumpad.vue` component

**Files:**
- Create: `apps/throttle/src/throttle/QuickThrottleNumpad.vue`

- [ ] **Step 1: Create the component**

Create `apps/throttle/src/throttle/QuickThrottleNumpad.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  canSubmit: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
}>()

const displayValue = computed(() => props.modelValue || '—')

function tap(digit: string) {
  const next = props.modelValue + digit
  if (next.length > 4) return
  emit('update:modelValue', next)
}

function backspace() {
  emit('update:modelValue', props.modelValue.slice(0, -1))
}

function submit() {
  if (props.canSubmit) emit('submit')
}
</script>

<template>
  <div class="quick-numpad">
    <div class="quick-numpad__display">
      <span class="quick-numpad__label">DCC</span>
      <span class="quick-numpad__value">{{ displayValue }}</span>
    </div>
    <div class="quick-numpad__grid">
      <button v-for="n in [1,2,3,4,5,6,7,8,9]" :key="n" class="quick-numpad__key" @click="tap(String(n))">
        {{ n }}
      </button>
      <button class="quick-numpad__key quick-numpad__key--util" @click="backspace" aria-label="Backspace">
        <v-icon size="20">mdi-backspace-outline</v-icon>
      </button>
      <button class="quick-numpad__key" @click="tap('0')">0</button>
      <button
        class="quick-numpad__key quick-numpad__key--submit"
        :disabled="!canSubmit"
        @click="submit"
        aria-label="Go"
      >
        <v-icon size="20">mdi-arrow-right</v-icon>
      </button>
    </div>
  </div>
</template>

<style scoped>
.quick-numpad {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.quick-numpad__display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  font-family: monospace;
}
.quick-numpad__label {
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  letter-spacing: 0.1em;
}
.quick-numpad__value {
  font-size: 1.6rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.95);
  letter-spacing: 0.05em;
}
.quick-numpad__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.quick-numpad__key {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 0;
  border-radius: 8px;
  border: none;
  background: rgba(var(--v-theme-on-surface), 0.06);
  color: rgba(var(--v-theme-on-surface), 0.9);
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 120ms ease, transform 80ms ease;
}
.quick-numpad__key:hover {
  background: rgba(var(--v-theme-on-surface), 0.12);
}
.quick-numpad__key:active {
  transform: scale(0.94);
}
.quick-numpad__key--util {
  background: rgba(var(--v-theme-on-surface), 0.04);
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.quick-numpad__key--submit {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}
.quick-numpad__key--submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add apps/throttle/src/throttle/QuickThrottleNumpad.vue
git commit -m "$(cat <<'EOF'
feat(throttle): 🔢 add QuickThrottleNumpad component

Touch-friendly 3x4 numpad with readout, backspace, and submit. Emits
update:modelValue as v-model and submit when Go is tapped. Used by
QuickThrottleForm on coarse-pointer devices.
EOF
)"
```

---

## Task 4: `QuickThrottleForm.vue` responsive form body

**Files:**
- Create: `apps/throttle/src/throttle/QuickThrottleForm.vue`

- [ ] **Step 1: Create the component**

Create `apps/throttle/src/throttle/QuickThrottleForm.vue`:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import QuickThrottleNumpad from './QuickThrottleNumpad.vue'

const emit = defineEmits<{
  submit: [address: number]
  cancel: []
}>()

const isCoarse = useMediaQuery('(pointer: coarse)')
const value = ref<string>('')

const parsed = computed<number | null>(() => {
  if (!value.value) return null
  const n = Number(value.value)
  if (!Number.isInteger(n)) return null
  if (n < 1 || n > 9999) return null
  return n
})

const canSubmit = computed(() => parsed.value !== null)

const helperText = computed(() => {
  if (!value.value) return 'Enter a DCC address (1–9999)'
  if (parsed.value === null) return 'Must be a whole number between 1 and 9999'
  return ''
})

function submit() {
  if (parsed.value !== null) {
    emit('submit', parsed.value)
    value.value = ''
  }
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
    <template v-else>
      <v-text-field
        v-model="value"
        type="number"
        inputmode="numeric"
        :min="1"
        :max="9999"
        label="DCC Address"
        :hint="helperText"
        persistent-hint
        autofocus
        density="compact"
        variant="outlined"
        @keyup.enter="submit"
      >
        <template #append-inner>
          <v-btn
            icon="mdi-arrow-right"
            size="small"
            variant="text"
            :disabled="!canSubmit"
            aria-label="Go"
            @click="submit"
          />
        </template>
      </v-text-field>
    </template>
  </div>
</template>

<style scoped>
.quick-throttle-form {
  min-width: 220px;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add apps/throttle/src/throttle/QuickThrottleForm.vue
git commit -m "$(cat <<'EOF'
feat(throttle): 📝 add QuickThrottleForm responsive body

Shared form component that renders QuickThrottleNumpad on coarse-pointer
devices and a v-text-field on desktop. Parses and validates the DCC
address (1-9999) before emitting submit, and clears the input after
a successful submission.
EOF
)"
```

---

## Task 5: `QuickThrottleButton.vue` per-page host

**Files:**
- Create: `apps/throttle/src/throttle/QuickThrottleButton.vue`

- [ ] **Step 1: Create the component**

Create `apps/throttle/src/throttle/QuickThrottleButton.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useQuickThrottle } from './useQuickThrottle'
import QuickThrottleForm from './QuickThrottleForm.vue'

withDefaults(
  defineProps<{
    size?: 'x-small' | 'small' | 'default' | 'large'
    color?: string
    icon?: string
    label?: string
  }>(),
  {
    size: 'default',
    color: 'primary',
    icon: 'mdi-numeric',
    label: '',
  },
)

const { open } = useQuickThrottle()
const menu = ref(false)
const error = ref<string | null>(null)

async function handleSubmit(address: number) {
  error.value = null
  menu.value = false
  try {
    await open(address)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to acquire throttle'
    console.error('Quick throttle failed', err)
  }
}
</script>

<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    location="bottom end"
    offset="8"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-if="label"
        v-bind="activatorProps"
        :size="size"
        :color="color"
        :prepend-icon="icon"
        variant="tonal"
        aria-label="Quick throttle by DCC address"
      >
        {{ label }}
      </v-btn>
      <v-btn
        v-else
        v-bind="activatorProps"
        :size="size"
        :color="color"
        :icon="icon"
        aria-label="Quick throttle by DCC address"
      />
    </template>
    <v-card class="pa-3" min-width="260">
      <div class="text-subtitle-2 mb-2">Quick Throttle 🚂</div>
      <QuickThrottleForm @submit="handleSubmit" @cancel="menu = false" />
      <div v-if="error" class="text-caption text-error mt-2">{{ error }}</div>
    </v-card>
  </v-menu>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add apps/throttle/src/throttle/QuickThrottleButton.vue
git commit -m "$(cat <<'EOF'
feat(throttle): 🔘 add QuickThrottleButton popover host

Icon or labeled button that opens a v-menu popover containing the
shared QuickThrottleForm. Forwards submissions to useQuickThrottle.open
and surfaces errors inline. Renders optionally with a text label for
placements that need it.
EOF
)"
```

---

## Task 6: `QuickThrottleGlobalDialog.vue` + mount in `App.vue`

**Files:**
- Create: `apps/throttle/src/throttle/QuickThrottleGlobalDialog.vue`
- Modify: `apps/throttle/src/App.vue`

- [ ] **Step 1: Create the dialog component**

Create `apps/throttle/src/throttle/QuickThrottleGlobalDialog.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useQuickThrottle } from './useQuickThrottle'
import QuickThrottleForm from './QuickThrottleForm.vue'

const { open, globalDialogOpen, registerGlobalShortcut } = useQuickThrottle()

registerGlobalShortcut()

const error = ref<string | null>(null)

async function handleSubmit(address: number) {
  error.value = null
  globalDialogOpen.value = false
  try {
    await open(address)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to acquire throttle'
    console.error('Quick throttle failed', err)
  }
}
</script>

<template>
  <v-dialog v-model="globalDialogOpen" max-width="340">
    <v-card class="pa-4">
      <div class="text-subtitle-1 mb-3 font-weight-bold">Quick Throttle 🚂</div>
      <QuickThrottleForm @submit="handleSubmit" @cancel="globalDialogOpen = false" />
      <div v-if="error" class="text-caption text-error mt-2">{{ error }}</div>
    </v-card>
  </v-dialog>
</template>
```

- [ ] **Step 2: Mount in `App.vue`**

In `apps/throttle/src/App.vue`, add the import alongside the existing `QuickMenu` import:

```ts
import QuickMenu from '@/quick-menu/QuickMenu.vue'
import QuickThrottleGlobalDialog from '@/throttle/QuickThrottleGlobalDialog.vue'
```

Then add the component in the template, right after `<QuickMenu v-if="!isFullscreen" />` (around line 176):

```vue
        <QuickMenu v-if="!isFullscreen" />
        <QuickThrottleGlobalDialog v-if="!isFullscreen" />
        <ConnectionStatusBanner v-if="!isFullscreen" />
```

- [ ] **Step 3: Manual sanity check**

Run: `pnpm --filter=deja-throttle dev`

Expected:
- Navigate to `/` while signed in
- Press `t` — dialog opens with autofocused input
- Type `42`, press Enter — navigates to `/throttle/42`
- Focus the main nav input (if any) or a text field, press `t` — dialog does NOT open
- Press `Cmd+T` — native "new browser tab" still works (not hijacked)

- [ ] **Step 4: Commit**

```bash
git add apps/throttle/src/throttle/QuickThrottleGlobalDialog.vue apps/throttle/src/App.vue
git commit -m "$(cat <<'EOF'
feat(throttle): ⌨️ add global QuickThrottleGlobalDialog with t shortcut

Centered dialog host mounted once in App.vue. Registers the global 't'
keyboard shortcut through useQuickThrottle, guarded against firing
when an input or contenteditable is focused. Shares QuickThrottleForm
with the per-page button so behavior stays consistent.
EOF
)"
```

---

## Task 7: Add button to `RosterView.vue`

**Files:**
- Modify: `apps/throttle/src/views/RosterView.vue`

- [ ] **Step 1: Add import**

At the top of the `<script setup>` block, after the existing imports:

```ts
import QuickThrottleButton from '@/throttle/QuickThrottleButton.vue'
```

- [ ] **Step 2: Add button in the header controls slot**

Replace the existing `#controls` template (lines 60-69) with:

```vue
      <template #controls>
        <div class="flex items-center gap-2">
          <ListControlBar
            :controls="rosterControls"
            color="pink"
            :sort-options="sortOptions"
            :filters="filters"
            :show-view="true"
            :view-options="viewOptions"
            :show-search="false"
          />
          <QuickThrottleButton size="small" color="pink" />
        </div>
      </template>
```

- [ ] **Step 3: Commit**

```bash
git add apps/throttle/src/views/RosterView.vue
git commit -m "feat(throttle): 🚂 add quick throttle button to roster page"
```

---

## Task 8: Add button to `ThrottleList.vue`

**Files:**
- Modify: `apps/throttle/src/throttle/ThrottleList.vue`

- [ ] **Step 1: Add import**

After the existing imports in the `<script setup>` block:

```ts
import QuickThrottleButton from '@/throttle/QuickThrottleButton.vue'
```

- [ ] **Step 2: Stack the quick throttle FAB above the existing `+` FAB**

Replace the existing `v-fab` line (line 88) with:

```vue
    <div class="throttle-list-fabs">
      <QuickThrottleButton size="default" color="primary" icon="mdi-numeric" />
      <v-fab icon="mdi-plus" color="primary" size="56" @click="isRosterOpen = true" app />
    </div>
```

Add to the existing `<style scoped>` block:

```css
.throttle-list-fabs {
  position: fixed;
  right: 16px;
  bottom: 96px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  z-index: 5;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/throttle/src/throttle/ThrottleList.vue
git commit -m "feat(throttle): 🚂 add quick throttle FAB to throttle list"
```

---

## Task 9: Add button + SaveToRosterChip host to `ThrottleView.vue`

> `SaveToRosterChip` itself is built in Task 12. In this task we only add the quick throttle button.

**Files:**
- Modify: `apps/throttle/src/views/ThrottleView.vue`

- [ ] **Step 1: Add import**

After the existing imports:

```ts
import QuickThrottleButton from '@/throttle/QuickThrottleButton.vue'
```

- [ ] **Step 2: Place button at the leading end of the footer slide-group**

Replace the existing `<v-slide-group>` block (lines 85-95) with:

```vue
    <div class="throttle-footer flex items-center gap-2 px-2">
      <QuickThrottleButton size="small" color="primary" />
      <v-slide-group
        selected-class="bg-success"
        show-arrows
        class="flex-1"
      >
        <v-slide-group-item
          v-for="item in throttles"
          :key="item.id"
        >
          <ThrottleNavItem v-if="item.address" :address="item.address" @select="handleSelect(item.address)" />
        </v-slide-group-item>
      </v-slide-group>
    </div>
```

- [ ] **Step 3: Commit**

```bash
git add apps/throttle/src/views/ThrottleView.vue
git commit -m "feat(throttle): 🚂 add quick throttle button to throttle view footer"
```

---

## Task 10: Add button to `ConductorLayout.vue`

**Files:**
- Modify: `apps/throttle/src/conductor/ConductorLayout.vue`

- [ ] **Step 1: Add import**

After the existing imports:

```ts
import QuickThrottleButton from '@/throttle/QuickThrottleButton.vue'
```

- [ ] **Step 2: Absolutely position the button in the top-right of the main grid**

Replace the opening `<main>` tag (line 26) with:

```vue
    <main class="@container relative">
      <div class="conductor-quick-throttle">
        <QuickThrottleButton size="small" color="green" />
      </div>
```

Add to the existing `<style scoped>` block:

```css
.conductor-quick-throttle {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/throttle/src/conductor/ConductorLayout.vue
git commit -m "feat(throttle): 🚂 add quick throttle button to conductor view"
```

---

## Task 11: Add button to `QuickMenuThrottles.vue`

**Files:**
- Modify: `apps/throttle/src/quick-menu/QuickMenuThrottles.vue`

- [ ] **Step 1: Add import**

After the existing imports in the `<script setup>` block:

```ts
import QuickThrottleButton from '@/throttle/QuickThrottleButton.vue'
```

- [ ] **Step 2: Replace the single "Add Loco" button with an inline row**

Replace the existing `<button class="quick-throttles__add" ...>` element (lines 94-97) with:

```vue
      <div class="quick-throttles__actions">
        <button class="quick-throttles__add" @click="showRoster = true">
          <v-icon size="14">mdi-plus</v-icon>
          <span>Add Loco</span>
        </button>
        <QuickThrottleButton size="x-small" color="primary" />
      </div>
```

Add to the existing `<style scoped>` block:

```css
.quick-throttles__actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.quick-throttles__actions .quick-throttles__add {
  flex: 1;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/throttle/src/quick-menu/QuickMenuThrottles.vue
git commit -m "feat(throttle): 🚂 add quick throttle button to quick menu"
```

---

## Task 12: `SaveToRosterChip.vue` — "Not in roster" affordance

**Files:**
- Create: `apps/throttle/src/throttle/SaveToRosterChip.vue`
- Modify: `apps/throttle/src/views/ThrottleView.vue`

- [ ] **Step 1: Create the chip component**

Create `apps/throttle/src/throttle/SaveToRosterChip.vue`:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { useLocos, ROADNAMES, type Loco } from '@repo/modules/locos'
import { createLogger } from '@repo/utils'

const props = defineProps<{
  address: number
}>()

const log = createLogger('SaveToRosterChip')
const layoutId = useStorage('@DEJA/layoutId', '')
const { getLocos } = useLocos()
const locos = getLocos()

const hasLoco = computed(() => {
  if (!props.address) return false
  return ((locos.value || []) as Loco[]).some((l) => l.address === props.address)
})

const dialog = ref(false)
const name = ref('')
const roadname = ref<string | null>(null)
const saving = ref(false)

async function save() {
  if (!layoutId.value || !props.address) return
  saving.value = true
  try {
    await setDoc(
      doc(db, `layouts/${layoutId.value}/locos`, props.address.toString()),
      {
        address: props.address,
        name: name.value || `Loco ${props.address}`,
        meta: { roadname: roadname.value || '' },
        timestamp: serverTimestamp(),
      },
      { merge: true },
    )
    dialog.value = false
    name.value = ''
    roadname.value = null
  } catch (e) {
    log.error('Failed to save loco to roster', e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <template v-if="!hasLoco && address">
    <v-chip
      color="amber"
      size="small"
      variant="tonal"
      prepend-icon="mdi-tag-plus-outline"
      class="save-to-roster-chip"
      @click="dialog = true"
    >
      Not in roster · Save
    </v-chip>
    <v-dialog v-model="dialog" max-width="360">
      <v-card class="pa-4">
        <div class="text-subtitle-1 mb-3 font-weight-bold">Save Loco #{{ address }}</div>
        <v-text-field
          v-model="name"
          label="Name"
          placeholder="e.g. GP38"
          density="compact"
          variant="outlined"
          autofocus
        />
        <v-select
          v-model="roadname"
          :items="ROADNAMES"
          item-title="label"
          item-value="value"
          label="Roadname"
          density="compact"
          variant="outlined"
          clearable
        />
        <div class="flex justify-end gap-2 mt-2">
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="save">Save</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </template>
</template>

<style scoped>
.save-to-roster-chip {
  cursor: pointer;
}
</style>
```

- [ ] **Step 2: Mount the chip in `ThrottleView.vue`**

In `apps/throttle/src/views/ThrottleView.vue`, add the import next to the existing `QuickThrottleButton` import:

```ts
import SaveToRosterChip from '@/throttle/SaveToRosterChip.vue'
```

Inside the main wrapper `<div class="@container ...">`, add the chip just before the `<component :is="variantComponent" ...>` line (around line 84):

```vue
    <div class="absolute top-2 left-2 z-10">
      <SaveToRosterChip v-if="!Number.isNaN(routeAddr)" :address="routeAddr" />
    </div>
    <component :is="variantComponent" :address="routeAddr" v-bind="settingsProps" class="flex-1 min-h-0" />
```

- [ ] **Step 3: Manual sanity check**

Run: `pnpm --filter=deja-throttle dev`

Expected:
- Open quick throttle, type an address that is NOT in the roster (e.g. `9999`), submit
- On the resulting throttle view, the amber "Not in roster · Save" chip appears in the top-left
- Click chip → dialog opens prefilled with the address
- Save with name "Test" → chip disappears (because `loco` computed now finds a match)
- Open quick throttle with address `3` (a roster loco) → chip does NOT appear

- [ ] **Step 4: Commit**

```bash
git add apps/throttle/src/throttle/SaveToRosterChip.vue apps/throttle/src/views/ThrottleView.vue
git commit -m "$(cat <<'EOF'
feat(throttle): 🏷️ add SaveToRosterChip to throttle view

When a throttle view is showing an address that has no matching roster
entry, surface a non-blocking amber chip offering to save it. Tapping
opens a minimal dialog for name + roadname, writes the loco doc, and
the chip disappears once the computed roster lookup resolves.
EOF
)"
```

---

## Task 13: Full verification pass

**Files:** (none — verification only)

- [ ] **Step 1: Lint + type-check + unit tests**

```bash
pnpm --filter=@repo/modules test
pnpm --filter=deja-throttle test:unit
pnpm --filter=deja-throttle lint
pnpm --filter=deja-throttle type-check
```

Expected:
- All tests pass (including new `acquireThrottle` and `useQuickThrottle` tests)
- Lint clean
- Type-check clean

- [ ] **Step 2: Build**

```bash
pnpm --filter=deja-throttle build
```

Expected: build succeeds with no new warnings introduced by the new files.

- [ ] **Step 3: Manual smoke test all 5 placements**

Run: `pnpm --filter=deja-throttle dev`

For each placement, verify:
1. **Roster (`/locos`)** — small pink `mdi-numeric` button sits next to the list controls. Click → popover opens. Type `5` → Enter → navigates to `/throttle/5`.
2. **Throttle List (`/throttles`)** — quick throttle FAB stacked above the `+` FAB. Click → popover → submit → navigates.
3. **Throttle page (`/throttle/3`)** — button at leading end of footer slide-group. Works as above.
4. **Conductor (`/conductor`)** — button top-right of main grid. Works as above.
5. **QuickMenu (FAB bottom corner)** — button inline with "Add Loco" row. Works as above.
6. **Keyboard** — press `t` from any page → global dialog opens. Submit works.
7. **Keyboard guard** — focus a text input in Settings, press `t` → dialog does NOT open.
8. **Preservation** — open throttle `3`, set speed to 40, re-open via quick throttle → speed still 40, not zeroed out.
9. **Save to roster** — quick-throttle an address not in your roster → amber chip → save → chip disappears.

- [ ] **Step 4: Commit the checkmarked plan**

```bash
git add docs/superpowers/plans/2026-04-10-quick-throttle.md
git commit -m "docs(plan): ✅ mark quick throttle plan tasks complete"
```

---

## Out of Scope (deferred)

- Recent-addresses MRU dropdown
- Bulk / consist acquisition through the quick form
- Rebindable keyboard shortcut
- Snackbar integration for acquire errors (currently logs to console + inline error text)
- E2E Playwright test for keyboard shortcut (covered by manual smoke test only)
