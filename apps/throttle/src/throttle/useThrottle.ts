import { computed, onMounted, onUnmounted, watch, type Ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { deleteDoc, doc, setDoc } from 'firebase/firestore'
import { useDocument } from 'vuefire'
import { type Loco, useLocos } from '@repo/modules'
import { db } from '@repo/firebase-config'
import { createLogger } from '@repo/utils'
import { getSignedSpeed } from '@/throttle/utils'
import type { Throttle } from '@/throttle/types'
import { useCommandQueue } from '@/composables/useCommandQueue'
import { wiThrottleService } from '@/services/WiThrottleService'

const log = createLogger('Throttle')

export const useThrottle = (address: Ref<number | null | undefined>) => {
  log.debug('useThrottle', address.value)
  const { getLocos } = useLocos()
  const layoutId = useStorage('@DEJA/layoutId', '')
  const { enqueue } = useCommandQueue()

  const throttle = useDocument<Throttle>(
    address.value
        ? doc(db, `layouts/${layoutId.value}/throttles`, address.value.toString())
        : null
  )

  log.debug('throttle doc ref:', throttle)

  // Acquire the loco on WiThrottle server when connected
  async function acquireOnWiThrottle() {
    const addr = address.value
    if (addr !== undefined && addr !== null && wiThrottleService.state.value === 'CONNECTED') {
      await wiThrottleService.acquireLoco(addr)
    }
  }

  onMounted(acquireOnWiThrottle)

  // Re-acquire if WiThrottle connects after the throttle is already mounted
  const stopWiThrottleWatch = watch(() => wiThrottleService.state.value, (state) => {
    if (state === 'CONNECTED') {
      acquireOnWiThrottle()
    }
  })

  onUnmounted(() => {
    stopWiThrottleWatch()
  })

  // Derive loco from the locos collection so we use the shared `getLocos` hook
  const locos = getLocos()
  const loco = computed(() => {
    const addr = address.value
    if (addr === undefined || addr === null) return undefined
    return (locos.value as Loco[] || []).find((l) => l.address === addr)
  })
  const currentSpeed = computed(() => throttle.value ? getSignedSpeed({
    speed: throttle.value?.speed,
    direction: throttle.value?.direction
  }) : 0)
  const direction = computed(() => currentSpeed.value > -1)

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
    const addr = address.value
    if (addr === undefined || addr === null) return
    await wiThrottleService.releaseLoco(addr)
    await enqueue(
      async () => {
        const throttleDoc = doc(db, `layouts/${layoutId.value}/throttles`, addr.toString())
        await deleteDoc(throttleDoc)
      },
      `release throttle ${addr}`,
    )
  }

  async function updateSpeed(speed: number) {
    const addr = address.value
    if (addr === undefined || addr === null) return
    await wiThrottleService.setThrottleSpeed(addr, Math.abs(speed), speed >= 0)
    await enqueue(
      async () => {
        await setDoc(
          doc(db, `layouts/${layoutId.value}/throttles`, addr.toString()),
          {
            direction: speed > 0,
            speed: Math.abs(speed),
          },
          { merge: true },
        )
      },
      `throttle ${addr} speed ${speed}`,
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
