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
import { db } from '@repo/firebase-config'
import type { Device, Layout, Tag } from './types'
import { useDejaJS } from '@repo/deja'

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
    {
      value: 'deja-server',
      label: 'DEJA Server',
      icon: 'mdi-laptop',
      color: 'purple',
    },
  ]

  const { sendDejaCommand } = useDejaJS()
  const layoutId = useStorage('@DEJA/layoutId', null)

  const layoutsRef = collection(db, 'layouts')

  const devicesCol = computed(() =>
    layoutId.value ? collection(db, `layouts/${layoutId.value}/devices`) : null
  )

  function getLayout() {
    console.log('getLayout', layoutId.value)
    if (!layoutId.value) return null
    const layout = useDocument(doc(db, 'layouts', layoutId.value))
    return layout
  }

  function getLayouts(email: string | null = null) {
    return email 
      ? useCollection(query(collection(db, 'layouts'), where('owner', '==', email)), { ssrKey: 'layouts' })
      : null
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
    if (!layoutId.value) {
      console.error('No layoutId set, cannot get device')
      return undefined
    }
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

  async function getLayoutDevices(layoutIdParam: string) {
    const devicesRef = collection(db, `layouts/${layoutIdParam}/devices`)
    const devices = useCollection(devicesRef, { ssrKey: `devices-${layoutIdParam}` })
    return devices
  }



  async function createLayout(id: string, layout: Layout) {
    console.log('createLayout', layout)
    const user = useCurrentUser()
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
    if (!layoutId.value) {
      console.error('No layoutId set, cannot create device')
      return false
    }
    console.log('createDevice', device)
    try {
      await setDoc(doc(db, `layouts/${layoutId.value}/devices`, id), {
        ...device,
        timestamp: serverTimestamp(),
      })
      return true
    } catch (e) {
      console.error('Error adding throttle: ', e)
      return false
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
    if (!layoutId.value) {
      console.error('No layoutId set, cannot auto-connect device')
      return
    }
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
    const docSnap = await getDoc(doc(db, 'layouts', layoutId.value))
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
      const docSnap = await getDoc(doc(db, 'layouts', layoutId.value))
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
      const docSnap = await getDoc(doc(db, 'layouts', layoutId.value))
      if (docSnap.exists()) {
        const layoutData = docSnap.data()
        await setDoc(
          doc(db, `layouts`, layoutId.value),
          { tags: [...((layoutData as any)?.tags || []), tag] },
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
    const docSnap = await getDoc(doc(db, 'layouts', layoutId.value))
    if (docSnap.exists()) {
      const layout = docSnap.data()
      if ((layout as any)?.tags) {
        return (layout as any).tags.filter((tag: Tag) => ids.includes(tag.id))
      }
    }
    return []
  }

  return {
    getLayout,
    getLayouts,
    createLayout,
    getDevice,
    getLayoutDevices,
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
