import log from './utils/logger.mjs'
import { getEffectCommand } from './effects.mjs'
import { turnoutCommand } from './turnouts.mjs'

export function getMacroCommand(effects, turnouts) {
  log.log('handleMacroCommand')
  
    return [
      ...effects?.map(getEffectCommand),
      ...turnouts?.map(turnoutCommand)
    ]
}

export default {
  getMacroCommand
}