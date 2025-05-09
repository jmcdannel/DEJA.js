import { computed } from 'vue'
import {
  collection,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  addDoc,
  serverTimestamp,
  where,
  doc,
  deleteField,
} from 'firebase/firestore'
import { storeToRefs } from 'pinia'
import { useDocument, useCollection, firestoreDefaultConverter } from 'vuefire'
import { ref, push, set } from 'firebase/database'
import { db, rtdb } from '@/firebase'
import type {
  Loco,
  LocoFunction,
  Throttle,
  ConsistLoco,
} from '@/throttle/types'
import { useConnectionStore } from '@/connections/connectionStore'
import { useDejaCloudStore } from '@/deja-cloud/dejaCloudStore'

export function useDejaCloud() {
  const dejaCloudStore = useDejaCloudStore()
  const connStore = useConnectionStore()
  const { layoutId } = storeToRefs(connStore)
  const { locos: storedLocos, throttles: storedThrottles } =
    storeToRefs(dejaCloudStore)

  async function send({ action, payload }) {
    switch (action) {
      case 'effects':
      case 'turnouts':
      case 'macro':
        sendDejaCommand({ action, payload })
        break
        case 'throttle':
          sendThrottleUpdate({ action, payload })
          break
        case 'dcc':
        case 'function':
          sendDccCommand({ action, payload })
          break
      default:
        // sendDccCommand({ action, payload })
        break
    }
  }

  function getLayout() {
    const layoutDoc = layoutId.value ? doc(db, 'layouts', layoutId.value) : null
    return useDocument(layoutDoc)
  }

  async function updateFunctions(id: string, functions: LocoFunction[]) {
    console.log('dejaCloud updateLoco', id, functions)
    try {
      const locoDoc = doc(db, `layouts/${layoutId.value}/locos`, id)
      await setDoc(locoDoc, { functions }, { merge: true })
    } catch (e) {
      console.error('Error updating consist: ', e)
    }
  }

  async function updateConsist(id: string, consist: ConsistLoco[]) {
    console.log('dejaCloud updateConsist', id, consist)
    try {
      const locoDoc = doc(db, `layouts/${layoutId.value}/locos`, id)
      await setDoc(locoDoc, { consist }, { merge: true })
    } catch (e) {
      console.error('Error updating consist: ', e)
    }
  }

  async function createLoco(locoId: number, name: string | undefined) {
    console.log('dejaCloud createLoco', locoId)
    try {
      const loco = {
        locoId,
        name,
        timestamp: serverTimestamp(),
      }
      const newLocoDoc = await addDoc(storedLocos.value, loco)
      console.log('loco written with ID: ', newLocoDoc)
      return newLocoDoc.id
    } catch (e) {
      console.error('Error adding throttle: ', e)
    }
  }

  async function getLocoByAddress(address: number) {
    try {
      const id = await getLocoDbId(address)
      const loco = await getLocoById(id)
      return loco
    } catch (e) {
      console.error('Error getting loco: ', e)
    }
  }

  function getLoco(address: string) {
    console.log('dejaCloud getLoco', address, typeof address)
    try {
      return useCollection(
        query(
          collection(db, `layouts/${layoutId.value}/locos`),
          where('locoId', '==', parseInt(address))
        )
      )
    } catch (e) {
      console.error('Error getting loco: ', e)
    }
  }

  async function getLocoDbId(address: number) {
    const locos = query(
      collection(db, `layouts/${layoutId.value}/locos`),
      where('locoId', '==', address)
    )
    const querySnapshot = await getDocs(locos)
    console.log('getLocoDbId', querySnapshot.docs[0], querySnapshot.docs[0].id)
    return await querySnapshot.docs[0].id
  }

  function getLocoById(id: string) {
    console.log('dejaCloud getLocoById', id, typeof id)
    // return useDocument(doc(db, `layouts/${layoutId.value}/locos`, id))
    // const docRef = doc(db, `layouts/${layoutId.value}/locos`, id)
    // const result = await getDoc(docRef)
    // return result

    try {
      // return dejaCloudStore.throttles || null
      const locoDoc = layoutId.value
        ? doc(db, `layouts/${layoutId.value}/locos`, id)
        : null
      const loco = useDocument(locoDoc)
      return loco
    } catch (e) {
      console.error('Error getting throttles')
    }
  }

  async function getDoc(docRef) {
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      console.log('Document data:', docSnap.data(), docSnap.id, docSnap.ref)
      return { ...docSnap.data(), id: docSnap.id }
    } else {
      // docSnap.data() will be undefined in this case
      console.error('No such document!')
    }
  }

  function getLocos() {
    try {
      // return dejaCloudStore.throttles || null
      const locosCollection = layoutId.value ? storedLocos.value : null
      const locos = useCollection(locosCollection)
      console.log('getLocos', locosCollection, locos, layoutId.value)
      return locos
    } catch (e) {
      console.error('Error getting locos')
    }
  }

  async function createThrottle(address) {
    console.log('dejaCloud createThrottle', address)
    try {
      const data = {
        address: parseInt(address),
        speed: 0,
        direction: false,
        timestamp: serverTimestamp(),
      }
      const newThrottleDoc = await setDoc(
        doc(db, `layouts/${layoutId.value}/throttles`, address.toString()),
        data
      )
      console.log('throttle written with ID: ', newThrottleDoc)
      return newThrottleDoc
    } catch (e) {
      console.error('Error adding throttle: ', e)
    }
  }

  async function acquireThrottle(address) {
    try {
      console.log('dejaCloud acquireThrottle', address)
      const throttleSource = computed(() => {
        async function fetchDoc(docRef) {
          const data = {
            address: parseInt(address),
            speed: 0,
            direction: false,
            timestamp: serverTimestamp(),
          }
          const newThrottleDoc = await setDoc(docRef, data)
          return newThrottleDoc
        }
        const docRef = doc(
          db,
          `layouts/${layoutId.value}/throttles`,
          address.toString()
        )
        fetchDoc(docRef)
        return docRef
      })
      return useDocument<Throttle>(throttleSource)

      // const docRef = doc(
      //   db,
      //   `layouts/${layoutId.value}/throttles`,
      //   address.toString()
      // )
      // const result = await getDoc(docRef)
      // return result

      // try {
      //   // return dejaCloudStore.throttles || null
      //   const throttleDoc = layoutId.value
      //     ? doc(db, `layouts/${layoutId.value}/throttles`, address.toString())
      //     : null
      //   const throttle = useDocument(throttleDoc)
      //   return throttle
      // } catch (e) {
      //   console.error('Error getting throttles')
      // }
    } catch (e) {
      console.error('Error adding throttle: ', e)
    }
  }

  async function releaseThrottle(throttleId: number) {
    try {
      console.log('dejaCloud releaseThrottle', throttleId)
      await deleteDoc(
        doc(db, `layouts/${layoutId.value}/throttles`, throttleId.toString())
      )
    } catch (e) {
      console.error('Error adding throttle: ', e)
    }
  }

  function getThrottles() {
    try {
      // return dejaCloudStore.throttles || null
      const throttlesCollection = layoutId.value ? storedThrottles.value : null
      const throttles = useCollection(throttlesCollection)
      console.log(
        'getThrottles',
        throttlesCollection,
        throttles,
        layoutId.value
      )
      return throttles
    } catch (e) {
      console.error('Error getting throttles')
    }
  }

  async function sendThrottleUpdate({ action, payload }) {
    console.log('sendThrottleUpdate', action, payload)
    try {
      const throttle = {
        speed: Math.abs(payload.speed),
        direction: payload.speed > 0 ? true : false,
        timestamp: serverTimestamp(),
      }

      await setDoc(
        doc(
          db,
          `layouts/${layoutId.value}/throttles`,
          payload.address.toString()
        ),
        throttle,
        { merge: true }
      )

      console.log('throttle written with ID: ', throttle)
    } catch (e) {
      console.error('Error adding throttle: ', e)
    }
  }

  async function sendDejaCommand({ action, payload }) {
    // console.log('dejaCloud SEND', action, payload)
    try {
      const command = {
        action,
        payload,
        timestamp: serverTimestamp(),
      }

      const result = await addDoc(
        collection(db, `layouts/${layoutId.value}/dejaCommands`),
        command
      )
      console.log('Document written with ID: ', result, command)
    } catch (e) {
      console.error('Error adding document: ', e)
    }
  }

  async function sendDccCommand({ action, payload }) {
    // console.log('dejaCloud SEND', action, payload)
    try {
      const command = {
        action,
        payload: JSON.stringify(payload),
        timestamp: serverTimestamp(),
      }

      // await addDoc(
      //   collection(db, `layouts/${layoutId.value}/dccCommands`),
      //   command
      // )
      const dccCommandsRef = ref(rtdb, 'dccCommands');
      const newCommandRef = push(dccCommandsRef);
      set(newCommandRef, command);
      // console.log('Document written with ID: ', command)
    } catch (e) {
      console.error('Error adding document: ', e)
    }
  }

  return {
    send,
    acquireThrottle,
    createThrottle,
    releaseThrottle,
    getLayout,
    createLoco,
    getLocos,
    getLoco,
    getLocoById,
    getLocoDbId,
    getLocoByAddress,
    updateConsist,
    updateFunctions,
    getThrottles,
  }
}
