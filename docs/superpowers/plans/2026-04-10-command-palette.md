# Command Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a global Command Palette (⌘K / Ctrl+K) that supersedes the per-page Quick Throttle popover and the QuickMenu drill-downs. The palette owns navigation, throttle acquisition, turnout control, effect toggling, and signal aspect selection. Also: trim the QuickMenu to throttles + favorites + prompt, wire up `g <letter>` chord shortcuts, and add an inline quick-add form to the Roster page.

**Architecture:** One shared `useCommandPalette` composable owns module-scoped palette state (open, query, activeIndex, stack). Five `commands/*.ts` files each expose a `ComputedRef<Command[]>` built from the corresponding domain composable. A `useCommands()` merger flattens them. `fuzzyMatch.ts` scores + filters results, with a `buildNumericShortcut()` helper that creates a synthetic "Open throttle #N" command when the query is pure digits. `useGlobalKeybindings()` registers a global `keydown` listener for ⌘K, Escape, and `g`-prefixed chord shortcuts. The palette UI is a single `CommandPalette.vue` dialog mounted once in `App.vue`, with a `CommandPaletteTrigger.vue` icon button injected into the AppHeader slot and a `CommandPaletteChordChip.vue` floating indicator while a chord is armed. The QuickMenu gets a new `QuickMenuPrompt.vue` section that hands off submitted queries to the palette. A new `RosterQuickAdd.vue` sits above `<LocoRoster>` on the Roster page.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, Vuetify 3, Vue Router 4, Vuefire + Firestore, VueUse, Vitest, Firebase modular SDK.

**Spec:** `docs/superpowers/specs/2026-04-10-command-palette-design.md`

---

## File Structure

**Create (new directory tree):**

```
apps/throttle/src/command-palette/
├── types.ts                          # Command, CommandCategory, CommandStack
├── useCommandPalette.ts              # Module-scoped palette state + open/close/push/pop
├── useCommandPalette.test.ts
├── fuzzyMatch.ts                     # scoreMatch, filterCommands, buildNumericShortcut
├── fuzzyMatch.test.ts
├── useGlobalKeybindings.ts           # ⌘K + g-chord keydown listener
├── useGlobalKeybindings.test.ts
├── useCommands.ts                    # Merged ComputedRef<Command[]>
├── CommandPalette.vue                # Dialog UI
├── CommandPaletteTrigger.vue         # Header icon button
├── CommandPaletteChordChip.vue       # Floating "g…" indicator
└── commands/
    ├── navigation.ts                 # useNavigationCommands
    ├── throttles.ts                  # useThrottleCommands
    ├── throttles.test.ts
    ├── turnouts.ts                   # useTurnoutCommands
    ├── turnouts.test.ts
    ├── effects.ts                    # useEffectCommands
    ├── effects.test.ts
    ├── signals.ts                    # useSignalCommands
    └── signals.test.ts

apps/throttle/src/quick-menu/
└── QuickMenuPrompt.vue               # New prompt input hand-off to palette

apps/throttle/src/roster/
├── RosterQuickAdd.vue                # New inline quick-add form
└── RosterQuickAdd.test.ts
```

**Modify:**
- `apps/throttle/src/App.vue` — mount `<CommandPalette />` and `<CommandPaletteChordChip />`, inject `<CommandPaletteTrigger />` into `<AppHeader>` default slot, call `useGlobalKeybindings()`.
- `apps/throttle/src/quick-menu/QuickMenu.vue` — strip sub-screen rendering, replace with `<QuickMenuThrottles /> / <QuickMenuFavorites /> / <QuickMenuPrompt />`.
- `apps/throttle/src/quick-menu/useQuickMenu.ts` — strip `screenStack`, `currentScreen`, `pushScreen`, `popScreen`, `EntityScreen`, `SUBSCREEN_CONFIGS`, `GROUP_SCREEN_META`. Keep `isOpen`, `quickMenuVisible`, `closeAll`.
- `apps/throttle/src/quick-menu/QuickMenuThrottles.vue` — revert the `QuickThrottleButton` placement from the previous task.
- `apps/throttle/src/views/RosterView.vue` — revert `QuickThrottleButton` placement, mount new `<RosterQuickAdd />` above `<LocoRoster>`.
- `apps/throttle/src/throttle/ThrottleList.vue` — revert `QuickThrottleButton` placement + `.throttle-list-fabs` wrapper.
- `apps/throttle/src/views/ThrottleView.vue` — revert `QuickThrottleButton` + footer wrapper. `SaveToRosterChip` overlay stays.
- `apps/throttle/src/conductor/ConductorLayout.vue` — revert `QuickThrottleButton` + `.conductor-quick-throttle` div.

**Delete:**
- `apps/throttle/src/throttle/QuickThrottleButton.vue`
- `apps/throttle/src/throttle/QuickThrottleForm.vue`
- `apps/throttle/src/throttle/QuickThrottleNumpad.vue`
- `apps/throttle/src/throttle/QuickThrottleGlobalDialog.vue`
- `apps/throttle/src/throttle/useQuickThrottle.ts`
- `apps/throttle/src/throttle/useQuickThrottle.test.ts`
- `apps/throttle/src/quick-menu/QuickMenuSubScreen.vue`
- `apps/throttle/src/quick-menu/QuickMenuGroupList.vue`
- `apps/throttle/src/quick-menu/QuickMenuItemList.vue`
- `apps/throttle/src/quick-menu/QuickMenuCloud.vue`
- `apps/throttle/src/quick-menu/useQuickMenuData.ts`

**Preserved (untouched):**
- `packages/modules/locos/useLocos.ts` — `acquireThrottle` merge fix stays.
- `packages/modules/locos/useLocos.acquireThrottle.test.ts`
- `apps/throttle/src/throttle/SaveToRosterChip.vue`

---

## Task 1: Palette types + state composable

**Files:**
- Create: `apps/throttle/src/command-palette/types.ts`
- Create: `apps/throttle/src/command-palette/useCommandPalette.ts`
- Create: `apps/throttle/src/command-palette/useCommandPalette.test.ts`

- [ ] **Step 1: Create the directory and types file**

Create `apps/throttle/src/command-palette/types.ts`:

```ts
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

- [ ] **Step 2: Write the failing palette state test**

Create `apps/throttle/src/command-palette/useCommandPalette.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useCommandPalette } from './useCommandPalette'
import type { Command, CommandStack } from './types'

const makeCommand = (id: string): Command => ({
  id,
  title: id,
  category: 'navigation',
  icon: 'mdi-star',
  run: () => {},
})

describe('useCommandPalette', () => {
  beforeEach(() => {
    const { close } = useCommandPalette()
    close()
  })

  it('starts closed with empty query and empty stack', () => {
    const { isOpen, query, activeIndex, stack } = useCommandPalette()
    expect(isOpen.value).toBe(false)
    expect(query.value).toBe('')
    expect(activeIndex.value).toBe(0)
    expect(stack.value).toEqual([])
  })

  it('open() flips isOpen and seeds the query', () => {
    const { open, isOpen, query, activeIndex, stack } = useCommandPalette()
    open('throw main')
    expect(isOpen.value).toBe(true)
    expect(query.value).toBe('throw main')
    expect(activeIndex.value).toBe(0)
    expect(stack.value).toEqual([])
  })

  it('open() without argument seeds empty query', () => {
    const { open, query } = useCommandPalette()
    open()
    expect(query.value).toBe('')
  })

  it('close() resets everything', () => {
    const { open, close, isOpen, query, activeIndex, stack } = useCommandPalette()
    open('something')
    close()
    expect(isOpen.value).toBe(false)
    expect(query.value).toBe('')
    expect(activeIndex.value).toBe(0)
    expect(stack.value).toEqual([])
  })

  it('push() adds a level, clears query and activeIndex', () => {
    const { open, push, query, activeIndex, stack } = useCommandPalette()
    open('signal block west')
    const level: CommandStack = {
      title: 'Set Block West ▸ aspect',
      commands: [makeCommand('red'), makeCommand('yellow')],
    }
    push(level)
    expect(stack.value).toHaveLength(1)
    expect(stack.value[0].title).toBe('Set Block West ▸ aspect')
    expect(query.value).toBe('')
    expect(activeIndex.value).toBe(0)
  })

  it('pop() removes the top level and resets query/activeIndex', () => {
    const { open, push, pop, query, activeIndex, stack } = useCommandPalette()
    open()
    push({ title: 'level 1', commands: [] })
    push({ title: 'level 2', commands: [] })
    expect(stack.value).toHaveLength(2)
    pop()
    expect(stack.value).toHaveLength(1)
    expect(stack.value[0].title).toBe('level 1')
    expect(query.value).toBe('')
    expect(activeIndex.value).toBe(0)
  })

  it('currentLevelTitle reflects the top of stack or null', () => {
    const { open, push, pop, currentLevelTitle } = useCommandPalette()
    open()
    expect(currentLevelTitle.value).toBeNull()
    push({ title: 'one', commands: [] })
    expect(currentLevelTitle.value).toBe('one')
    push({ title: 'two', commands: [] })
    expect(currentLevelTitle.value).toBe('two')
    pop()
    expect(currentLevelTitle.value).toBe('one')
    pop()
    expect(currentLevelTitle.value).toBeNull()
  })

  it('state is shared across calls (module-scoped)', () => {
    const a = useCommandPalette()
    const b = useCommandPalette()
    a.open('shared')
    expect(b.isOpen.value).toBe(true)
    expect(b.query.value).toBe('shared')
  })
})
```

- [ ] **Step 3: Run test to verify failure**

```bash
pnpm --filter=deja-throttle test:unit run useCommandPalette
```

Expected: FAIL — `useCommandPalette` module does not exist yet.

- [ ] **Step 4: Create the composable**

Create `apps/throttle/src/command-palette/useCommandPalette.ts`:

```ts
import { ref, computed } from 'vue'
import type { CommandStack } from './types'

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

- [ ] **Step 5: Run test to verify pass**

```bash
pnpm --filter=deja-throttle test:unit run useCommandPalette
```

Expected: 8 tests passing.

- [ ] **Step 6: Commit**

```bash
git add apps/throttle/src/command-palette/types.ts apps/throttle/src/command-palette/useCommandPalette.ts apps/throttle/src/command-palette/useCommandPalette.test.ts
git commit -m "$(cat <<'EOF'
feat(command-palette): 🏗️ add palette state composable + types

Module-scoped useCommandPalette shares isOpen/query/activeIndex/stack
across all call sites. open/close/push/pop methods cover the top-level
and the two-level stack for signal aspect selection. Command interface
defines the data shape: id, title, category, icon, run, optional
description/keywords/shortcut/children.
EOF
)"
```

---

## Task 2: Fuzzy match + numeric shortcut

**Files:**
- Create: `apps/throttle/src/command-palette/fuzzyMatch.ts`
- Create: `apps/throttle/src/command-palette/fuzzyMatch.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/throttle/src/command-palette/fuzzyMatch.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { scoreMatch, filterCommands, buildNumericShortcut } from './fuzzyMatch'
import type { Command } from './types'

const makeCmd = (title: string, keywords: string[] = []): Command => ({
  id: title,
  title,
  category: 'navigation',
  icon: 'mdi-star',
  keywords,
  run: () => {},
})

describe('scoreMatch', () => {
  it('empty query returns 1 (everything passes)', () => {
    expect(scoreMatch(makeCmd('Throw Main Yard'), '')).toBe(1)
  })

  it('exact title match scores 1000', () => {
    expect(scoreMatch(makeCmd('Throw Main Yard'), 'throw main yard')).toBe(1000)
  })

  it('title prefix scores 500', () => {
    expect(scoreMatch(makeCmd('Throw Main Yard'), 'throw main')).toBe(500)
  })

  it('title substring scores 300', () => {
    expect(scoreMatch(makeCmd('Throw Main Yard'), 'main yard')).toBe(300)
  })

  it('keyword substring scores 250', () => {
    expect(scoreMatch(makeCmd('Go to Roster', ['locos', 'trains']), 'trains')).toBe(250)
  })

  it('fuzzy subsequence returns > 0', () => {
    const score = scoreMatch(makeCmd('Throw Main Yard'), 'tmy')
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(300)
  })

  it('fuzzy match where characters are not in order returns 0', () => {
    expect(scoreMatch(makeCmd('Throw Main Yard'), 'zzz')).toBe(0)
  })

  it('case-insensitive matching', () => {
    expect(scoreMatch(makeCmd('THROW main YARD'), 'throw')).toBe(500)
  })
})

describe('filterCommands', () => {
  const commands = [
    makeCmd('Throw Main Yard'),
    makeCmd('Close Main Yard'),
    makeCmd('Throw Main Siding'),
    makeCmd('Go to Roster', ['locos']),
  ]

  it('empty query returns all commands up to MAX_RESULTS', () => {
    expect(filterCommands(commands, '')).toHaveLength(4)
  })

  it('filters by title substring', () => {
    const result = filterCommands(commands, 'main yard')
    expect(result.map((c) => c.title)).toContain('Throw Main Yard')
    expect(result.map((c) => c.title)).toContain('Close Main Yard')
    expect(result.map((c) => c.title)).not.toContain('Go to Roster')
  })

  it('sorts by score descending', () => {
    const result = filterCommands(commands, 'throw main yard')
    expect(result[0].title).toBe('Throw Main Yard') // exact match first
  })

  it('ties broken alphabetically', () => {
    const ties = [
      makeCmd('Throw Bravo'),
      makeCmd('Throw Alpha'),
    ]
    const result = filterCommands(ties, 'throw')
    expect(result[0].title).toBe('Throw Alpha')
    expect(result[1].title).toBe('Throw Bravo')
  })

  it('filters by keyword', () => {
    const result = filterCommands(commands, 'locos')
    expect(result.map((c) => c.title)).toContain('Go to Roster')
  })
})

describe('buildNumericShortcut', () => {
  const noLookup = vi.fn(() => null)
  const openThrottle = vi.fn(async () => {})

  it('returns null for non-numeric query', () => {
    expect(buildNumericShortcut('main', noLookup, openThrottle)).toBeNull()
  })

  it('returns null for empty query', () => {
    expect(buildNumericShortcut('', noLookup, openThrottle)).toBeNull()
  })

  it('returns null for address 0', () => {
    expect(buildNumericShortcut('0', noLookup, openThrottle)).toBeNull()
  })

  it('returns null for address above 9999', () => {
    expect(buildNumericShortcut('10000', noLookup, openThrottle)).toBeNull()
  })

  it('returns null for decimal', () => {
    expect(buildNumericShortcut('3.5', noLookup, openThrottle)).toBeNull()
  })

  it('returns null for scientific notation', () => {
    expect(buildNumericShortcut('1e3', noLookup, openThrottle)).toBeNull()
  })

  it('returns a command for a valid address with no roster match', () => {
    const cmd = buildNumericShortcut('42', noLookup, openThrottle)
    expect(cmd).not.toBeNull()
    expect(cmd!.id).toBe('throttle.numeric.42')
    expect(cmd!.title).toBe('Open throttle #42')
    expect(cmd!.description).toBeUndefined()
    expect(cmd!.category).toBe('throttle')
  })

  it('populates description with roster lookup when present', () => {
    const lookup = vi.fn(() => ({ name: 'GP38', roadname: 'Cuyama' }))
    const cmd = buildNumericShortcut('42', lookup, openThrottle)
    expect(cmd!.description).toBe('GP38 · Cuyama')
  })

  it('run() invokes openThrottle with the parsed address', async () => {
    const cmd = buildNumericShortcut('42', noLookup, openThrottle)
    await cmd!.run()
    expect(openThrottle).toHaveBeenCalledWith(42)
  })
})
```

- [ ] **Step 2: Run test to verify failure**

```bash
pnpm --filter=deja-throttle test:unit run fuzzyMatch
```

Expected: FAIL — `fuzzyMatch` module does not exist yet.

- [ ] **Step 3: Create the implementation**

Create `apps/throttle/src/command-palette/fuzzyMatch.ts`:

```ts
import type { Command } from './types'

const MAX_RESULTS = 50

export function scoreMatch(cmd: Command, query: string): number {
  const q = query.trim().toLowerCase()
  if (!q) return 1
  const title = cmd.title.toLowerCase()
  const keywords = (cmd.keywords || []).map((k) => k.toLowerCase())

  if (title === q) return 1000
  if (title.startsWith(q)) return 500
  if (title.includes(q)) return 300
  for (const kw of keywords) {
    if (kw.includes(q)) return 250
  }

  // Fuzzy subsequence: all chars of q appear in title in order
  let i = 0
  for (const ch of title) {
    if (ch === q[i]) i++
    if (i === q.length) {
      return 100 + Math.floor((q.length / Math.max(title.length, 1)) * 50)
    }
  }

  return 0
}

interface FilterResult {
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

- [ ] **Step 4: Run test to verify pass**

```bash
pnpm --filter=deja-throttle test:unit run fuzzyMatch
```

Expected: 20 tests passing.

- [ ] **Step 5: Commit**

```bash
git add apps/throttle/src/command-palette/fuzzyMatch.ts apps/throttle/src/command-palette/fuzzyMatch.test.ts
git commit -m "$(cat <<'EOF'
feat(command-palette): 🔍 add fuzzy match scoring + numeric shortcut

scoreMatch ranks exact (1000) > title prefix (500) > title substring
(300) > keyword substring (250) > fuzzy subsequence (100+). Ties broken
alphabetically. filterCommands caps at 50 results. buildNumericShortcut
creates a synthetic "Open throttle #N" command for digit-only queries
in 1..9999, with the description reflecting roster lookup.
EOF
)"
```

---

## Task 3: Global keybindings

**Files:**
- Create: `apps/throttle/src/command-palette/useGlobalKeybindings.ts`
- Create: `apps/throttle/src/command-palette/useGlobalKeybindings.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/throttle/src/command-palette/useGlobalKeybindings.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

const pushMock = vi.fn()
const paletteOpenMock = vi.fn()
const paletteCloseMock = vi.fn()
const palettePopMock = vi.fn()
const paletteIsOpen = { value: false }
const paletteStack = { value: [] as unknown[] }

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

vi.mock('./useCommandPalette', () => ({
  useCommandPalette: () => ({
    isOpen: paletteIsOpen,
    stack: paletteStack,
    open: paletteOpenMock,
    close: paletteCloseMock,
    pop: palettePopMock,
  }),
}))

import { useGlobalKeybindings, chordKey } from './useGlobalKeybindings'

const Host = defineComponent({
  setup() {
    useGlobalKeybindings()
    return () => null
  },
})

function dispatchKey(
  key: string,
  mods: { meta?: boolean; ctrl?: boolean; alt?: boolean; shift?: boolean } = {},
  target?: EventTarget,
) {
  const ev = new KeyboardEvent('keydown', {
    key,
    metaKey: !!mods.meta,
    ctrlKey: !!mods.ctrl,
    altKey: !!mods.alt,
    shiftKey: !!mods.shift,
    bubbles: true,
    cancelable: true,
  })
  if (target) {
    Object.defineProperty(ev, 'target', { value: target, enumerable: true })
    target.dispatchEvent(ev)
  } else {
    window.dispatchEvent(ev)
  }
  return ev
}

describe('useGlobalKeybindings', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    vi.useFakeTimers()
    pushMock.mockClear()
    paletteOpenMock.mockClear()
    paletteCloseMock.mockClear()
    palettePopMock.mockClear()
    paletteIsOpen.value = false
    paletteStack.value = []
    chordKey.value = null
    wrapper = mount(Host)
  })

  afterEach(() => {
    wrapper.unmount()
    vi.useRealTimers()
  })

  it('⌘K opens the palette', () => {
    dispatchKey('k', { meta: true })
    expect(paletteOpenMock).toHaveBeenCalledTimes(1)
  })

  it('Ctrl+K opens the palette', () => {
    dispatchKey('k', { ctrl: true })
    expect(paletteOpenMock).toHaveBeenCalledTimes(1)
  })

  it('⌘K fires even when focus is on an input', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    dispatchKey('k', { meta: true }, input)
    expect(paletteOpenMock).toHaveBeenCalledTimes(1)
    document.body.removeChild(input)
  })

  it('Esc closes the palette when at root level', () => {
    paletteIsOpen.value = true
    paletteStack.value = []
    dispatchKey('Escape')
    expect(paletteCloseMock).toHaveBeenCalledTimes(1)
    expect(palettePopMock).not.toHaveBeenCalled()
  })

  it('Esc pops the stack when non-empty', () => {
    paletteIsOpen.value = true
    paletteStack.value = [{ title: 'aspect', commands: [] }]
    dispatchKey('Escape')
    expect(palettePopMock).toHaveBeenCalledTimes(1)
    expect(paletteCloseMock).not.toHaveBeenCalled()
  })

  it('Esc does nothing when palette is closed', () => {
    paletteIsOpen.value = false
    dispatchKey('Escape')
    expect(paletteCloseMock).not.toHaveBeenCalled()
    expect(palettePopMock).not.toHaveBeenCalled()
  })

  it('g r navigates to roster', async () => {
    dispatchKey('g')
    expect(chordKey.value).toBe('g')
    dispatchKey('r')
    expect(pushMock).toHaveBeenCalledWith({ name: 'roster' })
    expect(chordKey.value).toBeNull()
  })

  it('g t navigates to throttles', () => {
    dispatchKey('g')
    dispatchKey('t')
    expect(pushMock).toHaveBeenCalledWith({ name: 'throttles' })
  })

  it('g c navigates to conductor', () => {
    dispatchKey('g')
    dispatchKey('c')
    expect(pushMock).toHaveBeenCalledWith({ name: 'conductor' })
  })

  it('g u navigates to turnouts', () => {
    dispatchKey('g')
    dispatchKey('u')
    expect(pushMock).toHaveBeenCalledWith({ name: 'turnouts' })
  })

  it('g s navigates to signals', () => {
    dispatchKey('g')
    dispatchKey('s')
    expect(pushMock).toHaveBeenCalledWith({ name: 'signals' })
  })

  it('g e navigates to effects', () => {
    dispatchKey('g')
    dispatchKey('e')
    expect(pushMock).toHaveBeenCalledWith({ name: 'effects' })
  })

  it('g , navigates to settings', () => {
    dispatchKey('g')
    dispatchKey(',')
    expect(pushMock).toHaveBeenCalledWith({ name: 'settings' })
  })

  it('g followed by invalid key clears chord without action', () => {
    dispatchKey('g')
    dispatchKey('z')
    expect(pushMock).not.toHaveBeenCalled()
    expect(chordKey.value).toBeNull()
  })

  it('g alone times out after 1000ms', () => {
    dispatchKey('g')
    expect(chordKey.value).toBe('g')
    vi.advanceTimersByTime(1000)
    expect(chordKey.value).toBeNull()
  })

  it('chord suppressed inside a focused INPUT', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    dispatchKey('g', {}, input)
    expect(chordKey.value).toBeNull()
    expect(pushMock).not.toHaveBeenCalled()
    document.body.removeChild(input)
  })

  it('chord suppressed inside a focused TEXTAREA', () => {
    const ta = document.createElement('textarea')
    document.body.appendChild(ta)
    dispatchKey('g', {}, ta)
    expect(chordKey.value).toBeNull()
    document.body.removeChild(ta)
  })

  it('chord suppressed inside a focused SELECT', () => {
    const sel = document.createElement('select')
    document.body.appendChild(sel)
    dispatchKey('g', {}, sel)
    expect(chordKey.value).toBeNull()
    document.body.removeChild(sel)
  })

  it('modifier-held g does not start a chord', () => {
    dispatchKey('g', { alt: true })
    expect(chordKey.value).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify failure**

```bash
pnpm --filter=deja-throttle test:unit run useGlobalKeybindings
```

Expected: FAIL — `useGlobalKeybindings` does not exist.

- [ ] **Step 3: Create the composable**

Create `apps/throttle/src/command-palette/useGlobalKeybindings.ts`:

```ts
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCommandPalette } from './useCommandPalette'

const CHORD_TIMEOUT_MS = 1000

export const chordKey = ref<string | null>(null)

export function useGlobalKeybindings() {
  const router = useRouter()
  const palette = useCommandPalette()
  let chordTimer: ReturnType<typeof setTimeout> | null = null

  function clearChord() {
    chordKey.value = null
    if (chordTimer !== null) {
      clearTimeout(chordTimer)
      chordTimer = null
    }
  }

  function runChord(first: string, second: string): boolean {
    if (first !== 'g') return false
    const routeName = (() => {
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
    if (!routeName) return false
    router.push({ name: routeName })
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
    // ⌘K / Ctrl+K — always active, even in inputs
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault()
      palette.open()
      clearChord()
      return
    }

    // Escape — close palette or pop stack
    if (e.key === 'Escape' && palette.isOpen.value) {
      e.preventDefault()
      if (palette.stack.value.length > 0) {
        palette.pop()
      } else {
        palette.close()
      }
      return
    }

    // All other shortcuts are suppressed in inputs or with modifiers
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
      chordTimer = setTimeout(clearChord, CHORD_TIMEOUT_MS)
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

- [ ] **Step 4: Run test to verify pass**

```bash
pnpm --filter=deja-throttle test:unit run useGlobalKeybindings
```

Expected: 17 tests passing.

- [ ] **Step 5: Commit**

```bash
git add apps/throttle/src/command-palette/useGlobalKeybindings.ts apps/throttle/src/command-palette/useGlobalKeybindings.test.ts
git commit -m "$(cat <<'EOF'
feat(command-palette): ⌨️ add global keybindings composable

Registers a keydown listener for ⌘K/Ctrl+K (open palette, always
active), Escape (close/pop palette, only when open), and g-prefixed
chords for navigation: g r/t/c/u/s/e/, → roster/throttles/conductor/
turnouts/signals/effects/settings. Chords time out after 1000ms and
are suppressed inside focused INPUT/TEXTAREA/SELECT/contentEditable.
The chordKey ref is exported for a floating indicator chip.
EOF
)"
```

---

## Task 4: Navigation commands

**Files:**
- Create: `apps/throttle/src/command-palette/commands/navigation.ts`

> No test — this is a static list with no branching logic. Coverage comes from palette smoke tests.

- [ ] **Step 1: Create the navigation command source**

Create `apps/throttle/src/command-palette/commands/navigation.ts`:

```ts
import { computed, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import type { Command } from '../types'

export function useNavigationCommands(): ComputedRef<Command[]> {
  const router = useRouter()

  return computed<Command[]>(() => [
    {
      id: 'nav.roster',
      title: 'Go to Roster',
      icon: 'mdi-train',
      category: 'navigation',
      shortcut: ['g', 'r'],
      keywords: ['locos', 'trains'],
      run: () => { router.push({ name: 'roster' }) },
    },
    {
      id: 'nav.throttles',
      title: 'Go to Throttles',
      icon: 'mdi-gamepad-variant',
      category: 'navigation',
      shortcut: ['g', 't'],
      keywords: ['throttle', 'drive'],
      run: () => { router.push({ name: 'throttles' }) },
    },
    {
      id: 'nav.conductor',
      title: 'Go to Conductor',
      icon: 'mdi-train-car',
      category: 'navigation',
      shortcut: ['g', 'c'],
      keywords: ['layout', 'dashboard'],
      run: () => { router.push({ name: 'conductor' }) },
    },
    {
      id: 'nav.turnouts',
      title: 'Go to Turnouts',
      icon: 'mdi-call-split',
      category: 'navigation',
      shortcut: ['g', 'u'],
      keywords: ['switches', 'points'],
      run: () => { router.push({ name: 'turnouts' }) },
    },
    {
      id: 'nav.signals',
      title: 'Go to Signals',
      icon: 'mdi-traffic-light',
      category: 'navigation',
      shortcut: ['g', 's'],
      keywords: ['aspect'],
      run: () => { router.push({ name: 'signals' }) },
    },
    {
      id: 'nav.effects',
      title: 'Go to Effects',
      icon: 'mdi-rocket-launch',
      category: 'navigation',
      shortcut: ['g', 'e'],
      keywords: ['sound', 'lights'],
      run: () => { router.push({ name: 'effects' }) },
    },
    {
      id: 'nav.settings',
      title: 'Go to Settings',
      icon: 'mdi-cog',
      category: 'navigation',
      shortcut: ['g', ','],
      keywords: ['preferences'],
      run: () => { router.push({ name: 'settings' }) },
    },
  ])
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm --filter=deja-throttle type-check
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add apps/throttle/src/command-palette/commands/navigation.ts
git commit -m "feat(command-palette): 🗺️ add navigation command source"
```

---

## Task 5: Throttle commands

**Files:**
- Create: `apps/throttle/src/command-palette/commands/throttles.ts`
- Create: `apps/throttle/src/command-palette/commands/throttles.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/throttle/src/command-palette/commands/throttles.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import type { Loco, Throttle } from '@repo/modules/locos'

const pushMock = vi.fn()
const acquireThrottleMock = vi.fn(async () => {})
const setDocMock = vi.fn(async () => {})
const getDocMock = vi.fn(async () => ({ exists: () => false }))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

const locosRef = ref<Loco[]>([])
const throttlesRef = ref<Throttle[]>([])

vi.mock('@repo/modules/locos', () => ({
  useLocos: () => ({
    getLocos: () => locosRef,
    getThrottles: () => throttlesRef,
    acquireThrottle: acquireThrottleMock,
  }),
}))

vi.mock('@vueuse/core', () => ({
  useStorage: (key: string, initial: unknown) =>
    key === '@DEJA/layoutId' ? { value: 'layout-1' } : { value: initial },
}))

vi.mock('firebase/firestore', () => ({
  doc: (_db: unknown, path: string, id: string) => ({ path: `${path}/${id}` }),
  setDoc: (...args: unknown[]) => setDocMock(...(args as [])),
  getDoc: (...args: unknown[]) => getDocMock(...(args as [])),
  serverTimestamp: () => 'SERVER_TIMESTAMP',
}))

vi.mock('@repo/firebase-config', () => ({ db: { __type: 'db' } }))

import { useThrottleCommands } from './throttles'

describe('useThrottleCommands', () => {
  beforeEach(() => {
    pushMock.mockClear()
    acquireThrottleMock.mockClear()
    setDocMock.mockClear()
    locosRef.value = []
    throttlesRef.value = []
  })

  it('produces one command per roster loco', () => {
    locosRef.value = [
      { id: '3',  address: 3,  name: 'Loco 3', meta: { roadname: 'BNSF' } } as Loco,
      { id: '17', address: 17, name: 'GP38',  meta: { roadname: 'Cuyama' } } as Loco,
    ]
    const commands = useThrottleCommands().value
    const perLoco = commands.filter((c) => c.id.startsWith('throttle.loco.'))
    expect(perLoco).toHaveLength(2)
    expect(perLoco[0].title).toBe('Open throttle for Loco 3')
    expect(perLoco[0].description).toBe('#3 · BNSF')
    expect(perLoco[0].keywords).toEqual(['3', 'Loco 3', 'BNSF'])
    expect(perLoco[1].title).toBe('Open throttle for GP38')
  })

  it('always exposes a Stop all throttles command', () => {
    const commands = useThrottleCommands().value
    const stopAll = commands.find((c) => c.id === 'throttle.stop-all')
    expect(stopAll).toBeDefined()
    expect(stopAll!.title).toBe('Stop all throttles')
    expect(stopAll!.keywords).toContain('halt')
  })

  it('running a per-loco command acquires and navigates', async () => {
    locosRef.value = [{ id: '42', address: 42, name: 'Freight' } as Loco]
    const commands = useThrottleCommands().value
    const cmd = commands.find((c) => c.id === 'throttle.loco.42')!
    await cmd.run()
    expect(acquireThrottleMock).toHaveBeenCalledWith(42)
    expect(pushMock).toHaveBeenCalledWith({ name: 'throttle', params: { address: 42 } })
  })

  it('running Stop all writes speed 0 to every throttle doc', async () => {
    throttlesRef.value = [
      { address: 3,  speed: 30, direction: true } as Throttle,
      { address: 17, speed: 55, direction: false } as Throttle,
    ]
    const commands = useThrottleCommands().value
    const stopAll = commands.find((c) => c.id === 'throttle.stop-all')!
    await stopAll.run()
    expect(setDocMock).toHaveBeenCalledTimes(2)
    const payloads = setDocMock.mock.calls.map((c) => c[1])
    for (const p of payloads) {
      expect(p).toMatchObject({ speed: 0, direction: false, timestamp: 'SERVER_TIMESTAMP' })
    }
  })

  it('handles loco with no name and no roadname', () => {
    locosRef.value = [{ id: '99', address: 99 } as Loco]
    const commands = useThrottleCommands().value
    const cmd = commands.find((c) => c.id === 'throttle.loco.99')!
    expect(cmd.title).toBe('Open throttle for Loco 99')
    expect(cmd.description).toBe('#99')
  })
})
```

- [ ] **Step 2: Run test to verify failure**

```bash
pnpm --filter=deja-throttle test:unit run commands/throttles
```

Expected: FAIL — module does not exist.

- [ ] **Step 3: Create the implementation**

Create `apps/throttle/src/command-palette/commands/throttles.ts`:

```ts
import { computed, type ComputedRef, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { useLocos, type Loco, type Throttle } from '@repo/modules/locos'
import type { Command } from '../types'

export function useThrottleCommands(): ComputedRef<Command[]> {
  const router = useRouter()
  const layoutId = useStorage('@DEJA/layoutId', '')
  const { getLocos, getThrottles, acquireThrottle } = useLocos()
  const locos = getLocos() as unknown as Ref<Loco[]>
  const throttles = getThrottles() as unknown as Ref<Throttle[]>

  async function openThrottle(address: number) {
    await acquireThrottle(address)
    await router.push({ name: 'throttle', params: { address } })
  }

  async function stopAll() {
    if (!layoutId.value) return
    const list = throttles.value || []
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
    const list = locos.value || []
    return list.map((l) => ({
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

  const stopAllCommand: Command = {
    id: 'throttle.stop-all',
    title: 'Stop all throttles',
    description: 'Set every running throttle to speed 0',
    icon: 'mdi-stop',
    category: 'throttle',
    keywords: ['halt', 'zero'],
    run: stopAll,
  }

  return computed<Command[]>(() => [
    ...rosterLocoCommands(),
    stopAllCommand,
  ])
}
```

- [ ] **Step 4: Run test to verify pass**

```bash
pnpm --filter=deja-throttle test:unit run commands/throttles
```

Expected: 5 tests passing.

- [ ] **Step 5: Commit**

```bash
git add apps/throttle/src/command-palette/commands/throttles.ts apps/throttle/src/command-palette/commands/throttles.test.ts
git commit -m "$(cat <<'EOF'
feat(command-palette): 🚂 add throttle command source

Per-roster-loco "Open throttle for <name>" commands with description
showing #address and roadname. Keywords cover address, name, and
roadname for fuzzy search. Stop all throttles command writes speed 0
and direction false directly to every throttle doc via setDoc merge —
no acquireThrottle, no navigation, stays on current page.
EOF
)"
```

---

## Task 6: Turnout commands

**Files:**
- Create: `apps/throttle/src/command-palette/commands/turnouts.ts`
- Create: `apps/throttle/src/command-palette/commands/turnouts.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/throttle/src/command-palette/commands/turnouts.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import type { Turnout } from '@repo/modules/turnouts'

const setTurnoutMock = vi.fn(async () => true)
const turnoutsRef = ref<Turnout[]>([])

vi.mock('@repo/modules/turnouts', () => ({
  useTurnouts: () => ({
    getTurnouts: () => turnoutsRef,
    setTurnout: setTurnoutMock,
  }),
}))

import { useTurnoutCommands } from './turnouts'

describe('useTurnoutCommands', () => {
  beforeEach(() => {
    setTurnoutMock.mockClear()
    turnoutsRef.value = []
  })

  it('produces two commands (throw + close) per turnout', () => {
    turnoutsRef.value = [
      { id: 't1', name: 'Main Yard', device: 'dccex-1', state: false, type: 'kato' } as Turnout,
      { id: 't2', name: 'East Siding', device: 'dccex-1', state: true,  type: 'kato' } as Turnout,
    ]
    const commands = useTurnoutCommands().value
    expect(commands).toHaveLength(4)
    const titles = commands.map((c) => c.title)
    expect(titles).toContain('Throw Main Yard')
    expect(titles).toContain('Close Main Yard')
    expect(titles).toContain('Throw East Siding')
    expect(titles).toContain('Close East Siding')
  })

  it('throw command calls setTurnout with state: true', async () => {
    turnoutsRef.value = [{ id: 't1', name: 'Main Yard', device: 'dccex-1', state: false, type: 'kato' } as Turnout]
    const cmd = useTurnoutCommands().value.find((c) => c.id === 'turnout.throw.t1')!
    await cmd.run()
    expect(setTurnoutMock).toHaveBeenCalledWith('t1', { state: true })
  })

  it('close command calls setTurnout with state: false', async () => {
    turnoutsRef.value = [{ id: 't1', name: 'Main Yard', device: 'dccex-1', state: true, type: 'kato' } as Turnout]
    const cmd = useTurnoutCommands().value.find((c) => c.id === 'turnout.close.t1')!
    await cmd.run()
    expect(setTurnoutMock).toHaveBeenCalledWith('t1', { state: false })
  })

  it('falls back to id when name is missing', () => {
    turnoutsRef.value = [{ id: 't99', device: 'dccex-1', state: false, type: 'kato' } as unknown as Turnout]
    const cmd = useTurnoutCommands().value.find((c) => c.id === 'turnout.throw.t99')!
    expect(cmd.title).toBe('Throw t99')
  })

  it('keywords include name, id, device, and tags', () => {
    turnoutsRef.value = [{
      id: 't1',
      name: 'Main Yard',
      device: 'dccex-1',
      state: false,
      type: 'kato',
      tags: ['yard', 'main'],
    } as Turnout]
    const cmd = useTurnoutCommands().value.find((c) => c.id === 'turnout.throw.t1')!
    expect(cmd.keywords).toEqual(['Main Yard', 't1', 'dccex-1', 'yard', 'main'])
  })

  it('returns empty array when no turnouts', () => {
    turnoutsRef.value = []
    expect(useTurnoutCommands().value).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify failure**

```bash
pnpm --filter=deja-throttle test:unit run commands/turnouts
```

Expected: FAIL — module does not exist.

- [ ] **Step 3: Create the implementation**

Create `apps/throttle/src/command-palette/commands/turnouts.ts`:

```ts
import { computed, type ComputedRef, type Ref } from 'vue'
import { useTurnouts, type Turnout } from '@repo/modules/turnouts'
import type { Command } from '../types'

export function useTurnoutCommands(): ComputedRef<Command[]> {
  const { getTurnouts, setTurnout } = useTurnouts()
  const turnouts = getTurnouts() as unknown as Ref<Turnout[]>

  return computed<Command[]>(() => {
    const list = turnouts.value || []
    const commands: Command[] = []
    for (const t of list) {
      const name = t.name || t.id
      const description = t.device ? `Device ${t.device}` : undefined
      const keywords = [name, t.id, t.device || '', ...(t.tags || [])].filter(Boolean)
      commands.push({
        id: `turnout.throw.${t.id}`,
        title: `Throw ${name}`,
        description,
        icon: 'mdi-call-split',
        category: 'turnout',
        keywords,
        run: async () => { await setTurnout(t.id, { state: true }) },
      })
      commands.push({
        id: `turnout.close.${t.id}`,
        title: `Close ${name}`,
        description,
        icon: 'mdi-call-merge',
        category: 'turnout',
        keywords,
        run: async () => { await setTurnout(t.id, { state: false }) },
      })
    }
    return commands
  })
}
```

- [ ] **Step 4: Run test to verify pass**

```bash
pnpm --filter=deja-throttle test:unit run commands/turnouts
```

Expected: 6 tests passing.

- [ ] **Step 5: Commit**

```bash
git add apps/throttle/src/command-palette/commands/turnouts.ts apps/throttle/src/command-palette/commands/turnouts.test.ts
git commit -m "$(cat <<'EOF'
feat(command-palette): 🔀 add turnout command source

Two commands per turnout — Throw and Close — using setTurnout with
explicit state (true/false) so commands are deterministic, not a
toggle. Keywords include name, id, device, and tags for fuzzy search.
EOF
)"
```

---

## Task 7: Effect commands

**Files:**
- Create: `apps/throttle/src/command-palette/commands/effects.ts`
- Create: `apps/throttle/src/command-palette/commands/effects.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/throttle/src/command-palette/commands/effects.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import type { Effect } from '@repo/modules/effects'

const runEffectMock = vi.fn(async () => {})
const effectsRef = ref<Effect[]>([])

vi.mock('@repo/modules/effects', () => ({
  useEfx: () => ({
    getEffects: () => effectsRef,
    runEffect: runEffectMock,
  }),
}))

import { useEffectCommands } from './effects'

describe('useEffectCommands', () => {
  beforeEach(() => {
    runEffectMock.mockClear()
    effectsRef.value = []
  })

  it('produces one command per effect', () => {
    effectsRef.value = [
      { id: 'e1', name: 'Flicker Campfire', type: 'strobe', device: 'pico-1', state: false } as Effect,
      { id: 'e2', name: 'Station Lights',   type: 'onoff',  device: 'pico-1', state: true  } as Effect,
    ]
    const commands = useEffectCommands().value
    expect(commands).toHaveLength(2)
    expect(commands[0].title).toBe('Toggle Flicker Campfire')
    expect(commands[0].description).toBe('strobe · pico-1')
    expect(commands[1].title).toBe('Toggle Station Lights')
  })

  it('falls back to id when name is missing', () => {
    effectsRef.value = [{ id: 'e99', type: 'onoff', state: false } as Effect]
    const cmd = useEffectCommands().value[0]
    expect(cmd.title).toBe('Toggle e99')
  })

  it('handles missing device', () => {
    effectsRef.value = [{ id: 'e1', name: 'Horn', type: 'sound', state: false } as Effect]
    const cmd = useEffectCommands().value[0]
    expect(cmd.description).toBe('sound')
  })

  it('running an effect command calls runEffect with flipped state', async () => {
    effectsRef.value = [{
      id: 'e1',
      name: 'Flicker',
      type: 'strobe',
      device: 'pico-1',
      state: false,
    } as Effect]
    const cmd = useEffectCommands().value[0]
    await cmd.run()
    expect(runEffectMock).toHaveBeenCalledTimes(1)
    const arg = runEffectMock.mock.calls[0][0] as Effect
    expect(arg.id).toBe('e1')
    expect(arg.state).toBe(true)
  })

  it('keywords include name, id, type, device, and tags', () => {
    effectsRef.value = [{
      id: 'e1',
      name: 'Horn',
      type: 'sound',
      device: 'pico-1',
      state: false,
      tags: ['loud', 'train'],
    } as Effect]
    const cmd = useEffectCommands().value[0]
    expect(cmd.keywords).toEqual(['Horn', 'e1', 'sound', 'pico-1', 'loud', 'train'])
  })

  it('returns empty array when no effects', () => {
    expect(useEffectCommands().value).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify failure**

```bash
pnpm --filter=deja-throttle test:unit run commands/effects
```

Expected: FAIL — module does not exist.

- [ ] **Step 3: Create the implementation**

Create `apps/throttle/src/command-palette/commands/effects.ts`:

```ts
import { computed, type ComputedRef, type Ref } from 'vue'
import { useEfx, type Effect } from '@repo/modules/effects'
import type { Command } from '../types'

export function useEffectCommands(): ComputedRef<Command[]> {
  const { getEffects, runEffect } = useEfx()
  const effects = getEffects() as unknown as Ref<Effect[]>

  return computed<Command[]>(() => {
    const list = effects.value || []
    return list.map((e) => {
      const name = e.name || e.id
      const description = e.type
        ? `${e.type}${e.device ? ` · ${e.device}` : ''}`
        : e.device
      return {
        id: `effect.toggle.${e.id}`,
        title: `Toggle ${name}`,
        description,
        icon: 'mdi-rocket-launch',
        category: 'effect' as const,
        keywords: [name, e.id, e.type || '', e.device || '', ...(e.tags || [])].filter(Boolean),
        run: async () => { await runEffect({ ...e, state: !e.state } as Effect) },
      }
    })
  })
}
```

- [ ] **Step 4: Run test to verify pass**

```bash
pnpm --filter=deja-throttle test:unit run commands/effects
```

Expected: 6 tests passing.

- [ ] **Step 5: Commit**

```bash
git add apps/throttle/src/command-palette/commands/effects.ts apps/throttle/src/command-palette/commands/effects.test.ts
git commit -m "$(cat <<'EOF'
feat(command-palette): 💡 add effect command source

One Toggle command per effect. Calls runEffect with the current state
flipped. Description shows type and device. Keywords cover name, id,
type, device, and tags for fuzzy search.
EOF
)"
```

---

## Task 8: Signal commands (two-level)

**Files:**
- Create: `apps/throttle/src/command-palette/commands/signals.ts`
- Create: `apps/throttle/src/command-palette/commands/signals.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/throttle/src/command-palette/commands/signals.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import type { Signal } from '@repo/modules/signals'

const setSignalAspectMock = vi.fn(async () => {})
const signalsRef = ref<Signal[]>([])

vi.mock('@repo/modules/signals', () => ({
  useSignals: () => ({
    getSignals: () => signalsRef,
    setSignalAspect: setSignalAspectMock,
  }),
}))

import { useSignalCommands } from './signals'

describe('useSignalCommands', () => {
  beforeEach(() => {
    setSignalAspectMock.mockClear()
    signalsRef.value = []
  })

  it('produces one command per signal', () => {
    signalsRef.value = [
      { id: 's1', name: 'Block West', device: 'pico-1', aspect: 'red' } as Signal,
      { id: 's2', name: 'Block East', device: 'pico-1', aspect: 'green' } as Signal,
    ]
    const commands = useSignalCommands().value
    expect(commands).toHaveLength(2)
    expect(commands[0].title).toBe('Set Block West')
    expect(commands[0].description).toBe('currently red')
    expect(commands[1].description).toBe('currently green')
  })

  it('signal command has children with 4 aspects', () => {
    signalsRef.value = [{ id: 's1', name: 'Block West', device: 'pico-1' } as Signal]
    const cmd = useSignalCommands().value[0]
    expect(cmd.children).toBeDefined()
    expect(cmd.children!.title).toBe('Set Block West ▸ aspect')
    expect(cmd.children!.commands).toHaveLength(4)
    const titles = cmd.children!.commands.map((c) => c.title)
    expect(titles).toEqual(['Red', 'Yellow', 'Green', 'Clear'])
  })

  it('each aspect child runs setSignalAspect with correct value', async () => {
    signalsRef.value = [{ id: 's1', name: 'Block West' } as Signal]
    const cmd = useSignalCommands().value[0]
    const children = cmd.children!.commands

    await children[0].run()
    expect(setSignalAspectMock).toHaveBeenLastCalledWith('s1', 'red')

    await children[1].run()
    expect(setSignalAspectMock).toHaveBeenLastCalledWith('s1', 'yellow')

    await children[2].run()
    expect(setSignalAspectMock).toHaveBeenLastCalledWith('s1', 'green')

    await children[3].run()
    expect(setSignalAspectMock).toHaveBeenLastCalledWith('s1', null)
  })

  it('top-level signal command run is a no-op', async () => {
    signalsRef.value = [{ id: 's1', name: 'Block West' } as Signal]
    const cmd = useSignalCommands().value[0]
    await cmd.run()
    expect(setSignalAspectMock).not.toHaveBeenCalled()
  })

  it('falls back to id when name missing', () => {
    signalsRef.value = [{ id: 's99' } as Signal]
    const cmd = useSignalCommands().value[0]
    expect(cmd.title).toBe('Set s99')
  })

  it('keywords include name, id, and device', () => {
    signalsRef.value = [{ id: 's1', name: 'Block West', device: 'pico-1' } as Signal]
    const cmd = useSignalCommands().value[0]
    expect(cmd.keywords).toEqual(['Block West', 's1', 'pico-1'])
  })
})
```

- [ ] **Step 2: Run test to verify failure**

```bash
pnpm --filter=deja-throttle test:unit run commands/signals
```

Expected: FAIL — module does not exist.

- [ ] **Step 3: Create the implementation**

Create `apps/throttle/src/command-palette/commands/signals.ts`:

```ts
import { computed, type ComputedRef, type Ref } from 'vue'
import { useSignals, type Signal, type SignalAspect } from '@repo/modules/signals'
import type { Command } from '../types'

interface AspectChoice {
  aspect: SignalAspect
  label: string
  icon: string
}

const ASPECTS: AspectChoice[] = [
  { aspect: 'red',    label: 'Red',    icon: 'mdi-traffic-light' },
  { aspect: 'yellow', label: 'Yellow', icon: 'mdi-traffic-light' },
  { aspect: 'green',  label: 'Green',  icon: 'mdi-traffic-light' },
  { aspect: null,     label: 'Clear',  icon: 'mdi-circle-off-outline' },
]

export function useSignalCommands(): ComputedRef<Command[]> {
  const { getSignals, setSignalAspect } = useSignals()
  const signals = getSignals() as unknown as Ref<Signal[]>

  return computed<Command[]>(() => {
    const list = signals.value || []
    return list.map((s) => {
      const name = s.name || s.id
      return {
        id: `signal.set.${s.id}`,
        title: `Set ${name}`,
        description: s.aspect ? `currently ${s.aspect}` : undefined,
        icon: 'mdi-traffic-light',
        category: 'signal' as const,
        keywords: [name, s.id, s.device || ''].filter(Boolean),
        run: () => {},
        children: {
          title: `Set ${name} ▸ aspect`,
          commands: ASPECTS.map<Command>((a) => ({
            id: `signal.set.${s.id}.${a.aspect ?? 'clear'}`,
            title: a.label,
            icon: a.icon,
            category: 'signal' as const,
            run: async () => { await setSignalAspect(s.id, a.aspect) },
          })),
        },
      }
    })
  })
}
```

- [ ] **Step 4: Run test to verify pass**

```bash
pnpm --filter=deja-throttle test:unit run commands/signals
```

Expected: 6 tests passing.

- [ ] **Step 5: Commit**

```bash
git add apps/throttle/src/command-palette/commands/signals.ts apps/throttle/src/command-palette/commands/signals.test.ts
git commit -m "$(cat <<'EOF'
feat(command-palette): 🚦 add signal command source with aspect picker

One top-level command per signal with children for each of the 4
aspects (red/yellow/green/clear). Running a top-level signal command
is a no-op — the palette detects the children and pushes a new level
instead. Running a child calls setSignalAspect with the aspect value.
EOF
)"
```

---

## Task 9: Merged commands composable

**Files:**
- Create: `apps/throttle/src/command-palette/useCommands.ts`

- [ ] **Step 1: Create the merger**

Create `apps/throttle/src/command-palette/useCommands.ts`:

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

- [ ] **Step 2: Type-check**

```bash
pnpm --filter=deja-throttle type-check
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add apps/throttle/src/command-palette/useCommands.ts
git commit -m "feat(command-palette): 🔗 merge all command sources into useCommands"
```

---

## Task 10: Command palette UI + chord chip

**Files:**
- Create: `apps/throttle/src/command-palette/CommandPalette.vue`
- Create: `apps/throttle/src/command-palette/CommandPaletteChordChip.vue`

- [ ] **Step 1: Create the chord chip**

Create `apps/throttle/src/command-palette/CommandPaletteChordChip.vue`:

```vue
<script setup lang="ts">
import { chordKey } from './useGlobalKeybindings'
</script>

<template>
  <Transition name="chord-chip-fade">
    <div v-if="chordKey" class="chord-chip">
      <span class="chord-chip__key">{{ chordKey }}</span>
      <span class="chord-chip__ellipsis">…</span>
    </div>
  </Transition>
</template>

<style scoped>
.chord-chip {
  position: fixed;
  bottom: 16px;
  left: 16px;
  z-index: 9998;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(96, 165, 250, 0.5);
  backdrop-filter: blur(12px);
  font-family: ui-monospace, monospace;
  font-size: 11px;
  color: #e2e8f0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
.chord-chip__key {
  display: inline-block;
  padding: 1px 6px;
  background: rgba(96, 165, 250, 0.2);
  border: 1px solid rgba(96, 165, 250, 0.5);
  border-radius: 4px;
  font-weight: 700;
  color: #60a5fa;
}
.chord-chip__ellipsis {
  color: rgba(148, 163, 184, 0.6);
}

.chord-chip-fade-enter-active,
.chord-chip-fade-leave-active {
  transition: opacity 120ms ease, transform 120ms ease;
}
.chord-chip-fade-enter-from,
.chord-chip-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
```

- [ ] **Step 2: Create the palette dialog**

Create `apps/throttle/src/command-palette/CommandPalette.vue`:

```vue
<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLocos, type Loco } from '@repo/modules/locos'
import { createLogger } from '@repo/utils'
import { useCommandPalette } from './useCommandPalette'
import { useCommands } from './useCommands'
import { filterCommands, buildNumericShortcut } from './fuzzyMatch'
import type { Command, CommandCategory } from './types'

const log = createLogger('CommandPalette')
const router = useRouter()
const { isOpen, query, activeIndex, stack, close, push } = useCommandPalette()
const allCommands = useCommands()
const { getLocos, acquireThrottle } = useLocos()
const locos = getLocos() as unknown as { value: Loco[] }

const inputRef = ref<HTMLInputElement | null>(null)
const errorText = ref<string | null>(null)

function locoLookup(address: number) {
  const loco = (locos.value || []).find((l) => l.address === address)
  if (!loco) return null
  return { name: loco.name, roadname: loco.meta?.roadname }
}

async function openThrottleByAddress(address: number) {
  await acquireThrottle(address)
  await router.push({ name: 'throttle', params: { address } })
}

const currentCommands = computed<Command[]>(() => {
  if (stack.value.length > 0) {
    return stack.value[stack.value.length - 1].commands
  }
  return allCommands.value
})

const displayedCommands = computed<Command[]>(() => {
  const base = filterCommands(currentCommands.value, query.value)
  // Only prepend numeric shortcut at the root level (no stack)
  if (stack.value.length === 0) {
    const synthetic = buildNumericShortcut(
      query.value,
      locoLookup,
      openThrottleByAddress,
    )
    if (synthetic) return [synthetic, ...base]
  }
  return base
})

const CATEGORY_ORDER: CommandCategory[] = ['navigation', 'throttle', 'turnout', 'effect', 'signal']
const CATEGORY_LABELS: Record<CommandCategory, string> = {
  navigation: 'Navigation',
  throttle:   'Throttles',
  turnout:    'Turnouts',
  effect:     'Effects',
  signal:     'Signals',
}

interface Group { category: CommandCategory; commands: Command[] }

const grouped = computed<Group[]>(() => {
  const map = new Map<CommandCategory, Command[]>()
  for (const cmd of displayedCommands.value) {
    if (!map.has(cmd.category)) map.set(cmd.category, [])
    map.get(cmd.category)!.push(cmd)
  }
  return CATEGORY_ORDER
    .filter((cat) => map.has(cat))
    .map((cat) => ({ category: cat, commands: map.get(cat)! }))
})

const flatIndexFor = computed<Map<string, number>>(() => {
  const m = new Map<string, number>()
  let idx = 0
  for (const group of grouped.value) {
    for (const cmd of group.commands) {
      m.set(cmd.id, idx++)
    }
  }
  return m
})

watch(displayedCommands, () => {
  if (activeIndex.value >= displayedCommands.value.length) {
    activeIndex.value = 0
  }
})

watch(isOpen, async (open) => {
  if (open) {
    await nextTick()
    inputRef.value?.focus()
  } else {
    errorText.value = null
  }
})

async function runCommand(cmd: Command) {
  if (cmd.children) {
    push(cmd.children)
    await nextTick()
    inputRef.value?.focus()
    return
  }
  errorText.value = null
  try {
    await cmd.run()
    close()
  } catch (err) {
    log.error('Command failed', err)
    errorText.value = err instanceof Error ? err.message : 'Command failed'
  }
}

function setActiveIndex(idx: number) {
  activeIndex.value = idx
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(
      activeIndex.value + 1,
      displayedCommands.value.length - 1,
    )
    return
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
    return
  }
  if (e.key === 'Enter') {
    e.preventDefault()
    const cmd = displayedCommands.value[activeIndex.value]
    if (cmd) runCommand(cmd)
  }
}

const headerLabel = computed(() =>
  stack.value.length > 0 ? stack.value[stack.value.length - 1].title : null,
)

function onDialogUpdate(v: boolean) {
  if (!v) close()
}
</script>

<template>
  <v-dialog
    :model-value="isOpen"
    max-width="560"
    transition="fade-transition"
    @update:model-value="onDialogUpdate"
  >
    <v-card class="cp-card pa-0">
      <div class="cp-input-row">
        <v-icon size="20" class="cp-chevron">mdi-chevron-right</v-icon>
        <div v-if="headerLabel" class="cp-breadcrumb">{{ headerLabel }}</div>
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          class="cp-input"
          placeholder="Type a command or DCC address…"
          @keydown="onKeydown"
        />
        <span class="cp-esc-hint">Esc</span>
      </div>

      <div class="cp-results" role="listbox">
        <template v-for="group in grouped" :key="group.category">
          <div class="cp-group-label">{{ CATEGORY_LABELS[group.category] }}</div>
          <div
            v-for="cmd in group.commands"
            :key="cmd.id"
            role="option"
            :aria-selected="flatIndexFor.get(cmd.id) === activeIndex"
            class="cp-result"
            :class="{ 'cp-result--active': flatIndexFor.get(cmd.id) === activeIndex }"
            @click="runCommand(cmd)"
            @mouseenter="setActiveIndex(flatIndexFor.get(cmd.id) ?? 0)"
          >
            <v-icon size="16" class="cp-result__icon">{{ cmd.icon }}</v-icon>
            <span class="cp-result__title">{{ cmd.title }}</span>
            <span v-if="cmd.description" class="cp-result__description">{{ cmd.description }}</span>
            <span v-if="cmd.shortcut" class="cp-result__shortcut">
              <kbd v-for="k in cmd.shortcut" :key="k">{{ k }}</kbd>
            </span>
          </div>
        </template>
        <div v-if="displayedCommands.length === 0" class="cp-empty">
          No matches
        </div>
      </div>

      <div v-if="errorText" class="cp-error">{{ errorText }}</div>

      <div class="cp-footer">
        <span><kbd>↑↓</kbd> navigate</span>
        <span><kbd>↵</kbd> run</span>
        <span><kbd>esc</kbd> close</span>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.cp-card {
  background: rgba(10, 15, 28, 0.98) !important;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px !important;
  overflow: hidden;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.cp-input-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}
.cp-chevron { color: #60a5fa; }
.cp-breadcrumb {
  padding: 3px 8px;
  background: rgba(96, 165, 250, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 6px;
  font-size: 11px;
  color: #93c5fd;
  font-family: ui-monospace, monospace;
  white-space: nowrap;
}
.cp-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e2e8f0;
  font-family: ui-monospace, monospace;
  font-size: 15px;
}
.cp-input::placeholder { color: rgba(148, 163, 184, 0.4); }
.cp-esc-hint {
  padding: 2px 6px;
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 4px;
  font-family: ui-monospace, monospace;
  font-size: 10px;
  color: rgba(148, 163, 184, 0.7);
}

.cp-results {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}
.cp-group-label {
  padding: 10px 18px 4px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(148, 163, 184, 0.5);
  font-weight: 600;
}
.cp-result {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 18px;
  font-size: 12px;
  color: rgba(226, 232, 240, 0.85);
  border-left: 2px solid transparent;
  cursor: pointer;
  transition: background 100ms ease;
}
.cp-result--active {
  background: rgba(59, 130, 246, 0.12);
  color: #dbeafe;
  border-left-color: #60a5fa;
}
.cp-result__icon { color: rgba(148, 163, 184, 0.7); }
.cp-result__title { flex: 1; }
.cp-result__description {
  font-size: 10px;
  color: rgba(148, 163, 184, 0.5);
  font-family: ui-monospace, monospace;
}
.cp-result__shortcut {
  display: flex;
  gap: 3px;
}
.cp-result__shortcut kbd {
  padding: 1px 5px;
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 3px;
  font-family: ui-monospace, monospace;
  font-size: 9px;
  color: rgba(226, 232, 240, 0.7);
}

.cp-empty {
  padding: 20px;
  text-align: center;
  font-size: 12px;
  color: rgba(148, 163, 184, 0.5);
}

.cp-error {
  padding: 8px 18px;
  font-size: 11px;
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.1);
  border-top: 1px solid rgba(239, 68, 68, 0.3);
}

.cp-footer {
  display: flex;
  gap: 14px;
  padding: 10px 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  font-size: 10px;
  color: rgba(148, 163, 184, 0.5);
  font-family: ui-monospace, monospace;
}
.cp-footer kbd {
  margin-right: 4px;
  padding: 1px 5px;
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 3px;
  color: rgba(226, 232, 240, 0.7);
}
</style>
```

- [ ] **Step 3: Type-check**

```bash
pnpm --filter=deja-throttle type-check
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add apps/throttle/src/command-palette/CommandPalette.vue apps/throttle/src/command-palette/CommandPaletteChordChip.vue
git commit -m "$(cat <<'EOF'
feat(command-palette): 🎛️ add CommandPalette dialog + chord chip

CommandPalette renders a centered v-dialog with search input, grouped
results, category labels, footer legend, and an inline error surface.
Arrow keys navigate, Enter runs the active command, clicking runs on
click. Numeric queries prepend the synthetic "Open throttle #N" at
the top level only. Commands with children push a new stack level.
Errors log + display inline without closing the palette.

CommandPaletteChordChip shows a floating "g…" indicator while a
chord is armed, using the exported chordKey ref from the keybindings
composable.
EOF
)"
```

---

## Task 11: Header command-palette trigger button

**Files:**
- Create: `apps/throttle/src/command-palette/CommandPaletteTrigger.vue`

- [ ] **Step 1: Create the trigger button**

Create `apps/throttle/src/command-palette/CommandPaletteTrigger.vue`:

```vue
<script setup lang="ts">
import { useCommandPalette } from './useCommandPalette'

const palette = useCommandPalette()

function handleClick() {
  palette.open()
}
</script>

<template>
  <v-btn
    icon="mdi-magnify"
    size="small"
    variant="text"
    class="ma-1"
    aria-label="Command palette (Cmd+K)"
    @click="handleClick"
  >
    <v-icon>mdi-magnify</v-icon>
    <v-tooltip activator="parent" location="bottom">
      Command palette
      <span class="text-caption opacity-60 ml-1">⌘K</span>
    </v-tooltip>
  </v-btn>
</template>
```

- [ ] **Step 2: Type-check**

```bash
pnpm --filter=deja-throttle type-check
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add apps/throttle/src/command-palette/CommandPaletteTrigger.vue
git commit -m "feat(command-palette): 🔍 add header trigger button"
```

---

## Task 12: QuickMenu prompt

**Files:**
- Create: `apps/throttle/src/quick-menu/QuickMenuPrompt.vue`

- [ ] **Step 1: Create the prompt component**

Create `apps/throttle/src/quick-menu/QuickMenuPrompt.vue`:

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
    <v-icon size="16" class="qm-prompt__chevron">mdi-chevron-right</v-icon>
    <input
      v-model="text"
      type="text"
      class="qm-prompt__input"
      placeholder="What do you want to do?"
      @keyup.enter="submit"
    />
    <v-icon size="14" class="qm-prompt__enter">mdi-keyboard-return</v-icon>
  </div>
</template>

<style scoped>
.qm-prompt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
}
.qm-prompt__chevron { color: rgba(96, 165, 250, 0.7); }
.qm-prompt__input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 12px;
  color: rgba(226, 232, 240, 0.9);
  font-family: ui-monospace, monospace;
}
.qm-prompt__input::placeholder {
  color: rgba(148, 163, 184, 0.4);
}
.qm-prompt__enter { color: rgba(148, 163, 184, 0.4); }
</style>
```

- [ ] **Step 2: Type-check**

```bash
pnpm --filter=deja-throttle type-check
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add apps/throttle/src/quick-menu/QuickMenuPrompt.vue
git commit -m "feat(quick-menu): 💬 add QuickMenuPrompt — hand off to command palette"
```

---

## Task 13: Wire up App.vue

**Files:**
- Modify: `apps/throttle/src/App.vue`

- [ ] **Step 1: Read the current App.vue**

Read `apps/throttle/src/App.vue` to locate the existing `QuickMenu` import and the `<QuickMenu v-if="!isFullscreen" />` render (plus `<QuickThrottleGlobalDialog v-if="!isFullscreen" />` added by the previous Quick Throttle task — which is about to be reverted).

- [ ] **Step 2: Replace the imports block additions**

Find the line:

```ts
import QuickMenu from '@/quick-menu/QuickMenu.vue'
import QuickThrottleGlobalDialog from '@/throttle/QuickThrottleGlobalDialog.vue'
```

Replace with:

```ts
import QuickMenu from '@/quick-menu/QuickMenu.vue'
import CommandPalette from '@/command-palette/CommandPalette.vue'
import CommandPaletteTrigger from '@/command-palette/CommandPaletteTrigger.vue'
import CommandPaletteChordChip from '@/command-palette/CommandPaletteChordChip.vue'
import { useGlobalKeybindings } from '@/command-palette/useGlobalKeybindings'
```

> If the `QuickThrottleGlobalDialog` import is not present (the previous task may not have landed), just add the four new imports after `QuickMenu`.

- [ ] **Step 3: Call the keybindings composable at script setup top level**

Find the `provideNotifications()` line and add immediately after it:

```ts
provideNotifications()
useGlobalKeybindings()
```

- [ ] **Step 4: Replace the QuickMenu / QuickThrottleGlobalDialog template block**

Find:

```vue
        <QuickMenu v-if="!isFullscreen" />
        <QuickThrottleGlobalDialog v-if="!isFullscreen" />
        <ConnectionStatusBanner v-if="!isFullscreen" />
```

Replace with:

```vue
        <QuickMenu v-if="!isFullscreen" />
        <CommandPalette v-if="!isFullscreen" />
        <CommandPaletteChordChip v-if="!isFullscreen" />
        <ConnectionStatusBanner v-if="!isFullscreen" />
```

> If `QuickThrottleGlobalDialog` is not present, just add the three new lines after `QuickMenu`.

- [ ] **Step 5: Inject the trigger button into AppHeader's default slot**

Find the `<AppHeader ...>` element in the template (around line 124). It currently has no default-slot content — just closing `/>` or `<AppHeader>...</AppHeader>` wrapping. Replace the self-closing form with an explicit slot:

Before:

```vue
        <AppHeader
          v-if="!isFullscreen"
          app-name="Throttle"
          app-icon="mdi-gamepad-variant"
          variant="throttle"
          color="blue"
          :drawer="drawer"
          :show-layout-power="true"
          :show-emergency-stop="true"
          :show-user-profile="true"
          @drawer-toggle="drawer = !drawer"
        />
```

After:

```vue
        <AppHeader
          v-if="!isFullscreen"
          app-name="Throttle"
          app-icon="mdi-gamepad-variant"
          variant="throttle"
          color="blue"
          :drawer="drawer"
          :show-layout-power="true"
          :show-emergency-stop="true"
          :show-user-profile="true"
          @drawer-toggle="drawer = !drawer"
        >
          <CommandPaletteTrigger />
        </AppHeader>
```

- [ ] **Step 6: Type-check + start dev server for smoke test**

```bash
pnpm --filter=deja-throttle type-check
```

Expected: clean.

Manual smoke test:
- `pnpm --filter=deja-throttle dev --port 3041`
- Press ⌘K → palette opens
- Type `42` → "Open throttle #42" appears → Enter navigates
- Press `g r` → navigates to /locos
- Close dev server

- [ ] **Step 7: Commit**

```bash
git add apps/throttle/src/App.vue
git commit -m "$(cat <<'EOF'
feat(throttle): 🔌 mount CommandPalette in App.vue

Imports CommandPalette, CommandPaletteTrigger, and CommandPaletteChordChip.
Registers useGlobalKeybindings() at script setup top level so ⌘K and
g-chords are live on mount. Palette dialog + chord chip mount alongside
the QuickMenu, gated by !isFullscreen. Trigger button is injected into
the AppHeader default slot.
EOF
)"
```

---

## Task 14: QuickMenu refactor

**Files:**
- Modify: `apps/throttle/src/quick-menu/QuickMenu.vue`
- Modify: `apps/throttle/src/quick-menu/useQuickMenu.ts`
- Modify: `apps/throttle/src/quick-menu/QuickMenuThrottles.vue`

- [ ] **Step 1: Rewrite useQuickMenu.ts**

Replace the entire contents of `apps/throttle/src/quick-menu/useQuickMenu.ts` with:

```ts
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'

export function useQuickMenu() {
  const isOpen = ref(false)
  const quickMenuVisible = useStorage('@DEJA/quickMenu/visible', true)

  function closeAll() {
    isOpen.value = false
  }

  return {
    isOpen,
    quickMenuVisible,
    closeAll,
  }
}
```

> Note: the old file exported `EntityScreen`, `SUBSCREEN_CONFIGS`, `GROUP_SCREEN_META`, `currentScreen`, `pushScreen`, `popScreen`. All are gone. Any downstream imports will break — they will be fixed in Tasks 15 and 16 when the consuming components are deleted.

- [ ] **Step 2: Rewrite QuickMenu.vue**

Replace the entire contents of `apps/throttle/src/quick-menu/QuickMenu.vue` with:

```vue
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { onClickOutside, useStorage } from '@vueuse/core'
import { useCurrentUser } from 'vuefire'
import { useDraggableFab } from './useDraggableFab'
import { useQuickMenu } from './useQuickMenu'
import { useFeatureFlags } from '@repo/modules'
import dejaLogo from '@repo/ui/src/assets/icons/deja.png'
import QuickMenuThrottles from './QuickMenuThrottles.vue'
import QuickMenuFavorites from './QuickMenuFavorites.vue'
import QuickMenuPrompt from './QuickMenuPrompt.vue'

const wrapperRef = ref<HTMLElement | null>(null)

const {
  positionStyle,
  isDragging,
  wasDragging,
  isOnRight,
  onPointerDown,
  onPointerMove,
  onPointerUp,
} = useDraggableFab()

const { isOpen, quickMenuVisible, closeAll } = useQuickMenu()

const { isEnabled } = useFeatureFlags()
const showFavorites = computed(() => isEnabled('quickMenuFavorites'))

const user = useCurrentUser()
const layoutId = useStorage('@DEJA/layoutId', '')
const canShow = computed(() => !!user.value && !!layoutId.value && quickMenuVisible.value)

watch(isDragging, (dragging) => {
  if (dragging) closeAll()
})

function handleFabClick() {
  if (wasDragging.value) {
    wasDragging.value = false
    return
  }
  isOpen.value = !isOpen.value
}

onClickOutside(wrapperRef, () => {
  closeAll()
})
</script>

<template>
  <div
    v-if="canShow"
    ref="wrapperRef"
    class="quick-menu"
    :style="positionStyle"
    :class="{ 'quick-menu--dragging': isDragging }"
  >
    <Transition name="qm-panel">
      <v-card
        v-if="isOpen"
        class="qm-panel elevation-12"
        :class="isOnRight ? 'qm-panel--right' : 'qm-panel--left'"
        width="280"
      >
        <QuickMenuThrottles />
        <template v-if="showFavorites">
          <v-divider class="opacity-10" />
          <QuickMenuFavorites />
        </template>
        <v-divider class="opacity-10" />
        <QuickMenuPrompt />
      </v-card>
    </Transition>

    <v-btn
      icon
      size="small"
      :color="isOpen ? 'primary' : undefined"
      class="qm-fab elevation-8"
      :class="{
        'cursor-pointer': !isDragging,
        'cursor-grabbing': isDragging,
      }"
      @pointerdown.prevent="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @click.stop="handleFabClick"
    >
      <v-icon v-if="isOpen" size="20" class="qm-fab__icon--open">mdi-close</v-icon>
      <img
        v-else
        :src="dejaLogo"
        alt="DEJA.js"
        class="qm-fab__logo"
      />
    </v-btn>
  </div>
</template>

<style scoped>
.quick-menu {
  position: fixed;
  z-index: 9999;
  width: 40px;
  height: 40px;
}

.quick-menu--dragging {
  cursor: grabbing;
}

.qm-fab {
  touch-action: none;
  user-select: none;
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.quick-menu--dragging .qm-fab {
  transform: scale(1.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35) !important;
}
.qm-fab__logo {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  pointer-events: none;
}
.qm-fab__icon--open {
  transition: transform 200ms ease;
  transform: rotate(90deg);
}

.qm-panel {
  position: absolute;
  bottom: 0;
  border-radius: 12px !important;
  overflow: hidden;
  backdrop-filter: blur(16px);
}
.qm-panel--left {
  left: calc(100% + 12px);
}
.qm-panel--right {
  right: calc(100% + 12px);
}

.qm-panel-enter-active,
.qm-panel-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}
.qm-panel-enter-from,
.qm-panel-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
</style>
```

- [ ] **Step 3: Revert QuickMenuThrottles.vue placement**

Read `apps/throttle/src/quick-menu/QuickMenuThrottles.vue`. The previous Quick Throttle task added:

- An import: `import QuickThrottleButton from '@/throttle/QuickThrottleButton.vue'`
- An `.quick-throttles__actions` wrapper around the "Add Loco" button that also contains `<QuickThrottleButton size="x-small" color="primary" />`
- Scoped CSS for `.quick-throttles__actions`

Remove all three additions so `QuickMenuThrottles.vue` returns to its original structure with just the single `<button class="quick-throttles__add">...</button>`. Preserve everything else (the `availableLocos`, `handleAcquire`, etc.).

Apply these edits:

**Edit A** — remove the import line near the top of `<script setup lang="ts">`:

```ts
import QuickThrottleButton from '@/throttle/QuickThrottleButton.vue'
```

Delete that line entirely.

**Edit B** — replace the action row wrapper:

Find:

```vue
      <div class="quick-throttles__actions">
        <button class="quick-throttles__add" @click="showRoster = true">
          <v-icon size="14">mdi-plus</v-icon>
          <span>Add Loco</span>
        </button>
        <QuickThrottleButton size="x-small" color="primary" />
      </div>
```

Replace with the original standalone button:

```vue
      <button class="quick-throttles__add" @click="showRoster = true">
        <v-icon size="14">mdi-plus</v-icon>
        <span>Add Loco</span>
      </button>
```

**Edit C** — remove the action row CSS from `<style scoped>`:

Delete:

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

- [ ] **Step 4: Type-check**

```bash
pnpm --filter=deja-throttle type-check
```

Expected: likely errors from the old drill-down components (`QuickMenuSubScreen`, `QuickMenuGroupList`, `QuickMenuItemList`, `QuickMenuCloud`) and `useQuickMenuData` still existing but referencing removed exports. **This is expected at this point** — those files will be deleted in Task 16. Verify that the errors are all coming from those 5 files and not from `QuickMenu.vue` or `useQuickMenu.ts` or `QuickMenuThrottles.vue`.

- [ ] **Step 5: Commit**

```bash
git add apps/throttle/src/quick-menu/QuickMenu.vue apps/throttle/src/quick-menu/useQuickMenu.ts apps/throttle/src/quick-menu/QuickMenuThrottles.vue
git commit -m "$(cat <<'EOF'
refactor(quick-menu): ✂️ strip drill-downs, wire QuickMenuPrompt

useQuickMenu now exposes only isOpen, quickMenuVisible, closeAll.
QuickMenu.vue body becomes throttles + favorites + prompt, no more
sub-screen stack. QuickMenuThrottles reverts the QuickThrottleButton
placement from the previous task.

The now-orphaned drill-down components (QuickMenuSubScreen, GroupList,
ItemList, Cloud) and useQuickMenuData are deleted in the next task.
EOF
)"
```

---

## Task 15: Delete old Quick Throttle files + revert remaining placements

**Files:**
- Delete: `apps/throttle/src/throttle/QuickThrottleButton.vue`
- Delete: `apps/throttle/src/throttle/QuickThrottleForm.vue`
- Delete: `apps/throttle/src/throttle/QuickThrottleNumpad.vue`
- Delete: `apps/throttle/src/throttle/QuickThrottleGlobalDialog.vue`
- Delete: `apps/throttle/src/throttle/useQuickThrottle.ts`
- Delete: `apps/throttle/src/throttle/useQuickThrottle.test.ts`
- Modify: `apps/throttle/src/views/RosterView.vue`
- Modify: `apps/throttle/src/throttle/ThrottleList.vue`
- Modify: `apps/throttle/src/views/ThrottleView.vue`
- Modify: `apps/throttle/src/conductor/ConductorLayout.vue`

- [ ] **Step 1: Delete the 6 Quick Throttle files**

```bash
rm apps/throttle/src/throttle/QuickThrottleButton.vue
rm apps/throttle/src/throttle/QuickThrottleForm.vue
rm apps/throttle/src/throttle/QuickThrottleNumpad.vue
rm apps/throttle/src/throttle/QuickThrottleGlobalDialog.vue
rm apps/throttle/src/throttle/useQuickThrottle.ts
rm apps/throttle/src/throttle/useQuickThrottle.test.ts
```

- [ ] **Step 2: Revert `RosterView.vue` placement**

Read `apps/throttle/src/views/RosterView.vue`. Remove:

- The import: `import QuickThrottleButton from '@/throttle/QuickThrottleButton.vue'`
- The `<div class="flex items-center gap-2">...</div>` wrapper around `<ListControlBar>`

Find:

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

Replace with:

```vue
      <template #controls>
        <ListControlBar
          :controls="rosterControls"
          color="pink"
          :sort-options="sortOptions"
          :filters="filters"
          :show-view="true"
          :view-options="viewOptions"
          :show-search="false"
        />
      </template>
```

And remove the `QuickThrottleButton` import line from the `<script setup>` block.

> `RosterView.vue` gets the new `<RosterQuickAdd />` added in Task 17 — that's a separate mount point.

- [ ] **Step 3: Revert `ThrottleList.vue` placement**

Read `apps/throttle/src/throttle/ThrottleList.vue`. Remove:

- The import: `import QuickThrottleButton from '@/throttle/QuickThrottleButton.vue'`
- The `<div class="throttle-list-fabs">...</div>` wrapper

Find:

```vue
    <div class="throttle-list-fabs">
      <QuickThrottleButton size="default" color="primary" icon="mdi-numeric" />
      <v-fab icon="mdi-plus" color="primary" size="56" @click="isRosterOpen = true" app />
    </div>
```

Replace with the original standalone FAB:

```vue
    <v-fab icon="mdi-plus" color="primary" size="56" @click="isRosterOpen = true"  app />
```

Also remove the `.throttle-list-fabs { ... }` rule from the `<style scoped>` block.

And remove the `QuickThrottleButton` import from the script setup.

- [ ] **Step 4: Revert `ThrottleView.vue` footer**

Read `apps/throttle/src/views/ThrottleView.vue`. The previous task wrapped the slide-group in a `.throttle-footer` div with a prepended `<QuickThrottleButton>`. Remove the wrapper but keep the `SaveToRosterChip` overlay (added in Task 12 of the previous plan).

Find:

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

Replace with:

```vue
    <v-slide-group
      selected-class="bg-success"
      show-arrows
    >
      <v-slide-group-item
        v-for="item in throttles"
        :key="item.id"
      >
        <ThrottleNavItem v-if="item.address" :address="item.address" @select="handleSelect(item.address)" />
      </v-slide-group-item>
    </v-slide-group>
```

Remove the `QuickThrottleButton` import.

**Keep** the existing `<SaveToRosterChip>` overlay and its import — these are preserved.

- [ ] **Step 5: Revert `ConductorLayout.vue` placement**

Read `apps/throttle/src/conductor/ConductorLayout.vue`. Remove:

- The import of `QuickThrottleButton`
- The `<div class="conductor-quick-throttle"><QuickThrottleButton ... /></div>` inside `<main>`
- The `.conductor-quick-throttle { ... }` CSS rule

Find:

```vue
    <main class="@container relative">
      <div class="conductor-quick-throttle">
        <QuickThrottleButton size="small" color="green" />
      </div>
```

Replace with:

```vue
    <main class="@container relative">
```

- [ ] **Step 6: Type-check**

```bash
pnpm --filter=deja-throttle type-check
```

Expected: same errors as Task 14 Step 4 (old drill-down components still referencing removed QuickMenu exports). No NEW errors from the Quick Throttle reverts. If new errors appear, find the leftover `QuickThrottleButton` reference and remove it.

- [ ] **Step 7: Commit**

```bash
git add apps/throttle/src/throttle/QuickThrottleButton.vue apps/throttle/src/throttle/QuickThrottleForm.vue apps/throttle/src/throttle/QuickThrottleNumpad.vue apps/throttle/src/throttle/QuickThrottleGlobalDialog.vue apps/throttle/src/throttle/useQuickThrottle.ts apps/throttle/src/throttle/useQuickThrottle.test.ts apps/throttle/src/views/RosterView.vue apps/throttle/src/throttle/ThrottleList.vue apps/throttle/src/views/ThrottleView.vue apps/throttle/src/conductor/ConductorLayout.vue
git commit -m "$(cat <<'EOF'
chore(throttle): 🗑️ remove Quick Throttle popover infrastructure

The command palette replaces the per-page popover trigger. Delete
QuickThrottleButton/Form/Numpad/GlobalDialog + useQuickThrottle +
its test, and revert the 4 placement changes (Roster, ThrottleList,
ThrottleView footer, Conductor). The 5th placement (QuickMenuThrottles)
was reverted in the QuickMenu refactor task.

Preserved: acquireThrottle merge fix (packages/modules) and
SaveToRosterChip (still displayed on ThrottleView).
EOF
)"
```

---

## Task 16: Delete QuickMenu drill-down components

**Files:**
- Delete: `apps/throttle/src/quick-menu/QuickMenuSubScreen.vue`
- Delete: `apps/throttle/src/quick-menu/QuickMenuGroupList.vue`
- Delete: `apps/throttle/src/quick-menu/QuickMenuItemList.vue`
- Delete: `apps/throttle/src/quick-menu/QuickMenuCloud.vue`
- Delete: `apps/throttle/src/quick-menu/useQuickMenuData.ts`

- [ ] **Step 1: Delete the five files**

```bash
rm apps/throttle/src/quick-menu/QuickMenuSubScreen.vue
rm apps/throttle/src/quick-menu/QuickMenuGroupList.vue
rm apps/throttle/src/quick-menu/QuickMenuItemList.vue
rm apps/throttle/src/quick-menu/QuickMenuCloud.vue
rm apps/throttle/src/quick-menu/useQuickMenuData.ts
```

- [ ] **Step 2: Type-check**

```bash
pnpm --filter=deja-throttle type-check
```

Expected: clean. All references to the deleted modules were already in files that were either edited in Task 14 (`QuickMenu.vue`, `useQuickMenu.ts`) or are themselves deleted here. If an error surfaces about a missing `QuickMenuData` or `EntityScreen` import, find the stray reference and remove it.

- [ ] **Step 3: Run tests to confirm nothing broke**

```bash
pnpm --filter=deja-throttle test:unit run
```

Expected: the existing Command Palette tests (Tasks 1–8) still pass. The old `useQuickThrottle.test.ts` is gone, so it no longer contributes tests.

- [ ] **Step 4: Commit**

```bash
git add apps/throttle/src/quick-menu/QuickMenuSubScreen.vue apps/throttle/src/quick-menu/QuickMenuGroupList.vue apps/throttle/src/quick-menu/QuickMenuItemList.vue apps/throttle/src/quick-menu/QuickMenuCloud.vue apps/throttle/src/quick-menu/useQuickMenuData.ts
git commit -m "$(cat <<'EOF'
chore(quick-menu): 🗑️ delete drill-down components

QuickMenuSubScreen, GroupList, ItemList, Cloud, and useQuickMenuData
are replaced by searchable command palette entries. No other file
consumed them after the QuickMenu.vue refactor in the previous task.
EOF
)"
```

---

## Task 17: Roster page quick-add form

**Files:**
- Create: `apps/throttle/src/roster/RosterQuickAdd.vue`
- Create: `apps/throttle/src/roster/RosterQuickAdd.test.ts`
- Modify: `apps/throttle/src/views/RosterView.vue`

- [ ] **Step 1: Write the failing test**

Create `apps/throttle/src/roster/RosterQuickAdd.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const setDocMock = vi.fn(async () => undefined)

vi.mock('firebase/firestore', () => ({
  doc: (_db: unknown, path: string, id: string) => ({ path: `${path}/${id}` }),
  setDoc: (...args: unknown[]) => setDocMock(...(args as [])),
  serverTimestamp: () => 'SERVER_TIMESTAMP',
}))

vi.mock('@repo/firebase-config', () => ({ db: { __type: 'db' } }))

vi.mock('@repo/modules/locos', () => ({
  ROADNAMES: [
    { label: 'BNSF',   value: 'bnsf',   color: 'orange' },
    { label: 'Cuyama', value: 'cuyama', color: 'blue' },
  ],
}))

vi.mock('@vueuse/core', () => ({
  useStorage: (key: string, initial: unknown) =>
    key === '@DEJA/layoutId' ? { value: 'layout-1' } : { value: initial },
}))

vi.mock('@repo/utils', () => ({
  createLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}))

import RosterQuickAdd from './RosterQuickAdd.vue'

const vuetify = createVuetify({ components, directives })

function makeWrapper() {
  return mount(RosterQuickAdd, {
    global: { plugins: [vuetify] },
  })
}

describe('RosterQuickAdd', () => {
  beforeEach(() => {
    setDocMock.mockClear()
  })

  it('save button disabled when address is empty', () => {
    const w = makeWrapper()
    const btn = w.get('button[aria-label="Add to roster"]')
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('save button disabled for non-integer address', async () => {
    const w = makeWrapper()
    const cmp = w.vm as unknown as { address: string }
    cmp.address = '3.5'
    await w.vm.$nextTick()
    const btn = w.get('button[aria-label="Add to roster"]')
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('save button disabled for out-of-range address', async () => {
    const w = makeWrapper()
    const cmp = w.vm as unknown as { address: string }
    cmp.address = '10000'
    await w.vm.$nextTick()
    const btn = w.get('button[aria-label="Add to roster"]')
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('submit calls setDoc with the expected payload', async () => {
    const w = makeWrapper()
    const cmp = w.vm as unknown as {
      address: string
      name: string
      roadname: string | null
      save: () => Promise<void>
    }
    cmp.address = '42'
    cmp.name = 'GP38'
    cmp.roadname = 'cuyama'
    await cmp.save()
    await flushPromises()
    expect(setDocMock).toHaveBeenCalledTimes(1)
    const [, payload, options] = setDocMock.mock.calls[0] as [unknown, Record<string, unknown>, unknown]
    expect(payload).toMatchObject({
      address: 42,
      name: 'GP38',
      meta: { roadname: 'cuyama' },
      timestamp: 'SERVER_TIMESTAMP',
    })
    expect(options).toEqual({ merge: true })
  })

  it('clears fields on successful save', async () => {
    const w = makeWrapper()
    const cmp = w.vm as unknown as {
      address: string
      name: string
      roadname: string | null
      save: () => Promise<void>
    }
    cmp.address = '42'
    cmp.name = 'GP38'
    cmp.roadname = 'cuyama'
    await cmp.save()
    await flushPromises()
    expect(cmp.address).toBe('')
    expect(cmp.name).toBe('')
    expect(cmp.roadname).toBeNull()
  })

  it('falls back to "Loco <address>" when name is empty', async () => {
    const w = makeWrapper()
    const cmp = w.vm as unknown as {
      address: string
      save: () => Promise<void>
    }
    cmp.address = '99'
    await cmp.save()
    await flushPromises()
    const payload = setDocMock.mock.calls[0][1] as Record<string, unknown>
    expect(payload.name).toBe('Loco 99')
  })

  it('keeps fields and sets error on write failure', async () => {
    setDocMock.mockRejectedValueOnce(new Error('firestore down'))
    const w = makeWrapper()
    const cmp = w.vm as unknown as {
      address: string
      name: string
      error: string | null
      save: () => Promise<void>
    }
    cmp.address = '42'
    cmp.name = 'GP38'
    await cmp.save()
    await flushPromises()
    expect(cmp.address).toBe('42')
    expect(cmp.name).toBe('GP38')
    expect(cmp.error).toBe('firestore down')
  })

  it('rejects scientific notation', async () => {
    const w = makeWrapper()
    const cmp = w.vm as unknown as { address: string; save: () => Promise<void> }
    cmp.address = '1e3'
    await cmp.save()
    await flushPromises()
    expect(setDocMock).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify failure**

```bash
pnpm --filter=deja-throttle test:unit run RosterQuickAdd
```

Expected: FAIL — component does not exist.

- [ ] **Step 3: Create the component**

Create `apps/throttle/src/roster/RosterQuickAdd.vue`:

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

defineExpose({ address, name, roadname, error, save })
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
        aria-label="Add to roster"
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

> `defineExpose` is included so the Vitest test can read/write the state refs directly. In production this has no effect.

- [ ] **Step 4: Run tests**

```bash
pnpm --filter=deja-throttle test:unit run RosterQuickAdd
```

Expected: 8 tests passing.

- [ ] **Step 5: Mount RosterQuickAdd in RosterView.vue**

Read `apps/throttle/src/views/RosterView.vue`. Add the import and mount.

Find the existing imports block and add after the `useListControls` import:

```ts
import RosterQuickAdd from '@/roster/RosterQuickAdd.vue'
```

Find the `<main class="@container min-h-screen overflow-auto">` element. Inside that main, after `<PageHeader ...>...</PageHeader>` and before `<LocoRoster ...>`, insert:

```vue
    <RosterQuickAdd class="mx-4 mt-4" />
```

- [ ] **Step 6: Type-check + commit**

```bash
pnpm --filter=deja-throttle type-check
git add apps/throttle/src/roster/RosterQuickAdd.vue apps/throttle/src/roster/RosterQuickAdd.test.ts apps/throttle/src/views/RosterView.vue
git commit -m "$(cat <<'EOF'
feat(roster): ➕ add RosterQuickAdd inline form

Compact always-visible form at the top of the Roster page with DCC
address, name, and roadname fields. Writes layouts/<layoutId>/locos/
<address> via setDoc merge so repeated saves are idempotent. Clears
fields on success, keeps them + surfaces an inline error on failure.
Strict digits-only regex validation — same pattern used in
QuickThrottleForm before it was deleted.
EOF
)"
```

---

## Task 18: Full verification pass

**Files:** (none — verification only)

- [ ] **Step 1: Run modules tests**

```bash
pnpm --filter=@repo/modules test
```

Expected: all tests pass (including the 3 `acquireThrottle` regression tests that landed in the previous plan).

- [ ] **Step 2: Run throttle unit tests**

```bash
pnpm --filter=deja-throttle test:unit run
```

Expected: the Command Palette tests (useCommandPalette: 8, fuzzyMatch: 20, useGlobalKeybindings: 17, commands/throttles: 5, commands/turnouts: 6, commands/effects: 6, commands/signals: 6, RosterQuickAdd: 8 = 76 new tests) all pass. Any pre-existing failures in `utils.test.ts` remain (not introduced by this change).

- [ ] **Step 3: Lint**

```bash
pnpm --filter=deja-throttle lint
```

Expected: no NEW errors in command-palette files. Warnings are acceptable.

- [ ] **Step 4: Type-check**

```bash
pnpm --filter=deja-throttle type-check
```

Expected: clean.

- [ ] **Step 5: Build**

```bash
pnpm --filter=deja-throttle build
```

Expected: build succeeds.

- [ ] **Step 6: Manual smoke test**

```bash
pnpm --filter=deja-throttle dev --port 3041
```

For each of the following, verify the expected behavior:

1. **⌘K from home** — palette opens, input autofocused, nav commands show in empty state
2. **Type `42`** — "Open throttle #42" is the first result; Enter navigates to `/throttle/42`
3. **Type `throw main`** — turnout results appear (assuming the layout has a turnout named similar); Enter fires `setTurnout` with state true
4. **Type a signal name fragment** — signal command appears; Enter pushes aspect picker; select an aspect; Enter fires `setSignalAspect`; palette closes
5. **Esc inside the aspect picker** — pops back to the signal list (palette still open)
6. **Esc at root** — closes the palette
7. **`g r`** → navigates to Roster (`/locos`)
8. **`g t`** → navigates to Throttles (`/throttles`)
9. **`g c`** → navigates to Conductor
10. **`g u`** → navigates to Turnouts
11. **`g s`** → navigates to Signals
12. **`g e`** → navigates to Effects
13. **`g ,`** → navigates to Settings
14. **Press `g`, wait 2 seconds, press `r`** → no navigation (chord timed out; chord chip appears then disappears)
15. **Focus a text field, press `g r`** → no navigation (chord suppressed)
16. **QuickMenu FAB** — click to open → shows throttles + favorites (if enabled) + prompt, no drill-downs
17. **Type in the QuickMenu prompt and hit Enter** — palette opens with the query pre-filled
18. **Header** — search icon button next to e-stop/power → click opens palette
19. **Roster page** — quick-add form at top → fill address `999`, name "Test", save → new loco appears in the list below
20. **Quick-throttle a non-roster address** → SaveToRosterChip still appears in ThrottleView
21. **Press `t` alone** → no action (old shortcut removed)
22. **Confirm no `QuickThrottleButton` appears** on Roster, ThrottleList, ThrottleView footer, Conductor, QuickMenu
23. **Stop dev server** with Ctrl+C

- [ ] **Step 7: Commit the checkmarked plan**

```bash
git add docs/superpowers/plans/2026-04-10-command-palette.md
git commit -m "docs(plan): ✅ mark command palette plan tasks complete"
```

---

## Out of Scope (deferred)

- Routes, power, layout-management, sensor commands
- Emergency stop in the palette (stays in header)
- `?` keybindings help overlay
- Recent commands history
- Rebindable shortcuts
- Virtualized result list
- Command palette on other apps (cloud, monitor, tour) — throttle-only in v1
- Plugin/contrib system for third-party commands
