import { useStorage } from '@vueuse/core'
import { ref, push, set, serverTimestamp } from 'firebase/database'
import { rtdb } from '@repo/firebase-config'
import { createLogger } from '@repo/utils'

const log = createLogger('DCC')

interface DccCommand {
  action: string
  payload: any
}

export const useDcc = () => {
  const layoutId = useStorage('@DEJA/layoutId', '')
  const isEmulated = useStorage('@DEJA/isEmulated', false)
  const isSerial = useStorage('@DEJA/layoutId', false)

  async function setFunction(address: any, func: any, state: any) {
    try {
      await send('function', { address, func, state })
    } catch (err: any) {
      log.error('[DCC API].setPower', err)
      throw new Error(err)
    }
  }

  async function sendOutput(pin: any, state: any) {
    try {
      log.debug('[DCC API].sendOutput', pin, state)
      await send('output', { pin, state })
    } catch (err: any) {
      log.error('[DCC API].setPower', err)
      throw new Error(err)
    }
  }

  async function setPower(payload: object) {
    try {
      log.debug('[DCC API].setPower', payload)
      await send('dcc', payload)
    } catch (err: any) {
      log.error('[DCC API].setPower', err)
      throw new Error(err)
    }
  }

  async function sendDccCommand({
    action,
    payload,
  }: DccCommand): Promise<void> {
    // log.debug('dejaCloud SEND', action, payload)
    try {
      const command = {
        action,
        payload: JSON.stringify(payload),
        timestamp: serverTimestamp(),
      }

      const dccCommandsRef = ref(rtdb, `dccCommands/${layoutId.value}`)
      const newCommandRef = push(dccCommandsRef)
      set(newCommandRef, command)
      // log.debug('Document written with ID: ', command)
    } catch (e) {
      log.error('Error adding document: ', e)
    }
  }

  async function send(action: string, payload?: object): Promise<void> {
    try {
      if (isEmulated.value) {
        log.debug('[DEJA EMULATOR] send', action, payload)
        return
      } else if (isSerial.value) {
        log.debug('[DEJA SERIAL] send', action, payload)
        return
      } else {
        log.debug('[DEJA CLOUD] send', action, payload)
        sendDccCommand({ action, payload })
        return
      }
    } catch (err) {
      log.error('[DCC API].send', err)
    }
  }

  return {
    sendDccCommand,
    send,
    setPower,
    setFunction,
    sendOutput,
  }
}

export default useDcc
