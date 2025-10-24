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

export const useEfx = () => {
  const layoutId = useStorage('@DEJA/layoutId', 'betatrack')
  const sortBy = useStorage<string[]>('@DEJA/prefs/effects/Sort', ['name'])
  const filterBy = useStorage<string[]>('@DEJA/prefs/effects/Filter', [])
  const colRef = collection(db, `layouts/${layoutId.value}/effects`)

  const efxCol = () => { // fitlered and sorted collection reference
    const whereClauses: any[] = []
    if (filterBy.value.length > 0) {
      filterBy.value.forEach((filter) => {
        if (filter.startsWith('device:')) {
          const deviceId = filter.split(':')[1]
          whereClauses.push(where('device', '==', deviceId))
        }
      })
    }

    let queryRef = query(collection(db, `layouts/${layoutId.value}/effects`), orderBy(sortBy.value[0]))
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
    const guestEffects = useCollection(
      query(
        collection(db, `layouts/${layoutId.value}/effects`), 
        where('allowGuest', '==', true),
      ), { ssrKey: 'guestEffects' })
    return guestEffects
  }

  function getEffectsList() {
    console.log('Getting effects list for layout:', layoutId.value)
    const baseQuery = efxCol()
    if (!baseQuery) {
      return null
    }
    const queryRef = query(baseQuery, where('type', 'not-in', ['macro', 'route']))
    const effects = useCollection(queryRef, { ssrKey: 'effects' })
    return effects
  }

  function getEffectsByTag(tag: string, allowGuest: boolean = false) {
    console.log('Getting effects by tag for layout:', layoutId.value)
    const baseQuery = query(
      collection(db, `layouts/${layoutId.value}/effects`),
      where('tags', 'array-contains', tag)
    )
    const queryRef = allowGuest
      ? query(baseQuery, where('allowGuest', '==', true))
      : baseQuery

    const effects = useCollection(queryRef, { ssrKey: `taggedEffects-${tag}` })
    return effects
  }

  function getEffectsByType(efxType: string, allowGuest: boolean = false) {
    try {
      console.log('getEffectsByType', efxType)
      const baseQuery = query(
        collection(db, `layouts/${layoutId.value}/effects`),
        where('type', '==', efxType),
      )
      const queryRef = allowGuest
      ? query(baseQuery, where('allowGuest', '==', true))
      : baseQuery

    const effects = useCollection(queryRef, { ssrKey: `effects-${efxType}` })
    return effects
    } catch (error) {
      console.error('Error getting effects by type:', error)
      return null
    }
  }

  function getEffectsByDevice(deviceId: string, allowGuest: boolean = false) {
    try {
      console.log('getEffectsByDevice', deviceId)
      const baseQuery = query(
        collection(db, `layouts/${layoutId.value}/effects`),
        where('device', '==', deviceId),
      )
      const queryRef = allowGuest
      ? query(baseQuery, where('allowGuest', '==', true))
      : baseQuery

    const effects = useCollection(queryRef, { ssrKey: `deviceEffects-${deviceId}` })
    return effects
    } catch (error) {
      console.error('Error getting effects by device:', error)
      return null
    }
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
    getEffectsList,
    getGuestEffects,
    getEffectsByDevice,
    getEffectsByTag,
    getEffectsByType,
    getEfxType,
    setEfx,
    runEffect,
  }
}

export default useEfx
