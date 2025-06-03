import type { Effect, MacroItem } from '@repo/modules/effects'
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@repo/firebase-config/firebase-node'
import { log } from '../utils/logger.js'
import { dcc, type OutputPayload } from '../lib/dcc.js'
import { layout } from './layout.js'

export interface EffectCommand {
  action: string
  device: string
  payload: {
    config?: string
    pattern?: string
    pin?: string
    state?: boolean
  }
}

const layoutId = process.env.LAYOUT_ID

const pinCommand = (effect: Effect): EffectCommand => ({
  action: 'pin',
  device: effect?.device || '',
  payload: {
    pin: effect?.pin?.toString() || '',
    state: effect.state,
  },
})

const ialedCommand = (effect: Effect): string => {
  const pin = effect?.pin
  const pattern = effect?.state ? effect?.pattern : 'off'
  // const range = effect?.range
  const config = effect?.config
  const command = `${pin}, ${pattern}, all, ${config}\n`
  return command
}

async function getEffect(id: string): Promise<Effect | undefined> {
  const deviceRef = doc(db, `layouts/${layoutId}/effects`, id)
  const docSnap = await getDoc(deviceRef)
  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id } as Effect
  }
  log.error('No such document!')
  return undefined
}

export function getEffectCommand(
  efx: Effect
): EffectCommand | string | undefined {
  try {
    switch (efx?.type) {
      case 'light':
      case 'streetlight':
      case 'frog':
      case 'relay':
      case 'pin':
      case 'led':
      case 'power':
        return pinCommand(efx)
      case 'ialed':
        return ialedCommand(efx)
      // case 'serial-ialed':
      //   return [ialedCommand(effect)]
      // case 'sound':
      //   return [soundCommand(effect)]
      // case 'signal':
      //   const signalCommands = await signalCommand(effect)
      //   return signalCommands;
      default:
        // no op
        break
    }
  } catch (err) {
    log.error('[EFFECTS] getCommand', err)
  }
}

const MACRO_DELAY = 1500

export const asyncTimeout = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function handleMacroItem(
  item: MacroItem,
  state: boolean,
  macroState: boolean
): Promise<void> {
  if (item.type === 'turnout' && item.id) {
    await setDoc(
      doc(db, `layouts/${layoutId}/turnouts`, item.id.toString()),
      { state },
      { merge: true }
    )
  } else if (item.type === 'effect' && item.id) {
    await setDoc(
      doc(db, `layouts/${layoutId}/effects`, item.id.toString()),
      { state },
      { merge: true }
    )
  } else if (
    item.type === 'throttle' &&
    macroState === state &&
    item.id &&
    item.speed !== undefined
  ) {
    // log.log('handleMacroItem throttle', item)
    await setDoc(
      doc(db, `layouts/${layoutId}/throttles`, item.id.toString()),
      {
        direction: item?.direction === 'forward',
        speed: item.speed,
        timestamp: serverTimestamp(),
      },
      { merge: true }
    )
    // log.log('handleMacroItem throttle DONE')
  }
  // log.log('handleMacroItem', item)
}

export async function handleMacro(efx: Effect): Promise<void> {
  try {
    // const macroItemPromises = efx?.on?.map(async (item) => await handleMacroItem(item, efx.state))
    const onPromises =
      efx?.on?.map((item: MacroItem) =>
        Promise.all([
          handleMacroItem(item, Boolean(efx.state), true),
          asyncTimeout(MACRO_DELAY),
        ])
      ) || []
    await Promise.all(onPromises)
    const offPromises =
      efx?.off?.map((item: MacroItem) =>
        Promise.all([
          handleMacroItem(item, !efx.state, false),
          asyncTimeout(MACRO_DELAY),
        ])
      ) || []
    await Promise.all(offPromises)
  } catch (e) {
    log.error('Error handling macro: ', e)
  }
}

export async function handleEffect(payload: Effect): Promise<void> {
  // log.log(layout.connections())
  if (payload.type === 'route' || payload.type === 'macro') {
    return await handleMacro(payload)
  }
  const conn = payload.device
    ? layout.connections()?.[payload.device]
    : undefined
  if (!conn?.isConnected) {
    log.error('Device not connected', payload.device, payload)
    return
  }
  const command = getEffectCommand(payload)
  const layoutDevice = layout.devices().find(({ id }) => id === payload.device)
  if (
    layoutDevice?.connection === 'usb' &&
    layoutDevice?.type === 'deja-arduino' &&
    conn.send &&
    conn.port
  ) {
    conn.send(conn.port, JSON.stringify([command]))
  } else if (
    layoutDevice?.connection === 'usb' &&
    layoutDevice?.type === 'deja-arduino-led' &&
    conn.send &&
    conn.port
  ) {
    conn.send(conn.port, JSON.stringify([command]))
  } else if (
    layoutDevice?.connection === 'wifi' &&
    conn.publish &&
    conn.topic
  ) {
    conn.publish(conn.topic, JSON.stringify(command), true)
  } else if (layoutDevice?.type === 'dcc-ex') {
    const outputCommand: OutputPayload = {
      pin: parseInt((command as EffectCommand).payload.pin?.toString() || '0'),
      state: Boolean((command as EffectCommand).payload.state),
    }
    // log.log('dcc sendOutput', outputCommand)
    await dcc.sendOutput(outputCommand)
  }
}

export async function handleEffectChange(
  snapshot: DocumentData
): Promise<void> {
  snapshot.docChanges().forEach(async (change: DocumentData) => {
    if (change.type === 'modified') {
      // log.log('handleEffectChange', change.type, change.doc.data())
      await handleEffect(change.doc.data())
    }
  })
}

export default {
  getEffect,
  getEffectCommand,
  handleEffect,
  handleEffectChange,
  handleMacro,
}
