import {
  doc,
  serverTimestamp,
  setDoc,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@repo/firebase-config/firebase-node'
import { log } from '../utils/logger'

const layoutId = process.env.LAYOUT_ID

export async function handleSensorChange(
  snapshot: DocumentData
): Promise<void> {
  snapshot.docChanges().forEach(async (change: DocumentData) => {
    const sensor = change.doc.data()
    if (change.type === 'modified') {
      log.log('Sensor modified', sensor.effectId, Boolean(sensor.state))
      await setDoc(
        doc(db, `layouts/${layoutId}/effects`, sensor.effectId),
        {
          state: Boolean(!sensor.state),
          timestamp: serverTimestamp(),
        },
        { merge: true }
      )
    }
  })
}

export default {
  handleSensorChange,
}
