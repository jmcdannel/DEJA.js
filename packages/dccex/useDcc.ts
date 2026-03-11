import { useStorage } from '@vueuse/core'
import { ref, push, set, serverTimestamp } from 'firebase/database'
import { rtdb } from '@repo/firebase-config'
import { createLogger } from '@repo/utils'

const log = createLogger('DCC')

interface DccCommand {
  action: string
  payload: unknown
}

interface DccWriteOptions {
  /** Optional callback that wraps a write with retry/queuing logic */
  enqueue?: (execute: () => Promise<void>, description: string) => Promise<void>
}

export const useDcc = (options?: DccWriteOptions) => {
  const layoutId = useStorage('@DEJA/layoutId', '')
  const isEmulated = useStorage('@DEJA/isEmulated', false)
  const isSerial = useStorage('@DEJA/layoutId', false)

  const wrappedWrite = options?.enqueue ?? ((execute: () => Promise<void>) => execute())

  async function setFunction(address: number, func: number, state: boolean) {
    try {
      await send('function', { address, func, state })
    } catch (err: unknown) {
      log.error('[DCC API].setFunction', err)
      throw err instanceof Error ? err : new Error(String(err))
    }
  }

  async function sendOutput(pin: number, state: boolean) {
    try {
      log.debug('[DCC API].sendOutput', pin, state)
      await send('output', { pin, state })
    } catch (err: unknown) {
      log.error('[DCC API].sendOutput', err)
      throw err instanceof Error ? err : new Error(String(err))
    }
  }

  async function setPower(payload: object) {
    try {
      log.debug('[DCC API].setPower', payload)
      await send('dcc', payload)
    } catch (err: unknown) {
      log.error('[DCC API].setPower', err)
      throw err instanceof Error ? err : new Error(String(err))
    }
  }

  async function sendDccCommand({
    action,
    payload,
  }: DccCommand): Promise<void> {
    await wrappedWrite(
      async () => {
        const command = {
          action,
          payload: JSON.stringify(payload),
          timestamp: serverTimestamp(),
        }

        const dccCommandsRef = ref(rtdb, `dccCommands/${layoutId.value}`)
        const newCommandRef = push(dccCommandsRef)
        await set(newCommandRef, command)
      },
      `dcc ${action}`,
    )
  }

  async function send(action: string, payload?: object): Promise<void> {
    if (isEmulated.value) {
      log.debug('[DEJA EMULATOR] send', action, payload)
      return
    } else if (isSerial.value) {
      log.debug('[DEJA SERIAL] send', action, payload)
      return
    } else {
      log.debug('[DEJA CLOUD] send', action, payload)
      await sendDccCommand({ action, payload })
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
