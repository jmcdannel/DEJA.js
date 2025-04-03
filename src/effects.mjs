
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase.mjs'
import log from './utils/logger.mjs'
import layout from './layout.mjs'
import { getMacroCommand } from './macro.mjs'
import { getTurnout } from './turnouts.mjs'

const layoutId = process.env.LAYOUT_ID

const pinCommand = (effect) => ({
  device: effect?.device,
  action: 'pin',
  payload: {
    pin: effect?.pin,
    state: effect.state,
  },
})

const ialedCommand = (effect) => {
  const pin = effect?.pin
  const pattern = effect?.state ? effect?.pattern : 'off'
  const range = effect?.range
  const config = effect?.config

  const command = `${pin}, ${pattern}, all, ${config}\n`
  // const command = `${pin}, ${pattern}, ${range}, ${config}\n`

  return command
}

async function getEffect(id) {
  const deviceRef = doc(db, `layouts/${layout.id}/effects`, id)
  const docSnap = await getDoc(deviceRef)

  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id }
  } else {
    console.error('No such document!')
  }
}

export function getEffectCommand(efx) {
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

export const asyncTimeout = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

async function handleMacroItem(item, state) {
  let result
  if (item.type === 'turnout') {
    result = await updateDoc(
      doc(db, `layouts/${layoutId}/turnouts`, item.id),
        { state },
        { merge: true }
     )
  } else if (item.type === 'effect') {
    result = await updateDoc(
      doc(db, `layouts/${layoutId}/effects`, item.id),
        { state },
        { merge: true }
     )
  }
  console.log("handleMacroItem", result, item)
}

export async function handleMacro(efx) {
  try {
    // const macroItemPromises = efx?.on?.map(async (item) => await handleMacroItem(item, efx.state))
    for(let i = 0; i < efx?.on.length; i++) {
      const item = efx?.on[i]
      await Promise.all([
        handleMacroItem(item, efx.state),
        asyncTimeout(MACRO_DELAY)
      ])
    }
    for(let i = 0; i < efx?.off.length; i++) {
      const item = efx?.off[i]
      
      await Promise.all([
        handleMacroItem(item, !efx.state),
        asyncTimeout(MACRO_DELAY)
      ])
    }
  } catch (e) {
    console.error('Error adding document: ', e)
  }
}

export async function handleEffect(payload) {
  log.log(layout.connections())
  if (payload.type === 'route' || payload.type === 'macro') {
    return await handleMacro(payload)
  }
  const conn = layout.connections()?.[payload.device]
  if (!conn?.isConnected) {
    log.error('Device not connected', payload.device, payload)
    return
  }
  const command = getEffectCommand(payload)
  const layoutDevice = layout.devices().find(({ id }) => id === payload.device)
  log.log(
    'handleEffectCommand',
    payload,
    command,
    conn?.isConnected,
    layoutDevice
  )
  if (
    layoutDevice?.connection === 'usb' &&
    layoutDevice?.type === 'deja-arduino'
  ) {
    await conn.send(conn.port, JSON.stringify([command]))
  } else if (
    layoutDevice?.connection === 'usb' &&
    layoutDevice?.type === 'deja-arduino-led'
  ) {
    await conn.send(conn.port, command)
  } else if (layoutDevice?.connection === 'wifi') {
    await conn.send(conn.topic, JSON.stringify(command))
  }
}

export async function handleEffectChange(snapshot) {
  snapshot.docChanges().forEach(async (change) => {
    if (change.type === 'modified') {
      console.log('handleEffectChange', change.type, change.doc.data())
      await handleEffect(change.doc.data())
    }
  })
}

export default {
  getEffectCommand,
  handleEffect,
  handleMacro,
  handleEffectChange,
}
