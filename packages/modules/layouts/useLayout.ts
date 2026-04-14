import { computed, type Ref, type ComputedRef, isRef } from 'vue'
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
  useCollection,
  useDocument,
  useCurrentUser,
} from 'vuefire'
import { db } from '@repo/firebase-config'
import { createLogger } from '@repo/utils'
import type { Device, Layout, Tag } from './types'
import { useDejaJS } from '@repo/deja'
import { defaultLayoutSounds, deviceTypes } from './constants'

const log = createLogger('Layout')

export const useLayout = () => {
  const { sendDejaCommand } = useDejaJS()
  const layoutId = useStorage('@DEJA/layoutId', null)

  const layoutsRef = collection(db, 'layouts')

  const devicesCol = computed(() =>
    layoutId.value ? collection(db, `layouts/${layoutId.value}/devices`) : null
  )

  function getLayout() {
    log.debug('getLayout', layoutId.value)
    if (!layoutId.value) return null
    const layout = useDocument(doc(db, 'layouts', layoutId.value))
    return layout
  }

  function getLayouts(email: string | null | Ref<string | null> | ComputedRef<string | null> = null) {
    // Support reactive email refs so the query re-runs when auth resolves
    if (isRef(email)) {
      const queryRef = computed(() =>
        email.value
          ? query(collection(db, 'layouts'), where('owner', '==', email.value))
          : null
      )
      return useCollection(queryRef, { ssrKey: 'layouts' })
    }
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
      log.error('No layoutId set, cannot get device')
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
      log.error('No such document!')
    }
  }

  async function getLayoutDevices(layoutIdParam: string) {
    const devicesRef = collection(db, `layouts/${layoutIdParam}/devices`)
    const devices = useCollection(devicesRef, { ssrKey: `devices-${layoutIdParam}` })
    return devices
  }



  async function createLayout(id: string, layout: Layout) {
    log.debug('createLayout', layout)
    const user = useCurrentUser()
    try {
      await setDoc(doc(db, `layouts`, id), {
        ...layout,
        approved: layout.approved ?? true,
        defaultSounds: layout.defaultSounds ?? defaultLayoutSounds,
        owner: layout.owner ?? user.value?.email,
        dcc: {
          client: 'dejaJs',
        },
        created: serverTimestamp(),
        timestamp: serverTimestamp(),
      })
      await setDoc(doc(db, `layouts/${id}/devices`, 'dccex'), {
        id: 'dccex',
        name: 'dccex',
        type: 'dcc-ex',
        connection: 'usb',
        timestamp: serverTimestamp(),
      })
      return true
    } catch (e) {
      log.error('Error adding throttle: ', e)
    }
  }

  async function updateLayout(id: string, data: Partial<Layout>) {
    log.debug('updateLayout', id, data)
    try {
      await setDoc(
        doc(db, `layouts`, id),
        {
          ...data,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
      return true
    } catch (e) {
      log.error('Error updating layout: ', e)
      return false
    }
  }

  async function createDevice(id: string, device: Device) {
    if (!layoutId.value) {
      log.error('No layoutId set, cannot create device')
      return false
    }
    log.debug('createDevice', device)
    try {
      await setDoc(doc(db, `layouts/${layoutId.value}/devices`, id), {
        ...device,
        timestamp: serverTimestamp(),
      })
      return true
    } catch (e) {
      log.error('Error adding throttle: ', e)
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

      log.debug('connectDevice: ', serial, device)
    } catch (e) {
      log.error('Error connectDevice: ', e)
    }
  }

  async function disconnectDevice(deviceId: string) {
    try {
      sendDejaCommand({ action: 'disconnect', payload: { deviceId } })

      log.debug('disconnectDevice: ', deviceId)
    } catch (e) {
      log.error('Error disconnectDevice: ', e)
    }
  }

  async function updateDevice(id: string, data: Partial<Device>) {
    if (!layoutId.value) {
      log.error('No layoutId set, cannot update device')
      return false
    }
    try {
      const deviceDoc = doc(db, `layouts/${layoutId.value}/devices`, id)
      await setDoc(deviceDoc, { ...data, timestamp: serverTimestamp() }, { merge: true })
      return true
    } catch (e) {
      log.error('Error updating device: ', e)
      return false
    }
  }

  async function autoConnectDevice(id: string, autoConnect: boolean) {
    if (!layoutId.value) {
      log.error('No layoutId set, cannot auto-connect device')
      return
    }
    try {
      const deviceDoc = doc(db, `layouts/${layoutId.value}/devices`, id)
      await setDoc(deviceDoc, { autoConnect: !!autoConnect }, { merge: true })
    } catch (e) {
      log.error('Error updating consist: ', e)
    }
  }

  async function getTags() {
    if (!layoutId.value) {
      log.error('No layoutId set, cannot get tags')
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
      log.error('No layoutId set, cannot get tags')
      return []
    }
    try {
      const docSnap = await getDoc(doc(db, 'layouts', layoutId.value))
      if (docSnap.exists()) {
        log.debug('setTags', layoutId.value, tags)
        await setDoc(
          doc(db, `layouts`, layoutId.value),
          { tags },
          { merge: true }
        )
      }
    } catch (e) {
      log.error('Error updating consist: ', e)
    }
  }

  async function setTag(tag: Tag) {
    if (!layoutId.value) {
      log.error('No layoutId set, cannot get tags')
      return []
    }
    try {
      const docSnap = await getDoc(doc(db, 'layouts', layoutId.value))
      if (docSnap.exists()) {
        const layoutData = docSnap.data() as Partial<Layout>
        await setDoc(
          doc(db, `layouts`, layoutId.value),
          { tags: [...(layoutData?.tags || []), tag] },
          { merge: true }
        )
      }
    } catch (e) {
      log.error('Error updating consist: ', e)
    }
  }

  async function getTagsByIds(ids: string[]): Promise<Tag[]> {
    if (!layoutId.value) {
      log.error('No layoutId set, cannot get tags')
      return []
    }
    const docSnap = await getDoc(doc(db, 'layouts', layoutId.value))
    if (docSnap.exists()) {
      const layout = docSnap.data() as Partial<Layout>
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
    updateLayout,
    getDevice,
    getLayoutDevices,
    getDevices,
    createDevice,
    updateDevice,
    autoConnectDevice,
    deviceTypes,
    connectDevice,
    disconnectDevice,
    getTags,
    setTags,
    setTag,
    getTagsByIds,
  }
}

export default useLayout
