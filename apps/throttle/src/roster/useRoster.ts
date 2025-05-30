import { useStorage } from '@vueuse/core'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@repo/firebase-config/firebase'

export const useRoster = () => {
  const layoutId = useStorage('@DEJA/layoutId', '')

  async function acquireThrottle(address: number) {
    try {
      if (!address) {
        console.warn('No throttle address provided for acquisition')
        return
      }
      const data = {
        address,
        speed: 0,
        direction: false,
        timestamp: serverTimestamp(),
      }
      const newThrottleDoc = await setDoc(
        doc(db, `layouts/${layoutId.value}/throttles`, address.toString()),
        data
      )
      return newThrottleDoc
    } catch (e) {
      console.error('Error adding throttle: ', e)
    }
  }

  return {
    acquireThrottle,
  }
}

export default useRoster
