import { storeToRefs } from 'pinia'
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useDcc } from '@/api/dccApi'
import { db } from '@/firebase'
import { useConnectionStore } from '@/connections/connectionStore'
import type { ConsistLoco } from './types'

const SWITCH_DIR_DELAY = 1000 // delay in ms to switch direction - occurs when slider goes from positive to negative value - which an occur quickly

export const useThrottle = () => {
  const dccApi = useDcc()
  const connStore = useConnectionStore()
  const { layoutId } = storeToRefs(connStore)

  async function acquireThrottle(address: string | number) {
    console.log('useThrottle aquireThrottle', address)
    try {
      const data = {
        address: parseInt(address.toString()),
        speed: 0,
        direction: false,
        timestamp: serverTimestamp(),
      }
      const newThrottleDoc = await setDoc(
        doc(db, `layouts/${layoutId.value}/throttles`, address.toString()),
        data
      )
      console.log('throttle written with ID: ', newThrottleDoc)
      return newThrottleDoc
    } catch (e) {
      console.error('Error adding throttle: ', e)
    }
  }

  async function releaseThrottle(throttleId: number) {
    try {
      console.log('dejaCloud releaseThrottle', throttleId)
      await deleteDoc(
        doc(db, `layouts/${layoutId.value}/throttles`, throttleId.toString())
      )
    } catch (e) {
      console.error('Error releasing throttle: ', e)
    }
  }

  async function updateSpeed(
    address: number,
    consist: ConsistLoco[],
    newSpeed: number,
    oldSpeed: number
  ) {
    if (!address) {
      return
    }
    let delay = 0

    if (newSpeed > 0 && oldSpeed < 0) {
      //change direction to forward
      stop(address, consist)
      delay = SWITCH_DIR_DELAY
    } else if (newSpeed < 0 && oldSpeed > 0) {
      //change direction to reverse
      stop(address, consist)
      delay = SWITCH_DIR_DELAY
    }

    if (newSpeed === 0) {
      dccApi.setSpeed(address, 0)
    } else {
      // set speed
      setTimeout(() => {
        dccApi.setSpeed(address, newSpeed)
      }, delay)
    }
  }

  function stop(address: number, consist: ConsistLoco[]) {
    dccApi.setSpeed(address, 0)
  }

  return {
    acquireThrottle,
    releaseThrottle,
    updateSpeed,
  }
}

export default useThrottle
