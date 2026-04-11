import { computed, type ComputedRef, type Ref } from 'vue'
import { useSignals, type Signal, type SignalAspect } from '@repo/modules/signals'
import type { Command } from '../types'

interface AspectChoice {
  aspect: SignalAspect
  label: string
  icon: string
}

const ASPECTS: AspectChoice[] = [
  { aspect: 'red',    label: 'Red',    icon: 'mdi-traffic-light' },
  { aspect: 'yellow', label: 'Yellow', icon: 'mdi-traffic-light' },
  { aspect: 'green',  label: 'Green',  icon: 'mdi-traffic-light' },
  { aspect: null,     label: 'Clear',  icon: 'mdi-circle-off-outline' },
]

export function useSignalCommands(): ComputedRef<Command[]> {
  const { getSignals, setSignalAspect } = useSignals()
  const signals = getSignals() as unknown as Ref<Signal[]>

  return computed<Command[]>(() => {
    const list = signals.value || []
    return list.map((s) => {
      const name = s.name || s.id
      return {
        id: `signal.set.${s.id}`,
        title: `Set ${name}`,
        description: s.aspect ? `currently ${s.aspect}` : undefined,
        icon: 'mdi-traffic-light',
        category: 'signal' as const,
        keywords: [name, s.id, s.device || ''].filter(Boolean),
        run: () => {},
        children: {
          title: `Set ${name} ▸ aspect`,
          commands: ASPECTS.map<Command>((a) => ({
            id: `signal.set.${s.id}.${a.aspect ?? 'clear'}`,
            title: a.label,
            icon: a.icon,
            category: 'signal' as const,
            run: async () => { await setSignalAspect(s.id, a.aspect) },
          })),
        },
      }
    })
  })
}
