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
import { db } from '@repo/firebase-config'
import type { Turnout } from './types'

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
    console.log('sortby', sortBy.value)
    let queryRef = query(collection(db, `layouts/${layoutId.value}/turnouts`), orderBy(sortBy.value[0]))
    // let queryRef = query(colRef, orderBy(sortBy.value[0])) // TODO: debug this, getting error: [VueFire SSR]: Could not get the path of the data source]
    whereClauses.forEach((clause) => {
      console.log(clause)
      queryRef = query(queryRef, clause)
    })
    
    return layoutId.value ? queryRef : null
  }
  

  function getTurnouts() {
    console.log('getTurnouts called')
    const turnouts = useCollection(turnoutsCol, { ssrKey: 'turnouts' })
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

  function getTurnoutsByIds(turnoutIds: string[] | null ) {
    try {
      console.log('getTurnoutsByIds', turnoutIds)
      if (!turnoutIds) {
        return null
      }
      if (turnoutIds.length === 0) {
        return colRef
      } else if (turnoutIds.length === 1) {
        return query(colRef, where('__name__', '==', turnoutIds[0]))
      } else if (turnoutIds.length > 10) {
        console.warn('Too many turnout ids for "in" query; returning all turnouts instead')
        return colRef
      }
      return query(
        colRef,
        where('__name__', 'in', turnoutIds),
      )
    } catch (error) {
      console.error('Error getting turnouts by ids:', error)
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

  async function setTurnout(id: string, turnout: Partial<Turnout>): Promise<boolean | void> {
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
    getTurnoutsByIds,
    setTurnout,
    switchTurnout,
  }
}

export default useTurnouts
