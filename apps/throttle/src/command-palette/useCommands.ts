import { computed, type ComputedRef } from 'vue'
import type { Command } from './types'
import { useNavigationCommands } from './commands/navigation'
import { useThrottleCommands } from './commands/throttles'
import { useTurnoutCommands } from './commands/turnouts'
import { useEffectCommands } from './commands/effects'
import { useSignalCommands } from './commands/signals'
import { useSettingsCommands } from './commands/settings'

export function useCommands(): ComputedRef<Command[]> {
  const nav = useNavigationCommands()
  const thr = useThrottleCommands()
  const tur = useTurnoutCommands()
  const efx = useEffectCommands()
  const sig = useSignalCommands()
  const set = useSettingsCommands()

  return computed(() => [
    ...nav.value,
    ...thr.value,
    ...tur.value,
    ...efx.value,
    ...sig.value,
    ...set.value,
  ])
}
