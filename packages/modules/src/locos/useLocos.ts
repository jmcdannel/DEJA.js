import {
  doc,
  collection,
  serverTimestamp,
  setDoc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { useCollection, useDocument } from 'vuefire'
import { db } from '@repo/firebase-config/firebase'
import { ROADNAMES } from './constants'

export function useLocos() {
  const layoutId = useStorage('@DEJA/layoutId', 'betatrack')
  
  const locosCol = () =>
    layoutId.value ? collection(db, `layouts/${layoutId.value}/locos`) : null

  function getRoadname(roadname: string) {
    return ROADNAMES.find((r) => r.value === roadname)
  }

  function getLocos() {
    const result = useCollection(locosCol)
    return result
  }

  function getLoco(id) {
    const locoDoc = () =>
      layoutId.value ? doc(db, `layouts/${layoutId.value}/locos`, id) : null
    
    const result = useDocument(locoDoc)
    return result
  }

  async function deleteLoco(id) {
    await deleteDoc(doc(db, `layouts/${layoutId.value}/locos`, id))
  }

  async function updateLoco(id: string, loco) {
    console.log('updateLoco', loco)
    try {
      const locoDoc = doc(db, `layouts/${layoutId.value}/locos`, id)
      await setDoc(
        locoDoc,
        { ...loco, timestamp: serverTimestamp() },
        { merge: true }
      )
      console.log('loco written with ID: ', id)
      return loco.locoId
    } catch (e) {
      console.error('Error adding throttle: ', e)
    }
  }

  async function updateConsist(id: string, consist) {
    console.log('updateConsist', id, consist)
    try {
      const locoDoc = doc(db, `layouts/${layoutId.value}/locos`, id)
      await setDoc(locoDoc, { consist }, { merge: true })
    } catch (e) {
      console.error('Error updating consist: ', e)
    }
  }

  async function createLoco(
    locoId: number,
    name: string | undefined,
    roadname: string | undefined
  ) {
    console.log('dejaCloud createLoco', locoId)
    try {
      const loco = {
        locoId,
        name,
        meta: {},
        timestamp: serverTimestamp(),
      }
      if (roadname) {
        loco.meta = { roadname }
      }
      const newLocoDoc = await addDoc(
        collection(db, `layouts/${layoutId.value}/locos`),
        loco
      )
      console.log('loco written with ID: ', newLocoDoc)
      return newLocoDoc.id
    } catch (e) {
      console.error('Error adding throttle: ', e)
    }
  }

  return {
    getLoco,
    getLocos,
    createLoco,
    updateLoco,
    deleteLoco,
    updateConsist,
    getRoadname,
  }
}

export default useLocos
