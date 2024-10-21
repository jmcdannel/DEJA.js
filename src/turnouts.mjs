import log from './utils/logger.mjs'

async function handleTurnout(turnout) {
  try {    
    const command = await turnoutCommand(turnout)
    return command
  } catch (err) {
    log.error('[COMMANDS] turnoutCommand', err)
  }
}
export async function turnoutCommand(turnout) {
  try {
    let commands = []
    if (turnout?.effectId) {
      // const efx = await getEffectById(turnout.config.effectId)
      // efx.state = turnout.state
      // const efxCommands =  await effectCommand(efx)
      // commands = [...commands, ...efxCommands]
    }
    switch(turnout?.type) {
      case 'kato':
        commands.push({
          iFaceId: turnout.interface,
          action: 'turnout', 
          payload: { 
            turnout: turnout.turnoutIdx, 
            state: turnout.state 
          }
        })
        break
      case 'servo':
        commands.push({
          iFaceId: turnout.interface,
          action: 'servo', 
          payload: { 
            servo: turnout.servo, 
            value: turnout.state 
              ? turnout.straight 
              : turnout.divergent, 
            current: !turnout.state 
              ? turnout.straight 
              : turnout.divergent
          }
        })
        break
      default:
        // no op
        break;
    }
    return commands?.[0] //  TODO: refactor to return all commands
  } catch (err) {
    log.error('[COMMANDS] turnoutCommand', err?.message);
  }
}

export default {
  turnoutCommand,
  handleTurnout
}