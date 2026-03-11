import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export type PaneState = 'normal' | 'minimized' | 'maximized'

export type PaneColorKey = 'cyan' | 'green' | 'orange' | 'purple' | 'yellow' | 'slate'

export interface PaneConfig {
  id: string
  index: number
  name: string
  icon: string
  color: PaneColorKey
  state: PaneState
  messageCount: number
  isLive: boolean
}

const DEFAULT_PANES: PaneConfig[] = [
  { id: 'dcc', index: 0, name: 'DCC Log', icon: 'mdi-console', color: 'cyan', state: 'normal', messageCount: 0, isLive: false },
  { id: 'serial', index: 1, name: 'Serial I/O', icon: 'mdi-serial-port', color: 'yellow', state: 'normal', messageCount: 0, isLive: false },
  { id: 'turnouts', index: 2, name: 'Turnouts', icon: 'mdi-source-branch', color: 'green', state: 'normal', messageCount: 0, isLive: false },
  { id: 'effects', index: 3, name: 'Effects', icon: 'mdi-lightbulb-on', color: 'orange', state: 'normal', messageCount: 0, isLive: false },
  { id: 'sensors', index: 4, name: 'Sensors', icon: 'mdi-access-point', color: 'purple', state: 'normal', messageCount: 0, isLive: false },
  { id: 'stats', index: 5, name: 'Stats', icon: 'mdi-chart-bar', color: 'slate', state: 'normal', messageCount: 0, isLive: false },
]

export const PANE_COLORS = {
  cyan: { border: 'border-sky-500', bg: 'bg-sky-500/10', text: 'text-sky-400', titleBg: 'bg-sky-500/15', titleBorder: 'border-sky-500/30' },
  green: { border: 'border-green-500', bg: 'bg-green-500/10', text: 'text-green-400', titleBg: 'bg-green-500/15', titleBorder: 'border-green-500/30' },
  orange: { border: 'border-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-400', titleBg: 'bg-orange-500/15', titleBorder: 'border-orange-500/30' },
  purple: { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400', titleBg: 'bg-purple-500/15', titleBorder: 'border-purple-500/30' },
  yellow: { border: 'border-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400', titleBg: 'bg-yellow-500/15', titleBorder: 'border-yellow-500/30' },
  slate: { border: 'border-slate-500', bg: 'bg-slate-500/10', text: 'text-slate-400', titleBg: 'bg-slate-500/15', titleBorder: 'border-slate-500/30' },
} as const

export const usePaneManager = defineStore('paneManager', () => {
  const persistedState = useStorage<Record<string, PaneState>>('@DEJA/monitor/paneState', {})

  const panes = computed<PaneConfig[]>(() =>
    DEFAULT_PANES.map((p) => ({
      ...p,
      state: persistedState.value[p.id] ?? p.state,
    }))
  )

  const normalPanes = computed(() => panes.value.filter((p) => p.state === 'normal'))
  const minimizedPanes = computed(() => panes.value.filter((p) => p.state === 'minimized'))
  const maximizedPane = computed(() => panes.value.find((p) => p.state === 'maximized') ?? null)

  // Grid reflow: arrange normal panes in 2-col grid, last pane spans full width if odd count
  const gridTemplateAreas = computed(() => {
    if (maximizedPane.value) {
      return `"${maximizedPane.value.id} ${maximizedPane.value.id}"`
    }
    const ids = normalPanes.value.map((p) => p.id)
    if (ids.length === 0) return ''
    const rows: string[] = []
    for (let i = 0; i < ids.length; i += 2) {
      if (i + 1 < ids.length) {
        rows.push(`"${ids[i]} ${ids[i + 1]}"`)
      } else {
        rows.push(`"${ids[i]} ${ids[i]}"`)
      }
    }
    return rows.join(' ')
  })

  const gridTemplateRows = computed(() => {
    if (maximizedPane.value) return '1fr'
    const rowCount = Math.ceil(normalPanes.value.length / 2)
    if (rowCount === 0) return ''
    return Array.from({ length: rowCount }, () => '1fr').join(' ')
  })

  const gridTemplateColumns = computed(() => {
    if (maximizedPane.value) return '1fr'
    if (normalPanes.value.length === 1) return '1fr'
    return '1fr 1fr'
  })

  function setPaneState(id: string, state: PaneState) {
    persistedState.value = { ...persistedState.value, [id]: state }
  }

  function toggleMaximize(id: string) {
    const current = persistedState.value[id] ?? 'normal'
    if (current === 'maximized') {
      setPaneState(id, 'normal')
    } else {
      // Restore any currently maximized pane
      const currentMax = panes.value.find((p) => p.state === 'maximized')
      if (currentMax) {
        setPaneState(currentMax.id, 'normal')
      }
      setPaneState(id, 'maximized')
    }
  }

  function toggleMinimize(id: string) {
    const current = persistedState.value[id] ?? 'normal'
    if (current === 'minimized') {
      setPaneState(id, 'normal')
    } else {
      setPaneState(id, 'minimized')
    }
  }

  function restoreAll() {
    const reset: Record<string, PaneState> = {}
    for (const p of DEFAULT_PANES) {
      reset[p.id] = 'normal'
    }
    persistedState.value = reset
  }

  function updateMessageCount(id: string, count: number) {
    const pane = DEFAULT_PANES.find((p) => p.id === id)
    if (pane) {
      pane.messageCount = count
    }
  }

  function setLive(id: string, live: boolean) {
    const pane = DEFAULT_PANES.find((p) => p.id === id)
    if (pane) {
      pane.isLive = live
    }
  }

  return {
    panes,
    normalPanes,
    minimizedPanes,
    maximizedPane,
    gridTemplateAreas,
    gridTemplateRows,
    gridTemplateColumns,
    toggleMaximize,
    toggleMinimize,
    restoreAll,
    updateMessageCount,
    setLive,
  }
})
