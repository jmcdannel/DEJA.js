import {
  doc,
  collection,
  serverTimestamp,
  getDoc,
  setDoc,
} from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { useCollection, useDocument, useCurrentUser } from 'vuefire'
import { db } from '@repo/firebase-config/firebase'
import { ITag } from './types'
import { useDejaJS } from '@repo/deja/useDejaJS'

export const useLayout = () => {
  const deviceTypes = [
    {
      value: 'dcc-ex',
      label: 'DCC-EX CommandStation',
      icon: 'mdi-memory',
      image: '/dcc-ex/android-chrome-192x192.png',
      color: 'pink',
    },
    {
      value: 'deja-arduino',
      label: 'DEJA Arduino (MEGA)',
      icon: 'mdi-usb',
      color: 'lime',
    },
    {
      value: 'deja-arduino-led',
      label: 'DEJA LED Arduino',
      icon: 'mdi-led-strip',
      color: 'teal',
    },
    {
      value: 'deja-mqtt',
      label: 'DEJA MQTT (Pico W)',
      icon: 'mdi-wifi',
      color: 'blue',
    },
  ]

  const user = useCurrentUser()
  const { sendDejaCommand } = useDejaJS()
  const layoutId = useStorage('@DEJA/layoutId', 'betatrack')
  const layoutDoc = () =>
    layoutId.value ? doc(db, 'layouts', layoutId.value) : null
  
  const layoutCol = () =>
    layoutId.value ? collection(db, 'layouts') : null
  
  const devicesCol = () =>
    layoutId.value ? collection(db, `layouts/${layoutId.value}/devices`) : null
  

  function getLayout() {
    const layout = useDocument(layoutDoc)
    return layout
  }

  function getLayouts() {
    const layouts = useCollection(layoutCol)
    return layouts
  }

  function getDevices() {
    const devices = useCollection(devicesCol)
    return devices
  }

  async function getDevice(deviceId: string) {
    // const device = useDocument(
    //   doc(db, `layouts/${layoutId.value}/devices`, deviceId)
    // )
    const deviceRef = doc(db, `layouts/${layoutId.value}/devices`, deviceId)
    const docSnap = await getDoc(deviceRef)

    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id }
    } else {
      // docSnap.data() will be undefined in this case
      console.error('No such document!')
    }
  }

  async function createLayout(id, layout) {
    console.log('createLayout', layout)
    try {
      await setDoc(doc(db, `layouts`, id), {
        ...layout,
        owner: user.value?.email,
        dcc: {
          client: 'dejaJs',
        },
        created: serverTimestamp(),
        timestamp: serverTimestamp(),
      })
      return true
    } catch (e) {
      console.error('Error adding throttle: ', e)
    }
  }

  async function createDevice(id, device) {
    console.log('createDevice', device)
    try {
      await setDoc(doc(db, `layouts/${layoutId.value}/devices`, id), {
        ...device,
        timestamp: serverTimestamp(),
      })
      return true
    } catch (e) {
      console.error('Error adding throttle: ', e)
    }
  }

  async function connectDevice(serial, device) {
    console.log('connectDevice', serial, device)
    try {
      const payload = {
        serial,
        device: device?.id || 'unknown',
      }

      sendDejaCommand({ action: 'connect', payload })

      console.log('connectDevice: ', serial, device)
    } catch (e) {
      console.error('Error connectDevice: ', e)
    }
  }

  async function autoConnectDevice(id, autoConnect) {
    try {
      const deviceDoc = doc(db, `layouts/${layoutId.value}/devices`, id)
      await setDoc(deviceDoc, { autoConnect: !!autoConnect }, { merge: true })
    } catch (e) {
      console.error('Error updating consist: ', e)
    }
  }

  async function getTags() {
    if (layoutDoc) {
      const docSnap = await getDoc(layoutDoc)

      if (docSnap.exists()) {
        const layout = docSnap.data()
        if (layout?.tags) {
          return layout.tags
        }
      }
    }
    return []
  }

  async function setTags(tags: ITag[]) {
    try {
      if (layoutDoc.value) {
        console.log('setTags', layoutId.value, tags)
        await setDoc(layoutDoc.value, { tags }, { merge: true })
      }
    } catch (e) {
      console.error('Error updating consist: ', e)
    }
  }

  async function setTag(tag: ITag) {
    try {
      if (layoutDoc.value) {
        const layout = useDocument(layoutDoc)
        console.log('setTags', layoutId.value, layout, tag)
        await setDoc(
          layoutDoc.value,
          { tags: [...(layout.value?.tags || []), tag] },
          { merge: true }
        )
      }
    } catch (e) {
      console.error('Error updating consist: ', e)
    }
  }

  async function getTagsByIds(ids: string[]): Promise<ITag[]> {
    if (layoutDoc.value) {
      const docSnap = await getDoc(layoutDoc.value)

      if (docSnap.exists()) {
        const layout = docSnap.data()
        if (layout?.tags) {
          return layout.tags.filter((tag: ITag) => ids.includes(tag.id))
        }
      }
    }
    return []
  }

  return {
    getLayout,
    getLayouts,
    createLayout,
    getDevice,
    getDevices,
    createDevice,
    autoConnectDevice,
    deviceTypes,
    connectDevice,
    getTags,
    setTags,
    setTag,
    getTagsByIds,
  }
}

export default useLayout
