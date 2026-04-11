import { computed, type ComputedRef, type Ref } from 'vue'
import { useTurnouts, type Turnout } from '@repo/modules/turnouts'
import type { Command } from '../types'

export function useTurnoutCommands(): ComputedRef<Command[]> {
  const { getTurnouts, setTurnout } = useTurnouts()
  const turnouts = getTurnouts() as unknown as Ref<Turnout[]>

  return computed<Command[]>(() => {
    const list = turnouts.value || []
    const commands: Command[] = []
    for (const t of list) {
      const name = t.name || t.id
      const description = t.device ? `Device ${t.device}` : undefined
      const keywords = [name, t.id, t.device || '', ...(t.tags || [])].filter(Boolean)
      commands.push({
        id: `turnout.throw.${t.id}`,
        title: `Throw ${name}`,
        description,
        icon: 'mdi-call-split',
        category: 'turnout',
        keywords,
        run: async () => { await setTurnout(t.id, { state: true }) },
      })
      commands.push({
        id: `turnout.close.${t.id}`,
        title: `Close ${name}`,
        description,
        icon: 'mdi-call-merge',
        category: 'turnout',
        keywords,
        run: async () => { await setTurnout(t.id, { state: false }) },
      })
    }
    return commands
  })
}
