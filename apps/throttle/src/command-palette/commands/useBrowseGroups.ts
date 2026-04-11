import { computed, type Ref } from 'vue'
import { useEfx, useTurnouts, useSignals, useLayout, useLocos } from '@repo/modules'
import type { Effect } from '@repo/modules/effects'
import type { Turnout } from '@repo/modules/turnouts'
import type { Signal } from '@repo/modules/signals'
import type { Loco } from '@repo/modules/locos'

// Ported from `preview:apps/throttle/src/quick-menu/useQuickMenuData.ts`
// — drill-down grouping helpers for the command palette Browse section.

export interface GroupItem {
  id: string
  label: string
  count: number
}

function groupBy<T>(items: T[], keyFn: (item: T) => string | undefined): GroupItem[] {
  const groups = new Map<string, number>()
  for (const item of items) {
    const key = keyFn(item) || 'Unassigned'
    groups.set(key, (groups.get(key) || 0) + 1)
  }
  return Array.from(groups.entries())
    .map(([id, count]) => ({ id, label: id, count }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

function collectTags<T extends { tags?: string[] }>(items: T[]): GroupItem[] {
  const tagCounts = new Map<string, number>()
  for (const item of items) {
    for (const tag of item.tags || []) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    }
  }
  return Array.from(tagCounts.entries())
    .map(([id, count]) => ({ id, label: id, count }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export interface BrowseGroups {
  // raw refs for filtering at leaf level
  effects: Ref<Effect[]>
  turnouts: Ref<Turnout[]>
  signals: Ref<Signal[]>
  locos: Ref<Loco[]>
  throttles: Ref<Array<{ address: number }>>
  // grouped data
  effectsByDevice: Ref<GroupItem[]>
  effectsByType: Ref<GroupItem[]>
  effectsByTag: Ref<GroupItem[]>
  turnoutsByDevice: Ref<GroupItem[]>
  turnoutsByTag: Ref<GroupItem[]>
  turnoutLabels: Ref<GroupItem[]>
  signalsByDevice: Ref<GroupItem[]>
  signalsByAspect: Ref<GroupItem[]>
  signalsByTag: Ref<GroupItem[]>
  locosByRoadname: Ref<GroupItem[]>
  // filter helpers
  filterByDevice: <T extends { device?: string }>(items: T[], deviceId: string) => T[]
  filterByTag: <T extends { tags?: string[] }>(items: T[], tag: string) => T[]
  resolveDeviceLabel: (deviceId: string) => string
}

export function useBrowseGroups(): BrowseGroups {
  const efx = useEfx()
  const effects = efx.getEffects() as unknown as Ref<Effect[]>

  const tn = useTurnouts()
  const turnouts = tn.getTurnouts() as unknown as Ref<Turnout[]>

  const sig = useSignals()
  const signals = sig.getSignals() as unknown as Ref<Signal[]>

  const { getLocos, getThrottles } = useLocos()
  const locos = getLocos() as unknown as Ref<Loco[]>
  const throttles = getThrottles() as unknown as Ref<Array<{ address: number }>>

  const layout = useLayout()
  const devices = layout.getDevices() as unknown as Ref<Array<{ id: string; name?: string }>>

  const deviceNames = computed(() => {
    const map = new Map<string, string>()
    for (const d of devices.value || []) {
      map.set(d.id, d.name || d.id)
    }
    return map
  })

  function resolveDeviceLabel(deviceId: string): string {
    return deviceNames.value.get(deviceId) || deviceId
  }

  function deviceGroups<T extends { device?: string }>(items: T[]): GroupItem[] {
    const groups = groupBy(items, (i) => i.device)
    return groups.map((g) => ({ ...g, label: resolveDeviceLabel(g.id) }))
  }

  const effectsByDevice = computed(() => deviceGroups(effects.value || []))
  const effectsByType = computed(() => groupBy(effects.value || [], (e) => e.type))
  const effectsByTag = computed(() => collectTags(effects.value || []))

  const turnoutsByDevice = computed(() => deviceGroups(turnouts.value || []))
  const turnoutsByTag = computed(() => collectTags(turnouts.value || []))
  const turnoutLabels = computed(() => groupBy(turnouts.value || [], (t) => t.type))

  const signalsByDevice = computed(() => deviceGroups(signals.value || []))
  const signalsByAspect = computed(() =>
    groupBy(signals.value || [], (s) => s.aspect || 'unknown'),
  )
  const signalsByTag = computed(() => collectTags(signals.value || []))

  const locosByRoadname = computed(() =>
    groupBy(locos.value || [], (l) => l.meta?.roadname || 'Unknown'),
  )

  function filterByDevice<T extends { device?: string }>(items: T[], deviceId: string): T[] {
    return items.filter((i) => (i.device || 'Unassigned') === deviceId)
  }

  function filterByTag<T extends { tags?: string[] }>(items: T[], tag: string): T[] {
    return items.filter((i) => i.tags?.includes(tag))
  }

  return {
    effects,
    turnouts,
    signals,
    locos,
    throttles,
    effectsByDevice,
    effectsByType,
    effectsByTag,
    turnoutsByDevice,
    turnoutsByTag,
    turnoutLabels,
    signalsByDevice,
    signalsByAspect,
    signalsByTag,
    locosByRoadname,
    filterByDevice,
    filterByTag,
    resolveDeviceLabel,
  }
}
