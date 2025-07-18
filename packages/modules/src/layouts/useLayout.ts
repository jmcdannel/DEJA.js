import { computed } from 'vue'
import {
  doc,
  collection,
  getDoc,
  query,
  setDoc,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import {
  firestoreDefaultConverter,
  useCollection,
  useDocument,
  useCurrentUser,
} from 'vuefire'
import { db } from '@repo/firebase-config/firebase'
import type { Device, Layout, Tag } from './types'
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

  const { sendDejaCommand } = useDejaJS()
  const layoutId = useStorage('@DEJA/layoutId', '')
  const layoutDoc = doc(db, 'layouts', layoutId.value)

  const layoutsRef = collection(db, 'layouts')

  const devicesCol = computed(() =>
    layoutId.value ? collection(db, `layouts/${layoutId.value}/devices`) : null
  )

  function getLayout() {
    const layout = useDocument(layoutDoc)
    return layout
  }

  function getLayouts() {
    const user = useCurrentUser()
    const layoutsQuery = query(layoutsRef, where('owner', '==', user.value?.email))
    console.log('getLayouts', layoutsQuery)
    const layouts = useCollection(layoutsQuery)
    return layouts
  }

  function getDevices() {
    const devices = useCollection<Device>(() =>
      layoutId.value
        ? collection(db, `layouts/${layoutId.value}/devices`)
        : null
    , { ssrKey: 'devices' })
    return devices
  }

  async function getDevice(deviceId: string): Promise<Device | undefined> {
    // const device = useDocument(
    //   doc(db, `layouts/${layoutId.value}/devices`, deviceId)
    // )
    const deviceRef = doc(db, `layouts/${layoutId.value}/devices`, deviceId)
    const docSnap = await getDoc(deviceRef)

    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as Device
    } else {
      // docSnap.data() will be undefined in this case
      console.error('No such document!')
    }
  }

  async function createLayout(id: string, layout: Layout) {
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

  async function createDevice(id: string, device: Device) {
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

  async function connectDevice(device: Device, serial?: string, topic?: string) {
    try {
      const payload = {
        device: device.id,
        serial,
        topic
      }

      sendDejaCommand({ action: 'connect', payload })

      console.log('connectDevice: ', serial, device)
    } catch (e) {
      console.error('Error connectDevice: ', e)
    }
  }

  async function autoConnectDevice(id: string, autoConnect: boolean) {
    try {
      const deviceDoc = doc(db, `layouts/${layoutId.value}/devices`, id)
      await setDoc(deviceDoc, { autoConnect: !!autoConnect }, { merge: true })
    } catch (e) {
      console.error('Error updating consist: ', e)
    }
  }

  async function getTags() {
    if (!layoutId.value) {
      console.error('No layoutId set, cannot get tags')
      return []
    }
    const docSnap = await getDoc(layoutDoc)
    if (docSnap.exists()) {
      const layout = docSnap.data()
      if (layout?.tags) {
        return layout.tags
      }
    }
    return []
  }

  async function setTags(tags: Tag[]) {
    if (!layoutId.value) {
      console.error('No layoutId set, cannot get tags')
      return []
    }
    try {
      const docSnap = await getDoc(layoutDoc)
      if (docSnap.exists()) {
        console.log('setTags', layoutId.value, tags)
        await setDoc(
          doc(db, `layouts`, layoutId.value),
          { tags },
          { merge: true }
        )
      }
    } catch (e) {
      console.error('Error updating consist: ', e)
    }
  }

  async function setTag(tag: Tag) {
    if (!layoutId.value) {
      console.error('No layoutId set, cannot get tags')
      return []
    }
    try {
      const docSnap = await getDoc(layoutDoc)
      if (docSnap.exists()) {
        await setDoc(
          doc(db, `layouts`, layoutId.value),
          { tags: [...(docSnap.data().tags || []), tag] },
          { merge: true }
        )
      }
    } catch (e) {
      console.error('Error updating consist: ', e)
    }
  }

  async function getTagsByIds(ids: string[]): Promise<Tag[]> {
    if (!layoutId.value) {
      console.error('No layoutId set, cannot get tags')
      return []
    }
    const docSnap = await getDoc(layoutDoc)
    if (docSnap.exists()) {
      const layout = docSnap.data()
      if (layout?.tags) {
        return layout.tags.filter((tag: Tag) => ids.includes(tag.id))
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
