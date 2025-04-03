import {
  doc,
  getDoc,
} from 'firebase/firestore'
import { db } from './firebase.mjs'
import log from './utils/logger.mjs'
import layout from './layout.mjs'

const layoutId = process.env.LAYOUT_ID
const turnoutStates = {}

export async function handleTurnout(turnout) {
  try {
    const conn = layout.connections()?.[turnout.device]
    log.log('handleTurnout', turnout, conn?.isConnected)
    if (!conn?.isConnected) {
      log.error('Device not connected', turnout.device)
      return
    }
    const command = turnoutCommand(turnout)
    const layoutDevice = layout
      .devices()
      ?.find(({ id }) => id === turnout.device)
    log.log('handleTurnout', turnout, command, conn?.isConnected, layoutDevice)
    if (layoutDevice?.connection === 'usb') {
      await conn.send(conn.port, JSON.stringify([command]))
    } else if (layoutDevice?.connection === 'wifi') {
      await conn.send(conn.topic, JSON.stringify(command))
    }
  } catch (err) {
    log.error('[COMMANDS] turnoutCommand', err)
  }
}

export async function getTurnout(id) {
  const deviceRef = doc(db, `layouts/${layoutId}/turnouts`, id)
  const docSnap = await getDoc(deviceRef)

  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id }
  } else {
    console.error('No such document!', id, layoutId)
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
    if (change.type === 'added') {
      turnoutStates[change.doc.id] = change.doc.data()?.state
      console.log('turnoutStates', turnoutStates)
    }
    if (change.type === 'modified') {
      console.log('handleTurnoutChange', change.type, change.doc.id, turnoutStates[change.doc.id], change.doc.data()?.state)
      if (turnoutStates[change.doc.id] !== change.doc.data()?.state) {
        turnoutStates[change.doc.id] = change.doc.data()?.state
        await handleTurnout(change.doc.data())
      }
    }
  })
}

export default {
  turnoutCommand,
  handleTurnout,
  handleTurnoutChange,
}
