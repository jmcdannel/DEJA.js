import { computed, type ComputedRef } from 'vue'
import type { Command } from './types'
import { useNavigationCommands } from './commands/navigation'
import { useThrottleCommands } from './commands/throttles'
import { useTurnoutCommands } from './commands/turnouts'
import { useEffectCommands } from './commands/effects'
import { useSignalCommands } from './commands/signals'

export function useCommands(): ComputedRef<Command[]> {
  const nav = useNavigationCommands()
  const thr = useThrottleCommands()
  const tur = useTurnoutCommands()
  const efx = useEffectCommands()
  const sig = useSignalCommands()

  return computed(() => [
    ...nav.value,
    ...thr.value,
    ...tur.value,
    ...efx.value,
    ...sig.value,
  ])
}
