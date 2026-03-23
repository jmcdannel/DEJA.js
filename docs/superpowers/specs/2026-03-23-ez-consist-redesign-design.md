# EZ Consist Redesign

**Date:** 2026-03-23
**Status:** Approved
**Scope:** `packages/ui/src/Consist/`, `apps/throttle/`, `docs/features/ez-consist/`

---

## Problem

The current consist UI in the throttle app has several UX issues:

1. **Vague indicator** — The gradient pill with "Consist ⚙️" doesn't convey what's in the consist or loco directions at a glance.
2. **Confusing direction controls** — Left/right arrow buttons for direction toggling are ambiguous and take up excessive space.
3. **Unfiltered add list** — The "Add Loco to Consist" dialog shows every loco in the roster with no search or filtering, requiring excessive scrolling.
4. **Heavy trim controls** — The "Trim −/+ 0" pill is visually overweight for a secondary adjustment.
5. **No branding** — EZ Consist is a key DEJA.js selling point (software-based consisting without DCC CV19 programming) but the UI doesn't communicate this.
6. **No documentation** — Users have no reference for what EZ Consist is or how to use it.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Target device | Mobile-first (375px) | Phone-in-hand at the layout |
| Indicator style | Labeled badges with arrows | Clear at a glance: address, direction, color-coded |
| Direction arrows | FWD/REV text replaced with ◀/▶ arrows | Compact, universal |
| Lead loco arrow | Always ◀ (points left) | Left edge = front of train, consistent visual anchor |
| Editor layout | Full-screen panel | Enough room for controls, consistent with app patterns |
| Member card interaction | Tap to expand action bar | Keeps collapsed view clean, actions discoverable |
| Add picker | Search + inline ◀ Fwd / ▶ Rev buttons per row | One tap = add with direction, no separate toggle step |
| Branding | "EZ" label on indicator, "EZ Consist" in editor header | Reinforces this is a DEJA.js software feature |
| Color prop removed | Colors are semantic (purple/green/red), managed internally | Old `color` prop was passed through everywhere; new components own their color logic based on direction state |

## Arrow Direction Logic

| Loco Role | Direction Value | Arrow | Color | Meaning |
|-----------|----------------|-------|-------|---------|
| Lead | Always forward | ◀ (left) | Purple (`#7c3aed`) | Front of train |
| Member | `direction: true` (forward) | ◀ (left) | Green (`#059669`) | Facing same way as lead |
| Member | `direction: false` (reversed) | ▶ (right) | Red (`#dc2626`) | Facing opposite to lead |

The arrow always indicates which way the locomotive is physically facing relative to the train. Left = toward the front of the train (same as lead). Right = toward the rear.

## Component Design

### 1. ConsistIndicator — Always-Visible Badge Bar

**Replaces:** `Consist.vue` (display portion) + `MiniConsist.vue`

**With consist members:**
```
[ EZ  ◀ (23)  ◀ (17)  (24) ▶  ✎ ]
       purple   green    red
```

- Lead loco: purple badge, ◀ arrow on left side, larger (28px)
- Forward members: green badge, ◀ arrow on left side
- Reversed members: red badge, ▶ arrow on right side
- Subtle "EZ" label at the leading edge
- Pencil icon (✎) at trailing edge to open editor
- Entire bar is tappable to open editor
- Container: `rgba(purple, 0.12)` background with `rgba(purple, 0.25)` border, `border-radius: 16px`

**Empty state (no consist):**
```
[ EZ Consist  ✎ ]
```

- Full "EZ Consist" text label (purple, subtle opacity)
- Pencil icon to open editor
- Tapping opens editor where user can start building a consist
- Both `consist: undefined` and `consist: []` are treated as empty (no consist)

**Overflow (5+ members):**
- Container uses `overflow-x: auto` for horizontal scrolling
- Badges do not wrap — the bar scrolls horizontally on small screens

**Props:**
- `loco: Loco` (required) — the lead loco with its `consist` array

**Emits:**
- `edit` — when user taps to open editor

### 2. ConsistEditor — Full-Screen Panel

**Replaces:** `EditConsist.vue`

Opens as a `v-dialog` with `fullscreen` on mobile, or `max-width="480"` on desktop. Contains:

**Header:**
- Title: "EZ Consist"
- Subtitle: "Software-based consisting by DEJA.js"
- Close button (✕)

**Consist visualization bar:**
- Mirrors the ConsistIndicator badge layout (smaller, 24px avatars)
- Updates in real-time as user makes changes
- Sits below header in a dark background strip

**Loco card list:**
- Lead loco card (ConsistLeadCard) — non-editable, always first
- Consist member cards (ConsistLocoCard) — one per member, tap to expand
- "Add Locomotive" button at bottom — dashed border, purple accent

**Props:**
- `loco: Loco` (required)

**Emits:**
- `close` — when user closes the editor

**Internal state:**
- `expandedAddress: number | null` — which member card is currently expanded (only one at a time)
- Roster fetched internally via `useLocos().getLocos()` and passed to `ConsistLocoPicker` as its `locos` prop

**Error and loading states:**
- Mutations are fire-and-forget, matching current behavior — `updateConsist()` is called without awaiting UI feedback
- The `loco.id` guard from the current implementation is preserved (buttons are effectively no-ops if `loco.id` is undefined)
- No loading spinners or toast notifications — changes appear instantly via Firestore reactivity

### 3. ConsistLeadCard — Non-Editable Lead Loco

**Replaces:** `LeadLoco.vue`

Displays the lead locomotive in the editor list. Always shows ◀ arrow (left-pointing). Not editable — no action bar, no tap interaction.

**Layout:**
```
[ ◀  (23)  BNSF 5801          ]
           Lead Locomotive
```

- Arrow on far left, ◀ pointing left
- Purple avatar with address
- Name and "Lead Locomotive" subtitle
- Purple-tinted background: `rgba(#7c3aed, 0.1)` with `rgba(#7c3aed, 0.2)` border
- `border-radius: 12px`, `padding: 12px`

**Props:**
- `loco: Loco` (required)

### 4. ConsistLocoCard — Expandable Member Card

**Replaces:** `ConsistLoco.vue`

Each consist member is a card that can be tapped to reveal an action bar.

**Collapsed state:**
```
[ ◀  (17)  Great Northern 17     ]
           Forward • Trim: 0
```

- Direction arrow on far left (◀ green for forward, ▶ red for reversed — arrow on the side matching the direction)
- Colored avatar with address
- Name and status subtitle ("Forward • Trim: 0" or "Reversed • Trim: -2")
- Color-coded border and background matching direction color
- `border-radius: 12px`, `padding: 12px`

**Expanded state (tap to toggle):**
```
[ ◀  (17)  Great Northern 17     ]
           Forward • Trim: 0
[  🔄 Flip  |  − Trim 0 +  |  🗑 Remove  ]
```

Action bar appears below the card content:
- **Flip** (🔄): toggles direction. Card color/arrow animate to new state.
- **Trim** (− value +): decrement/increment buttons with current value displayed between them. Value displayed in monospace font.
- **Remove** (🗑): removes loco from consist. Red-tinted.

Action bar has a darker background (`rgba(0,0,0,0.2)`) with top border matching the card's accent color.

**Props:**
- `cloco: ConsistLoco` (required)
- `expanded: boolean` (required)

**Emits:**
- `toggle-expand` — when card is tapped
- `flip(cloco: ConsistLoco)` — direction flip
- `trim(cloco: ConsistLoco, delta: number)` — trim adjustment (+1 or -1)
- `remove(cloco: ConsistLoco)` — remove from consist

### 5. ConsistLocoPicker — Search + Inline Direction Add

**Replaces:** `AddConsistLoco.vue`

Full-screen picker for adding a locomotive to the consist.

**Header:**
- Title: "Add to Consist"
- Close button (✕)

**Search bar:**
- Placeholder: "Search by name, address, or road..."
- Filters roster immediately on each keystroke (no debounce — roster sizes are typically 10–50 locos)
- Matches against: `loco.address` (number converted to string), `loco.name`, `loco.meta.roadname`
- Case-insensitive matching
- Empty search shows all available locos

**Loco list:**
Each available loco is a row:
```
[ (10)  BNSF 1000     [ ◀ Fwd ] [ Rev ▶ ] ]
        BNSF
```

- Avatar with roadname color and address
- Name and roadname
- Two action buttons side-by-side:
  - **◀ Fwd**: green-tinted, adds with `direction: true`
  - **Rev ▶**: red-tinted, adds with `direction: false`
- Tapping either button immediately adds the loco and returns to the editor

**Already-in-consist locos:**
- Shown at their normal position in the list but grayed out (opacity 0.35)
- No action buttons
- Subtitle: "Already in consist ◀" or "In consist (lead)"

**Props:**
- `locos: Loco[]` (required) — full roster
- `loco: Loco` (required) — lead loco (to know what's already in consist)

**Emits:**
- `add(address: number, direction: boolean)` — when user taps Fwd or Rev. Note: `address` is typed as `number` (matching the `Loco` interface). The existing `EditConsist.vue` incorrectly used `parseInt(newAddress)` suggesting a string was passed — this is fixed.
- `close` — when user closes picker

## Data Model

No changes to the existing data model. The `ConsistLoco` interface remains:

```typescript
interface ConsistLoco {
  address: number
  direction: boolean  // true = forward (same as lead), false = reversed
  trim: number        // speed offset applied to this loco
}
```

The `Loco` interface's optional `consist` field remains:

```typescript
interface Loco {
  // ... existing fields
  consist?: ConsistLoco[]
}
```

All mutations continue to flow through `useLocos().updateConsist(id, consist)` which writes to Firestore.

## Files Changed

### New Components (packages/ui/src/Consist/)

| File | Purpose |
|------|---------|
| `ConsistIndicator.vue` | Badge bar — replaces `Consist.vue` display + `MiniConsist.vue` |
| `ConsistEditor.vue` | Full panel editor — replaces `EditConsist.vue` |
| `ConsistLocoCard.vue` | Expandable member card — replaces `ConsistLoco.vue` |
| `ConsistLocoPicker.vue` | Search + inline direction add — replaces `AddConsistLoco.vue` |
| `ConsistLeadCard.vue` | Non-editable lead card — replaces `LeadLoco.vue` |

### Deleted Components

| File | Replaced By |
|------|-------------|
| `Consist.vue` | `ConsistIndicator.vue` + `ConsistEditor.vue` |
| `EditConsist.vue` | `ConsistEditor.vue` |
| `MiniConsist.vue` | `ConsistIndicator.vue` |
| `ConsistLoco.vue` | `ConsistLocoCard.vue` |
| `AddConsistLoco.vue` | `ConsistLocoPicker.vue` |
| `LeadLoco.vue` | `ConsistLeadCard.vue` |

### Updated Files

| File | Change |
|------|--------|
| `packages/ui/src/index.ts` | Update exports: remove old, add new component names |
| `apps/throttle/src/throttle/Throttle.vue` | Import `ConsistIndicator` instead of `Consist` + `MiniConsist` |
| `apps/throttle/src/throttle/SimpleThrottle.vue` | Import `ConsistIndicator` instead of `MiniConsist` |
| `apps/cloud/src/Roster/Consist/*` | Update cloud app's consist components to match new patterns (separate task) |

**Note on `ThrottleTile.vue`:** This component passes `showConsist` to `LocoAvatar`, which renders a small badge with `loco.consist.length`. This is unrelated to the consist component suite — it reads from the same data model and will continue to work unchanged. `ThrottleTile` does not need `ConsistIndicator`.

### Deleted Files

Components:
- `packages/ui/src/Consist/Consist.vue`
- `packages/ui/src/Consist/EditConsist.vue`
- `packages/ui/src/Consist/MiniConsist.vue`
- `packages/ui/src/Consist/ConsistLoco.vue`
- `packages/ui/src/Consist/AddConsistLoco.vue`
- `packages/ui/src/Consist/LeadLoco.vue`

Stories:
- `packages/ui/src/Consist/Consist.stories.ts`
- `packages/ui/src/Consist/EditConsist.stories.ts`
- `packages/ui/src/Consist/MiniConsist.stories.ts`
- `packages/ui/src/Consist/ConsistLoco.stories.ts`
- `packages/ui/src/Consist/AddConsistLoco.stories.ts`
- `packages/ui/src/Consist/LeadLoco.stories.ts`

Types cleanup:
- Remove orphaned `ConsistSettingsProps` interface from `apps/throttle/src/throttle/types.ts`

### New Storybook Files

- `ConsistIndicator.stories.ts`
- `ConsistEditor.stories.ts`
- `ConsistLocoCard.stories.ts`
- `ConsistLocoPicker.stories.ts`
- `ConsistLeadCard.stories.ts`

### New Documentation

| File | Purpose |
|------|---------|
| `docs/features/ez-consist/overview.mdx` | User-facing EZ Consist documentation for dejajs.com |

## Documentation Content Plan (dejajs.com)

The `docs/features/ez-consist/overview.mdx` page covers:

1. **What is EZ Consist?** — Software-based consisting that lives in DEJA.js, not in DCC decoder CV19. Benefits: no decoder programming needed, instant changes, per-loco speed trim, works with any DCC decoder, save and recall consist configurations.

2. **How to Build a Consist** — Step-by-step guide with screenshots:
   - Open a throttle for your lead loco
   - Tap the "EZ Consist" indicator
   - Tap "+ Add Locomotive"
   - Search or scroll to find a loco, tap "◀ Fwd" or "Rev ▶"
   - Repeat for additional locos

3. **Direction Explained** — Forward means the loco faces the same way as the lead. Reversed means it faces the opposite direction (e.g., a helper on the rear running "backwards"). Visual diagram showing a consist with mixed directions.

4. **Trim Adjustment** — Trim applies a speed offset to individual consist members. Use it when locos don't speed-match well — a loco that runs slightly fast gets negative trim, slightly slow gets positive trim. Range and behavior explained.

5. **Common Consist Patterns** — Examples with diagrams:
   - Standard consist (all forward)
   - Helper on rear (last loco reversed)
   - Mid-train helper (middle loco, either direction)
   - Push-pull (lead forward, tail reversed)

6. **EZ Consist vs. DCC Consisting** — Comparison table: EZ Consist is software-managed (instant, no CV programming, trim support) vs. DCC CV19 (decoder-level, requires programming track, no trim).

## Scope Exclusions

- **Cloud app consist components** — `apps/cloud/src/Roster/Consist/` has its own copies. Updating those is a separate task.
- **DCC-level consisting** — This redesign is purely UI. No changes to `@repo/dccex` or serial command protocol.
- **Consist persistence changes** — Data model and Firestore paths remain unchanged.
- **Throttle logic changes** — How the server applies consist speed/direction to DCC commands is unchanged.
