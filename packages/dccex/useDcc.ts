import { useStorage } from '@vueuse/core'
import { ref, push, set, serverTimestamp } from 'firebase/database'
import { rtdb } from '@repo/firebase-config'
import { createLogger } from '@repo/utils'
import { getAuth } from 'firebase/auth'
import { createMockResponder } from './mockResponses'

const DEMO_EMAIL = 'demo@dejajs.com'
function isDemoUser(): boolean {
  return getAuth().currentUser?.email === DEMO_EMAIL
}

const log = createLogger('DCC')

interface DccCommand {
  action: string
  payload: unknown
}

interface DccWriteOptions {
  /** Optional callback that wraps a write with retry/queuing logic */
  enqueue?: (execute: () => Promise<void>, description: string) => Promise<void>
}

let _mockResponder: ReturnType<typeof createMockResponder> | null = null

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
    if (isDemoUser()) {
      if (!_mockResponder) _mockResponder = createMockResponder()
      log.debug('[DEJA DEMO] send', action, payload)
      await _mockResponder.handleCommand(action, payload)
      return
    } else if (isEmulated.value) {
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

  async function syncRosterEntry(
    address: number,
    name: string,
    functions?: Array<{ id: number; label: string }>,
  ): Promise<void> {
    try {
      log.debug('[DCC API].syncRosterEntry', address, name)
      await send('syncRoster', { locos: [{ address, name, functions }] })
    } catch (err: unknown) {
      log.error('[DCC API].syncRosterEntry', err)
      throw err instanceof Error ? err : new Error(String(err))
    }
  }

  async function syncAllRoster(
    locos: Array<{ address: number; name: string; functions?: Array<{ id: number; label: string }> }>,
  ): Promise<void> {
    try {
      log.debug('[DCC API].syncAllRoster', locos.length, 'locos')
      await send('syncRoster', { locos })
    } catch (err: unknown) {
      log.error('[DCC API].syncAllRoster', err)
      throw err instanceof Error ? err : new Error(String(err))
    }
  }

  async function importRoster(): Promise<void> {
    try {
      log.debug('[DCC API].importRoster')
      await send('importRoster', {})
    } catch (err: unknown) {
      log.error('[DCC API].importRoster', err)
      throw err instanceof Error ? err : new Error(String(err))
    }
  }

  return {
    sendDccCommand,
    send,
    setPower,
    setFunction,
    sendOutput,
    syncRosterEntry,
    syncAllRoster,
    importRoster,
  }
}

export default useDcc
