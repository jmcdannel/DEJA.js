import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * useThrottles — real-time Firestore listener for active throttle count.
 *
 * Subscribes to `layouts/{layoutId}/throttles` and exposes the snapshot size.
 * State updates are skipped when the count is unchanged, preventing unnecessary
 * re-renders.
 *
 * @param {FirebaseFirestore.Firestore | null} db        Firestore instance
 * @param {string | null}                      layoutId  Active layout ID
 * @returns {{ throttleCount, error, cleanup }}
 */
export function useThrottles(db, layoutId) {
  const [throttleCount, setThrottleCount] = useState(0)
  const [error, setError]                 = useState(null)
  const prevCountRef = useRef(0)
  const unsubRef     = useRef(null)

  useEffect(() => {
    if (!db || !layoutId) return

    const ref = db.collection('layouts').doc(layoutId).collection('throttles')

    unsubRef.current = ref.onSnapshot(
      (snapshot) => {
        const count = snapshot.size
        if (count === prevCountRef.current) return // dedup
        prevCountRef.current = count
        setThrottleCount(count)
      },
      (err) => {
        setError(err.message || 'Firestore throttle listener error')
      }
    )

    return () => {
      if (unsubRef.current) unsubRef.current()
    }
  }, [db, layoutId])

  const cleanup = useCallback(() => {
    if (unsubRef.current) unsubRef.current()
  }, [])

  return { throttleCount, error, cleanup }
}
