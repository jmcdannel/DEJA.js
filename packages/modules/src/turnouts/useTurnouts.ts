import {
  collection,
  serverTimestamp,
  setDoc,
  doc,
  getDoc,
  query, 
  orderBy,
  where,
} from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { useCollection } from 'vuefire'
import { db } from '@repo/firebase-config/firebase'
import type { Turnout } from '@repo/modules/turnouts'

export function useTurnouts() {
  const layoutId = useStorage('@DEJA/layoutId', '')
  const colRef = collection(db, `layouts/${layoutId.value}/turnouts`)

  const turnoutsCol = () =>
    layoutId.value ? query(colRef, orderBy('order'), orderBy('name')) : null

  function getTurnouts() {
    const turnouts = useCollection(turnoutsCol)
    return turnouts
  }
  
  function getTurnoutsByDevice(deviceId: string) {
    try {
      console.log('getTurnoutsByDevice', deviceId)
      return query(
        colRef,
        where('device', '==', deviceId),
      )
    } catch (error) {
      console.error('Error getting turnouts by device:', error)
      return null
    }
  }

  async function getTurnout(id: string): Turnout {
    const deviceRef = doc(db, `layouts/${layoutId.value}/turnouts`, id)
    const docSnap = await getDoc(deviceRef)

    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as Turnout
    } else {
      console.error('No such document!')
      throw new Error('No such turnout!')
    }
  }

  async function switchTurnout(turnout: Turnout): Promise<void> {
    try {
      await setDoc(
        doc(db, `layouts/${layoutId.value}/turnouts`, turnout.id),
        {
          state: Boolean(!turnout.state),
          timestamp: serverTimestamp(),
        },
        { merge: true }
      )
      console.log('Turnout switched:', turnout.id, turnout.state)
    } catch (e) {
      console.error('Error adding document: ', e)
    }
  }

  async function setTurnout(id: string, turnout: Turnout) {
    try {
      await setDoc(doc(db, `layouts/${layoutId.value}/turnouts`, id), {
        ...turnout,
        timestamp: serverTimestamp(),
      },
      { merge: true })
      return true
    } catch (e) {
      console.error('Error adding throttle: ', e)
    }
  }

  return {
    getTurnout,
    getTurnouts,
    getTurnoutsByDevice,
    setTurnout,
    switchTurnout,
  }
}

export default useTurnouts
