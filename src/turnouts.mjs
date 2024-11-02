import log from './utils/logger.mjs'

async function handleTurnout(turnout) {
  try {
    const command = await turnoutCommand(turnout)
    return command
  } catch (err) {
    log.error('[COMMANDS] turnoutCommand', err)
  }
}
export function turnoutCommand(turnout) {
  try {
    let commands = []
    switch (turnout?.type) {
      case 'kato':
        commands.push({
          device: turnout.device,
          action: 'turnout',
          payload: {
            turnout: turnout.turnoutIdx,
            state: turnout.state,
          },
        })
        break
      case 'servo':
        commands.push({
          device: turnout.device,
          action: 'servo',
          payload: {
            servo: turnout.turnoutIdx,
            value: turnout.state ? turnout.straight : turnout.divergent,
            current: !turnout.state ? turnout.straight : turnout.divergent,
          },
        })
        break
      default:
        // no op
        break
    }
    return commands?.[0] //  TODO: refactor to return all commands
  } catch (err) {
    log.error('[COMMANDS] turnoutCommand', err?.message)
  }
}

export default {
  turnoutCommand,
  handleTurnout,
}
