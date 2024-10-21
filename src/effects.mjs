import log from './utils/logger.mjs'
const pinCommand = effect => ({ 
  iFaceId: effect?.interface,
  action: 'pin', 
  payload: { 
    pin: effect?.pin,
    state: effect.state
  }
});

async function handleEffect(efx) {
  try {    
    const command = await getCommand(efx)
    return command
  } catch (err) {
    log.error('[COMMANDS] turnoutCommand', err)
  }
}

export async function getCommand(efx) {
  try {    
    switch(efx?.type) {
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
      // case 'macro':
      //   const macroCommands = await macroCommand(effect)
      //   return macroCommands;
      default: 
        // no op
        break
    }
  } catch (err) {
    log.error('[EFFECTS] getCommand', err)
  }
}

export default {
  getCommand,
  handleEffect
}