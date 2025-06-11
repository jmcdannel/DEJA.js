import { ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useDocument } from 'vuefire'
import type { Throttle } from '@/throttle/types'
import { useLocos } from '@repo/modules/locos'
import { db } from '@repo/firebase-config/firebase'
import { getSignedSpeed } from '@/throttle/utils'

export const useThrottle = (address: Number) => {
  const layoutId = useStorage('@DEJA/layoutId', '')
  const liveThrottle = useDocument(
    () => address
      ? doc(db, `layouts/${layoutId.value}/throttles`, address.toString())
      : null
  )
  const throttle = liveThrottle.value as Throttle
  const currentSpeed = ref(throttle ? getSignedSpeed(throttle) : 0)
  const { getLoco } = useLocos()
  const loco = getLoco(address)

  function handleThrottleChange(addres: Throttle) {
    if (throttle) {
      const newSpeed = getSignedSpeed(throttle)
      // Only update if speeds are different to avoid loops
      if (currentSpeed.value !== newSpeed) {
        currentSpeed.value = newSpeed
      }
    }
  }

  // watch(currentSpeed, (newSpeed: number) => {
  //   console.log('Throttle speed changed:', newSpeed)
  //   throttle?.address && updateSpeed(throttle?.address, newSpeed)
  // })

  function adjustSpeed(val: number): void {
    currentSpeed.value = currentSpeed.value + val
  }

  function stop() {
    currentSpeed.value = 0
  }

  async function releaseThrottle(throttleId?: number) {
    try {
      const id = throttleId || throttle?.address
      if (!id) {
        console.warn('No throttle ID provided for release')
        return
      }
      const throttleDoc = doc(
        db,
        `layouts/${layoutId.value}/throttles`,
        id.toString()
      )
      await deleteDoc(throttleDoc)
    } catch (e) {
      console.error('Error releasing throttle: ', e)
    }
  }

  async function updateSpeed(address: number, speed: number) {
    if (!address) {
      return
    }
    await setDoc(
      doc(db, `layouts/${layoutId.value}/throttles`, address.toString()),
      {
        direction: speed > 0,
        speed: Math.abs(speed),
        // timestamp: serverTimestamp(),
      },
      { merge: true }
    )
  }

  return {
    adjustSpeed,
    currentSpeed,
    getSignedSpeed,
    handleThrottleChange,
    liveThrottle,
    loco,
    releaseThrottle,
    stop,
    throttle,
    updateSpeed,
  }
}

export default useThrottle
