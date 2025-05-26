import {
  collection,
  serverTimestamp,
  setDoc,
  doc,
  getDoc,
} from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { useCollection } from 'vuefire'
import { db } from '@repo/firebase-config/firebase'

export function useTurnouts() {
  const layoutId = useStorage('@DEJA/layoutId', 'betatrack')

  const turnoutsCol = () =>
    layoutId.value ? collection(db, `layouts/${layoutId.value}/turnouts`) : null
  

  function getTurnouts() {
    const turnouts = useCollection(turnoutsCol)
    return turnouts
  }

  async function getTurnout(id: string) {
    const deviceRef = doc(db, `layouts/${layoutId.value}/turnouts`, id)
    const docSnap = await getDoc(deviceRef)

    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id }
    } else {
      console.error('No such document!')
    }
  }

  async function switchTurnout(turnout) {
    try {
      await setDoc(
        doc(db, `layouts/${layoutId.value}/turnouts`, turnout.id),
        {
          state: turnout.state,
          timestamp: serverTimestamp(),
        },
        { merge: true }
      )
    } catch (e) {
      console.error('Error adding document: ', e)
    }
  }

  async function setTurnout(id, turnout) {
    try {
      await setDoc(doc(db, `layouts/${layoutId.value}/turnouts`, id), {
        ...turnout,
        timestamp: serverTimestamp(),
      })
      return true
    } catch (e) {
      console.error('Error adding throttle: ', e)
    }
  }

  return {
    getTurnouts,
    getTurnout,
    switchTurnout,
    setTurnout,
  }
}

export default useTurnouts
