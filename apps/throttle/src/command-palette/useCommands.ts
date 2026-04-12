import { computed, type ComputedRef } from 'vue'
import type { Command } from './types'
import { useNavigationCommands } from './commands/navigation'
import { useThrottleCommands } from './commands/throttles'
import { useTurnoutCommands, useTurnoutBrowseCommand } from './commands/turnouts'
import { useEffectCommands, useEffectBrowseCommand } from './commands/effects'
import { useSignalCommands, useSignalBrowseCommand } from './commands/signals'
import { useLocoBrowseCommand } from './commands/locos'
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

/**
 * Browse commands aggregate the domain-level `useXxxBrowseCommand()`
 * composables into a single list of top-level Browse cards. Each card
 * is a drill-down: root → facet (By Device / By Tag / ...) → filtered
 * item list. Used at the palette root alongside the flat-search list.
 */
export function useBrowseCommands(): ComputedRef<Command[]> {
  const locoBrowse = useLocoBrowseCommand()
  const turnoutBrowse = useTurnoutBrowseCommand()
  const effectBrowse = useEffectBrowseCommand()
  const signalBrowse = useSignalBrowseCommand()

  return computed(() => {
    const out: Command[] = []
    if (locoBrowse.value) out.push(locoBrowse.value)
    if (turnoutBrowse.value) out.push(turnoutBrowse.value)
    if (effectBrowse.value) out.push(effectBrowse.value)
    if (signalBrowse.value) out.push(signalBrowse.value)
    return out
  })
}
