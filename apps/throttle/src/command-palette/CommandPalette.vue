<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLocos, type Loco } from '@repo/modules/locos'
import { createLogger } from '@repo/utils'
import { useCommandPalette } from './useCommandPalette'
import { useCommands, useBrowseCommands } from './useCommands'
import { filterCommands, buildNumericShortcut } from './fuzzyMatch'
import type {
  Command,
  CommandCategory,
  CommandAction,
  CommandStack,
  CycleControl,
  ToggleControl,
} from './types'
import QuickMenuThrottles from '@/quick-menu/QuickMenuThrottles.vue'

const log = createLogger('CommandPalette')
const router = useRouter()
const { isOpen, query, activeIndex, stack, close, push, pop } = useCommandPalette()
const allCommands = useCommands()
const browseCommands = useBrowseCommands()
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

const FLAT_SEARCH_THRESHOLD = 3

// Below the flat-search threshold at the root level, the palette shows a
// curated set of navigation shortcuts + category "browse" cards that drill
// into the full list for each domain. Above the threshold, it flat-searches
// everything. Inside a drilled-in stack level, it always filters that level.
const rootViewCommands = computed<Command[]>(() => {
  const list = allCommands.value
  const nav = list.filter((c) => c.category === 'navigation')
  const stopAll = list.find((c) => c.id === 'throttle.stop-all')
  const settings = list.filter((c) => c.category === 'settings')

  // Section order at root:
  //   inlined <QuickMenuThrottles /> (rendered in template)
  //   → Browse (drill-down cards, one per domain)
  //   → Settings (contextual)
  //   → Navigation (+ stopAll)
  const root: Command[] = [
    ...browseCommands.value,
    ...settings,
    ...nav,
  ]

  if (stopAll) root.push(stopAll)

  return root
})

/**
 * 🧭 Walk the id-based drill stack against the LIVE root command tree.
 * Returns an array of resolved levels. Any id that fails to resolve (no
 * match, or the matched command has no children) gracefully terminates
 * the walk — the trail so far is what renders.
 *
 * This is the fix for the stale-drilldown bug: stack used to snapshot a
 * full `CommandStack` at push time, so state flips on leaf commands
 * never re-rendered. With live resolution, any reactive source that
 * rebuilds the tree (turnouts/effects/signals/…) flows straight through.
 */
const resolvedStack = computed<CommandStack[]>(() => {
  const levels: CommandStack[] = []
  let currentCommands = rootViewCommands.value
  for (const id of stack.value) {
    const match = currentCommands.find((c) => c.id === id)
    if (!match || !match.children) break
    levels.push(match.children)
    currentCommands = match.children.commands
  }
  return levels
})

const stackTop = computed<CommandStack | null>(() =>
  resolvedStack.value.length > 0
    ? resolvedStack.value[resolvedStack.value.length - 1]
    : null,
)

const headerLabel = computed<string | null>(() => stackTop.value?.title ?? null)

const displayedCommands = computed<Command[]>(() => {
  const trimmedQuery = query.value.trim()

  // Inside a drilled-in level: filter within that level only.
  if (resolvedStack.value.length > 0) {
    const levelCommands = stackTop.value?.commands ?? []
    return filterCommands(levelCommands, trimmedQuery)
  }

  // At root, build a numeric shortcut from bare digits or `#<digits>` —
  // always active so users can open a throttle without waiting for the
  // flat-search threshold.
  const synthetic = buildNumericShortcut(trimmedQuery, locoLookup, openThrottleByAddress)

  if (trimmedQuery.length < FLAT_SEARCH_THRESHOLD) {
    const root = rootViewCommands.value
    return synthetic ? [synthetic, ...root] : root
  }

  const filtered = filterCommands(allCommands.value, trimmedQuery)
  return synthetic ? [synthetic, ...filtered] : filtered
})

const CATEGORY_ORDER: CommandCategory[] = ['browse', 'settings', 'navigation', 'throttle', 'turnout', 'effect', 'signal']

const showInlineThrottles = computed(() => stack.value.length === 0 && !query.value.trim())
const CATEGORY_LABELS: Record<CommandCategory, string> = {
  navigation: 'Navigation',
  browse:     'Browse',
  throttle:   'Throttles',
  turnout:    'Turnouts',
  effect:     'Effects',
  signal:     'Signals',
  settings:   'Settings',
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
  if (activeIndex.value >= displayedCommands.value.length && activeIndex.value !== 0) {
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
  // 🎛️ Rows with an inline control are driven by ← / → / Enter — treat
  // Enter as "cycle next / toggle on" and keep the palette open.
  if (cmd.control) {
    await applyControl(cmd, 'next')
    return
  }
  if (cmd.children) {
    push(cmd.id)
    await nextTick()
    inputRef.value?.focus()
    return
  }
  errorText.value = null
  try {
    await cmd.run()
    // 🔁 Toggle-style commands (turnouts, effects, signal rows) keep the
    // palette open so the user can flip multiple in a row.
    if (!cmd.keepOpen) {
      close()
    }
  } catch (err) {
    log.error('Command failed', err)
    errorText.value = err instanceof Error ? err.message : 'Command failed'
  }
}

async function runAction(cmd: Command, action: CommandAction) {
  errorText.value = null
  try {
    await action.run()
    // 🔁 Inline action dots always keep the palette open.
  } catch (err) {
    log.error('Action failed', err)
    errorText.value = err instanceof Error ? err.message : 'Action failed'
  }
}

/**
 * 🎛️ Step an inline control forward or backward. For cycle controls this
 * wraps around the options array; for toggle controls either direction
 * flips. Errors are captured on `errorText` — the palette stays open.
 */
async function applyControl(cmd: Command, direction: 'prev' | 'next') {
  const control = cmd.control
  if (!control) return
  errorText.value = null
  try {
    if (control.kind === 'toggle') {
      await control.set(!control.value)
      return
    }
    // cycle
    const { options, value } = control
    if (options.length === 0) return
    const idx = options.findIndex((o) => o.value === value)
    const nextIdx = direction === 'next'
      ? (idx + 1) % options.length
      : (idx - 1 + options.length) % options.length
    await control.set(options[nextIdx].value)
  } catch (err) {
    log.error('Control step failed', err)
    errorText.value = err instanceof Error ? err.message : 'Control step failed'
  }
}

async function onNavigateToThrottle(address: number) {
  await router.push({ name: 'throttle', params: { address } })
  close()
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
  // ⬅️ Left arrow: if the active row has an inline control, step it back.
  // Otherwise, pop a drill-down level.
  if (e.key === 'ArrowLeft') {
    const cmd = displayedCommands.value[activeIndex.value]
    if (cmd?.control) {
      e.preventDefault()
      applyControl(cmd, 'prev')
      return
    }
    if (stack.value.length > 0) {
      e.preventDefault()
      pop()
    }
    return
  }
  // ➡️ Right arrow: if the active row has an inline control, step it forward.
  if (e.key === 'ArrowRight') {
    const cmd = displayedCommands.value[activeIndex.value]
    if (cmd?.control) {
      e.preventDefault()
      applyControl(cmd, 'next')
    }
    return
  }
  // ⌫ Backspace pops only when the input is empty — otherwise it deletes text.
  if (e.key === 'Backspace') {
    if (!query.value && stack.value.length > 0) {
      e.preventDefault()
      pop()
    }
    return
  }
  if (e.key === 'Enter') {
    e.preventDefault()
    const cmd = displayedCommands.value[activeIndex.value]
    if (cmd) runCommand(cmd)
  }
}

function onDialogUpdate(v: boolean) {
  if (!v) close()
}

// 🎨 Helpers for rendering inline controls.
const INLINE_CYCLE_CHIP_LIMIT = 4

function asToggleControl(cmd: Command): ToggleControl | null {
  return cmd.control && cmd.control.kind === 'toggle' ? cmd.control : null
}

function asCycleControl(cmd: Command): CycleControl | null {
  return cmd.control && cmd.control.kind === 'cycle' ? cmd.control : null
}

function cycleCurrentLabel(control: CycleControl): string {
  const match = control.options.find((o) => o.value === control.value)
  return match?.label ?? String(control.value)
}

function cycleCurrentIndex(control: CycleControl): number {
  const idx = control.options.findIndex((o) => o.value === control.value)
  return idx < 0 ? 0 : idx
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
          v-if="!stackTop?.component"
          ref="inputRef"
          v-model="query"
          type="text"
          class="cp-input"
          placeholder="Search or type #42 to open throttle…"
          @keydown="onKeydown"
        />
        <span v-else class="cp-widget-hint">Keyboard: W ↑  S ↓  X stop  A ←  D →</span>
        <span class="cp-esc-hint">Esc</span>
      </div>

      <div class="cp-results" role="listbox">
        <component
          v-if="stackTop?.component"
          :is="stackTop.component"
          v-bind="stackTop.componentProps"
        />
        <template v-else>
          <template v-if="showInlineThrottles">
            <div class="cp-group-label">Throttles</div>
            <QuickMenuThrottles @navigate="onNavigateToThrottle" />
          </template>
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
              <!-- 🏷️ Turnout / effect on-off status pill -->
              <span
                v-if="cmd.toggleState !== undefined"
                class="cp-result__toggle"
                :class="{ 'cp-result__toggle--on': cmd.toggleState }"
              >{{ cmd.toggleState ? 'ON' : 'OFF' }}</span>
              <!-- 🎛️ Inline toggle control (settings) -->
              <span
                v-if="asToggleControl(cmd)"
                class="cp-result__toggle cp-result__toggle--control"
                :class="{ 'cp-result__toggle--on': asToggleControl(cmd)!.value }"
                @click.stop="applyControl(cmd, 'next')"
              >{{ asToggleControl(cmd)!.value ? 'ON' : 'OFF' }}</span>
              <!-- 🎛️ Inline cycle control (settings) -->
              <span
                v-if="asCycleControl(cmd) && asCycleControl(cmd)!.options.length <= INLINE_CYCLE_CHIP_LIMIT"
                class="cp-result__cycle"
              >
                <button
                  v-for="opt in asCycleControl(cmd)!.options"
                  :key="String(opt.value)"
                  type="button"
                  class="cp-cycle-chip"
                  :class="{ 'cp-cycle-chip--active': opt.value === asCycleControl(cmd)!.value }"
                  @click.stop="asCycleControl(cmd)!.set(opt.value)"
                >{{ opt.label }}</button>
              </span>
              <span
                v-else-if="asCycleControl(cmd)"
                class="cp-result__cycle cp-result__cycle--arrows"
              >
                <button
                  type="button"
                  class="cp-cycle-arrow"
                  aria-label="Previous"
                  @click.stop="applyControl(cmd, 'prev')"
                >‹</button>
                <span class="cp-cycle-label">
                  {{ cycleCurrentLabel(asCycleControl(cmd)!) }}
                  <span class="cp-cycle-index">
                    {{ cycleCurrentIndex(asCycleControl(cmd)!) + 1 }}/{{ asCycleControl(cmd)!.options.length }}
                  </span>
                </span>
                <button
                  type="button"
                  class="cp-cycle-arrow"
                  aria-label="Next"
                  @click.stop="applyControl(cmd, 'next')"
                >›</button>
              </span>
              <span v-if="cmd.actions && cmd.actions.length" class="cp-result__actions">
                <button
                  v-for="action in cmd.actions"
                  :key="action.id"
                  type="button"
                  class="cp-action-dot"
                  :style="{ '--dot': action.color }"
                  :title="action.label"
                  @click.stop="runAction(cmd, action)"
                >{{ action.label }}</button>
              </span>
            </div>
          </template>
          <div v-if="displayedCommands.length === 0" class="cp-empty">
            No matches
          </div>
        </template>
      </div>

      <div v-if="errorText" class="cp-error">{{ errorText }}</div>

      <div class="cp-footer">
        <span><kbd>↑↓</kbd> navigate</span>
        <span><kbd>←→</kbd> adjust</span>
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

/* 🏷️ Status / toggle pill (turnouts, effects, inline toggle control) */
.cp-result__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  padding: 2px 8px;
  border-radius: 999px;
  font-family: ui-monospace, monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: rgba(148, 163, 184, 0.75);
}
.cp-result__toggle--on {
  background: rgba(34, 197, 94, 0.18);
  border-color: rgba(34, 197, 94, 0.5);
  color: #86efac;
}
.cp-result__toggle--control { cursor: pointer; }

/* 🎛️ Segmented cycle control */
.cp-result__cycle {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
}
.cp-cycle-chip {
  padding: 3px 10px;
  border: none;
  background: transparent;
  color: rgba(226, 232, 240, 0.7);
  font-family: ui-monospace, monospace;
  font-size: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 100ms ease, color 100ms ease;
}
.cp-cycle-chip:hover { color: #dbeafe; }
.cp-cycle-chip--active {
  background: rgba(96, 165, 250, 0.22);
  color: #dbeafe;
}
.cp-result__cycle--arrows { padding: 2px 4px; }
.cp-cycle-arrow {
  border: none;
  background: transparent;
  color: rgba(148, 163, 184, 0.85);
  font-size: 14px;
  font-family: ui-monospace, monospace;
  padding: 0 6px;
  cursor: pointer;
}
.cp-cycle-arrow:hover { color: #dbeafe; }
.cp-cycle-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 4px;
  font-family: ui-monospace, monospace;
  font-size: 10px;
  color: #dbeafe;
  white-space: nowrap;
}
.cp-cycle-index {
  font-size: 9px;
  color: rgba(148, 163, 184, 0.6);
}

.cp-result__actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 4px;
}
.cp-action-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(var(--dot-rgb, 148, 163, 184), 0.15);
  color: var(--dot, #cbd5e1);
  font-family: ui-monospace, monospace;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 100ms ease, transform 80ms ease, border-color 100ms ease;
  padding: 0;
}
.cp-action-dot:hover {
  background: var(--dot, #cbd5e1);
  color: #0a0f1c;
  border-color: var(--dot, #cbd5e1);
  transform: scale(1.05);
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

.cp-widget-hint {
  flex: 1;
  font-family: ui-monospace, monospace;
  font-size: 11px;
  color: rgba(148, 163, 184, 0.55);
  letter-spacing: 0.02em;
}
</style>
