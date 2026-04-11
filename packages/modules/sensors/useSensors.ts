import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { useCollection } from 'vuefire'
import { db } from '@repo/firebase-config'
import { slugify, createLogger } from '@repo/utils'
import type { Sensor, SensorInput } from './types'

const log = createLogger('Sensors')

const VALID_SENSOR_SORT_FIELDS = new Set(['name', 'device', 'type', 'index'])
const DEFAULT_SENSOR_SORT = 'name'

function validSensorSortField(field: string | undefined): string {
  return field && VALID_SENSOR_SORT_FIELDS.has(field) ? field : DEFAULT_SENSOR_SORT
}

export const useSensors = () => {
  const layoutId = useStorage<string | null>('@DEJA/layoutId', null)
  const sortBy = useStorage<string[]>('@DEJA/prefs/sensors/Sort', ['name'])

  const sensorsCol = () => {
    if (!layoutId.value) return null
    const sortField = validSensorSortField(sortBy.value?.[0])
    return query(collection(db, `layouts/${layoutId.value}/sensors`), orderBy(sortField))
  }

  function getSensors() {
    return useCollection<Sensor>(sensorsCol, { ssrKey: 'sensors' })
  }

  async function getSensor(id: string): Promise<Sensor | undefined> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return undefined
    }
    try {
      const docRef = doc(db, `layouts/${layoutId.value}/sensors`, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data() as SensorInput
        return {
          ...data,
          id: docSnap.id,
        }
      }
    } catch (error) {
      log.error('Error fetching sensor:', error)
    }
    return undefined
  }

  async function setSensor(sensorId: string, sensor: SensorInput): Promise<boolean> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return false
    }

    if (!sensor) {
      log.error('Sensor data is not provided')
      return false
    }

    try {
      const id = sensorId || slugify(`${sensor.device || 'device'}-${sensor.name || 'sensor'}`)
      const payload: SensorInput & { id: string } = {
        ...sensor,
        id,
        enabled: Boolean(sensor.enabled),
        state: Boolean(sensor.state),
        invertState: Boolean(sensor.invertState),
        pullup: Boolean(sensor.pullup),
      }

      await setDoc(doc(db, `layouts/${layoutId.value}/sensors`, id), {
        ...payload,
        timestamp: serverTimestamp(),
      }, { merge: true })
      return true
    } catch (error) {
      log.error('Error saving sensor:', error)
      return false
    }
  }

  async function deleteSensor(sensorId: string): Promise<void> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return
    }

    try {
      await deleteDoc(doc(db, `layouts/${layoutId.value}/sensors`, sensorId))
    } catch (error) {
      log.error('Error deleting sensor:', error)
    }
  }

  async function setSensorState(sensorId: string, state: boolean): Promise<void> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return
    }
    if (!sensorId) {
      log.error('Sensor ID is required to set state')
      return
    }
    try {
      await setDoc(doc(db, `layouts/${layoutId.value}/sensors`, sensorId), {
        state: Boolean(state),
        timestamp: serverTimestamp(),
      }, { merge: true })
    } catch (error) {
      log.error('Error setting sensor state:', error)
    }
  }

  function getSensorsByDevice(deviceId: string) {
    // ⚠️ Don't add orderBy — composite (device + sortField) index isn't deployed.
    // Caller sorts client-side.
    // 🔁 Use a reactive getter so VueFire re-evaluates when layoutId hydrates from localStorage.
    const colGetter = () => {
      if (!layoutId.value) return null
      return query(
        collection(db, `layouts/${layoutId.value}/sensors`),
        where('device', '==', deviceId),
      )
    }
    return useCollection<Sensor>(colGetter, { ssrKey: `sensors-device-${deviceId}` })
  }

  return {
    deleteSensor,
    getSensor,
    getSensors,
    getSensorsByDevice,
    sensorsCol,
    setSensor,
    setSensorState,
  }
}

export default useSensors
