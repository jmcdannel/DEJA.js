# Speed Dial Redesign — Design Spec

**Date:** 2026-04-16
**Branch:** feature/speed-dial
**Status:** Approved

---

## Overview

Redesign the `SpeedDial` component to:

1. Show a dynamic grid of favorite DCC function buttons (sound locos) or a mix of DCC + hardcoded sound library buttons (silent locos)
2. Use a 3×3+ layout on desktop with a centered "..." overflow button, and a 2×5+ layout on mobile
3. Auto-populate function defaults when a loco is created, based on `loco.hasSound`
4. Ship a one-time Firestore migration script to backfill existing locos with these defaults

---

## Data Layer

### Default function arrays

Two new named exports in `packages/modules/locos/constants.ts`, alongside the existing `defaultFunctions`:

**`soundLocoDefaultFunctions`** — 32-item array, F0–F31. F0–F9 pre-configured as favorites:

| F# | Label | Icon | isFavorite | isMomentary |
|---|---|---|---|---|
| F0 | Light | `light` | true | false |
| F1 | Bell | `bell` | true | true |
| F2 | Horn | `horn` | true | true |
| F3 | Coupler | `coupler` | true | true |
| F4 | Dynamic Brake | `brake` | true | false |
| F5 | Dim Lights | `dim` | true | false |
| F6 | Cab Light | `light` | true | false |
| F8 | Mute | `mute` | true | false |
| F9 | Start-Up | `sound` | true | true |
| F7, F10–F31 | `F{n}` | null | false | false |

**`silentLocoDefaultFunctions`** — 32-item array. Only F0 configured:

| F# | Label | Icon | isFavorite | isMomentary |
|---|---|---|---|---|
| F0 | Light | `light` | true | false |
| F1–F31 | `F{n}` | null | false | false |

The existing `defaultFunctions` export (all 32 bare) is kept for use in the full function editor (F0–F31 list in the cloud app).

### Hardcoded sound slots

New file: `packages/modules/locos/soundSlotDefaults.ts`

```ts
interface SoundSlot {
  label: string
  icon: string       // key from FUNCTION_ICONS
  soundKey: string   // Vercel Blob filename/key (placeholder until catalog is complete)
  isMomentary: boolean
}
```

8 slots in order, best-matching common DCC sound positions:

| Slot | Label | Icon | isMomentary |
|---|---|---|---|
| 1 | Horn | `horn` | true |
| 2 | Bell | `bell` | true |
| 3 | Coupler | `coupler` | true |
| 4 | Brake Squeal | `brake` | true |
| 5 | Air Release | `air` | true |
| 6 | Dynamic Brake | `fan` | false |
| 7 | Announcement | `announce` | false |
| 8 | Ambient | `sound` | false |

`soundKey` values are placeholders — to be updated once the full Vercel Blob sound catalog is inventoried.

### Exports

`packages/modules/locos/index.ts` exports:
- `soundLocoDefaultFunctions`
- `silentLocoDefaultFunctions`
- `SoundSlot` type
- `soundSlotDefaults`

---

## Component Architecture

### New: `SoundButton.vue` (`packages/ui/src/Functions/SoundButton.vue`)

Props:
```ts
{ slot: SoundSlot, showLabel?: boolean }
```

- Same visual style as `FunctionButton` — `rounded-full`, `border-cyan-400/60`, same active/press gradient classes
- Calls `useEfx().runEffect()` with a synthetic `Effect` object built from the slot: `{ type: 'sound', soundBlobUrl: slot.soundKey, state: true, id: slot.label }`
- Momentary behavior: if `slot.isMomentary`, hold activates (state: true) and release deactivates (state: false); otherwise single-tap toggles

### Updated: `SpeedDial.vue` (`packages/ui/src/Functions/SpeedDial.vue`)

**Slot computation:**

```
favoritedFunctions = loco.functions.filter(f => f.isFavorite)

if loco.hasSound:
  slots = favoritedFunctions               // all favorites, minimum 9 shown naturally
else:
  dccSlots = favoritedFunctions            // all favorited DCC functions
  soundPadding = max(0, 9 - dccSlots.length)
  slots = [...dccSlots, ...soundSlotDefaults.slice(0, soundPadding)]

// "..." is always appended as the last item (not counted in slots)
```

If `favoritedFunctions.length > 9` for a sound loco (user manually favorited more), all are shown — no cap.

**Grid layout:**

- Desktop (`!mobile`): `grid-cols-3`, rows grow as needed. "..." button rendered after the grid as `col-span-3 flex justify-center`, same round style, `mdi-dots-horizontal` icon.
- Mobile (`mobile`): `grid-cols-2`, rows grow as needed. "..." button is the last grid item (appended naturally), same round style.

**Button rendering per slot:**
- `LocoFunction` slots → `<FunctionButton>`
- `SoundSlot` slots → `<SoundButton>`

**"..." button:** plain `v-btn` with `icon="mdi-dots-horizontal"`, same `rounded-full border-cyan-400/60` classes. `@click` calls `openAllFunctions()` → opens `FunctionList` dialog (unchanged).

### Unchanged

- `FunctionButton.vue` — no changes
- `FunctionList.vue` — no changes
- `LocoFunction` type — no changes
- `Loco` type — no changes (`hasSound` already exists)

---

## Loco Creation — Applying Defaults

Wherever new locos are written to Firestore in the cloud app (roster add flow), pass the appropriate default array based on `hasSound`:

```ts
import { soundLocoDefaultFunctions, silentLocoDefaultFunctions } from '@repo/modules/locos'

const functions = loco.hasSound ? soundLocoDefaultFunctions : silentLocoDefaultFunctions
await setDoc(locoRef, { ...loco, functions }, { merge: true })
```

---

## Migration Script

**Location:** `scripts/migrate-loco-function-defaults.ts`

**Run with:** `tsx scripts/migrate-loco-function-defaults.ts`

**Flags:** `--force` re-applies defaults to all locos regardless of existing customization

**Logic:**

1. Load `LAYOUT_ID` from `.env`
2. Fetch all docs from `layouts/{layoutId}/locos`
3. For each loco:
   - **Skip condition (default):** any function has `isFavorite: true` OR any function has a non-`F{n}` label → treat as customized, skip
   - **Apply:** `hasSound: true` → `soundLocoDefaultFunctions`; `hasSound: false` or missing → `silentLocoDefaultFunctions`
   - Write with `setDoc(..., { functions }, { merge: true })`
4. Log summary: `{ total, updated, skipped, errored }`

---

## File Summary

| Action | Path |
|---|---|
| New | `packages/modules/locos/soundSlotDefaults.ts` |
| Modified | `packages/modules/locos/constants.ts` |
| Modified | `packages/modules/locos/index.ts` |
| New | `packages/ui/src/Functions/SoundButton.vue` |
| Modified | `packages/ui/src/Functions/SpeedDial.vue` |
| Modified | cloud app roster add flow (exact file TBD during impl) |
| New | `scripts/migrate-loco-function-defaults.ts` |
