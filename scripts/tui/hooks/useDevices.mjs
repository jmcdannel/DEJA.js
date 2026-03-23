import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * useDevices — real-time Firestore listener for layout devices.
 *
 * Subscribes to `layouts/{layoutId}/devices` and tracks connected/total counts.
 * Snapshot deduplication: each snapshot is fingerprinted by device IDs, connection
 * states, ports, and topics. State updates are skipped when the fingerprint is
 * unchanged, preventing unnecessary re-renders.
 *
 * @param {FirebaseFirestore.Firestore | null} db        Firestore instance
 * @param {string | null}                      layoutId  Active layout ID
 * @returns {{ devices, connectedCount, totalCount, error, cleanup }}
 */
export function useDevices(db, layoutId) {
  const [devices, setDevices]               = useState([])
  const [connectedCount, setConnectedCount] = useState(0)
  const [totalCount, setTotalCount]         = useState(0)
  const [error, setError]                   = useState(null)
  const fingerprintRef = useRef('')
  const unsubRef       = useRef(null)

  useEffect(() => {
    if (!db || !layoutId) return

    const ref = db.collection('layouts').doc(layoutId).collection('devices')

    unsubRef.current = ref.onSnapshot(
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        // Fingerprint: device IDs + connection states + ports + topics
        const fingerprint = docs
          .map(d =>
            `${d.id}:${d.isConnected || d.connected || false}:${d.port || ''}:${d.topic || ''}`
          )
          .sort()
          .join('|')

        if (fingerprint === fingerprintRef.current) return // dedup
        fingerprintRef.current = fingerprint

        setDevices(docs)
        const connected = docs.filter(d => d.isConnected || d.connected).length
        setConnectedCount(connected)
        setTotalCount(docs.length)
      },
      (err) => {
        setError(err.message || 'Firestore device listener error')
      }
    )

    return () => {
      if (unsubRef.current) unsubRef.current()
    }
  }, [db, layoutId])

  const cleanup = useCallback(() => {
    if (unsubRef.current) unsubRef.current()
  }, [])

  return { devices, connectedCount, totalCount, error, cleanup }
}
