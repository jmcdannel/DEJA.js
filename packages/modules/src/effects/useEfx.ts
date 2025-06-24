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
import { db } from '@repo/firebase-config/firebase'
import { slugify } from '@repo/utils/slugify'
import { efxTypes } from './constants'
import type { Effect, EffectType } from './types'

export const useEfx = () => {
  const layoutId = useStorage('@DEJA/layoutId', '')
  const colRef = collection(db, `layouts/${layoutId.value}/effects`)

  const efxCol = () => {
    if (!layoutId.value) {
      console.error('Layout ID is not set')
      return null
    }
    return query(colRef, orderBy('device'), orderBy('type'), orderBy('name'))
  }

  function getEffects() {
    const layouts = useCollection(efxCol)
    return layouts
  }

  async function getEffect(id: string): Promise<Effect | undefined> {
    if (!layoutId.value) {
      console.error('Layout ID is not set')
      return
    }
    const deviceRef = doc(db, `layouts/${layoutId.value}/effects`, id)
    const docSnap = await getDoc(deviceRef)

    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id }
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
    getEfxType,
    getEffects,
    getEffect,
    getEffectsByType,
    setEfx,
    runEffect,
  }
}

export default useEfx
