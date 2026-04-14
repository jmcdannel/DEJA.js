import {
  collection,
  deleteDoc,
  serverTimestamp,
  setDoc,
  doc,
  getDoc,
  query,
  orderBy,
  where,
  type QueryConstraint,
} from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { useCollection } from 'vuefire'
import { db } from '@repo/firebase-config'
import { createLogger } from '@repo/utils'
import type { Turnout } from './types'

const log = createLogger('Turnouts')

// 🚨 `order` is intentionally NOT in the valid sort fields: Firestore's
// orderBy excludes documents that don't have the field, and turnouts only
// receive an `order` value when the user explicitly drag-sorts them. Sorting
// by `order` would hide every newly-added turnout. If we ever want drag-sort
// back, it has to be a client-side sort after fetching all docs.
const VALID_TURNOUT_SORT_FIELDS = new Set(['name', 'device', 'turnoutIdx', 'state', 'type'])
const DEFAULT_TURNOUT_SORT = 'name'

function validTurnoutSortField(field: string | undefined): string {
  return field && VALID_TURNOUT_SORT_FIELDS.has(field) ? field : DEFAULT_TURNOUT_SORT
}

export function useTurnouts() {
  const layoutId = useStorage('@DEJA/layoutId', '')
  const sortBy = useStorage<string[]>('@DEJA/prefs/turnouts/Sort', ['name'])
  const filterBy = useStorage<string[]>('@DEJA/prefs/turnouts/Filter', [])
  /** Lazy collection ref — avoids the [VueFire SSR] warning when layoutId is empty at setup time. */
  const getColRef = () => collection(db, `layouts/${layoutId.value}/turnouts`)

  const turnoutsCol = () => {
    const whereClauses: QueryConstraint[] = []
    if (filterBy.value.length > 0) {
      filterBy.value.forEach((filter) => {
        if (filter.startsWith('device:')) {
          const deviceId = filter.split(':')[1]
          whereClauses.push(where('device', '==', deviceId))
        }
      })
    }
    log.debug('sortby', sortBy.value)
    let queryRef = query(getColRef(), orderBy(validTurnoutSortField(sortBy.value[0])))
    whereClauses.forEach((clause) => {
      log.debug(clause)
      queryRef = query(queryRef, clause)
    })

    return layoutId.value ? queryRef : null
  }


  function getTurnouts() {
    log.debug('getTurnouts called')
    const turnouts = useCollection(turnoutsCol, { ssrKey: 'turnouts' })
    return turnouts
  }

  function getTurnoutsByDevice(deviceId: string) {
    try {
      log.debug('getTurnoutsByDevice', deviceId)
      return query(
        getColRef(),
        where('device', '==', deviceId),
      )
    } catch (error) {
      log.error('Error getting turnouts by device:', error)
      return null
    }
  }

  function getTurnoutsByIds(turnoutIds: string[] | null ) {
    try {
      log.debug('getTurnoutsByIds', turnoutIds)
      if (!turnoutIds) {
        return null
      }
      if (turnoutIds.length === 0) {
        return getColRef()
      } else if (turnoutIds.length === 1) {
        return query(getColRef(), where('__name__', '==', turnoutIds[0]))
      } else if (turnoutIds.length > 10) {
        log.warn('Too many turnout ids for "in" query; returning all turnouts instead')
        return getColRef()
      }
      return query(
        getColRef(),
        where('__name__', 'in', turnoutIds),
      )
    } catch (error) {
      log.error('Error getting turnouts by ids:', error)
      return null
    }
  }

  async function getTurnout(id: string): Promise<Turnout> {
    const deviceRef = doc(db, `layouts/${layoutId.value}/turnouts`, id)
    const docSnap = await getDoc(deviceRef)

    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as Turnout
    } else {
      log.error('No such document!')
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
      log.debug('Turnout switched:', turnout.id, newState)
    } catch (e) {
      log.error('Error adding document: ', e)
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
      log.error('Error setting turnout: ', e)
    }
  }

  async function deleteTurnout(id: string): Promise<void> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return
    }
    try {
      await deleteDoc(doc(db, `layouts/${layoutId.value}/turnouts`, id))
    } catch (error) {
      log.error('Error deleting turnout:', error)
    }
  }

  return {
    deleteTurnout,
    getTurnout,
    getTurnouts,
    getTurnoutsByDevice,
    getTurnoutsByIds,
    setTurnout,
    switchTurnout,
  }
}

export default useTurnouts
