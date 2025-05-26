import { useStorage } from '@vueuse/core'
import { ref, push, set, serverTimestamp } from 'firebase/database'
import { rtdb } from '@repo/firebase-config/firebase'

export const useDcc = () => {
  const layoutId = useStorage('@DEJA/layoutId', 'betatrack')

  async function sendDccCommand({ action, payload }) {
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
  return {
    sendDccCommand
  }
}

export default useDcc
