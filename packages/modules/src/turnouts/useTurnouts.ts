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
  const sortBy = useStorage<string[]>('@DEJA/prefs/turnouts/Sort', ['order'])
  const filterBy = useStorage<string[]>('@DEJA/prefs/turnouts/Filter', [])
  const colRef = collection(db, `layouts/${layoutId.value}/turnouts`)

  const turnoutsCol = () => {
    const whereClauses: any[] = []
    if (filterBy.value.length > 0) {
      filterBy.value.forEach((filter) => {
        if (filter.startsWith('device:')) {
          const deviceId = filter.split(':')[1]
          whereClauses.push(where('device', '==', deviceId))
        }
      })
    }
    
    let queryRef = query(colRef, orderBy(sortBy.value[0]))
    whereClauses.forEach((clause) => {
      console.log(clause)
      queryRef = query(queryRef, clause)
    })
    
    return layoutId.value ? queryRef : null
  }
  

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

  async function getTurnout(id: string): Promise<Turnout> {
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
      const newState = Boolean(!turnout.state)
      await setDoc(
        doc(db, `layouts/${layoutId.value}/turnouts`, turnout.id),
        {
          state: newState,
          timestamp: serverTimestamp(),
        },
        { merge: true }
      )
      console.log('Turnout switched:', turnout.id, newState)
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
