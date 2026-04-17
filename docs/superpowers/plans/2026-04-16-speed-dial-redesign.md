# Speed Dial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the SpeedDial component to show smart defaults (9 DCC functions for sound locos, 1 DCC + 8 sound-library buttons for silent locos) in a 3×3+ desktop / 2×5+ mobile grid with a "..." overflow button, and ship a migration script to backfill existing Firestore locos.

**Architecture:** Option A — single `SpeedDial.vue` that computes a `slots` array and routes each slot to either `FunctionButton` (DCC) or a new `SoundButton` (sound API). New default arrays in `constants.ts` are applied at loco creation time and by the migration script.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, Vuetify 3, Tailwind CSS, Vitest, Firebase Admin SDK (migration only), `tsx` (script runner)

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `packages/modules/locos/soundSlotDefaults.ts` | `SoundSlot` type + 8 hardcoded sound slots |
| Modify | `packages/modules/locos/constants.ts` | Add `soundLocoDefaultFunctions` + `silentLocoDefaultFunctions` |
| Modify | `packages/modules/locos/index.ts` | Export new symbols |
| Modify | `packages/modules/locos/useLocos.ts` | Apply defaults in `createLoco` |
| Create | `packages/ui/src/Functions/SoundButton.vue` | Round button that calls `runEffect` with a sound slot |
| Modify | `packages/ui/src/Functions/SpeedDial.vue` | Dynamic slot computation + new grid layout |
| Create | `scripts/migrate-loco-function-defaults.ts` | One-time Firestore migration |
| Create | `packages/modules/locos/soundSlotDefaults.test.ts` | Tests for sound slot shape |
| Create | `packages/modules/locos/locoFunctionDefaults.test.ts` | Tests for new default arrays |

---

## Task 1: Add `soundSlotDefaults.ts` with `SoundSlot` type and 8 default slots

**Files:**
- Create: `packages/modules/locos/soundSlotDefaults.ts`
- Create: `packages/modules/locos/soundSlotDefaults.test.ts`

- [ ] **Step 1: Create the source file**

```ts
// packages/modules/locos/soundSlotDefaults.ts

export interface SoundSlot {
  label: string
  icon: string        // key from FUNCTION_ICONS (light, bell, horn, etc.)
  soundKey: string    // Vercel Blob filename/key — placeholder until catalog is complete
  isMomentary: boolean
}

export const soundSlotDefaults: SoundSlot[] = [
  { label: 'Horn',      icon: 'horn',     soundKey: 'train-horn.mp3',          isMomentary: true  },
  { label: 'Bell',      icon: 'bell',     soundKey: 'train-bell.mp3',          isMomentary: true  },
  { label: 'Coupler',   icon: 'coupler',  soundKey: 'train-coupler.mp3',       isMomentary: true  },
  { label: 'Brake',     icon: 'brake',    soundKey: 'train-brake-squeal.mp3',  isMomentary: true  },
  { label: 'Air',       icon: 'air',      soundKey: 'train-air-release.mp3',   isMomentary: true  },
  { label: 'Dyn Brake', icon: 'fan',      soundKey: 'train-dynamic-brake.mp3', isMomentary: false },
  { label: 'Announce',  icon: 'announce', soundKey: 'station-announce.mp3',    isMomentary: false },
  { label: 'Ambient',   icon: 'sound',    soundKey: 'train-ambient.mp3',       isMomentary: false },
]
```

- [ ] **Step 2: Write tests**

```ts
// packages/modules/locos/soundSlotDefaults.test.ts
import { describe, it, expect } from 'vitest'
import { soundSlotDefaults, type SoundSlot } from './soundSlotDefaults'

describe('soundSlotDefaults', () => {
  it('exports exactly 8 slots', () => {
    expect(soundSlotDefaults).toHaveLength(8)
  })

  it('every slot has required fields', () => {
    for (const slot of soundSlotDefaults) {
      expect(typeof slot.label).toBe('string')
      expect(slot.label.length).toBeGreaterThan(0)
      expect(typeof slot.icon).toBe('string')
      expect(slot.icon.length).toBeGreaterThan(0)
      expect(typeof slot.soundKey).toBe('string')
      expect(slot.soundKey.length).toBeGreaterThan(0)
      expect(typeof slot.isMomentary).toBe('boolean')
    }
  })

  it('first 5 slots are momentary (Horn, Bell, Coupler, Brake, Air)', () => {
    const momentary = soundSlotDefaults.slice(0, 5)
    expect(momentary.every(s => s.isMomentary)).toBe(true)
  })

  it('last 3 slots are not momentary (Dyn Brake, Announce, Ambient)', () => {
    const latching = soundSlotDefaults.slice(5)
    expect(latching.every(s => !s.isMomentary)).toBe(true)
  })

  it('icons are valid FUNCTION_ICONS keys', () => {
    const validIcons = ['light', 'bell', 'horn', 'wifi', 'coupler', 'fan', 'brake',
      'station', 'mute', 'quiet', 'sound', 'track', 'air', 'announce', 'dim']
    for (const slot of soundSlotDefaults) {
      expect(validIcons).toContain(slot.icon)
    }
  })
})
```

- [ ] **Step 3: Run tests**

```bash
pnpm --filter=@repo/modules vitest run packages/modules/locos/soundSlotDefaults.test.ts
```

Expected: all 5 tests pass.

- [ ] **Step 4: Commit**

```bash
git add packages/modules/locos/soundSlotDefaults.ts packages/modules/locos/soundSlotDefaults.test.ts
git commit -m "feat(modules): add SoundSlot type and soundSlotDefaults 🔊"
```

---

## Task 2: Add `soundLocoDefaultFunctions` and `silentLocoDefaultFunctions` to `constants.ts`

**Files:**
- Modify: `packages/modules/locos/constants.ts`
- Create: `packages/modules/locos/locoFunctionDefaults.test.ts`

- [ ] **Step 1: Add the two new arrays to constants.ts**

Add these after the existing `defaultFunctions` export in `packages/modules/locos/constants.ts`:

```ts
// Add this import at the top if not already present:
// import type { LocoFunction, RoadName } from './types'
// (it is already there)

export const soundLocoDefaultFunctions: LocoFunction[] = Array.from({ length: 32 }, (_, id) => {
  const presets: Record<number, Partial<LocoFunction>> = {
    0: { label: 'Light',     icon: 'light',   isFavorite: true, isMomentary: false },
    1: { label: 'Bell',      icon: 'bell',    isFavorite: true, isMomentary: true  },
    2: { label: 'Horn',      icon: 'horn',    isFavorite: true, isMomentary: true  },
    3: { label: 'Coupler',   icon: 'coupler', isFavorite: true, isMomentary: true  },
    4: { label: 'Dyn Brake', icon: 'brake',   isFavorite: true, isMomentary: false },
    5: { label: 'Dim Lights',icon: 'dim',     isFavorite: true, isMomentary: false },
    6: { label: 'Cab Light', icon: 'light',   isFavorite: true, isMomentary: false },
    8: { label: 'Mute',      icon: 'mute',    isFavorite: true, isMomentary: false },
    9: { label: 'Start-Up',  icon: 'sound',   isFavorite: true, isMomentary: true  },
  }
  return {
    id,
    label:       presets[id]?.label      ?? `F${id}`,
    icon:        presets[id]?.icon       ?? null,
    isFavorite:  presets[id]?.isFavorite ?? false,
    isMomentary: presets[id]?.isMomentary ?? false,
  }
})

export const silentLocoDefaultFunctions: LocoFunction[] = Array.from({ length: 32 }, (_, id) => ({
  id,
  label:       id === 0 ? 'Light' : `F${id}`,
  icon:        id === 0 ? 'light' : null,
  isFavorite:  id === 0,
  isMomentary: false,
}))
```

- [ ] **Step 2: Write tests**

```ts
// packages/modules/locos/locoFunctionDefaults.test.ts
import { describe, it, expect } from 'vitest'
import { soundLocoDefaultFunctions, silentLocoDefaultFunctions } from './constants'

describe('soundLocoDefaultFunctions', () => {
  it('has exactly 32 entries', () => {
    expect(soundLocoDefaultFunctions).toHaveLength(32)
  })

  it('each entry has a sequential id', () => {
    soundLocoDefaultFunctions.forEach((f, i) => expect(f.id).toBe(i))
  })

  it('has exactly 9 favorites (F0–F6, F8, F9)', () => {
    const favorites = soundLocoDefaultFunctions.filter(f => f.isFavorite)
    expect(favorites).toHaveLength(9)
    expect(favorites.map(f => f.id)).toEqual([0, 1, 2, 3, 4, 5, 6, 8, 9])
  })

  it('F0 is Light, not momentary', () => {
    const f0 = soundLocoDefaultFunctions[0]
    expect(f0.label).toBe('Light')
    expect(f0.icon).toBe('light')
    expect(f0.isMomentary).toBe(false)
  })

  it('F1 Bell and F2 Horn are momentary', () => {
    expect(soundLocoDefaultFunctions[1].isMomentary).toBe(true)
    expect(soundLocoDefaultFunctions[2].isMomentary).toBe(true)
  })

  it('F3 Coupler is momentary', () => {
    expect(soundLocoDefaultFunctions[3].isMomentary).toBe(true)
  })

  it('F8 Mute is not momentary', () => {
    expect(soundLocoDefaultFunctions[8].isMomentary).toBe(false)
  })

  it('F7 is bare (not a favorite)', () => {
    const f7 = soundLocoDefaultFunctions[7]
    expect(f7.label).toBe('F7')
    expect(f7.isFavorite).toBe(false)
    expect(f7.icon).toBeNull()
  })

  it('non-preset functions have F{n} labels and null icons', () => {
    const bareFunctions = soundLocoDefaultFunctions.filter(f => !f.isFavorite)
    for (const f of bareFunctions) {
      expect(f.label).toBe(`F${f.id}`)
      expect(f.icon).toBeNull()
    }
  })
})

describe('silentLocoDefaultFunctions', () => {
  it('has exactly 32 entries', () => {
    expect(silentLocoDefaultFunctions).toHaveLength(32)
  })

  it('each entry has a sequential id', () => {
    silentLocoDefaultFunctions.forEach((f, i) => expect(f.id).toBe(i))
  })

  it('only F0 is a favorite', () => {
    const favorites = silentLocoDefaultFunctions.filter(f => f.isFavorite)
    expect(favorites).toHaveLength(1)
    expect(favorites[0].id).toBe(0)
  })

  it('F0 is Light', () => {
    const f0 = silentLocoDefaultFunctions[0]
    expect(f0.label).toBe('Light')
    expect(f0.icon).toBe('light')
    expect(f0.isMomentary).toBe(false)
  })

  it('all other functions are bare F{n} with no icon', () => {
    const rest = silentLocoDefaultFunctions.slice(1)
    for (const f of rest) {
      expect(f.label).toBe(`F${f.id}`)
      expect(f.icon).toBeNull()
      expect(f.isFavorite).toBe(false)
    }
  })
})
```

- [ ] **Step 3: Run tests**

```bash
pnpm --filter=@repo/modules vitest run packages/modules/locos/locoFunctionDefaults.test.ts
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add packages/modules/locos/constants.ts packages/modules/locos/locoFunctionDefaults.test.ts
git commit -m "feat(modules): add soundLocoDefaultFunctions and silentLocoDefaultFunctions 🚂"
```

---

## Task 3: Update `packages/modules/locos/index.ts` exports

**Files:**
- Modify: `packages/modules/locos/index.ts`

- [ ] **Step 1: Add new exports**

```ts
// packages/modules/locos/index.ts — full file after edit:
export * from './types.js'
export * from './constants.js'
export * from './soundSlotDefaults.js'
export { default as useLocos } from './useLocos.js'
export { default as useFunctions } from './useFunctions.js'
export { default as useFunctionIcon } from './useFunctionIcon.js'
```

- [ ] **Step 2: Verify the package still type-checks**

```bash
pnpm --filter=@repo/modules check-types
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/modules/locos/index.ts
git commit -m "feat(modules): export SoundSlot, soundSlotDefaults, and new defaults from locos index 📦"
```

---

## Task 4: Apply function defaults in `createLoco`

**Files:**
- Modify: `packages/modules/locos/useLocos.ts`

- [ ] **Step 1: Add the import and update `createLoco`**

At the top of `packages/modules/locos/useLocos.ts`, add to the existing import from `'./constants'`:

```ts
import { ROADNAMES, soundLocoDefaultFunctions, silentLocoDefaultFunctions } from './constants'
```

Then replace the `createLoco` function body (currently at lines 163–190):

```ts
async function createLoco(
  address: number,
  name: string | undefined,
  roadname: string | undefined = undefined,
  hasSound = true,
): Promise<number | undefined> {
  log.debug('dejaCloud createLoco', address)
  try {
    const functions = hasSound ? soundLocoDefaultFunctions : silentLocoDefaultFunctions
    const loco: Record<string, unknown> = {
      address,
      name,
      hasSound,
      functions,
      meta: {},
      timestamp: serverTimestamp(),
    }
    if (roadname) {
      loco.meta = { roadname }
    }
    await setDoc(
      doc(db, `layouts/${layoutId.value}/locos`, address.toString()),
      loco
    )
    log.debug('loco written with ID: ', address)
    return address
  } catch (e) {
    log.error('Error adding loco: ', e)
  }
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm --filter=@repo/modules check-types
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/modules/locos/useLocos.ts
git commit -m "feat(modules): apply function defaults at loco creation time 🎛️"
```

---

## Task 5: Create `SoundButton.vue`

**Files:**
- Create: `packages/ui/src/Functions/SoundButton.vue`

- [ ] **Step 1: Create the component**

```vue
<!-- packages/ui/src/Functions/SoundButton.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEfx } from '@repo/modules/effects'
import { useFunctionIcon, type SoundSlot } from '@repo/modules/locos'

const props = defineProps<{
  soundSlot: SoundSlot
  showLabel?: boolean
}>()

const { runEffect } = useEfx()
const { getIconComponent } = useFunctionIcon()

const isActive = ref(false)
const icon = computed(() => getIconComponent(props.soundSlot.icon))

const buttonClasses = computed(() => {
  const classes = [
    'rounded-full',
    'border',
    'border-cyan-400/60',
    'fn-btn-bg',
    'relative',
    'p-2',
    'transition-all',
    'duration-deja-fast',
    'ease-deja-standard',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-cyan-300',
    'bg-blue-900/80',
    'text-cyan-100',
    'shadow-[inset_0_3px_6px_rgba(14,165,233,0.25)]',
  ]
  if (isActive.value) {
    classes.push('ring-2', 'ring-cyan-300', 'shadow-inner', 'scale-95')
  }
  return classes.join(' ')
})

async function activate() {
  if (isActive.value) return
  isActive.value = true
  await runEffect({
    id: props.soundSlot.label,
    type: 'sound',
    soundBlobUrl: props.soundSlot.soundKey,
    state: true,
  })
}

async function deactivate() {
  if (!isActive.value) return
  isActive.value = false
  if (props.soundSlot.isMomentary) {
    await runEffect({
      id: props.soundSlot.label,
      type: 'sound',
      soundBlobUrl: props.soundSlot.soundKey,
      state: false,
    })
  }
}

function handlePointerDown(event: PointerEvent) {
  event.preventDefault()
  if (typeof event.pointerId === 'number') {
    (event.currentTarget as HTMLElement)?.setPointerCapture?.(event.pointerId)
  }
  activate()
}

function handlePointerUp(event: PointerEvent) {
  if (typeof event.pointerId === 'number') {
    (event.currentTarget as HTMLElement)?.releasePointerCapture?.(event.pointerId)
  }
  deactivate()
}

const sharedListeners = {
  onPointerdown: handlePointerDown,
  onPointerup: handlePointerUp,
  onPointerleave: deactivate,
  onPointercancel: deactivate,
}
</script>

<template>
  <v-btn
    v-if="showLabel"
    v-bind="sharedListeners"
    :prepend-icon="icon"
    :class="[buttonClasses, 'px-4 gap-2 justify-start text-sm font-semibold tracking-wide']"
  >
    {{ soundSlot.label }}
  </v-btn>
  <v-btn
    v-else
    v-bind="sharedListeners"
    :icon="icon"
    :class="[buttonClasses, 'w-12 h-12']"
  />
</template>

<style scoped>
.fn-btn-bg {
  background: rgba(var(--v-theme-surface), 0.8);
}
</style>
```

- [ ] **Step 2: Type-check**

```bash
pnpm check-types
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/Functions/SoundButton.vue
git commit -m "feat(ui): add SoundButton component for sound-library playback 🔉"
```

---

## Task 6: Rewrite `SpeedDial.vue` with dynamic slots and new grid layout

**Files:**
- Modify: `packages/ui/src/Functions/SpeedDial.vue`

- [ ] **Step 1: Replace the file**

```vue
<!-- packages/ui/src/Functions/SpeedDial.vue -->
<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'
import { useDisplay } from 'vuetify'
import FunctionButton from './FunctionButton.vue'
import SoundButton from './SoundButton.vue'
import FunctionList from './FunctionList.vue'
import type { Loco, LocoFunction } from '@repo/modules/locos'
import { soundSlotDefaults, type SoundSlot } from '@repo/modules/locos'

type DccSlot = { kind: 'dcc'; func: LocoFunction }
type SoundSlotItem = { kind: 'sound'; slot: SoundSlot }
type SpeedDialSlot = DccSlot | SoundSlotItem

const props = defineProps({
  loco: {
    type: Object as PropType<Loco>,
    required: true,
  },
})

defineEmits(['saveLoco'])

const { mobile } = useDisplay()
const listRef = ref<{ showModal: () => void } | null>(null)

function openAllFunctions() {
  listRef?.value?.showModal()
}

defineExpose({
  openAll: () => listRef?.value?.showModal(),
})

const slots = computed<SpeedDialSlot[]>(() => {
  const favorites = props.loco.functions?.filter(f => f.isFavorite) ?? []

  if (props.loco.hasSound) {
    // Sound loco: show all favorited DCC functions
    return favorites.map(func => ({ kind: 'dcc' as const, func }))
  }

  // Silent loco: DCC favorites + pad with sound slots up to 9 total
  const dccSlots: SpeedDialSlot[] = favorites.map(func => ({ kind: 'dcc' as const, func }))
  const soundPadding = Math.max(0, 9 - dccSlots.length)
  const soundSlots: SpeedDialSlot[] = soundSlotDefaults
    .slice(0, soundPadding)
    .map(slot => ({ kind: 'sound' as const, slot }))
  return [...dccSlots, ...soundSlots]
})
</script>

<template>
  <template v-if="loco">
    <section class="flex flex-col flex-grow justify-center">
      <ul
        :class="[
          'grid',
          mobile ? 'grid-cols-2' : 'grid-cols-3',
          'justify-center',
          'mx-2',
          'items-center',
          'gap-1',
        ]"
      >
        <li v-for="(item, idx) in slots" :key="idx">
          <FunctionButton
            v-if="item.kind === 'dcc'"
            :func="item.func"
            :address="loco.address"
            class="w-full"
          />
          <SoundButton
            v-else
            :sound-slot="item.slot"
            class="w-full"
          />
        </li>

        <!-- "..." button — col-span-2 on mobile, col-span-3 on desktop, centered -->
        <li :class="mobile ? 'col-span-2 flex justify-center' : 'col-span-3 flex justify-center'">
          <v-btn
            icon="mdi-dots-horizontal"
            class="rounded-full border border-cyan-400/60 fn-btn-bg w-12 h-12"
            @click="openAllFunctions()"
          />
        </li>
      </ul>
    </section>

    <FunctionList ref="listRef" :loco="loco" />
  </template>
</template>

<style scoped>
.fn-btn-bg {
  background: rgba(var(--v-theme-surface), 0.8);
}
</style>
```

- [ ] **Step 2: Type-check**

```bash
pnpm check-types
```

Expected: no errors.

- [ ] **Step 3: Lint**

```bash
pnpm lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/Functions/SpeedDial.vue
git commit -m "feat(ui): redesign SpeedDial with dynamic slots, 3x3/2x5 grid, and '...' overflow 🎛️"
```

---

## Task 7: Write the Firestore migration script

**Files:**
- Create: `scripts/migrate-loco-function-defaults.ts`

- [ ] **Step 1: Create the script**

```ts
// scripts/migrate-loco-function-defaults.ts
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import 'dotenv/config'
import { soundLocoDefaultFunctions, silentLocoDefaultFunctions } from '../packages/modules/locos/constants'
import type { LocoFunction } from '../packages/modules/locos/types'

const serviceAccount = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

initializeApp({ credential: cert(serviceAccount) })

const db = getFirestore()

/**
 * A loco is considered customized if any function is marked as a favorite
 * OR has a non-default label (anything other than "F{id}").
 * Customized locos are skipped unless --force is passed.
 */
function isCustomized(functions: LocoFunction[]): boolean {
  return functions.some(f => f.isFavorite || f.label !== `F${f.id}`)
}

async function migrate(force: boolean): Promise<void> {
  const layoutId = process.env.LAYOUT_ID
  if (!layoutId) throw new Error('LAYOUT_ID is not set in .env')

  console.log(`🚂 Migrating locos for layout: ${layoutId}${force ? ' (--force)' : ''}`)

  const snapshot = await db.collection(`layouts/${layoutId}/locos`).get()
  let updated = 0
  let skipped = 0
  let errored = 0

  for (const docSnap of snapshot.docs) {
    try {
      const data = docSnap.data()
      const existingFunctions: LocoFunction[] = data.functions ?? []

      if (!force && isCustomized(existingFunctions)) {
        console.log(`⏭️  Skipped (customized): ${data.name || docSnap.id}`)
        skipped++
        continue
      }

      const defaults = data.hasSound
        ? soundLocoDefaultFunctions
        : silentLocoDefaultFunctions

      await docSnap.ref.set({ functions: defaults }, { merge: true })
      updated++
      console.log(`✅ Updated: ${data.name || docSnap.id} (hasSound: ${!!data.hasSound})`)
    } catch (e) {
      errored++
      console.error(`❌ Error updating ${docSnap.id}:`, e)
    }
  }

  console.log(`\n📊 Migration complete:`)
  console.log(`   Updated: ${updated}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Errored: ${errored}`)
  console.log(`   Total:   ${snapshot.size}`)
}

const force = process.argv.includes('--force')
migrate(force).catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
```

- [ ] **Step 2: Dry-run against Firestore**

```bash
tsx scripts/migrate-loco-function-defaults.ts
```

Expected: summary log shows updated/skipped counts, no errors.

- [ ] **Step 3: Verify a loco in Firebase console**

Open the Firebase console → Firestore → `layouts/{layoutId}/locos`. Pick a loco that was updated and confirm:
- `functions` array has 32 entries
- For sound locos: F0–F6 + F8 + F9 have `isFavorite: true` and correct labels
- For silent locos: only F0 has `isFavorite: true`, label is `"Light"`

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate-loco-function-defaults.ts
git commit -m "feat(scripts): add Firestore migration for loco function defaults 🗄️"
```

---

## Task 8: Final type-check, lint, and integration smoke test

- [ ] **Step 1: Full type-check**

```bash
pnpm check-types
```

Expected: no errors across all packages.

- [ ] **Step 2: Full lint**

```bash
pnpm lint
```

Expected: no errors.

- [ ] **Step 3: Run all module tests**

```bash
pnpm --filter=@repo/modules vitest run
```

Expected: all tests pass including `soundSlotDefaults.test.ts` and `locoFunctionDefaults.test.ts`.

- [ ] **Step 4: Manual smoke test**

Start the throttle app and verify:
1. A sound loco shows 9 round DCC function buttons (Light, Bell, Horn, Coupler, Dyn Brake, Dim Lights, Cab Light, Mute, Start-Up) in a 3-column grid on desktop, with "..." centered below
2. A silent loco shows 1 DCC button (Light) + 8 sound buttons (Horn, Bell, Coupler, Brake, Air, Dyn Brake, Announce, Ambient) in the same grid
3. On mobile (or Vuetify mobile breakpoint), the grid switches to 2 columns
4. "..." opens the FunctionList dialog showing all 32 functions
5. If a loco has more than 9 favorites, all are shown before the "..."

```bash
pnpm --filter=deja-throttle dev
```

- [ ] **Step 5: Final commit**

```bash
git add -p   # stage only if there are any stray changes
git commit -m "chore: verify speed dial redesign complete ✅" --allow-empty
```
