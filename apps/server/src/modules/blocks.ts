import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type DocumentData,
  type DocumentChange,
  type QuerySnapshot,
} from 'firebase/firestore'
import { getDb } from '../lib/firebase-client.js'
import { log } from '../utils/logger'
import { broadcast } from '../broadcast'

const layoutId = process.env.LAYOUT_ID

export async function updateBlockOccupancy(blockId: string): Promise<void> {
  if (!layoutId) return

  try {
    const db = getDb()
    const blockDoc = await getDoc(doc(db, `layouts/${layoutId}/blocks/${blockId}`))

    if (!blockDoc.exists()) return

    const block = blockDoc.data()
    const sensorIds: string[] = block?.sensorIds || []

    if (sensorIds.length === 0) return

    // Check if any sensor in this block is active
    let occupied = false
    for (const sensorId of sensorIds) {
      const sensorDoc = await getDoc(doc(db, `layouts/${layoutId}/sensors/${sensorId}`))
      if (sensorDoc.exists() && sensorDoc.data()?.state) {
        occupied = true
        break
      }
    }

    // Update block occupancy
    await setDoc(
      doc(db, `layouts/${layoutId}/blocks/${blockId}`),
      { occupied, timestamp: serverTimestamp() },
      { merge: true },
    )

    // Broadcast to WebSocket clients
    broadcast({
      action: 'block',
      payload: { id: blockId, occupied },
    })

    log.log(`[BLOCKS] Block ${blockId} occupancy: ${occupied}`)
  } catch (error) {
    log.error(`[BLOCKS] Failed to update block ${blockId}:`, error)
  }
}

export async function handleBlockChange(snapshot: QuerySnapshot<DocumentData>): Promise<void> {
  if (!snapshot || !snapshot.docChanges) return

  snapshot.docChanges().forEach(async (change: DocumentChange<DocumentData>) => {
    if (change.type === 'modified') {
      const block = { id: change.doc.id, ...change.doc.data() } as { id: string; occupied?: boolean }
      log.log('[BLOCKS] Block modified', block.id, block.occupied)
      broadcast({
        action: 'block',
        payload: { id: block.id, occupied: block.occupied },
      })
    }
  })
}

export default { updateBlockOccupancy, handleBlockChange }
