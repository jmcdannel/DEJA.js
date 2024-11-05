import log from './utils/logger.mjs'
import layout from './layout.mjs'
import { getMacroCommand } from './macro.mjs'

const pinCommand = (effect) => ({
  device: effect?.device,
  action: 'pin',
  payload: {
    pin: effect?.pin,
    state: effect.state,
  },
})

export function getEffectCommand(efx) {
  try {
    switch (efx?.type) {
      case 'light':
      case 'frog':
      case 'relay':
      case 'pin':
      case 'led':
      case 'power':
        return pinCommand(efx)
      // case 'ialed':
      //   return [ialedCommand(effect)]
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

export async function handleMacro({ macro }) {
  log.log('handleMacroCommand', macro)

  Object.keys(macro).forEach(async (deviceId) => {
    const conn = layout.connections()?.[deviceId]
    if (conn?.isConnected) {
      const commands = getMacroCommand(
        macro[deviceId]?.effects,
        macro[deviceId]?.turnouts
      )
      log.log('macro commands', commands, deviceId)
      await conn.send(conn.port, JSON.stringify(commands))
    } else {
      log.error('Device not connected', conn, layout.connections, deviceId)
    }
  })
}

export async function handleEffect(payload) {
  log.log(layout.connections())
  const conn = layout.connections()?.[payload.device]
  if (!conn?.isConnected) {
    log.error('Device not connected', payload.device)
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
  if (layoutDevice?.connection === 'usb') {
    await conn.send(conn.port, JSON.stringify([command]))
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
