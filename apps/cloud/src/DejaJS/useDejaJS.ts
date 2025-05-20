import { collection, serverTimestamp, addDoc } from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { db } from '@/firebase'

export const useDejaJS = () => {
  const layoutId = useStorage('@DEJA/cloud/layoutId', 'betatrack')

  async function sendDejaCommand({ action, payload }) {
    // console.log('dejaCloud SEND', action, payload)
    try {
      const command = {
        action,
        payload,
        timestamp: serverTimestamp(),
      }

      const result = await addDoc(
        collection(db, `layouts/${layoutId.value}/dejaCommands`),
        command
      )
      console.log('Document written with ID: ', result, command)
    } catch (e) {
      console.error('Error adding document: ', e)
    }
  }
  return {
    sendDejaCommand,
  }
}

export default useDejaJS
