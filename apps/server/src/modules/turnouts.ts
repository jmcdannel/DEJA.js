import { doc, getDoc, type DocumentData } from 'firebase/firestore'
import { db } from '@repo/firebase-config/firebase-node'
import type { Turnout } from '@repo/modules/turnouts'
import { log } from '../utils/logger.js'
import { dcc, type TurnoutPayload } from '../lib/dcc.js'
import { layout } from './layout.js'

export interface KatoCommand {
  action: string
  device: string
  payload: {
    state?: boolean
    turnout?: number
  }
}

export interface ServoCommand {
  action: string
  device: string
  payload: {
    current?: number
    servo: number
    value?: number
  }
}

const layoutId = process.env.LAYOUT_ID
const turnoutStates: { [key: string]: boolean } = {}

export async function handleTurnout(turnout: Turnout): Promise<void> {
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
    if (layoutDevice?.type === 'dcc-ex') {
      await dcc.sendTurnout({ state: turnout.state, turnoutIdx: turnout.turnoutIdx } as TurnoutPayload)
    } else if (layoutDevice?.connection === 'usb' && conn?.port && conn.send) {
      await conn.send(conn.port, JSON.stringify([command]))
    } else if (layoutDevice?.connection === 'wifi' && conn?.topic && conn.publish) {
      await conn.publish(conn.topic, JSON.stringify(command), true)
    }
  } catch (err) {
    log.error('[COMMANDS] turnoutCommand', err)
  }
}

export async function getTurnout(id: string): Promise<Turnout | undefined> {
  const deviceRef = doc(db, `layouts/${layoutId}/turnouts`, id)
  const docSnap = await getDoc(deviceRef)

  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id } as Turnout
  } 
  log.error('No such turnout', id, layoutId)
}

export function turnoutCommand(turnout: Turnout): KatoCommand | ServoCommand | Turnout | undefined {
  try {
    if (turnout.device === 'dccex') {
      return turnout
    } 
    const commands: (KatoCommand | ServoCommand)[] = []
    
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
    log.error(`[COMMANDS] turnoutCommand ${err}`)
  }
}

function katoCommand(turnout: Turnout): KatoCommand {
  return {
    action: 'turnout',
    device: turnout.device,
    payload: {
      state: turnout.state,
      turnout: turnout.turnoutIdx,
    },
  }
}

function servoCommand(turnout: Turnout): ServoCommand {
  return {
    action: 'servo',
    device: turnout.device,
    payload: {
      current: !turnout.state ? turnout.straight : turnout.divergent,
      servo: turnout.turnoutIdx,
      value: turnout.state ? turnout.straight : turnout.divergent,
    },
  }
}

export async function handleTurnoutChange(snapshot: DocumentData): Promise<void> {
  snapshot.docChanges().forEach(async (change:DocumentData) => {
    if (change.type === 'added') {
      turnoutStates[change.doc.id] = change.doc.data()?.state
    }
    if (change.type === 'modified') {
      if (turnoutStates[change.doc.id] !== change.doc.data()?.state) {
        turnoutStates[change.doc.id] = change.doc.data()?.state
        await handleTurnout(change.doc.data())
      }
    }
  })
}

export default {
  handleTurnout,
  handleTurnoutChange,
  turnoutCommand,
}
