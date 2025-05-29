import {
  doc,
  collection,
  getDoc,
  serverTimestamp,
  setDoc,
  addDoc,
  deleteDoc,
  where,
  getDocs,
  query,
} from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { useCollection, useDocument } from 'vuefire'
import { db } from '@repo/firebase-config/firebase'
import type { Loco, ConsistLoco, LocoThrottle, Throttle } from './types'
import { ROADNAMES } from './constants'

export function useLocos() {
  const layoutId = useStorage('@DEJA/layoutId', 'betatrack')
  
  const locosCol = () =>
    layoutId.value ? collection(db, `layouts/${layoutId.value}/locos`) : null

  const throttlesCol = () =>
    layoutId.value ? collection(db, `layouts/${layoutId.value}/throttles`) : null

  function getThrottles() {
    const throttles = useCollection(throttlesCol)
    return throttles
  }

  function getRoadname(roadname: string) {
    return ROADNAMES.find((r) => r.value === roadname)
  }

  function getLocos() {
    const result = useCollection(locosCol)
    return result
  }

  function getLoco(id: string) {
    const locoDoc = () =>
      layoutId.value ? doc(db, `layouts/${layoutId.value}/locos`, id) : null
    
    return useDocument(locoDoc)
  }

  async function getLocoThrottle(address: number) {
    console.log('getLocoThrottle', address)
    const throttleDoc = doc(db, `layouts/${layoutId.value}/throttles`, address.toString())
    const throttle = await getDoc(throttleDoc)
    const locoQuery = await getDocs(query(collection(db, `layouts/${layoutId.value}/locos`), where('address', '==', address)))
    const loco = locoQuery.docs[0]
    const locoThrottle: LocoThrottle = {
      address,
      throttle: {...throttle.data(), id: parseInt(throttle.id)} as Throttle,
      loco: { ...loco.data(), id: loco.id } as Loco
    }
    return locoThrottle
  }


  function getThrottlesWithLocos(): LocoThrottle[] {
    const throttles = getThrottles()
    const locos = getLocos()
    return throttles.value?.map(throttle => ({
      address: throttle.address,
      throttle: throttle as Throttle,
      loco: locos.value?.find(loco => loco.address === throttle.address) as Loco
    })).filter(t => t.loco)
  }

  const throttlesWithLocos = getThrottlesWithLocos()

  async function deleteLoco(id: string) {
    await deleteDoc(doc(db, `layouts/${layoutId.value}/locos`, id))
  }

  async function updateLoco(id: string, loco: Loco) {
    console.log('updateLoco', loco)
    try {
      const locoDoc = doc(db, `layouts/${layoutId.value}/locos`, id)
      await setDoc(
        locoDoc,
        { ...loco, timestamp: serverTimestamp() },
        { merge: true }
      )
      console.log('loco written with ID: ', id)
      return loco.address
    } catch (e) {
      console.error('Error adding throttle: ', e)
    }
  }

  async function updateConsist(id: string, consist: ConsistLoco[]) {
    console.log('updateConsist', id, consist)
    try {
      const locoDoc = doc(db, `layouts/${layoutId.value}/locos`, id)
      await setDoc(locoDoc, { consist }, { merge: true })
    } catch (e) {
      console.error('Error updating consist: ', e)
    }
  }

  async function createLoco(
    address: number,
    name: string | undefined,
    roadname: string | undefined = undefined
  ) {
    console.log('dejaCloud createLoco', address)
    try {
      const loco = {
        address,
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
    createLoco,
    deleteLoco,
    getLoco,
    getLocos,
    getLocoThrottle,
    getRoadname,
    getThrottles,
    getThrottlesWithLocos,
    throttlesWithLocos,
    updateLoco,
    updateConsist,
  }
}

export default useLocos
