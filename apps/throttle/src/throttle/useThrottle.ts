import { computed, ref, watch, isRef, type Ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useDocument } from 'vuefire'
import type { Throttle } from '@/throttle/types'
import { type Loco, useLocos } from '@repo/modules'
import { db } from '@repo/firebase-config'
import { getSignedSpeed } from '@/throttle/utils'


export const useThrottle = (address: Ref<number | null | undefined>) => {
  console.log('useThrottle', address)
  const { getLocos } = useLocos()
  const layoutId = useStorage('@DEJA/layoutId', '')

  const throttle = useDocument<Throttle>(
    () => {
      const addr = address.value
      return addr !== undefined && addr !== null
        ? doc(db, `layouts/${layoutId.value}/throttles`, addr.toString())
        : null
    }
  )

  // Derive loco from the locos collection so we use the shared `getLocos` hook
  const locos = getLocos()
  const loco = computed(() => {
    const addr = address.value
    if (addr === undefined || addr === null) return undefined
    return (locos.value || []).find((l: any) => l.address === addr) as unknown as Loco | undefined
  })
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

  function setSpeed(val: number): void {
    updateSpeed(val)
  }

  function stop() {
    updateSpeed(0)
  }

  async function releaseThrottle() {
    try {
      const addr = address.value
      if (addr === undefined || addr === null) return
      const throttleDoc = doc(db, `layouts/${layoutId.value}/throttles`, addr.toString())
      await deleteDoc(throttleDoc)
    } catch (e) {
      console.error('Error releasing throttle: ', e)
    }
  }

  async function updateSpeed(speed: number) {
    const addr = address.value
    if (addr === undefined || addr === null) return
    await setDoc(
      doc(db, `layouts/${layoutId.value}/throttles`, addr.toString()),
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
    setSpeed,
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
