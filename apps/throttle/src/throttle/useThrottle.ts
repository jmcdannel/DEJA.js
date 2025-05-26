import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import type { Throttle } from '@/throttle/types'
import { db } from '@repo/firebase-config/firebase'
import { useConnectionStore } from '@/connections/connectionStore'


export const useThrottle = (throttle?: Throttle) => {
  const connStore = useConnectionStore()
  const { layoutId } = storeToRefs(connStore)
  const currentSpeed = ref(throttle ? getSignedSpeed(throttle) : 0)

  function getSignedSpeed({speed, direction}: { speed: number, direction: boolean }): number {
    return speed && !!direction ? speed : -speed || 0
  }

  function handleThrottleChange(throttle: Throttle) {
    if (throttle) {
      const newSpeed = getSignedSpeed(throttle)
      // Only update if speeds are different to avoid loops
      if (currentSpeed.value !== newSpeed) {
        currentSpeed.value = newSpeed
      }
    }
  }

  watch(currentSpeed, (newSpeed: number) => {
    console.log('Throttle speed changed:', newSpeed)
    throttle?.address && updateSpeed(throttle?.address, newSpeed)
  })

  function adjustSpeed(val: number): void {
    currentSpeed.value = currentSpeed.value + val
  }

  function stop() {
    currentSpeed.value = 0
  }

  async function acquireThrottle(address: string | number) {
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
      return newThrottleDoc
    } catch (e) {
      console.error('Error adding throttle: ', e)
    }
  }

  async function releaseThrottle(throttleId: number) {
    try {
      await deleteDoc(
        doc(db, `layouts/${layoutId.value}/throttles`, throttleId.toString())
      )
    } catch (e) {
      console.error('Error releasing throttle: ', e)
    }
  }

  async function updateSpeed(
    address: number,
    speed: number,
  ) {
    if (!address) {
      return
    }
    await setDoc(
      doc(db, `layouts/${layoutId.value}/throttles`, address.toString()),
      {
        direction: speed > 0,
        speed: Math.abs(speed),
        timestamp: serverTimestamp(),
      },
      { merge: true }
    )
    // let delay = 0

    // if (newSpeed > 0 && oldSpeed < 0) {
    //   //change direction to forward
    //   stop(address, consist)
    //   delay = SWITCH_DIR_DELAY
    // } else if (newSpeed < 0 && oldSpeed > 0) {
    //   //change direction to reverse
    //   stop(address, consist)
    //   delay = SWITCH_DIR_DELAY
    // }

    // if (newSpeed === 0) {
    //   dccApi.setSpeed(address, 0)
    // } else {
    //   // set speed
    //   setTimeout(() => {
    //     dccApi.setSpeed(address, newSpeed)
    //   }, delay)
    // }
  }


  return {
    acquireThrottle,
    adjustSpeed,
    currentSpeed,
    getSignedSpeed,
    handleThrottleChange,
    releaseThrottle,
    stop,
    updateSpeed,
  }
}

export default useThrottle
