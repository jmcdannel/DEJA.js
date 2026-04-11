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
const { isOpen, query, activeIndex, stack, currentLevelTitle: headerLabel, close, push } = useCommandPalette()
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

const FLAT_SEARCH_THRESHOLD = 3

// Below the flat-search threshold at the root level, the palette shows a
// curated set of navigation shortcuts + category "browse" cards that drill
// into the full list for each domain. Above the threshold, it flat-searches
// everything. Inside a drilled-in stack level, it always filters that level.
const rootViewCommands = computed<Command[]>(() => {
  const list = allCommands.value
  const nav = list.filter((c) => c.category === 'navigation')
  const throttleLocos = list.filter((c) => c.category === 'throttle' && c.id !== 'throttle.stop-all')
  const stopAll = list.find((c) => c.id === 'throttle.stop-all')
  const turnouts = list.filter((c) => c.category === 'turnout')
  const effects = list.filter((c) => c.category === 'effect')
  const signals = list.filter((c) => c.category === 'signal')

  const root: Command[] = [...nav]

  if (throttleLocos.length > 0) {
    root.push({
      id: 'browse.throttles',
      title: 'Locos',
      description: `${throttleLocos.length} in roster`,
      icon: 'mdi-train',
      category: 'browse',
      run: () => {},
      children: { title: 'Locos', commands: throttleLocos },
    })
  }
  if (turnouts.length > 0) {
    root.push({
      id: 'browse.turnouts',
      title: 'Turnouts',
      description: `${turnouts.length / 2} turnouts`,
      icon: 'mdi-call-split',
      category: 'browse',
      run: () => {},
      children: { title: 'Turnouts', commands: turnouts },
    })
  }
  if (effects.length > 0) {
    root.push({
      id: 'browse.effects',
      title: 'Effects',
      description: `${effects.length} effects`,
      icon: 'mdi-rocket-launch',
      category: 'browse',
      run: () => {},
      children: { title: 'Effects', commands: effects },
    })
  }
  if (signals.length > 0) {
    root.push({
      id: 'browse.signals',
      title: 'Signals',
      description: `${signals.length} signals`,
      icon: 'mdi-traffic-light',
      category: 'browse',
      run: () => {},
      children: { title: 'Signals', commands: signals },
    })
  }

  if (stopAll) root.push(stopAll)

  return root
})

const displayedCommands = computed<Command[]>(() => {
  const trimmedQuery = query.value.trim()

  // Inside a drilled-in level: filter within that level only.
  if (stack.value.length > 0) {
    const levelCommands = stack.value[stack.value.length - 1].commands
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

const CATEGORY_ORDER: CommandCategory[] = ['navigation', 'browse', 'throttle', 'turnout', 'effect', 'signal']
const CATEGORY_LABELS: Record<CommandCategory, string> = {
  navigation: 'Navigation',
  browse:     'Browse',
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
          placeholder="Search or type #42 to open throttle…"
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
