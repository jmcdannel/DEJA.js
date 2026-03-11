import { computed, ref } from 'vue'
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
  hideClear?: boolean
}

const DEFAULT_PANES: PaneConfig[] = [
  { id: 'dcc', index: 0, name: 'DCC Log', icon: 'mdi-console', color: 'cyan', state: 'normal', messageCount: 0, isLive: false },
  { id: 'turnouts', index: 1, name: 'Turnouts', icon: 'mdi-source-branch', color: 'green', state: 'normal', messageCount: 0, isLive: false },
  { id: 'effects', index: 2, name: 'Effects', icon: 'mdi-lightbulb-on', color: 'orange', state: 'normal', messageCount: 0, isLive: false },
  { id: 'sensors', index: 3, name: 'Sensors', icon: 'mdi-access-point', color: 'purple', state: 'normal', messageCount: 0, isLive: false },
  { id: 'stats', index: 4, name: 'Stats', icon: 'mdi-chart-bar', color: 'slate', state: 'normal', messageCount: 0, isLive: false, hideClear: true },
]

// Color rotation for dynamic device panes
const DEVICE_COLORS: PaneColorKey[] = ['yellow', 'cyan', 'green', 'orange', 'purple']

export const PANE_COLORS = {
  cyan: { border: 'border-sky-500', bg: 'bg-sky-500/10', text: 'text-sky-400', titleBg: 'bg-sky-500/15', titleBorder: 'border-sky-500/30' },
  green: { border: 'border-green-500', bg: 'bg-green-500/10', text: 'text-green-400', titleBg: 'bg-green-500/15', titleBorder: 'border-green-500/30' },
  orange: { border: 'border-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-400', titleBg: 'bg-orange-500/15', titleBorder: 'border-orange-500/30' },
  purple: { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400', titleBg: 'bg-purple-500/15', titleBorder: 'border-purple-500/30' },
  yellow: { border: 'border-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400', titleBg: 'bg-yellow-500/15', titleBorder: 'border-yellow-500/30' },
  slate: { border: 'border-slate-500', bg: 'bg-slate-500/10', text: 'text-slate-400', titleBg: 'bg-slate-500/15', titleBorder: 'border-slate-500/30' },
} as const

export interface DeviceInfo {
  id: string
  name?: string
  type?: string
  connection?: string
}

export const usePaneManager = defineStore('paneManager', () => {
  const persistedState = useStorage<Record<string, PaneState>>('@DEJA/monitor/paneState', {})
  const devicePanes = ref<PaneConfig[]>([])

  function setDevices(devices: DeviceInfo[]) {
    devicePanes.value = devices.map((device, i) => ({
      id: `device-${device.id}`,
      index: DEFAULT_PANES.length + i,
      name: device.name || device.id,
      icon: device.connection === 'mqtt' ? 'mdi-access-point-network' : 'mdi-serial-port',
      color: DEVICE_COLORS[i % DEVICE_COLORS.length],
      state: 'normal' as PaneState,
      messageCount: 0,
      isLive: false,
    }))
  }

  const allPaneConfigs = computed<PaneConfig[]>(() => [
    ...DEFAULT_PANES,
    ...devicePanes.value,
  ])

  const panes = computed<PaneConfig[]>(() =>
    allPaneConfigs.value.map((p) => ({
      ...p,
      state: persistedState.value[p.id] ?? p.state,
    }))
  )

  const normalPanes = computed(() => panes.value.filter((p) => p.state === 'normal'))
  const minimizedPanes = computed(() => panes.value.filter((p) => p.state === 'minimized'))
  const maximizedPane = computed(() => panes.value.find((p) => p.state === 'maximized') ?? null)

  // Responsive column count — updated by media query listener
  const columns = ref(2)

  function updateColumns() {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1024
    if (w < 768) columns.value = 1
    else if (w >= 2200) columns.value = 4
    else if (w >= 1600) columns.value = 3
    else columns.value = 2
  }

  if (typeof window !== 'undefined') {
    updateColumns()
    window.addEventListener('resize', updateColumns)
  }

  // Grid reflow: arrange normal panes in N-col grid
  const gridTemplateAreas = computed(() => {
    if (maximizedPane.value) {
      const cols = columns.value
      const fill = Array.from({ length: cols }, () => maximizedPane.value!.id).join(' ')
      return `"${fill}"`
    }
    const ids = normalPanes.value.map((p) => p.id)
    if (ids.length === 0) return ''
    const cols = columns.value
    const rows: string[] = []
    for (let i = 0; i < ids.length; i += cols) {
      const row: string[] = []
      for (let j = 0; j < cols; j++) {
        row.push(ids[i + j] ?? ids[i + (j > 0 ? j - 1 : 0)] ?? ids[ids.length - 1])
      }
      rows.push(`"${row.join(' ')}"`)
    }
    return rows.join(' ')
  })

  const gridTemplateRows = computed(() => {
    if (maximizedPane.value) return '1fr'
    const rowCount = Math.ceil(normalPanes.value.length / columns.value)
    if (rowCount === 0) return ''
    return Array.from({ length: rowCount }, () => '1fr').join(' ')
  })

  const gridTemplateColumns = computed(() => {
    if (maximizedPane.value) return '1fr'
    const cols = Math.min(columns.value, normalPanes.value.length)
    return Array.from({ length: cols }, () => '1fr').join(' ')
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

  function restorePane(id: string) {
    setPaneState(id, 'normal')
  }

  function restoreAll() {
    const reset: Record<string, PaneState> = {}
    for (const p of allPaneConfigs.value) {
      reset[p.id] = 'normal'
    }
    persistedState.value = reset
  }

  function updateMessageCount(id: string, count: number) {
    const pane = allPaneConfigs.value.find((p) => p.id === id)
    if (pane) {
      pane.messageCount = count
    }
  }

  function setLive(id: string, live: boolean) {
    const pane = allPaneConfigs.value.find((p) => p.id === id)
    if (pane) {
      pane.isLive = live
    }
  }

  return {
    panes,
    normalPanes,
    minimizedPanes,
    maximizedPane,
    devicePanes,
    gridTemplateAreas,
    gridTemplateRows,
    gridTemplateColumns,
    setDevices,
    toggleMaximize,
    toggleMinimize,
    restorePane,
    restoreAll,
    updateMessageCount,
    setLive,
  }
})
