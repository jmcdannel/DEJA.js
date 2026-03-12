import { ref as vueRef, onUnmounted } from 'vue'
import {
  ref as dbRef,
  query,
  orderByChild,
  limitToLast,
  onValue,
  type Unsubscribe,
} from 'firebase/database'
import { rtdb } from '@repo/firebase-config'
import type { DccLogEntry } from './types'

/**
 * Subscribe to the dccLog RTDB path for a given layout.
 * Returns a reactive array of the last 50 log entries, ordered by timestamp.
 *
 * Uses the raw Firebase RTDB client SDK (not VueFire database module,
 * which is not registered in the cloud app).
 *
 * Note: Takes layoutId as a plain string (not reactive). The subscription
 * is created once at call time. Layout changes require a page reload.
 * This matches the spec's example and is acceptable because layout changes
 * are rare and trigger full navigation.
 */
export function useDccLog(layoutId: string) {
  const entries = vueRef<DccLogEntry[]>([])
  let unsubscribe: Unsubscribe | null = null

  function subscribe() {
    // Clean up any existing subscription
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }

    if (!layoutId) {
      entries.value = []
      return
    }

    const logQuery = query(
      dbRef(rtdb, `dccLog/${layoutId}`),
      orderByChild('timestamp'),
      limitToLast(50)
    )

    unsubscribe = onValue(logQuery, (snapshot) => {
      const result: DccLogEntry[] = []
      snapshot.forEach((child) => {
        result.push(child.val() as DccLogEntry)
      })
      entries.value = result
    })
  }

  // Subscribe immediately
  subscribe()

  // Clean up on component unmount
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  return { entries }
}
