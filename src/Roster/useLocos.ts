import { computed } from 'vue'
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
import { db } from '@/firebase'

export function useLocos() {
  const layoutId = useStorage('@DEJA/cloud/layoutId', 'betatrack')
  const roadnames = [
    {
      value: 'bnsf',
      label: 'BNSF',
      color: 'orange',
    },
    {
      value: 'amtrak',
      label: 'Amtrak',
      color: 'sky',
    },
    {
      value: 'up',
      label: 'Union Pacific',
      color: 'yellow',
    },
    {
      value: 'cn',
      label: 'Canadian National',
      color: 'red',
    },
    {
      value: 'csx',
      label: 'CSX',
      color: 'indigo',
    },
    {
      value: 'ns',
      label: 'Norfolk Southern',
      color: 'zinc',
    },
    {
      value: 'mrl',
      label: 'Montana Rail Link',
      color: 'blue',
    },
    {
      value: 'gn',
      label: 'Great Northern',
      color: 'orange',
    },
    {
      value: 'bn',
      label: 'Burlington Northern',
      color: 'green',
    },
    {
      value: 'santefe',
      label: 'Santa Fe',
      color: 'red',
    },
  ]
  const locosCol = computed(() =>
    layoutId.value ? collection(db, `layouts/${layoutId.value}/locos`) : null
  )

  function getRoadname(roadname: string) {
    return roadnames.find((r) => r.value === roadname)
  }

  function getLocos() {
    const result = useCollection(locosCol)
    return result
  }

  function getLoco(id) {
    const locoDoc = computed(() =>
      layoutId.value ? doc(db, `layouts/${layoutId.value}/locos`, id) : null
    )
    const result = useDocument(locoDoc)
    return result
  }

  async function deleteLoco(id) {
    await deleteLoco(doc(db, `layouts/${layoutId.value}/locos`, id))
  }

  async function updateLoco(
    id: string,
    locoId: number,
    name: string | undefined,
    roadname: string | undefined
  ) {
    console.log('updateLoco', locoId)
    try {
      const loco = {
        name,
        locoId,
        meta: {},
        timestamp: serverTimestamp(),
      }
      if (roadname) {
        loco.meta = { roadname }
      }

      const locoDoc = doc(db, `layouts/${layoutId.value}/locos`, id)
      await setDoc(locoDoc, { ...loco }, { merge: true })
      console.log('loco written with ID: ', id)
      return locoId
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
    roadnames,
    getRoadname,
  }
}

export default useLocos
