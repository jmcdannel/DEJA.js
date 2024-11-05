import log from './utils/logger.mjs'
import layout from './layout.mjs'

export async function handleTurnout(turnout) {
  try {
    const conn = layout.connections()?.[turnout.device]
    if (!conn?.isConnected) {
      log.error('Device not connected', turnout.device)
      return
    }
    const command = turnoutCommand(turnout)
    const layoutDevice = layout
      .devices()
      ?.find(({ id }) => id === turnout.device)
    log.log(
      'handleTurnoutCommand',
      turnout,
      command,
      conn?.isConnected,
      layoutDevice
    )
    if (layoutDevice?.connection === 'usb') {
      await conn.send(conn.port, JSON.stringify([command]))
    } else if (layoutDevice?.connection === 'wifi') {
      await conn.send(conn.topic, JSON.stringify(command))
    }
  } catch (err) {
    log.error('[COMMANDS] turnoutCommand', err)
  }
}

export function turnoutCommand(turnout) {
  try {
    let commands = []
    switch (turnout?.type) {
      case 'kato':
        commands.push(katoCommand(turnout))
        break
      case 'servo':
        commands.push(servoCommand(turnout))
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

function katoCommand(turnout) {
  return {
    device: turnout.device,
    action: 'turnout',
    payload: {
      turnout: parseInt(turnout.turnoutIdx),
      state: turnout.state,
    },
  }
}

function servoCommand(turnout) {
  return {
    device: turnout.device,
    action: 'servo',
    payload: {
      servo: parseInt(turnout.turnoutIdx),
      value: parseInt(turnout.state ? turnout.straight : turnout.divergent),
      current: parseInt(!turnout.state ? turnout.straight : turnout.divergent),
    },
  }
}

export async function handleTurnoutChange(snapshot) {
  snapshot.docChanges().forEach(async (change) => {
    if (change.type === 'modified') {
      console.log('handleTurnoutChange', change.type, change.doc.data())
      await handleTurnout(change.doc.data())
    }
  })
}

export default {
  turnoutCommand,
  handleTurnout,
  handleTurnoutChange,
}
