import { computed, ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useDocument } from 'vuefire'
import type { Throttle } from '@/throttle/types'
import { type Loco, useLocos } from '@repo/modules/locos'
import { db } from '@repo/firebase-config/firebase'
import { getSignedSpeed } from '@/throttle/utils'


export const useThrottle = (address: Number) => {
  const { getLoco } = useLocos()
  const layoutId = useStorage('@DEJA/layoutId', '')
  const throttle = useDocument<Throttle>(
    () => address
      ? doc(db, `layouts/${layoutId.value}/throttles`, address.toString())
      : null
  )
  const loco = getLoco(address)
  const currentSpeed = computed(() => throttle.value ? getSignedSpeed({
    speed: throttle.value?.speed,
    direction: throttle.value?.direction
  }) : 0)
  const direction = computed(() => currentSpeed.value > -1 ? true : false)

  watch(currentSpeed, (newSpeed: number) => {
    updateSpeed(newSpeed)
  })

  function adjustSpeed(val: number): void {
    updateSpeed(currentSpeed.value + val)
  }

  function stop() {
    updateSpeed(0)
  }

  async function releaseThrottle() {
    try {
      const throttleDoc = doc(
        db,
        `layouts/${layoutId.value}/throttles`,
        address.toString()
      )
      await deleteDoc(throttleDoc)
    } catch (e) {
      console.error('Error releasing throttle: ', e)
    }
  }

  async function updateSpeed(speed: number) {
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
    direction,
    loco: loco as unknown as Loco,
    releaseThrottle,
    stop,
    throttle: throttle as unknown as Throttle,
    updateSpeed,
  }
}

export default useThrottle
