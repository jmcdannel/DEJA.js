import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where
} from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { useCollection } from 'vuefire'
import { db } from '@repo/firebase-config'
import { slugify } from '@repo/utils'
import { efxTypes } from './constants'
import type { Effect, EffectType } from './types'

const VALID_EFFECT_SORT_FIELDS = new Set(['name', 'device', 'type', 'order', 'state', 'pin'])
const DEFAULT_EFFECT_SORT = 'name'

function validEffectSortField(field: string | undefined): string {
  return field && VALID_EFFECT_SORT_FIELDS.has(field) ? field : DEFAULT_EFFECT_SORT
}

export const useEfx = () => {
  const layoutId = useStorage('@DEJA/layoutId', 'betatrack')
  const sortBy = useStorage<string[]>('@DEJA/prefs/effects/Sort', ['name'])
  const filterBy = useStorage<string[]>('@DEJA/prefs/effects/Filter', [])
  const colRef = collection(db, `layouts/${layoutId.value}/effects`)

  const efxCol = () => {
    const whereClauses: any[] = []
    if (filterBy.value.length > 0) {
      filterBy.value.forEach((filter) => {
        if (filter.startsWith('device:')) {
          const deviceId = filter.split(':')[1]
          whereClauses.push(where('device', '==', deviceId))
        }
      })
    }

    let queryRef = query(collection(db, `layouts/${layoutId.value}/effects`), orderBy(validEffectSortField(sortBy.value[0])))
    // let queryRef = fquery(colRef, orderBy(sortBy.value[0])) // TODO: debug this, getting error: [VueFire SSR]: Could not get the path of the data source]
    whereClauses.forEach((clause) => {
      queryRef = query(queryRef, clause)
    })

    return layoutId.value ? queryRef : null
  }

  function getEffects() {
    console.log('Getting effects for layout:', layoutId.value)
    const effects = useCollection(efxCol, { ssrKey: 'effects' })
    return effects
  }

  function getGuestEffects() {
    console.log('Getting guest effects for layout:', layoutId.value)
    const guestEffects = useCollection(query(collection(db, `layouts/${layoutId.value}/effects`), where('allowGuest', '==', true)), { ssrKey: 'guestEffects' })
    return guestEffects
  }

  async function getEffect(id: string): Promise<Effect | undefined> {
    if (!layoutId.value) {
      console.error('Layout ID is not set')
      return
    }
    const deviceRef = doc(db, `layouts/${layoutId.value}/effects`, id)
    const docSnap = await getDoc(deviceRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        ...data,
        id: docSnap.id,
        type: data.type || '',
        state: data.state || false
      } as Effect
    } else {
      console.error('No such document!')
    }
  }

  function getEffectsByType(efxType: string) {
    try {
      console.log('getEffectsByType', efxType)
      return query(
        colRef,
        where('type', '==', efxType),
      )
    } catch (error) {
      console.error('Error getting effects by type:', error)
      return null
    }
  }

  function getEffectsByDevice(deviceId: string) {
    try {
      console.log('getEffectsByDevice', deviceId)
      return query(
        colRef,
        where('device', '==', deviceId),
      )
    } catch (error) {
      console.error('Error getting effects by device:', error)
      return null
    }
  }

  function getEfxType(value: string): EffectType | undefined {
    return efxTypes.find((item) => item.value === value)
  }

  async function deleteEfx(efxId: string): Promise<void> {
    try {
      console.log('deleteEfx', efxId)
      await deleteDoc(doc(db, `layouts/${layoutId.value}/effects`, efxId))
    } catch (e) {
      console.error('Error deleting document: ', e)
    }
  }

  // const DEFAULT_TYPE = getEfxType('pin')

  async function setEfx(efxId: string, efx: Effect): Promise<boolean> {
    if (!layoutId.value) {
      console.error('Layout ID is not set')
      return false
    }
    if (!efx) {
      console.error('Effect data is not provided')
      return false
    }
    try {
      const id = efxId
        ? efxId
        : slugify(`${efx.device || 'macro'}-${efx.type}-${efx.name}`)
      await setDoc(doc(db, `layouts/${layoutId.value}/effects`, id), {
        ...efx,
        timestamp: serverTimestamp(),
      })
      return true
    } catch (e) {
      console.error('Error setting effect: ', e)
      return false
    }
  }

  async function runEffect(efx: Effect): Promise<void> {
    if (!layoutId.value) {
      console.error('Layout ID is not set')
      return
    }
    if (!efx || !efx.id) {
      console.error('Effect data is not provided or invalid')
      return
    }
    try {
      await setDoc(
        doc(db, `layouts/${layoutId.value}/effects`, efx.id),
        {
          state: Boolean(efx.state),
          timestamp: serverTimestamp(),
        },
        { merge: true }
      )
      return
    } catch (e) {
      console.error('runEffect: ', e, efx)
    }
  }

  return {
    deleteEfx,
    efxCol,
    getEffect,
    getEffects,
    getGuestEffects,
    getEffectsByDevice,
    getEffectsByType,
    getEfxType,
    setEfx,
    runEffect,
  }
}

export default useEfx
