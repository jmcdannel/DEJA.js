import { computed, type ComputedRef, type Ref } from 'vue'
import { useEfx, type Effect } from '@repo/modules/effects'
import type { Command } from '../types'

export function useEffectCommands(): ComputedRef<Command[]> {
  const { getEffects, runEffect } = useEfx()
  const effects = getEffects() as unknown as Ref<Effect[]>

  return computed<Command[]>(() => {
    const list = effects.value || []
    return list.map((e) => {
      const name = e.name || e.id
      const description = e.type
        ? `${e.type}${e.device ? ` · ${e.device}` : ''}`
        : e.device
      return {
        id: `effect.toggle.${e.id}`,
        title: `Toggle ${name}`,
        description,
        icon: 'mdi-rocket-launch',
        category: 'effect' as const,
        keywords: [name, e.id, e.type || '', e.device || '', ...(e.tags || [])].filter(Boolean),
        run: async () => { await runEffect({ ...e, state: !e.state } as Effect) },
      }
    })
  })
}
