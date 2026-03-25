import {
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { useCollection } from 'vuefire'
import { db } from '@repo/firebase-config'
import { slugify, createLogger } from '@repo/utils'
import type { PowerDistrict, PowerDistrictInput } from './types'

const log = createLogger('PowerDistricts')

export const usePowerDistricts = () => {
  const layoutId = useStorage<string | null>('@DEJA/layoutId', null)

  const powerDistrictsCol = () => {
    if (!layoutId.value) return null
    return query(collection(db, `layouts/${layoutId.value}/powerDistricts`), orderBy('name'))
  }

  function getPowerDistricts() {
    return useCollection<PowerDistrict>(powerDistrictsCol, { ssrKey: 'powerDistricts' })
  }

  async function setPowerDistrict(
    districtId: string,
    district: PowerDistrictInput,
  ): Promise<boolean> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return false
    }

    try {
      const id = districtId || slugify(district.name || 'district')
      const payload = {
        ...district,
        id,
      }

      await setDoc(
        doc(db, `layouts/${layoutId.value}/powerDistricts`, id),
        {
          ...payload,
          timestamp: serverTimestamp(),
        },
        { merge: true },
      )
      return true
    } catch (error) {
      log.error('Error saving power district:', error)
      return false
    }
  }

  async function deletePowerDistrict(districtId: string): Promise<void> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return
    }

    try {
      await deleteDoc(doc(db, `layouts/${layoutId.value}/powerDistricts`, districtId))
    } catch (error) {
      log.error('Error deleting power district:', error)
    }
  }

  return {
    deletePowerDistrict,
    getPowerDistricts,
    powerDistrictsCol,
    setPowerDistrict,
  }
}

export default usePowerDistricts
