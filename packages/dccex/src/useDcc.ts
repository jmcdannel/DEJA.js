import { useStorage } from '@vueuse/core'
import { ref, push, set, serverTimestamp } from 'firebase/database'
import { rtdb } from '@repo/firebase-config/firebase'

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
      console.error('[DCC API].setPower', err)
      throw new Error(err)
    }
  }

  async function sendOutput(pin: any, state: any) {
    try {
      console.log('[DCC API].sendOutput', pin, state)
      await send('output', { pin, state })
    } catch (err: any) {
      console.error('[DCC API].setPower', err)
      throw new Error(err)
    }
  }

  async function setPower(payload: object) {
    try {
      console.log('[DCC API].setPower', payload)
      await send('dcc', payload)
    } catch (err: any) {
      console.error('[DCC API].setPower', err)
      throw new Error(err)
    }
  }

  async function sendDccCommand({
    action,
    payload,
  }: DccCommand): Promise<void> {
    // console.log('dejaCloud SEND', action, payload)
    try {
      const command = {
        action,
        payload: JSON.stringify(payload),
        timestamp: serverTimestamp(),
      }

      const dccCommandsRef = ref(rtdb, `dccCommands/${layoutId.value}`)
      const newCommandRef = push(dccCommandsRef)
      set(newCommandRef, command)
      // console.log('Document written with ID: ', command)
    } catch (e) {
      console.error('Error adding document: ', e)
    }
  }

  async function send(action: string, payload?: object): Promise<void> {
    try {
      if (isEmulated.value) {
        console.log('[DEJA EMULATOR] send', action, payload)
        return
      } else if (isSerial.value) {
        console.log('[DEJA SERIAL] send', action, payload)
        return
      } else {
        console.log('[DEJA CLOUD] send', action, payload)
        sendDccCommand({ action, payload })
        return
      }
    } catch (err) {
      console.error('[DCC API].send', err)
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
