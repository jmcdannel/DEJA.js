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
import type { SensorAutomation, SensorAutomationInput } from './types'

const log = createLogger('Automations')

const VALID_AUTOMATION_SORT_FIELDS = new Set(['name', 'sensorId'])
const DEFAULT_AUTOMATION_SORT = 'name'

function validAutomationSortField(field: string | undefined): string {
  return field && VALID_AUTOMATION_SORT_FIELDS.has(field) ? field : DEFAULT_AUTOMATION_SORT
}

export const useAutomations = () => {
  const layoutId = useStorage<string | null>('@DEJA/layoutId', null)
  const sortBy = useStorage<string[]>('@DEJA/prefs/automations/Sort', ['name'])

  const automationsCol = () => {
    if (!layoutId.value) return null
    const sortField = validAutomationSortField(sortBy.value?.[0])
    return query(collection(db, `layouts/${layoutId.value}/automations`), orderBy(sortField))
  }

  function getAutomations() {
    return useCollection<SensorAutomation>(automationsCol, { ssrKey: 'automations' })
  }

  async function getAutomation(id: string): Promise<SensorAutomation | undefined> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return undefined
    }
    try {
      const docRef = doc(db, `layouts/${layoutId.value}/automations`, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data() as SensorAutomationInput
        return {
          ...data,
          id: docSnap.id,
        }
      }
    } catch (error) {
      log.error('Error fetching automation:', error)
    }
    return undefined
  }

  async function setAutomation(automationId: string, automation: SensorAutomationInput): Promise<boolean> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return false
    }

    if (!automation) {
      log.error('Automation data is not provided')
      return false
    }

    try {
      const id = automationId || slugify(automation.name || 'automation')
      const payload: SensorAutomationInput & { id: string } = {
        ...automation,
        id,
        enabled: Boolean(automation.enabled),
      }

      await setDoc(doc(db, `layouts/${layoutId.value}/automations`, id), {
        ...payload,
        timestamp: serverTimestamp(),
      }, { merge: true })
      return true
    } catch (error) {
      log.error('Error saving automation:', error)
      return false
    }
  }

  async function deleteAutomation(automationId: string): Promise<void> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return
    }

    try {
      await deleteDoc(doc(db, `layouts/${layoutId.value}/automations`, automationId))
    } catch (error) {
      log.error('Error deleting automation:', error)
    }
  }

  function getAutomationsBySensor(sensorId: string) {
    if (!layoutId.value) return null
    return useCollection<SensorAutomation>(
      query(
        collection(db, `layouts/${layoutId.value}/automations`),
        where('sensorId', '==', sensorId),
        orderBy('name'),
      ),
      { ssrKey: `automations-sensor-${sensorId}` },
    )
  }

  return {
    automationsCol,
    deleteAutomation,
    getAutomation,
    getAutomations,
    getAutomationsBySensor,
    setAutomation,
  }
}

export default useAutomations
