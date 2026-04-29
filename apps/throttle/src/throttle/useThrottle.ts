import { computed, watch, type Ref, type MaybeRef } from 'vue'
import { useStorage } from '@vueuse/core'
import { deleteDoc, doc, setDoc } from 'firebase/firestore'
import { useDocument } from 'vuefire'
import { type Loco, useLocos } from '@repo/modules'
import { db } from '@repo/firebase-config'
import { createLogger } from '@repo/utils'
import { getSignedSpeed } from '@/throttle/utils'
import type { Throttle } from '@/throttle/types'
import { useCommandQueue } from '@/composables/useCommandQueue'

const log = createLogger('Throttle')

export const useThrottle = (address: Ref<number | null | undefined>) => {
  log.debug('useThrottle', address.value)
  const { getLocos } = useLocos()
  const layoutId = useStorage('@DEJA/layoutId', '')
  const { enqueue } = useCommandQueue()

  const docRef = computed(() =>
    address.value
      ? doc(db, `layouts/${layoutId.value}/throttles`, address.value.toString())
      : null
  )
  const throttle = useDocument<Throttle>(docRef)

  log.debug('throttle doc ref:', throttle)

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

    const newSpeed = Math.abs(speed)
    const newDirection = speed > 0

    // 🛡️ Dedup guard — skip writes that would not change the server state.
    // Prevents feedback loops between multiple throttle tabs/browsers watching
    // the same doc where a local reactive chain bounces echoes back as writes.
    // At speed 0, direction is meaningless — any speed-0 write with matching speed is a no-op.
    const current = throttle.value as Throttle | undefined
    if (current && current.speed === newSpeed) {
      if (newSpeed === 0 || current.direction === newDirection) return
    }

    // 🔬 DEBUG INSTRUMENTATION — remove after multi-instance bug is fixed
    const tabId = ((): string => {
      const w = window as unknown as { __DEJA_TAB_ID__?: string }
      if (!w.__DEJA_TAB_ID__) w.__DEJA_TAB_ID__ = Math.random().toString(36).slice(2, 8)
      return w.__DEJA_TAB_ID__
    })()
    const counter = ((): number => {
      const w = window as unknown as { __DEJA_WRITE_COUNT__?: number }
      w.__DEJA_WRITE_COUNT__ = (w.__DEJA_WRITE_COUNT__ ?? 0) + 1
      return w.__DEJA_WRITE_COUNT__
    })()
    const stack = new Error('trace').stack?.split('\n').slice(2, 7).join('\n')
    // eslint-disable-next-line no-console
    console.warn(`🚨 [tab ${tabId} #${counter}] updateSpeed(addr=${addr} speed=${speed})\n${stack}`)

    await enqueue(
      async () => {
        await setDoc(
          doc(db, `layouts/${layoutId.value}/throttles`, addr.toString()),
          {
            direction: newDirection,
            speed: newSpeed,
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
