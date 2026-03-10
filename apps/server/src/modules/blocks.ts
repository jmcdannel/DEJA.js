import { FieldValue } from 'firebase-admin/firestore'
import { db } from '@repo/firebase-config/firebase-admin-node'
import { log } from '../utils/logger'
import { broadcast } from '../broadcast'

const layoutId = process.env.LAYOUT_ID

export async function updateBlockOccupancy(blockId: string): Promise<void> {
  if (!layoutId) return

  try {
    const blockDoc = await db.collection('layouts').doc(layoutId)
      .collection('blocks').doc(blockId).get()

    if (!blockDoc.exists) return

    const block = blockDoc.data()
    const sensorIds: string[] = block?.sensorIds || []

    if (sensorIds.length === 0) return

    // Check if any sensor in this block is active
    let occupied = false
    for (const sensorId of sensorIds) {
      const sensorDoc = await db.collection('layouts').doc(layoutId)
        .collection('sensors').doc(sensorId).get()
      if (sensorDoc.exists && sensorDoc.data()?.state) {
        occupied = true
        break
      }
    }

    // Update block occupancy
    await db.collection('layouts').doc(layoutId).collection('blocks').doc(blockId)
      .set({ occupied, timestamp: FieldValue.serverTimestamp() }, { merge: true })

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Firestore snapshot type
export async function handleBlockChange(snapshot: any): Promise<void> {
  if (!snapshot || !snapshot.docChanges) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Firestore document change type
  snapshot.docChanges().forEach(async (change: any) => {
    if (change.type === 'modified') {
      const block = { id: change.doc.id, ...change.doc.data() }
      log.log('[BLOCKS] Block modified', block.id, block.occupied)
      broadcast({
        action: 'block',
        payload: { id: block.id, occupied: block.occupied },
      })
    }
  })
}

export default { updateBlockOccupancy, handleBlockChange }
