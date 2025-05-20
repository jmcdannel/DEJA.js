import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import {
  doc,
  collection,
  serverTimestamp,
  getDoc,
  setDoc,
  addDoc,
} from 'firebase/firestore'
import { useConnectionStore } from '@/connections/connectionStore'
import { useCollection, useDocument } from 'vuefire'
import { db } from '@/firebase'
// import { useDcc } from '@/DCCEX/useDcc'
// import { useDejaJS } from '@/DejaJS/useDejaJS'

export const useLayout = () => {
  const { layoutId } = storeToRefs(useConnectionStore())

  const deviceTypes = [
    {
      value: 'dcc-ex',
      label: 'DCC-EX CommandStation',
      icon: 'mdi-memory',
      image: '/dcc-ex/android-chrome-192x192.png',
      color: 'yellow',
    },
    {
      value: 'deja-arduino',
      label: 'DJEA Adrduino (MEGA)',
      icon: 'mdi-usb',
      color: 'lime',
    },
  ]

  // const { sendDccCommand } = useDcc()
  // const { sendDejaCommand } = useDejaJS()

  const layoutDoc = computed(() =>
    layoutId.value ? doc(db, 'layouts', layoutId.value) : null
  )
  const layoutCol = computed(() =>
    layoutId.value ? collection(db, 'layouts') : null
  )
  const devicesCol = computed(() =>
    layoutId.value ? collection(db, `layouts/${layoutId.value}/devices`) : null
  )

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
      console.log('DgetDevice:', docSnap.data(), docSnap.id, docSnap.ref)
      return { ...docSnap.data(), id: docSnap.id }
    } else {
      // docSnap.data() will be undefined in this case
      console.error('getDevice: No such document!')
    }
  }

  async function createDevice(id, device) {
    console.log('createDevice', device)
    try {
      await setDoc(doc(db, `layouts/${layoutId.value}/devices`, id), {
        ...device,
        timestamp: serverTimestamp(),
      })
      console.log('device written with ID: ', id, layoutId.value)
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

      if (device?.type === 'dcc-ex') {
        // sendDccCommand({ action: 'connect', payload })
      } else if (device?.type === 'deja-arduino') {
        // sendDejaCommand({ action: 'connect', payload })
      }
      console.log('Document written with ID: ', serial, device)
    } catch (e) {
      console.error('Error adding document: ', e)
    }
  }

  return {
    getLayout,
    getLayouts,
    getDevice,
    getDevices,
    createDevice,
    deviceTypes,
    connectDevice,
  }
}

export default useLayout
