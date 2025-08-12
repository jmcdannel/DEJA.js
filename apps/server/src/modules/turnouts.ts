import { type DocumentData } from 'firebase/firestore'
import { db } from '@repo/firebase-config/firebase-admin-node'
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
    log.log('handleTurnout', turnout?.id, turnout?.device, turnout?.name, conn?.isConnected)
    if (!conn?.isConnected) {
      log.error('Device not connected', turnout.device)
      return
    }
    const command = turnoutCommand(turnout)
    const layoutDevice = layout
      .devices()
      ?.find(({ id }) => id === turnout.device)
    // log.log('handleTurnout', turnout, command, conn?.isConnected, layoutDevice)
    if (layoutDevice?.type === 'dcc-ex') {
      await dcc.sendTurnout({
        state: turnout.state,
        turnoutIdx: turnout.turnoutIdx,
      } as TurnoutPayload)
    } else if (layoutDevice?.connection === 'usb' && conn?.port && conn.send) {
      await conn.send(conn, JSON.stringify([command]))
    } else if (
      layoutDevice?.connection === 'wifi' &&
      conn?.topic &&
      conn.publish
    ) {
      await conn.publish(conn.topic, JSON.stringify(command), true)
    }
  } catch (err) {
    log.error('[COMMANDS] turnoutCommand', err)
  }
}

export async function getTurnout(id: string): Promise<Turnout | undefined> {
  if (!layoutId) {
    log.error('Layout ID is not set')
    return undefined
  }
  if (!id) {
    log.error('Turnout ID is not set')
    return undefined
  }
  log.log('getTurnout', id, layoutId)
  const turnoutRef = db.collection(`layouts/${layoutId}/turnouts`).doc(id)
  const docSnap = await turnoutRef.get()
  if (docSnap.exists) {
    return { ...docSnap.data(), id: docSnap.id } as Turnout
  }
  log.error('No such turnout', id, layoutId)
}

export function turnoutCommand(
  turnout: Turnout
): KatoCommand | ServoCommand | Turnout | undefined {
  try {
    if (turnout.device === 'dccex') {
      return turnout
    }
    let command: KatoCommand | ServoCommand | undefined

    switch (turnout?.type) {
      case 'kato':
        command = katoCommand(turnout)      
        break
      case 'servo':
        command = servoCommand(turnout) 
        break
      default:
        // no op
        break
    }  
    return command //  TODO: refactor to return all commands
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

function servoCommand(turnout: Turnout): ServoCommand | undefined {
  
  if (turnout.straight === undefined || turnout.divergent === undefined) {
    log.error(
      `[COMMANDS] servoCommand: straight/divergent values are undefined for turnout ${turnout.id}`
    )
    return undefined
  }
  if (isNaN(turnout.straight) || isNaN(turnout.divergent)) {
    log.error(
      `[COMMANDS] servoCommand: Invalid straight/divergent values for turnout ${turnout.id}`
    )
    return undefined
  }
  if (turnout.turnoutIdx === undefined) {
    log.error(
      `[COMMANDS] servoCommand: turnoutIdx is undefined for turnout ${turnout.id}`
    )
    return undefined
  }
  if (!turnout.device) {
    log.error(`[COMMANDS] servoCommand: device is undefined for turnout ${turnout.id}`)
    return undefined
  }
  if (turnout.straight === undefined || turnout.divergent === undefined) {
    log.error(
      `[COMMANDS] servoCommand: straight/divergent is undefined for turnout ${turnout.id}`
    )
    return undefined
  }
  if (turnout.straight === turnout.divergent) {
    log.error(
      `[COMMANDS] servoCommand: straight and divergent values are the same for turnout ${turnout.id}`
    )
    return undefined
  }
  if (turnout.straight < 0 || turnout.divergent < 0) {
    log.error(
      `[COMMANDS] servoCommand: straight/divergent values cannot be negative for turnout ${turnout.id}`
    )
    return undefined
  }
  if (turnout.straight > 180 || turnout.divergent > 180) {
    log.error(
      `[COMMANDS] servoCommand: straight/divergent values cannot be greater than 180 for turnout ${turnout.id}`
    )
    return undefined
  }
  const current = turnout.state ? parseInt(turnout.divergent) : parseInt(turnout.straight)
  if (isNaN(current)) {
    log.error(
      `[COMMANDS] servoCommand: Invalid current value for turnout ${turnout.id}`
    )
    return undefined
  }
  return {
    action: 'servo',
    device: turnout.device,
    payload: {
      current,
      servo: parseInt(turnout.turnoutIdx),
      value: turnout.state ? parseInt(turnout.straight) : parseInt(turnout.divergent),
    },
  }
}

export async function handleTurnoutChange(
  snapshot: DocumentData
): Promise<void> {
  snapshot.docChanges().forEach(async (change: DocumentData) => {
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
