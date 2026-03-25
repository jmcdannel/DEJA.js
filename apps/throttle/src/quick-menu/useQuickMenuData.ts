import { computed, type Ref } from 'vue'
import { useEfx, useTurnouts, useSignals, useSensors, useLayout, useLocos, useLayoutRoutes } from '@repo/modules'
import type { Effect } from '@repo/modules/effects'
import type { Turnout } from '@repo/modules/turnouts'
import type { Signal } from '@repo/modules/signals'
import type { Sensor } from '@repo/modules/sensors'
import type { Loco } from '@repo/modules/locos'
import type { ToggleItem } from './QuickMenuItemList.vue'

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

export function useQuickMenuData() {
  const efx = useEfx()
  const effects = efx.getEffects() as Ref<Effect[]>

  const tn = useTurnouts()
  const turnouts = tn.getTurnouts() as Ref<Turnout[]>

  const sig = useSignals()
  const signals = sig.getSignals() as Ref<Signal[]>

  const sen = useSensors()
  const sensors = sen.getSensors() as Ref<Sensor[]>

  const { getLocos, getThrottles } = useLocos()
  const locos = getLocos() as Ref<Loco[]>
  const throttles = getThrottles()

  const routesMod = useLayoutRoutes()
  const routes = routesMod.getRoutes()

  const layout = useLayout()
  const devices = layout.getDevices()

  // Device name lookup
  const deviceNames = computed(() => {
    const map = new Map<string, string>()
    for (const d of (devices.value || []) as Array<{ id: string; name?: string }>) {
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

  // === Group data (for QuickMenuGroupList) ===

  const effectsByDevice = computed(() => deviceGroups(effects.value || []))
  const effectsByType = computed(() => groupBy(effects.value || [], (e) => e.type))
  const effectsByTag = computed(() => collectTags(effects.value || []))

  const turnoutsByDevice = computed(() => deviceGroups(turnouts.value || []))
  const turnoutsByTag = computed(() => collectTags(turnouts.value || []))

  const signalsByDevice = computed(() => deviceGroups(signals.value || []))
  const signalsByAspect = computed(() => groupBy(signals.value || [], (s) => s.aspect || 'unknown'))

  const sensorsByDevice = computed(() => deviceGroups(sensors.value || []))

  // Locos
  const locosByRoadname = computed(() =>
    groupBy(locos.value || [], (l) => l.meta?.roadname || 'Unknown')
  )

  // Routes
  const routesByWaypoint = computed(() => {
    const waypoints = new Map<string, number>()
    for (const r of (routes.value || []) as Array<{ point1?: string; point2?: string }>) {
      if (r.point1) waypoints.set(r.point1, (waypoints.get(r.point1) || 0) + 1)
      if (r.point2) waypoints.set(r.point2, (waypoints.get(r.point2) || 0) + 1)
    }
    return Array.from(waypoints.entries())
      .map(([id, count]) => ({ id, label: id, count }))
      .sort((a, b) => a.label.localeCompare(b.label))
  })

  // Turnout labels (turnouts that have a name/desc)
  const turnoutLabels = computed(() =>
    groupBy(turnouts.value || [], (t) => t.type)
  )

  // Sensor automations
  const sensorAutomations = computed(() => {
    const items = (sensors.value || []).filter((s) => s.automationId)
    return groupBy(items, (s) => s.automationId)
  })

  // === Filtered item lists (for QuickMenuItemList) ===

  function effectsToToggle(list: Effect[]): ToggleItem[] {
    return list.map((e) => ({
      id: e.id,
      name: e.name || e.id,
      state: e.state,
      icon: 'mdi-rocket-launch',
      color: 'indigo',
    }))
  }

  function turnoutsToToggle(list: Turnout[]): ToggleItem[] {
    return list.map((t) => ({
      id: t.id,
      name: t.name || t.id,
      state: t.state,
      icon: 'mdi-call-split',
      color: 'amber',
    }))
  }

  function signalsToToggle(list: Signal[]): ToggleItem[] {
    return list.map((s) => ({
      id: s.id,
      name: s.name || s.id,
      state: s.aspect === 'green',
      icon: 'mdi-traffic-light',
      color: 'emerald',
    }))
  }

  function sensorsToToggle(list: Sensor[]): ToggleItem[] {
    return list.map((s) => ({
      id: s.id,
      name: s.name || s.id,
      state: s.state,
      icon: 'mdi-access-point',
      color: 'teal',
    }))
  }

  function locosToToggle(list: Loco[]): ToggleItem[] {
    const activeAddresses = new Set(
      ((throttles.value || []) as Array<{ address: number }>).map((t) => t.address)
    )
    return list.map((l) => ({
      id: l.id,
      name: l.name || `Loco ${l.address}`,
      state: activeAddresses.has(l.address),
      icon: 'mdi-train',
      color: 'pink',
    }))
  }

  function routesToToggle(list: Array<{ id: string; name?: string; color?: string }>): ToggleItem[] {
    return list.map((r) => ({
      id: r.id,
      name: r.name || r.id,
      state: false,
      icon: 'mdi-map',
      color: 'purple',
    }))
  }

  // Filter helpers
  function filterByDevice<T extends { device?: string }>(items: T[], deviceId: string): T[] {
    return items.filter((i) => (i.device || 'Unassigned') === deviceId)
  }
  function filterByTag<T extends { tags?: string[] }>(items: T[], tag: string): T[] {
    return items.filter((i) => i.tags?.includes(tag))
  }

  function getFilteredItems(screenKey: string, filterId: string): ToggleItem[] {
    const allEffects = effects.value || []
    const allTurnouts = turnouts.value || []
    const allSignals = signals.value || []
    const allSensors = sensors.value || []
    const allLocos = locos.value || []
    const allRoutes = (routes.value || []) as Array<{ id: string; name?: string; point1?: string; point2?: string; color?: string }>

    switch (screenKey) {
      // Locos
      case 'locos:by-roadname':
        return locosToToggle(allLocos.filter((l) => (l.meta?.roadname || 'Unknown') === filterId))
      case 'locos:active':
        return locosToToggle(allLocos.filter((l) => {
          const addrs = new Set(((throttles.value || []) as Array<{ address: number }>).map((t) => t.address))
          return addrs.has(l.address)
        }))
      case 'locos:all':
        return locosToToggle(allLocos)
      // Effects
      case 'effects:by-device':
        return effectsToToggle(filterByDevice(allEffects, filterId))
      case 'effects:by-type':
        return effectsToToggle(allEffects.filter((e) => e.type === filterId))
      case 'effects:by-tag':
        return effectsToToggle(filterByTag(allEffects, filterId))
      case 'effects:all':
        return effectsToToggle(allEffects)
      // Routes
      case 'routes:by-waypoint':
        return routesToToggle(allRoutes.filter((r) => r.point1 === filterId || r.point2 === filterId))
      case 'routes:all':
        return routesToToggle(allRoutes)
      // Turnouts
      case 'turnouts:by-device':
        return turnoutsToToggle(filterByDevice(allTurnouts, filterId))
      case 'turnouts:by-tag':
        return turnoutsToToggle(filterByTag(allTurnouts, filterId))
      case 'turnouts:labels':
        return turnoutsToToggle(allTurnouts.filter((t) => t.type === filterId))
      case 'turnouts:all':
        return turnoutsToToggle(allTurnouts)
      // Signals
      case 'signals:by-device':
        return signalsToToggle(filterByDevice(allSignals, filterId))
      case 'signals:by-aspect':
        return signalsToToggle(allSignals.filter((s) => (s.aspect || 'unknown') === filterId))
      case 'signals:all':
        return signalsToToggle(allSignals)
      // Sensors
      case 'sensors:by-device':
        return sensorsToToggle(filterByDevice(allSensors, filterId))
      case 'sensors:automations':
        return sensorsToToggle(allSensors.filter((s) => s.automationId === filterId))
      case 'sensors:all':
        return sensorsToToggle(allSensors)
      default:
        return []
    }
  }

  // === Toggle actions ===

  async function toggleItem(entity: string, id: string, newState: boolean) {
    switch (entity) {
      case 'effects': {
        // runEffect writes efx.state as-is, so pass the NEW desired state
        await efx.runEffect({ id, state: newState } as Effect)
        break
      }
      case 'turnouts': {
        // switchTurnout toggles state internally, so just pass the turnout
        const turnout = (turnouts.value || []).find((t) => t.id === id)
        if (turnout) {
          await tn.switchTurnout(turnout)
        }
        break
      }
      case 'signals': {
        await sig.setSignalAspect(id, newState ? 'green' : 'red')
        break
      }
      case 'sensors': {
        await sen.setSensorState(id, newState)
        break
      }
    }
  }

  return {
    // Group data
    locosByRoadname,
    effectsByDevice,
    effectsByType,
    effectsByTag,
    routesByWaypoint,
    turnoutsByDevice,
    turnoutsByTag,
    turnoutLabels,
    signalsByDevice,
    signalsByAspect,
    sensorsByDevice,
    sensorAutomations,
    // Filtered items
    getFilteredItems,
    // Actions
    toggleItem,
  }
}
