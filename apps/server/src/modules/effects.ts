import type { Effect, MacroItem } from '@repo/modules'
import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import { db } from '@repo/firebase-config/firebase-admin-node'
import { log } from '../utils/logger.js'
import { dcc, type OutputPayload } from '../lib/dcc.js'
import { layout } from './layout.js'
import { soundCommand } from '../lib/sound.js'

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

const layoutId = process.env.LAYOUT_ID || 'betatrack'

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
  const range = effect?.range || 'all'
  const config = effect?.config || '{}'
  const command = `${pin}, ${pattern}, ${range}, ${config}\n`
  return command
}

async function getEffect(id: string): Promise<Effect | undefined> {
  if (!layoutId) {
    log.error('Layout ID is not set')
    return undefined
  }
  if (!id) {
    log.error('Effect ID is not provided')
    return undefined
  }
  const effectData = await db.collection('layouts').doc(layoutId)
    .collection('effects').doc(id).get()
  return { id: effectData.id, ...effectData.data() } as Effect
}

export function getEffectCommand(
  efx: Effect
): EffectCommand | string | any {
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
      case 'sound':
        return soundCommand(efx)
      // case 'serial-ialed':
      //   return [ialedCommand(effect)]
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
    db.collection('layouts').doc(layoutId).collection('turnouts').doc(item.id.toString()).set({
      state: item.state,
      timestamp: FieldValue.serverTimestamp(),
    }, { merge: true })
    // log.log('handleMacroItem turnout', item)
  } else if (item.type === 'effect' && item.id) {
    db.collection('layouts').doc(layoutId).collection('effects').doc(item.id.toString()).set({
      state: item.state,
      timestamp: FieldValue.serverTimestamp(),
    }, { merge: true })

  } else if (
    item.type === 'throttle' &&
    macroState === state &&
    item.id &&
    item.speed !== undefined
  ) {
    // log.log('handleMacroItem throttle', item)
    db.collection('layouts').doc(layoutId).collection('throttles').doc(item.id.toString()).set({
      direction: item?.direction === 'forward',
      speed: item.speed,
      timestamp: FieldValue.serverTimestamp(),
    }, { merge: true })
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
  
  // Handle sound effects - only play on DEJA Server device
  if (payload.type === 'sound') {
    try {
      // Device is required for sound effects
      if (!payload.device) {
        log.error('Device field is required for sound effects:', payload)
        return
      }
      
      // Only allow sound effects on DEJA Server device
      if (payload.device !== 'deja-server') {
        log.error('Sound effects can only be played on DEJA Server device:', { 
          requestedDevice: payload.device, 
          effectId: payload.id 
        })
        return
      }
      
      // Use soundBlobUrl if available, otherwise fall back to sound field
      const soundUrl = (payload as any).soundBlobUrl || payload.sound
      
      if (!soundUrl) {
        log.error('No sound URL available for sound effect:', payload)
        return
      }
      
      log.log('Processing sound effect on DEJA Server:', { 
        soundUrl: soundUrl, 
        state: payload.state,
        hasBlobUrl: !!(payload as any).soundBlobUrl,
        device: payload.device
      })
      
      // Import and use the playSound function
      const { playSound, stopSound } = await import('../lib/sound.js')
      
      if (payload.state) {
        // Play the sound
        await playSound(soundUrl)
      } else {
        // Stop the sound
        await stopSound(soundUrl)
      }
    } catch (error) {
      log.error('Error playing sound effect:', error)
    }
    return
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
    conn.send(conn, JSON.stringify(command))
  } else if (
    layoutDevice?.connection === 'usb' &&
    layoutDevice?.type === 'deja-arduino-led' &&
    conn.send &&
    conn.port
  ) {
    conn.send(conn, command)
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
