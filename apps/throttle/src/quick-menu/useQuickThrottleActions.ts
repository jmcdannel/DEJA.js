import { useStorage } from '@vueuse/core'
import { deleteDoc, doc, setDoc } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { useCommandQueue } from '@/composables/useCommandQueue'
import { wiThrottleService } from '@/services/WiThrottleService'
import type { Throttle } from '@/throttle/types'
import { getSignedSpeed } from '@/throttle/utils'

export function useQuickThrottleActions() {
  const layoutId = useStorage('@DEJA/layoutId', '')
  const { enqueue } = useCommandQueue()

  function getThrottleDocRef(address: number) {
    return doc(db, `layouts/${layoutId.value}/throttles`, address.toString())
  }

  async function setSpeed(address: number, speed: number) {
    await wiThrottleService.setThrottleSpeed(address, Math.abs(speed), speed >= 0)
    await enqueue(
      async () => {
        await setDoc(
          getThrottleDocRef(address),
          { direction: speed >= 0, speed: Math.abs(speed) },
          { merge: true },
        )
      },
      `qm throttle ${address} speed ${speed}`,
    )
  }

  async function stop(address: number) {
    await setSpeed(address, 0)
  }

  async function adjustSpeed(address: number, amount: number, throttle: Throttle) {
    const current = getSignedSpeed({ speed: throttle.speed, direction: throttle.direction })
    await setSpeed(address, current + amount)
  }

  async function park(address: number) {
    await wiThrottleService.releaseLoco(address)
    await enqueue(
      async () => {
        await deleteDoc(getThrottleDocRef(address))
      },
      `qm release throttle ${address}`,
    )
  }

  return { stop, adjustSpeed, park }
}
