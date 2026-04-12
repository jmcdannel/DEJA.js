import { computed, type ComputedRef, type Ref } from 'vue'
import { useEfx, type Effect } from '@repo/modules/effects'
import type { Command } from '../types'
import { useBrowseGroups } from './useBrowseGroups'

// 💡 Single-toggle command for an effect — keeps the palette open so users
// can fire multiple in a row.
function effectToggleCommand(
  e: Effect,
  runEffect: (effect: Effect) => Promise<unknown>,
  idPrefix: string,
): Command {
  const name = e.name || e.id
  const isOn = Boolean(e.state)
  const extra = e.type
    ? `${e.type}${e.device ? ` · ${e.device}` : ''}`
    : e.device
  return {
    id: `${idPrefix}.${e.id}`,
    // 🏷️ Title is the effect name only. The trailing pill shows ON/OFF.
    title: name,
    description: extra || undefined,
    icon: 'mdi-toggle-switch-outline',
    category: 'effect',
    keywords: [name, e.id, e.type || '', e.device || '', ...(e.tags || [])].filter(Boolean),
    keepOpen: true,
    toggleState: isOn,
    run: async () => {
      await runEffect({ ...e, state: !isOn } as Effect)
    },
  }
}

export function useEffectCommands(): ComputedRef<Command[]> {
  const { getEffects, runEffect } = useEfx()
  const effects = getEffects() as unknown as Ref<Effect[]>

  return computed<Command[]>(() => {
    const list = effects.value || []
    return list.map((e) => effectToggleCommand(e, runEffect, 'effect.toggle'))
  })
}

export function useEffectBrowseCommand(): ComputedRef<Command | null> {
  const { getEffects, runEffect } = useEfx()
  const effects = getEffects() as unknown as Ref<Effect[]>
  const { effectsByDevice, effectsByType, effectsByTag, filterByDevice, filterByTag } =
    useBrowseGroups()

  return computed<Command | null>(() => {
    const list = effects.value || []
    if (list.length === 0) return null

    const toCmd = (e: Effect) => effectToggleCommand(e, runEffect, 'browse.effects.toggle')

    const byDevice: Command = {
      id: 'browse.effects.by-device',
      title: 'By Device',
      description: `${effectsByDevice.value.length} devices`,
      icon: 'mdi-chip',
      category: 'browse',
      run: () => {},
      children: {
        title: 'Effects ▸ By Device',
        commands: effectsByDevice.value.map<Command>((group) => ({
          id: `browse.effects.by-device.${group.id}`,
          title: group.label,
          description: `${group.count} effects`,
          icon: 'mdi-chip',
          category: 'browse',
          run: () => {},
          children: {
            title: `Effects ▸ ${group.label}`,
            commands: filterByDevice(list, group.id).map(toCmd),
          },
        })),
      },
    }

    const byType: Command = {
      id: 'browse.effects.by-type',
      title: 'By Type',
      description: `${effectsByType.value.length} types`,
      icon: 'mdi-shape',
      category: 'browse',
      run: () => {},
      children: {
        title: 'Effects ▸ By Type',
        commands: effectsByType.value.map<Command>((group) => ({
          id: `browse.effects.by-type.${group.id}`,
          title: group.label,
          description: `${group.count} effects`,
          icon: 'mdi-shape-outline',
          category: 'browse',
          run: () => {},
          children: {
            title: `Effects ▸ ${group.label}`,
            commands: list.filter((e) => e.type === group.id).map(toCmd),
          },
        })),
      },
    }

    const byTag: Command = {
      id: 'browse.effects.by-tag',
      title: 'By Tag',
      description: `${effectsByTag.value.length} tags`,
      icon: 'mdi-tag-multiple',
      category: 'browse',
      run: () => {},
      children: {
        title: 'Effects ▸ By Tag',
        commands: effectsByTag.value.map<Command>((group) => ({
          id: `browse.effects.by-tag.${group.id}`,
          title: group.label,
          description: `${group.count} effects`,
          icon: 'mdi-tag',
          category: 'browse',
          run: () => {},
          children: {
            title: `Effects ▸ #${group.label}`,
            commands: filterByTag(list, group.id).map(toCmd),
          },
        })),
      },
    }

    const all: Command = {
      id: 'browse.effects.all',
      title: 'View All',
      description: `${list.length} effects`,
      icon: 'mdi-format-list-bulleted',
      category: 'browse',
      run: () => {},
      children: {
        title: 'Effects ▸ All',
        commands: list.map(toCmd),
      },
    }

    return {
      id: 'browse.effects',
      title: 'Effects',
      description: `${list.length} effects`,
      icon: 'mdi-rocket-launch',
      category: 'browse',
      run: () => {},
      children: {
        title: 'Browse ▸ Effects',
        commands: [byDevice, byType, byTag, all],
      },
    }
  })
}
