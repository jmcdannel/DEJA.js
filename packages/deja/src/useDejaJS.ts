import { useStorage } from '@vueuse/core'
import { ref, push, set, serverTimestamp } from 'firebase/database'
import { rtdb } from '@repo/firebase-config/firebase'

interface DejaCommand {
  action: string
  payload: any
}

export const useDejaJS = () => {
  const layoutId = useStorage('@DEJA/layoutId', 'betatrack')

  async function sendDejaCommand({ action, payload }: DejaCommand) {
    // console.log('dejaCloud SEND', action, payload)
    try {

      const commandsRef = ref(rtdb, `dejaCommands/${layoutId.value}`)
      const newCommandRef = push(commandsRef)
      set(newCommandRef, {
        action,
        payload: JSON.stringify(payload),
        timestamp: serverTimestamp(),
      })
    } catch (e) {
      console.error('Error adding document: ', e)
    }
  }
  return {
    sendDejaCommand
  }
}

export default useDejaJS
