import { useStorage } from '@vueuse/core'
import { ref, push, set, serverTimestamp } from 'firebase/database'
import { rtdb } from '@repo/firebase-config/firebase'

export const useDejaJS = () => {
  const layoutId = useStorage('@DEJA/layoutId', 'betatrack')

  async function sendDejaCommand({ action, payload }) {
    // console.log('dejaCloud SEND', action, payload)
    try {
      const command = {
        action,
        payload: JSON.stringify(payload),
        timestamp: serverTimestamp(),
      }

      const commandsRef = ref(rtdb, `dejaCommands/${layoutId.value}`)
      const newCommandRef = push(commandsRef)
      set(newCommandRef, command)
    } catch (e) {
      console.error('Error adding document: ', e)
    }
  }
  return {
    sendDejaCommand
  }
}

export default useDejaJS
