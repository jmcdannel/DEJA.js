import { computed, type ComputedRef, type Ref } from 'vue'
import { useSignals, type Signal, type SignalAspect } from '@repo/modules/signals'
import type { Command, CommandAction } from '../types'
import { useBrowseGroups } from './useBrowseGroups'

// 🚦 Each signal row gets four inline action "dots": Red / Yellow / Green /
// clear. Clicking a dot calls setSignalAspect directly and keeps the palette
// open. The row's `run` is a no-op — the row itself isn't the action, the
// dots are.

interface AspectAction {
  id: 'red' | 'yellow' | 'green' | 'clear'
  label: string
  color: string
  icon: string
  aspect: SignalAspect
}

const ASPECT_ACTIONS: AspectAction[] = [
  { id: 'red',    label: 'R', color: '#ef4444', icon: 'mdi-circle', aspect: 'red' },
  { id: 'yellow', label: 'Y', color: '#eab308', icon: 'mdi-circle', aspect: 'yellow' },
  { id: 'green',  label: 'G', color: '#22c55e', icon: 'mdi-circle', aspect: 'green' },
  { id: 'clear',  label: '○', color: '#64748b', icon: 'mdi-circle-outline', aspect: null },
]

// 🚦 Produce a single signal command with inline R/Y/G/clear actions.
function signalCommand(
  s: Signal,
  setSignalAspect: (id: string, aspect: SignalAspect) => Promise<unknown>,
  idPrefix: string,
): Command {
  const name = s.name || s.id
  const keywords = [name, s.id, s.device || '', ...(s.tags || [])].filter(Boolean)
  const actions: CommandAction[] = ASPECT_ACTIONS.map((a) => ({
    id: `${idPrefix}.${s.id}.${a.id}`,
    label: a.label,
    color: a.color,
    icon: a.icon,
    run: async () => {
      await setSignalAspect(s.id, a.aspect)
    },
  }))
  return {
    id: `${idPrefix}.${s.id}`,
    title: name,
    description: s.aspect ? `currently ${s.aspect}` : 'clear',
    icon: 'mdi-traffic-light',
    category: 'signal',
    keywords,
    // 🛑 Top-level row click is intentionally a no-op — interaction is via dots.
    keepOpen: true,
    run: () => {},
    actions,
  }
}

// 🔍 Flat-search commands: one row per signal, with inline aspect actions.
export function useSignalCommands(): ComputedRef<Command[]> {
  const { getSignals, setSignalAspect } = useSignals()
  const signals = getSignals() as unknown as Ref<Signal[]>

  return computed<Command[]>(() => {
    const list = signals.value || []
    return list.map((s) => signalCommand(s, setSignalAspect, 'signal'))
  })
}

export function useSignalBrowseCommand(): ComputedRef<Command | null> {
  const { getSignals, setSignalAspect } = useSignals()
  const signals = getSignals() as unknown as Ref<Signal[]>
  const { signalsByDevice, signalsByTag, filterByDevice, filterByTag } = useBrowseGroups()

  return computed<Command | null>(() => {
    const list = signals.value || []
    if (list.length === 0) return null

    const toCmd = (s: Signal) => signalCommand(s, setSignalAspect, 'browse.signals')

    const byDevice: Command = {
      id: 'browse.signals.by-device',
      title: 'By Device',
      description: `${signalsByDevice.value.length} devices`,
      icon: 'mdi-chip',
      category: 'browse',
      run: () => {},
      children: {
        title: 'Signals ▸ By Device',
        commands: signalsByDevice.value.map<Command>((group) => ({
          id: `browse.signals.by-device.${group.id}`,
          title: group.label,
          description: `${group.count} signals`,
          icon: 'mdi-chip',
          category: 'browse',
          run: () => {},
          children: {
            title: `Signals ▸ ${group.label}`,
            commands: filterByDevice(list, group.id).map(toCmd),
          },
        })),
      },
    }

    const byTag: Command = {
      id: 'browse.signals.by-tag',
      title: 'By Tag',
      description: `${signalsByTag.value.length} tags`,
      icon: 'mdi-tag-multiple',
      category: 'browse',
      run: () => {},
      children: {
        title: 'Signals ▸ By Tag',
        commands: signalsByTag.value.map<Command>((group) => ({
          id: `browse.signals.by-tag.${group.id}`,
          title: group.label,
          description: `${group.count} signals`,
          icon: 'mdi-tag',
          category: 'browse',
          run: () => {},
          children: {
            title: `Signals ▸ #${group.label}`,
            commands: filterByTag(list, group.id).map(toCmd),
          },
        })),
      },
    }

    const all: Command = {
      id: 'browse.signals.all',
      title: 'All',
      description: `${list.length} signals`,
      icon: 'mdi-format-list-bulleted',
      category: 'browse',
      run: () => {},
      children: {
        title: 'Signals ▸ All',
        commands: list.map(toCmd),
      },
    }

    return {
      id: 'browse.signals',
      title: 'Signals',
      description: `${list.length} signals`,
      icon: 'mdi-traffic-light',
      category: 'browse',
      run: () => {},
      children: {
        title: 'Browse ▸ Signals',
        commands: [byDevice, byTag, all],
      },
    }
  })
}
