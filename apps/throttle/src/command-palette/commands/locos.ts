import { computed, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import { useLocos, type Loco } from '@repo/modules/locos'
import type { Command } from '../types'
import { useBrowseGroups } from './useBrowseGroups'

// Build the `Locos` browse card for the command palette. One top-level
// command with drill-down children: `By Roadname / Active / View All`.
// Each leaf opens a throttle for the selected address.

export function useLocoBrowseCommand(): ComputedRef<Command | null> {
  const router = useRouter()
  const { acquireThrottle } = useLocos()
  const { locos, throttles, locosByRoadname } = useBrowseGroups()

  async function openThrottle(address: number) {
    await acquireThrottle(address)
    await router.push({ name: 'throttle', params: { address } })
  }

  function locoToCommand(l: Loco): Command {
    const name = l.name || `Loco ${l.address}`
    const description = `#${l.address}${l.meta?.roadname ? ` · ${l.meta.roadname}` : ''}`
    return {
      id: `browse.locos.open.${l.address}`,
      title: name,
      description,
      icon: 'mdi-train',
      category: 'throttle',
      keywords: [String(l.address), name, l.meta?.roadname || ''].filter(Boolean),
      run: () => openThrottle(l.address),
    }
  }

  return computed<Command | null>(() => {
    const list = locos.value || []
    if (list.length === 0) return null

    const activeAddresses = new Set(
      (throttles.value || []).map((t) => t.address),
    )
    const activeLocos = list.filter((l) => activeAddresses.has(l.address))

    const byRoadname: Command = {
      id: 'browse.locos.by-roadname',
      title: 'By Roadname',
      description: `${locosByRoadname.value.length} roadnames`,
      icon: 'mdi-tag-outline',
      category: 'browse',
      run: () => {},
      children: {
        title: 'Locos ▸ By Roadname',
        commands: locosByRoadname.value.map<Command>((group) => ({
          id: `browse.locos.by-roadname.${group.id}`,
          title: group.label,
          description: `${group.count} locos`,
          icon: 'mdi-tag-outline',
          category: 'browse',
          run: () => {},
          children: {
            title: `Locos ▸ ${group.label}`,
            commands: list
              .filter((l) => (l.meta?.roadname || 'Unknown') === group.id)
              .map(locoToCommand),
          },
        })),
      },
    }

    const active: Command = {
      id: 'browse.locos.active',
      title: 'Active',
      description: `${activeLocos.length} running`,
      icon: 'mdi-speedometer',
      category: 'browse',
      run: () => {},
      children: {
        title: 'Locos ▸ Active',
        commands: activeLocos.map(locoToCommand),
      },
    }

    const all: Command = {
      id: 'browse.locos.all',
      title: 'View All',
      description: `${list.length} locos`,
      icon: 'mdi-format-list-bulleted',
      category: 'browse',
      run: () => {},
      children: {
        title: 'Locos ▸ All',
        commands: list.map(locoToCommand),
      },
    }

    return {
      id: 'browse.locos',
      title: 'Locos',
      description: `${list.length} in roster`,
      icon: 'mdi-train',
      category: 'browse',
      run: () => {},
      children: {
        title: 'Browse ▸ Locos',
        commands: [byRoadname, active, all],
      },
    }
  })
}
