import { useStorage } from '@vueuse/core'
import { ref, push, set, serverTimestamp } from 'firebase/database'
import { rtdb } from '@repo/firebase-config'
import { getAuth } from 'firebase/auth'
import { createLogger, DEMO_EMAIL } from '@repo/utils'

function isDemoUser(): boolean {
  return getAuth().currentUser?.email === DEMO_EMAIL
}

const log = createLogger('DejaJS')

interface DejaCommand {
  action: string
  payload: unknown
}

interface DejaWriteOptions {
  /** Optional callback that wraps a write with retry/queuing logic */
  enqueue?: (execute: () => Promise<void>, description: string) => Promise<void>
}

export const useDejaJS = (options?: DejaWriteOptions) => {
  const layoutId = useStorage('@DEJA/layoutId', '')

  const wrappedWrite = options?.enqueue ?? ((execute: () => Promise<void>) => execute())

  async function sendDejaCommand({ action, payload }: DejaCommand) {
    if (isDemoUser()) {
      log.debug('[DEJA DEMO] skipping RTDB write:', action, payload)
      return
    }
    await wrappedWrite(
      async () => {
        const commandsRef = ref(rtdb, `dejaCommands/${layoutId.value}`)
        const newCommandRef = push(commandsRef)
        await set(newCommandRef, {
          action,
          payload: JSON.stringify(payload),
          timestamp: serverTimestamp(),
        })
      },
      `deja ${action}`,
    )
  }
  return {
    sendDejaCommand,
  }
}

export default useDejaJS
