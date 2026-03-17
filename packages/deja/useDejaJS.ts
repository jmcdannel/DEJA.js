import { useStorage } from '@vueuse/core'
import { ref, push, set, serverTimestamp } from 'firebase/database'
import { rtdb } from '@repo/firebase-config'
import { createLogger } from '@repo/utils'

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
