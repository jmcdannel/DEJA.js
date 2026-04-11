import { computed, type ComputedRef, type Ref } from 'vue'
import { useTurnouts, type Turnout } from '@repo/modules/turnouts'
import type { Command } from '../types'
import { useBrowseGroups } from './useBrowseGroups'

// 🔀 Single-toggle command for a turnout — palette stays open on click so the
// user can flip multiple in a row.
function turnoutToggleCommand(
  t: Turnout,
  setTurnout: (id: string, patch: Partial<Turnout>) => Promise<unknown>,
  idPrefix: string,
): Command {
  const name = t.name || t.id
  const isThrown = Boolean(t.state)
  const keywords = [name, t.id, t.device || '', ...(t.tags || [])].filter(Boolean)
  return {
    id: `${idPrefix}.${t.id}`,
    // 👀 Title reflects the action that will happen next (live state).
    title: isThrown ? `Close ${name}` : `Throw ${name}`,
    description: isThrown ? 'currently thrown' : 'currently closed',
    icon: isThrown ? 'mdi-call-merge' : 'mdi-call-split',
    category: 'turnout',
    keywords,
    keepOpen: true,
    run: async () => {
      await setTurnout(t.id, { state: !isThrown })
    },
  }
}

// 🔍 Flat-search commands for turnouts. One toggle command per turnout so a
// search for "main yard" returns a single row that flips state on click.
export function useTurnoutCommands(): ComputedRef<Command[]> {
  const { getTurnouts, setTurnout } = useTurnouts()
  const turnouts = getTurnouts() as unknown as Ref<Turnout[]>

  return computed<Command[]>(() => {
    const list = turnouts.value || []
    return list.map((t) => turnoutToggleCommand(t, setTurnout, 'turnout.toggle'))
  })
}

export function useTurnoutBrowseCommand(): ComputedRef<Command | null> {
  const { getTurnouts, setTurnout } = useTurnouts()
  const turnouts = getTurnouts() as unknown as Ref<Turnout[]>
  const { turnoutsByDevice, turnoutsByTag, turnoutLabels, filterByDevice, filterByTag } =
    useBrowseGroups()

  return computed<Command | null>(() => {
    const list = turnouts.value || []
    if (list.length === 0) return null

    const toCmd = (t: Turnout) => turnoutToggleCommand(t, setTurnout, 'browse.turnouts.toggle')

    const byDevice: Command = {
      id: 'browse.turnouts.by-device',
      title: 'By Device',
      description: `${turnoutsByDevice.value.length} devices`,
      icon: 'mdi-chip',
      category: 'browse',
      run: () => {},
      children: {
        title: 'Turnouts ▸ By Device',
        commands: turnoutsByDevice.value.map<Command>((group) => ({
          id: `browse.turnouts.by-device.${group.id}`,
          title: group.label,
          description: `${group.count} turnouts`,
          icon: 'mdi-chip',
          category: 'browse',
          run: () => {},
          children: {
            title: `Turnouts ▸ ${group.label}`,
            commands: filterByDevice(list, group.id).map(toCmd),
          },
        })),
      },
    }

    const byTag: Command = {
      id: 'browse.turnouts.by-tag',
      title: 'By Tag',
      description: `${turnoutsByTag.value.length} tags`,
      icon: 'mdi-tag-multiple',
      category: 'browse',
      run: () => {},
      children: {
        title: 'Turnouts ▸ By Tag',
        commands: turnoutsByTag.value.map<Command>((group) => ({
          id: `browse.turnouts.by-tag.${group.id}`,
          title: group.label,
          description: `${group.count} turnouts`,
          icon: 'mdi-tag',
          category: 'browse',
          run: () => {},
          children: {
            title: `Turnouts ▸ #${group.label}`,
            commands: filterByTag(list, group.id).map(toCmd),
          },
        })),
      },
    }

    const labels: Command = {
      id: 'browse.turnouts.labels',
      title: 'Labels',
      description: `${turnoutLabels.value.length} types`,
      icon: 'mdi-label-outline',
      category: 'browse',
      run: () => {},
      children: {
        title: 'Turnouts ▸ Labels',
        commands: turnoutLabels.value.map<Command>((group) => ({
          id: `browse.turnouts.labels.${group.id}`,
          title: group.label,
          description: `${group.count} turnouts`,
          icon: 'mdi-label',
          category: 'browse',
          run: () => {},
          children: {
            title: `Turnouts ▸ ${group.label}`,
            commands: list.filter((t) => t.type === group.id).map(toCmd),
          },
        })),
      },
    }

    const all: Command = {
      id: 'browse.turnouts.all',
      title: 'View All',
      description: `${list.length} turnouts`,
      icon: 'mdi-format-list-bulleted',
      category: 'browse',
      run: () => {},
      children: {
        title: 'Turnouts ▸ All',
        commands: list.map(toCmd),
      },
    }

    return {
      id: 'browse.turnouts',
      title: 'Turnouts',
      description: `${list.length} turnouts`,
      icon: 'mdi-call-split',
      category: 'browse',
      run: () => {},
      children: {
        title: 'Browse ▸ Turnouts',
        commands: [byDevice, byTag, labels, all],
      },
    }
  })
}
