import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import { db } from '@repo/firebase-config/firebase-admin-node'
import { log } from '../utils/logger'

const layoutId = process.env.LAYOUT_ID

export async function handleSensorChange(
  snapshot: DocumentData
): Promise<void> {
  if (!layoutId) {
    log.error('Layout ID is not set')
    return
  }
  if (!snapshot || !snapshot.docChanges) {
    log.error('Invalid snapshot data', snapshot)
    return
  }
  
  snapshot.docChanges().forEach(async (change: DocumentData) => {
    const sensor = change.doc.data()
    if (change.type === 'modified') {
      log.log('Sensor modified', sensor.effectId, Boolean(sensor.state))
      db.collection('layouts')
        .doc(layoutId)
        .collection('effects')
        .doc(sensor.effectId)
        .set(
          {
            state: Boolean(sensor.state),
            timestamp: FieldValue.serverTimestamp(),
          },
          { merge: true }
        )
    }
  })
}

export default {
  handleSensorChange,
}
