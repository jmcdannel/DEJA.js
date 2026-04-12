# Command Palette Design 🎛️

**Date:** 2026-04-10
**Branch:** `feature/quick-throttle` (replaces earlier popover-based Quick Throttle work on the same branch)
**Status:** Design approved, pending implementation plan
**Supersedes:** `2026-04-10-quick-throttle-design.md` for the input-trigger UX (keeps the `acquireThrottle` fix and `SaveToRosterChip`)

## Problem

The Quick Throttle we just shipped uses an icon-button popover on five pages plus a global `t` shortcut dialog. It works, but it feels like dedicated plumbing for a single verb. Users also still drill through a multi-level `QuickMenu` to toggle turnouts, fire effects, and set signal aspects — a tactile structure that's slow to navigate with a keyboard and painful to extend.

We want a single **Command Palette** — ⌘K / Ctrl+K — that can do everything the QuickMenu drill-downs do, plus open any DCC throttle by address, plus navigate the app via `g <letter>` chord shortcuts. The QuickMenu FAB stays, but becomes a thumb-reachable shortlist of running throttles + favorites + a prompt that hands off to the palette. A small search button in the main app header provides a visible affordance for mouse users.

## Goals

- Single global command palette triggered from anywhere by ⌘K / Ctrl+K, from the QuickMenu prompt, or from a header button.
- Cover five command groups in v1: Navigation, Throttle actions, Turnouts, Effects, Signals.
- Numeric input (e.g. `42`) auto-surfaces "Open throttle #42" as the top result. Pressing Enter acquires the throttle and navigates — no dedicated popover, no `t` shortcut.
- Vim-style `g <letter>` chord shortcuts for the seven navigation targets. ⌘K always opens the palette.
- Fuzzy matching across title + keywords + roster metadata.
- Two-level selection for signals (pick signal → pick aspect).
- Reduce QuickMenu to three sections: running throttles, favorites, and a prompt input that hands off to the palette.
- Add a compact quick-add form to the Roster page so users can create a loco without leaving the list.
- Keep everything touch-friendly: the palette dialog works on mobile, the QuickMenu FAB still hosts the throttle shortlist.

## Non-Goals

- Routes, power, layout management, emergency stop, sensor commands, and the `?` keybindings help overlay — all deferred to v2. E-stop stays in the `<AppHeader>`.
- A Raycast-style application launcher, plugin system, or theme-able palette chrome.
- Replacing the `<EmergencyStop>` header button.
- Keeping per-page `QuickThrottleButton` placements or the `t` shortcut. Both are deleted in this change.
- A rebindable keybinding editor. Chords are fixed in v1.
- A global recent-commands history. May land in v1.1.

## Surfaces

### 1. Command Palette (`⌘K` / `Ctrl+K`)

- Full-screen-feel centered `v-dialog`, `max-width: 560px`, mounted once in `App.vue`.
- Header: `▸` chevron + single input (`type="text"`, autofocus). Right side: small `Esc close` hint.
- Results body: vertically scrollable list of `Command` entries grouped by category with sticky category labels.
- Footer: keyboard-shortcut legend — `↑↓ navigate`, `↵ run`, `esc close`.
- Mobile: same dialog, full-width with 12px side padding, input stays autofocused so the OS keyboard opens immediately.

**Opening behavior:**

- `⌘K` (or `Ctrl+K`) from anywhere — opens with empty query, cursor in input.
- QuickMenu prompt submit — opens with the submitted string pre-filled in the query.
- Header command-palette button click — same as `⌘K`.

**Closing behavior:**

- `Esc` while at the top level — closes.
- `Esc` while in a pushed stack (signal aspect selection) — pops one level.
- Clicking outside the dialog — closes.
- Running a command — closes by default.

**Active result (default is first visible result):**

- Highlighted with `border-left: 2px solid primary` + tinted background.
- `↑ / ↓` move the active index through the flat filtered list.
- `Home / End` jump to first/last (optional polish).
- `Enter` runs the active result's command.

**Numeric input:**

- If the query matches `/^\d+$/` and the number is in `[1, 9999]`, a synthetic command is prepended to results:
  ```
  🚂  Open throttle #42   ·   (Loco 3 · GP38 Cuyama)
  ```
  The sub-label shows the roster match if one exists; otherwise it's omitted.
- The synthetic command always appears first, ahead of any other fuzzy-matched results.

**Two-level commands (signal aspects):**

- Selecting a signal command pushes a new level onto the palette stack. The input clears, the header updates (`Set [Signal Name] ▸`), and the results become the aspect choices for that signal.
- `Esc` pops back to the previous level (does not close the palette).
- Running an aspect command closes the palette.

**Empty state (no query):**

- Shows the first ~50 commands from all groups in a stable order: Navigation, Throttles, Turnouts, Effects, Signals.
- Navigation commands render with their shortcut badges (`g r`, `g t`, etc.) on the right.

**Search behavior:**

- Fuzzy match over `title + keywords`. Scoring (highest wins):
  - Exact title match: `1000`
  - Title prefix match: `500`
  - Title substring match: `300`
  - Keyword substring match: `250`
  - Fuzzy (all query chars appear in order): `100 + (query.length / title.length * 50)` — shorter titles score higher
  - No match: `0` (excluded)
- Ties broken by alphabetical title.
- Max 50 results shown at a time.

### 2. Trimmed QuickMenu (FAB panel)

The draggable FAB stays. The panel shrinks to three sections:

1. **Running throttles** (`QuickMenuThrottles.vue` — mostly unchanged). Mini controls for speed up/down, stop, park. Empty state shows "No locos running".
2. **Favorites** (`QuickMenuFavorites.vue` — unchanged, still feature-flagged).
3. **Prompt input** (`QuickMenuPrompt.vue` — new). A single text field with placeholder "What do you want to do?". `Enter` submits: closes the QuickMenu, opens the palette, passes the typed string as the initial query.

**Gone from the QuickMenu:** the entire `QuickMenuCloud` sub-menu with its drill-downs into locos-by-roadname, effects-by-device, effects-by-type, effects-by-tag, routes-by-waypoint, turnouts-by-device, turnouts-by-tag, turnout labels, signals-by-device, signals-by-aspect, sensors-by-device, sensor-automations. All of these become searchable palette commands.

### 3. Header command-palette button

A small icon button (`mdi-magnify` or `mdi-keyboard`) injected into the default slot of `<AppHeader>` from `App.vue`. Renders to the left of the append-slot contents (layout chip, e-stop, power). Click → opens palette. Tooltip: "Command palette (⌘K)". Lives next to the `EmergencyStop` button so it's visually co-located with the primary action cluster.

### 4. Roster page quick-add form (parallel track)

A new compact inline form at the top of the Roster page (above `LocoRoster`, inside the main scroll area).

**Fields:**

- `Address` — number input, 1–9999, required.
- `Name` — text input, optional. Placeholder: "e.g. GP38".
- `Roadname` — `v-select` bound to `ROADNAMES`, optional, clearable.
- `Save` — primary button, icon + "Save" label.

**Submit behavior:**

- Validates `address` (integer, 1–9999, not empty).
- Writes `layouts/${layoutId}/locos/${address}` with `{ address, name, meta: { roadname }, timestamp }` using `setDoc` with `{ merge: true }` — so an existing loco is updated, not duplicated.
- On success, clears all three fields and the new loco appears in the list (reactive via `useLocos`). No notification — the list update is the feedback.
- On Firestore error, shows a small inline error chip below the form and keeps the fields intact.

**Layout:**

- Inline horizontal row on wide screens; wraps to two rows on narrow screens.
- Same `v-card` styling as the rest of the roster controls.

### 5. Keyboard shortcuts

Registered once globally in `App.vue` via `useGlobalKeybindings()`. All shortcuts are suppressed when the focused element is `INPUT`, `TEXTAREA`, `SELECT`, or `contentEditable`, except `⌘K` / `Ctrl+K` which is always active.

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open command palette (always, even in inputs) |
| `Esc` | Close palette or pop stack |
| `↑` / `↓` | Navigate results (only active when palette open) |
| `Enter` | Run active result (only active when palette open) |
| `g r` | Go to Roster (`/locos`) |
| `g t` | Go to Throttles (`/throttles`) |
| `g c` | Go to Conductor (`/conductor`) |
| `g u` | Go to Turnouts (`/turnouts`) |
| `g s` | Go to Signals (`/signals`) |
| `g e` | Go to Effects (`/effects`) |
| `g ,` | Go to Settings (`/settings`) |

Chord behavior:

- Press `g` → enter "g chord" state for 1000 ms.
- Press the second key within 1000 ms → run the matching action.
- Press anything else, or time out → chord state cleared silently, no action taken.
- While in chord state, no other keystroke runs an action (the palette trigger is still honored because it checks `metaKey`/`ctrlKey` first).
- Chord state is visible as a small floating chip in the bottom-left while active ("g…") so users know they armed it.

## Architecture

### File layout (new)

```
apps/throttle/src/command-palette/
├── CommandPalette.vue              # Dialog UI, mounted once in App.vue
├── CommandPaletteTrigger.vue       # Header button; click → useCommandPalette().open()
├── CommandPaletteChordChip.vue     # Floating "g…" indicator while a chord is armed
├── useCommandPalette.ts            # State: isOpen, query, activeIndex, stack, open(), close(), push(), pop()
├── useCommands.ts                  # Merged ComputedRef<Command[]> from all sources
├── useGlobalKeybindings.ts         # Global keydown listener: ⌘K + chord handling
├── fuzzyMatch.ts                   # scoreMatch + filterCommands
├── types.ts                        # Command, CommandCategory, CommandStack interface
└── commands/
    ├── navigation.ts               # useNavigationCommands() — static nav commands with shortcuts
    ├── throttles.ts                # useThrottleCommands() — numeric synthetic + per-loco + stop-all
    ├── turnouts.ts                 # useTurnoutCommands() — throw + close per turnout
    ├── effects.ts                  # useEffectCommands() — toggle per effect
    └── signals.ts                  # useSignalCommands() — signal → aspect two-level

apps/throttle/src/views/
└── RosterView.vue                  # Modified: mount new RosterQuickAdd at the top

apps/throttle/src/roster/
└── RosterQuickAdd.vue              # New: inline quick-add form

apps/throttle/src/quick-menu/
└── QuickMenuPrompt.vue              # New: prompt input that hands off to palette
```

### File layout (modified)

```
apps/throttle/src/App.vue                                 # Mount <CommandPalette /> and <CommandPaletteTrigger /> (in AppHeader slot); call useGlobalKeybindings()
apps/throttle/src/quick-menu/QuickMenu.vue                # Strip sub-screen rendering + cloud section; add QuickMenuPrompt
apps/throttle/src/quick-menu/useQuickMenu.ts              # Strip pushScreen/popScreen/SUBSCREEN_CONFIGS/GROUP_SCREEN_META; keep isOpen/visible
apps/throttle/src/quick-menu/QuickMenuThrottles.vue       # Revert QuickThrottleButton placement; import useLocos directly
apps/throttle/src/views/RosterView.vue                    # Revert QuickThrottleButton placement; add <RosterQuickAdd />
apps/throttle/src/throttle/ThrottleList.vue               # Revert QuickThrottleButton + .throttle-list-fabs wrapper
apps/throttle/src/views/ThrottleView.vue                  # Revert QuickThrottleButton + footer wrapper; SaveToRosterChip stays
apps/throttle/src/conductor/ConductorLayout.vue           # Revert QuickThrottleButton + .conductor-quick-throttle div
```

### File layout (deleted)

```
apps/throttle/src/throttle/QuickThrottleButton.vue
apps/throttle/src/throttle/QuickThrottleForm.vue
apps/throttle/src/throttle/QuickThrottleNumpad.vue
apps/throttle/src/throttle/QuickThrottleGlobalDialog.vue
apps/throttle/src/throttle/useQuickThrottle.ts            # Logic moves into commands/throttles.ts
apps/throttle/src/throttle/useQuickThrottle.test.ts       # Replaced by commands/throttles.test.ts

apps/throttle/src/quick-menu/QuickMenuSubScreen.vue
apps/throttle/src/quick-menu/QuickMenuGroupList.vue
apps/throttle/src/quick-menu/QuickMenuItemList.vue
apps/throttle/src/quick-menu/QuickMenuCloud.vue
apps/throttle/src/quick-menu/useQuickMenuData.ts          # Drill-down data wrapper, no longer consumed
```

### Preserved

The following from the earlier spec stay untouched:

- `packages/modules/locos/useLocos.ts` — the `acquireThrottle` merge-safe fix is permanent.
- `packages/modules/locos/useLocos.acquireThrottle.test.ts` — regression tests stay.
- `apps/throttle/src/throttle/SaveToRosterChip.vue` — still displayed on `ThrottleView` when the current address has no roster match.
- The `ThrottleView` chip overlay wrapper stays.

### Data model

```ts
// apps/throttle/src/command-palette/types.ts

export type CommandCategory = 'navigation' | 'throttle' | 'turnout' | 'effect' | 'signal'

export interface Command {
  /** Unique stable identifier. Used for Vue keys and future recent-command tracking. */
  id: string
  /** Display title. The primary searchable string. */
  title: string
  /** Optional context shown in dim text next to the title. */
  description?: string
  /** Category for grouping in the results list. */
  category: CommandCategory
  /** mdi icon name. */
  icon: string
  /** Additional search terms not shown in the title (e.g. address numbers, device names). */
  keywords?: string[]
  /** Optional display-only keyboard hint. Does not register the shortcut — that's done in useGlobalKeybindings. */
  shortcut?: string[]
  /** Called when the user runs this command. May be async. */
  run: () => void | Promise<void>
  /**
   * If present, running the command pushes a new palette level instead of closing.
   * The children are displayed as the new result set with a fresh input and a breadcrumb header.
   */
  children?: {
    title: string
    commands: Command[]
  }
}

export interface CommandStack {
  title: string
  commands: Command[]
}
```

The `Command` interface is intentionally flat. No generics, no command groups, no plugin system. Each source is a Vue composable returning `ComputedRef<Command[]>`.

### Palette state — `useCommandPalette.ts`

Singleton via module-scoped refs. Shared across trigger, dialog, and any component that wants to open it programmatically.

```ts
import { ref, computed, type Ref } from 'vue'
import type { Command, CommandStack } from './types'

const isOpen = ref(false)
const query = ref('')
const activeIndex = ref(0)
const stack = ref<CommandStack[]>([])

export function useCommandPalette() {
  function open(initialQuery = '') {
    query.value = initialQuery
    activeIndex.value = 0
    stack.value = []
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    query.value = ''
    activeIndex.value = 0
    stack.value = []
  }

  function push(level: CommandStack) {
    stack.value.push(level)
    query.value = ''
    activeIndex.value = 0
  }

  function pop() {
    stack.value.pop()
    query.value = ''
    activeIndex.value = 0
  }

  const currentLevelTitle = computed(() =>
    stack.value.length > 0 ? stack.value[stack.value.length - 1].title : null,
  )

  return { isOpen, query, activeIndex, stack, currentLevelTitle, open, close, push, pop }
}
```

### Command source: navigation (`commands/navigation.ts`)

Static list, no reactive data. Each command carries its `g <letter>` shortcut as a display hint.

```ts
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Command } from '../types'

export function useNavigationCommands() {
  const router = useRouter()

  return computed<Command[]>(() => [
    { id: 'nav.roster',    title: 'Go to Roster',     icon: 'mdi-train',               category: 'navigation', shortcut: ['g', 'r'], run: () => router.push({ name: 'roster' }) },
    { id: 'nav.throttles', title: 'Go to Throttles',  icon: 'mdi-gamepad-variant',     category: 'navigation', shortcut: ['g', 't'], run: () => router.push({ name: 'throttles' }) },
    { id: 'nav.conductor', title: 'Go to Conductor',  icon: 'mdi-train-car',           category: 'navigation', shortcut: ['g', 'c'], run: () => router.push({ name: 'conductor' }) },
    { id: 'nav.turnouts',  title: 'Go to Turnouts',   icon: 'mdi-call-split',          category: 'navigation', shortcut: ['g', 'u'], run: () => router.push({ name: 'turnouts' }) },
    { id: 'nav.signals',   title: 'Go to Signals',    icon: 'mdi-traffic-light',       category: 'navigation', shortcut: ['g', 's'], run: () => router.push({ name: 'signals' }) },
    { id: 'nav.effects',   title: 'Go to Effects',    icon: 'mdi-rocket-launch',       category: 'navigation', shortcut: ['g', 'e'], run: () => router.push({ name: 'effects' }) },
    { id: 'nav.settings',  title: 'Go to Settings',   icon: 'mdi-cog',                 category: 'navigation', shortcut: ['g', ','], run: () => router.push({ name: 'settings' }) },
  ])
}
```

### Command source: throttles (`commands/throttles.ts`)

```ts
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { useLocos, type Loco, type Throttle } from '@repo/modules/locos'
import type { Command } from '../types'

export function useThrottleCommands() {
  const router = useRouter()
  const layoutId = useStorage('@DEJA/layoutId', '')
  const { getLocos, getThrottles, acquireThrottle } = useLocos()
  const locos = getLocos()
  const throttles = getThrottles()

  async function openThrottle(address: number) {
    await acquireThrottle(address)
    await router.push({ name: 'throttle', params: { address } })
  }

  async function stopAll() {
    if (!layoutId.value) return
    const list = (throttles.value || []) as unknown as Throttle[]
    await Promise.all(
      list.map((t) =>
        setDoc(
          doc(db, `layouts/${layoutId.value}/throttles`, String(t.address)),
          { speed: 0, direction: false, timestamp: serverTimestamp() },
          { merge: true },
        ),
      ),
    )
  }

  function rosterLocoCommands(): Command[] {
    return ((locos.value || []) as Loco[]).map((l) => ({
      id: `throttle.loco.${l.address}`,
      title: `Open throttle for ${l.name || `Loco ${l.address}`}`,
      description: `#${l.address}${l.meta?.roadname ? ` · ${l.meta.roadname}` : ''}`,
      icon: 'mdi-train',
      category: 'throttle' as const,
      keywords: [
        String(l.address),
        l.name || '',
        l.meta?.roadname || '',
      ].filter(Boolean),
      run: () => openThrottle(l.address),
    }))
  }

  function stopAllCommand(): Command {
    return {
      id: 'throttle.stop-all',
      title: 'Stop all throttles',
      description: 'Set every running throttle to speed 0',
      icon: 'mdi-stop',
      category: 'throttle',
      keywords: ['halt', 'zero'],
      run: stopAll,
    }
  }

  return computed<Command[]>(() => [
    ...rosterLocoCommands(),
    stopAllCommand(),
  ])
}
```

`stopAll` writes speed 0 and direction false directly to every throttle doc via `setDoc` with merge, matching the pattern the existing throttle `updateSpeed` function uses. It does not use `acquireThrottle` (no need to create new throttles) and does not navigate (the user stays on whatever page they were on).

The **numeric synthetic** command (typed `42` → "Open throttle #42") is not part of this file — it's built inline by the palette filter in `fuzzyMatch.ts` when the query matches `/^\d+$/`, so it doesn't pollute the empty-state list and can adapt to whatever the user typed.

### Command source: turnouts (`commands/turnouts.ts`)

```ts
import { computed } from 'vue'
import { useTurnouts, type Turnout } from '@repo/modules/turnouts'
import type { Command } from '../types'

export function useTurnoutCommands() {
  const { getTurnouts, setTurnout } = useTurnouts()
  const turnouts = getTurnouts()

  return computed<Command[]>(() => {
    const list = (turnouts.value || []) as unknown as Turnout[]
    const commands: Command[] = []
    for (const t of list) {
      const name = t.name || t.id
      commands.push({
        id: `turnout.throw.${t.id}`,
        title: `Throw ${name}`,
        description: t.device ? `Device ${t.device}` : undefined,
        icon: 'mdi-call-split',
        category: 'turnout',
        keywords: [name, t.id, t.device || '', ...(t.tags || [])].filter(Boolean),
        run: () => setTurnout(t.id, { state: true }),
      })
      commands.push({
        id: `turnout.close.${t.id}`,
        title: `Close ${name}`,
        description: t.device ? `Device ${t.device}` : undefined,
        icon: 'mdi-call-merge',
        category: 'turnout',
        keywords: [name, t.id, t.device || '', ...(t.tags || [])].filter(Boolean),
        run: () => setTurnout(t.id, { state: false }),
      })
    }
    return commands
  })
}
```

Uses `setTurnout(id, { state: true | false })` so the commands are deterministic (not a toggle). The `QuickMenuData` toggle logic used `switchTurnout` which flips state; that's not what we want in a command palette where "Throw" should always throw.

### Command source: effects (`commands/effects.ts`)

```ts
import { computed } from 'vue'
import { useEfx, type Effect } from '@repo/modules/effects'
import type { Command } from '../types'

export function useEffectCommands() {
  const { getEffects, runEffect } = useEfx()
  const effects = getEffects()

  return computed<Command[]>(() => {
    const list = (effects.value || []) as unknown as Effect[]
    return list.map((e) => ({
      id: `effect.toggle.${e.id}`,
      title: `Toggle ${e.name || e.id}`,
      description: e.type ? `${e.type}${e.device ? ` · ${e.device}` : ''}` : e.device,
      icon: 'mdi-rocket-launch',
      category: 'effect' as const,
      keywords: [e.name || '', e.id, e.type || '', e.device || '', ...(e.tags || [])].filter(Boolean),
      run: () => runEffect({ ...e, state: !e.state } as Effect),
    }))
  })
}
```

Effects are toggled (matches the existing QuickMenu behavior). If a specific effect is a "run one-shot" pattern (e.g. fire, blink), `runEffect` already handles the semantics via the effect's type.

### Command source: signals (`commands/signals.ts`)

Two-level command. The top-level per-signal command uses `children` to push a second level with the three-aspect picker.

```ts
import { computed } from 'vue'
import { useSignals, type Signal, type SignalAspect } from '@repo/modules/signals'
import type { Command } from '../types'

const ASPECTS: { aspect: SignalAspect; label: string; icon: string; iconColor: string }[] = [
  { aspect: 'red',    label: 'Red',    icon: 'mdi-traffic-light', iconColor: 'text-red-500' },
  { aspect: 'yellow', label: 'Yellow', icon: 'mdi-traffic-light', iconColor: 'text-yellow-500' },
  { aspect: 'green',  label: 'Green',  icon: 'mdi-traffic-light', iconColor: 'text-green-500' },
  { aspect: null,     label: 'Clear',  icon: 'mdi-circle-off-outline', iconColor: 'text-slate-400' },
]

export function useSignalCommands() {
  const { getSignals, setSignalAspect } = useSignals()
  const signals = getSignals()

  return computed<Command[]>(() => {
    const list = (signals.value || []) as Signal[]
    return list.map((s) => {
      const name = s.name || s.id
      return {
        id: `signal.set.${s.id}`,
        title: `Set ${name}`,
        description: s.aspect ? `currently ${s.aspect}` : undefined,
        icon: 'mdi-traffic-light',
        category: 'signal' as const,
        keywords: [name, s.id, s.device || ''].filter(Boolean),
        // Running this command pushes the aspect-picker level instead of closing the palette.
        run: () => {},
        children: {
          title: `Set ${name} ▸ aspect`,
          commands: ASPECTS.map((a) => ({
            id: `signal.set.${s.id}.${a.aspect ?? 'clear'}`,
            title: a.label,
            icon: a.icon,
            category: 'signal' as const,
            run: () => setSignalAspect(s.id, a.aspect),
          })),
        },
      }
    })
  })
}
```

> **Note:** The `run` on a two-level command is a no-op — the palette detects `children` before calling `run` and pushes the new level. Implementation detail, documented here for clarity.

### Merged commands (`useCommands.ts`)

```ts
import { computed, type ComputedRef } from 'vue'
import type { Command } from './types'
import { useNavigationCommands } from './commands/navigation'
import { useThrottleCommands } from './commands/throttles'
import { useTurnoutCommands } from './commands/turnouts'
import { useEffectCommands } from './commands/effects'
import { useSignalCommands } from './commands/signals'

export function useCommands(): ComputedRef<Command[]> {
  const nav = useNavigationCommands()
  const thr = useThrottleCommands()
  const tur = useTurnoutCommands()
  const efx = useEffectCommands()
  const sig = useSignalCommands()

  return computed(() => [
    ...nav.value,
    ...thr.value,
    ...tur.value,
    ...efx.value,
    ...sig.value,
  ])
}
```

### Fuzzy match (`fuzzyMatch.ts`)

```ts
import type { Command } from './types'

const MAX_RESULTS = 50

export function scoreMatch(cmd: Command, query: string): number {
  const q = query.trim().toLowerCase()
  if (!q) return 1 // empty query: everything passes at rank 1
  const title = cmd.title.toLowerCase()
  const keywords = (cmd.keywords || []).map((k) => k.toLowerCase())

  if (title === q) return 1000
  if (title.startsWith(q)) return 500
  if (title.includes(q)) return 300
  for (const kw of keywords) {
    if (kw.includes(q)) return 250
  }

  // Fuzzy subsequence match: all characters of q appear in title in order
  let i = 0
  for (const ch of title) {
    if (ch === q[i]) i++
    if (i === q.length) {
      return 100 + Math.floor((q.length / Math.max(title.length, 1)) * 50)
    }
  }

  return 0
}

export interface FilterResult {
  command: Command
  score: number
}

export function filterCommands(commands: Command[], query: string): Command[] {
  if (!query.trim()) return commands.slice(0, MAX_RESULTS)

  const results: FilterResult[] = []
  for (const cmd of commands) {
    const score = scoreMatch(cmd, query)
    if (score > 0) results.push({ command: cmd, score })
  }
  results.sort((a, b) => b.score - a.score || a.command.title.localeCompare(b.command.title))
  return results.slice(0, MAX_RESULTS).map((r) => r.command)
}

/**
 * If the query is pure digits in 1..9999, returns the synthetic "Open throttle #N" command
 * prepended to the filtered results. The synthetic command receives a roster lookup so its
 * description can reflect whether the address is a known loco.
 */
export function buildNumericShortcut(
  query: string,
  locoLookup: (address: number) => { name?: string; roadname?: string } | null,
  openThrottle: (address: number) => Promise<void>,
): Command | null {
  const q = query.trim()
  if (!/^\d+$/.test(q)) return null
  const n = Number(q)
  if (!Number.isInteger(n) || n < 1 || n > 9999) return null
  const match = locoLookup(n)
  return {
    id: `throttle.numeric.${n}`,
    title: `Open throttle #${n}`,
    description: match
      ? `${match.name || `Loco ${n}`}${match.roadname ? ` · ${match.roadname}` : ''}`
      : undefined,
    icon: 'mdi-train',
    category: 'throttle',
    run: () => openThrottle(n),
  }
}
```

### Global keybindings (`useGlobalKeybindings.ts`)

```ts
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCommandPalette } from './useCommandPalette'

const CHORD_TIMEOUT_MS = 1000

export const chordKey = ref<string | null>(null) // exposed for CommandPaletteChordChip

export function useGlobalKeybindings() {
  const router = useRouter()
  const palette = useCommandPalette()
  let chordTimer: number | null = null

  function clearChord() {
    chordKey.value = null
    if (chordTimer !== null) {
      window.clearTimeout(chordTimer)
      chordTimer = null
    }
  }

  function runChord(first: string, second: string): boolean {
    if (first !== 'g') return false
    const route = (() => {
      switch (second) {
        case 'r': return 'roster'
        case 't': return 'throttles'
        case 'c': return 'conductor'
        case 'u': return 'turnouts'
        case 's': return 'signals'
        case 'e': return 'effects'
        case ',': return 'settings'
        default: return null
      }
    })()
    if (!route) return false
    router.push({ name: route })
    return true
  }

  function isEditable(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null
    if (!el) return false
    const tag = el.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
    if (el.isContentEditable) return true
    return false
  }

  function handler(e: KeyboardEvent) {
    // ⌘K / Ctrl+K — always active (even in inputs)
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault()
      palette.open()
      clearChord()
      return
    }

    // Esc — close palette or pop stack
    if (e.key === 'Escape' && palette.isOpen.value) {
      e.preventDefault()
      if (palette.stack.value.length > 0) {
        palette.pop()
      } else {
        palette.close()
      }
      return
    }

    // All other shortcuts are suppressed inside inputs
    if (isEditable(e.target)) return
    if (e.metaKey || e.ctrlKey || e.altKey) return

    // Chord second key
    if (chordKey.value) {
      const ran = runChord(chordKey.value, e.key)
      clearChord()
      if (ran) e.preventDefault()
      return
    }

    // Start a chord
    if (e.key === 'g') {
      chordKey.value = 'g'
      chordTimer = window.setTimeout(clearChord, CHORD_TIMEOUT_MS)
      return
    }
  }

  onMounted(() => window.addEventListener('keydown', handler))
  onUnmounted(() => {
    window.removeEventListener('keydown', handler)
    clearChord()
  })
}
```

The `chordKey` is exported so `CommandPaletteChordChip.vue` can render a tiny floating "g…" indicator while armed.

### Palette UI (`CommandPalette.vue`) — shape

- `v-dialog v-model="isOpen" max-width="560" persistent="false" transition="fade-transition"` — persistent=false so outside clicks close.
- `v-card class="pa-0"` with three sections: header input, results list, footer legend.
- Input uses an unstyled `<input>` (not `v-text-field`) so the focus ring and chrome don't fight with the palette aesthetic.
- Results list: `<div class="cp-results" role="listbox">` with `<div role="option" :aria-selected="idx === activeIndex">` children, each with the icon + title + description + shortcut badges.
- Category headers render as `<div class="cp-group-label">` between runs of same-category results.
- Virtualization is NOT needed for v1 — with current data sizes (a few hundred turnouts/effects/signals max), a simple `<div v-for>` loop is fine.

### Palette filtering flow

1. `CommandPalette.vue` imports `useCommands()` and `useCommandPalette()`.
2. `currentCommands` = either the merged commands from `useCommands()` or, if a stack level is active, `stack[stack.length - 1].commands`.
3. `displayedCommands` = `filterCommands(currentCommands, query)`, plus `buildNumericShortcut(query, ...)` prepended if applicable.
4. `activeIndex` is clamped to `[0, displayedCommands.length - 1]` whenever `displayedCommands` changes.
5. Running a command:
   - If `cmd.children` is set → `palette.push(cmd.children)`.
   - Otherwise → `await cmd.run()` then `palette.close()`.
   - Errors bubble up: a try/catch logs + shows an inline error chip at the bottom of the card, does NOT close.

### QuickMenu prompt handoff (`QuickMenuPrompt.vue`)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useCommandPalette } from '@/command-palette/useCommandPalette'
import { useQuickMenu } from './useQuickMenu'

const palette = useCommandPalette()
const { closeAll } = useQuickMenu()
const text = ref('')

function submit() {
  const query = text.value.trim()
  closeAll()
  palette.open(query)
  text.value = ''
}
</script>

<template>
  <div class="qm-prompt">
    <v-icon size="16" class="qm-prompt-chevron">mdi-chevron-right</v-icon>
    <input
      v-model="text"
      type="text"
      class="qm-prompt-input"
      placeholder="What do you want to do?"
      @keyup.enter="submit"
    />
  </div>
</template>

<style scoped>
.qm-prompt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}
.qm-prompt-chevron { color: rgba(96, 165, 250, 0.7); }
.qm-prompt-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 12px;
  color: rgba(226, 232, 240, 0.9);
  font-family: ui-monospace, monospace;
}
.qm-prompt-input::placeholder {
  color: rgba(148, 163, 184, 0.4);
}
</style>
```

### Trimmed QuickMenu (`QuickMenu.vue`)

The rewritten body of the `<v-card v-if="isOpen">` (inside `QuickMenu.vue`):

```vue
<QuickMenuThrottles />
<template v-if="showFavorites">
  <v-divider class="opacity-10" />
  <QuickMenuFavorites />
</template>
<v-divider class="opacity-10" />
<QuickMenuPrompt />
```

All other template branches inside the `<v-card>` (sub-screen conditional, group list, item list, cloud section) are removed. No `currentScreen === 'home'` wrapper — there is only one screen now.

### `useQuickMenu.ts` after cleanup

Keeps: `isOpen`, `quickMenuVisible`, `closeAll`. Removes: `currentScreen`, `pushScreen`, `popScreen`, `SUBSCREEN_CONFIGS`, `GROUP_SCREEN_META`, `EntityScreen` type.

### `useQuickMenuData.ts` — deleted

The file is removed in this change. `QuickMenuThrottles.vue` is updated to import `useLocos` directly (which it already does — `useQuickMenuData` was just a wrapper around the drill-down data). Nothing else consumed this file after the drill-down components were deleted.

### Roster quick-add form (`RosterQuickAdd.vue`)

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { ROADNAMES } from '@repo/modules/locos'
import { createLogger } from '@repo/utils'

const log = createLogger('RosterQuickAdd')
const layoutId = useStorage('@DEJA/layoutId', '')

const address = ref<string>('')
const name = ref('')
const roadname = ref<string | null>(null)
const saving = ref(false)
const error = ref<string | null>(null)

const parsedAddress = computed<number | null>(() => {
  if (!address.value) return null
  if (!/^\d+$/.test(address.value)) return null
  const n = Number(address.value)
  if (!Number.isInteger(n) || n < 1 || n > 9999) return null
  return n
})

const canSave = computed(() => parsedAddress.value !== null && !saving.value)

async function save() {
  const addr = parsedAddress.value
  if (addr === null || !layoutId.value) return
  error.value = null
  saving.value = true
  try {
    await setDoc(
      doc(db, `layouts/${layoutId.value}/locos`, String(addr)),
      {
        address: addr,
        name: name.value || `Loco ${addr}`,
        meta: { roadname: roadname.value || '' },
        timestamp: serverTimestamp(),
      },
      { merge: true },
    )
    address.value = ''
    name.value = ''
    roadname.value = null
  } catch (e) {
    log.error('Failed to save loco', e)
    error.value = e instanceof Error ? e.message : 'Failed to save loco'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <v-card class="roster-quick-add pa-3 mb-3" variant="tonal">
    <div class="flex items-center gap-3 flex-wrap">
      <v-text-field
        v-model="address"
        type="number"
        inputmode="numeric"
        :min="1"
        :max="9999"
        label="DCC Address"
        density="compact"
        variant="outlined"
        hide-details
        class="qa-field qa-field-address"
        @keyup.enter="save"
      />
      <v-text-field
        v-model="name"
        label="Name"
        placeholder="e.g. GP38"
        density="compact"
        variant="outlined"
        hide-details
        class="qa-field qa-field-name"
        @keyup.enter="save"
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
        hide-details
        class="qa-field qa-field-roadname"
      />
      <v-btn
        color="pink"
        prepend-icon="mdi-plus"
        :disabled="!canSave"
        :loading="saving"
        @click="save"
      >
        Add
      </v-btn>
    </div>
    <div v-if="error" class="text-caption text-error mt-2">{{ error }}</div>
  </v-card>
</template>

<style scoped>
.qa-field-address { max-width: 140px; }
.qa-field-name { min-width: 180px; flex: 1; }
.qa-field-roadname { max-width: 200px; }
</style>
```

Mounted in `RosterView.vue` above `<LocoRoster>` (inside the main `<main>` scroll area, after `<PageHeader>`). The `parsedAddress` computed uses a strict digits-only regex (`/^\d+$/`) before calling `Number()` — same pattern used throughout the codebase for DCC input — so `1e3`, `1.5`, and empty strings are all rejected without needing individual branches.

## Error Handling

- **Palette command run failure:** caught, logged via `createLogger`, surfaced as an inline error chip inside the palette card for 5 seconds, does NOT close the palette.
- **QuickMenu prompt with empty string:** still opens the palette but with an empty query.
- **Chord pressed inside a focused input:** chord state not entered — keystroke passes through to the input.
- **Command palette opened while QuickMenu is still open:** `closeAll()` is called first to avoid two overlays.
- **Invalid DCC in roster quick-add:** Save button disabled, no submit, no write.
- **Firestore write failure in roster quick-add:** inline error chip, fields preserved for retry.

## Testing

### Unit tests

- **`fuzzyMatch.test.ts`** (Vitest, in `apps/throttle/src/command-palette/`)
  - Exact match scores 1000
  - Title prefix scores 500
  - Title substring scores 300
  - Keyword substring scores 250
  - Fuzzy subsequence returns > 0 for matching chars in order, 0 otherwise
  - Empty query returns all commands up to MAX_RESULTS
  - `buildNumericShortcut('42', ...)` returns a synthetic command with the right id, title, and description reflecting the roster lookup
  - `buildNumericShortcut('0', ...)` and `buildNumericShortcut('10000', ...)` return null
  - `buildNumericShortcut('3.5', ...)` returns null
- **`useCommandPalette.test.ts`**
  - `open('foo')` sets isOpen, query, and clears stack/activeIndex
  - `close()` resets everything
  - `push()` advances the stack and clears query/activeIndex
  - `pop()` rewinds the stack one level
  - `currentLevelTitle` reflects top of stack or null at root
- **`useGlobalKeybindings.test.ts`**
  - ⌘K opens palette (mock router + palette)
  - ⌘K fires even when focus is on an input
  - `g r` chord navigates to roster
  - `g` alone and then timeout → no action
  - `g` followed by an invalid key → chord cleared, no action
  - Chord suppressed inside a focused INPUT/TEXTAREA/SELECT
  - Escape closes palette when at root level
  - Escape pops stack when stack is non-empty
- **`commands/throttles.test.ts`**
  - `openThrottle(42)` calls `acquireThrottle(42)` then navigates to throttle view
  - Roster loco commands generated one per loco with keywords containing address, name, roadname
  - `stop-all` command writes speed 0 to every throttle doc in the collection (use mock setDoc)
- **`commands/turnouts.test.ts`**
  - Two commands per turnout (throw + close)
  - `setTurnout(id, { state: true })` called on throw, `{ state: false }` on close
- **`commands/signals.test.ts`**
  - One top-level per signal
  - Children include 4 aspects (red/yellow/green/clear)
  - Running a child calls `setSignalAspect(signalId, aspect)` with the correct value

### Component smoke tests

- **`CommandPalette.test.ts`**
  - Renders with query input autofocused when isOpen flips true
  - ↑/↓ cycles activeIndex
  - Enter runs the active command
  - Clicking a result runs it
  - When query is `42`, the synthetic "Open throttle #42" is the first result
  - When a signal command is selected, the stack advances and the aspects are shown
- **`QuickMenuPrompt.test.ts`**
  - Enter calls palette.open with the current query and closes the quickmenu
- **`RosterQuickAdd.test.ts`**
  - Save button disabled when address is empty / non-integer / out of range
  - Submitting calls setDoc with the expected shape
  - Clears fields on success
  - Keeps fields and shows error on write failure

### Manual smoke test checklist

1. `⌘K` from the home page → palette opens with empty query → shows nav commands first.
2. Type `42` → "Open throttle #42" appears as the first result → Enter navigates to `/throttle/42`.
3. Type `throw main yard` → a turnout command appears → Enter runs it → the turnout flips in Firestore.
4. Type `block west` (a signal name fragment) → Enter pushes the aspect picker → select "Red" → Enter runs `setSignalAspect(id, 'red')` → palette closes.
5. Esc inside the aspect picker → back to the signal list.
6. `g r` → navigates to Roster. `g t` → Throttles. `g ,` → Settings. All within the 1s chord window.
7. Press `g`, wait 2 seconds, press `r` → no navigation (chord timed out).
8. Focus a text field, press `g r` → no navigation (chord suppressed).
9. Open QuickMenu FAB → type "stop all" in the prompt → Enter → palette opens with "stop all" results.
10. QuickMenu no longer shows cloud sub-menu, group lists, or item lists — only throttles, favorites, and the prompt.
11. Header shows a new magnify icon next to the e-stop button → click opens the palette.
12. Roster page shows the quick-add form at the top → fill address 999, name "Test", save → new loco appears in the list.
13. Quick-throttle a non-roster address via the palette → the save-to-roster chip still appears in `ThrottleView`.
14. Confirm `t` no longer opens any popover (old shortcut removed).
15. Confirm the old per-page Quick Throttle buttons are gone from Roster, Throttle List, Throttle View footer, Conductor, and QuickMenu Throttles.

## Scope

### In scope

- Command palette dialog, composables, keybindings, chord UI
- Command sources for 5 categories
- Header trigger button
- Trimmed QuickMenu + new prompt component
- Roster quick-add form
- Cleanup of previous Quick Throttle popover code + QuickMenu drill-downs
- `useQuickThrottle.ts` deletion (logic moves to `commands/throttles.ts`)

### Out of scope (v1.1 or later)

- Routes, power, layout-management, sensor commands
- Emergency stop in the palette (stays in header)
- `?` keybindings help overlay
- Recent commands history
- Rebindable shortcuts
- Virtualized result list
- A plugin/contrib system for third-party commands
- Replacing the EmergencyStop button
- Command palette on other apps (cloud, monitor, tour) — throttle-only in v1
