import { doc, setDoc } from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { db } from '@repo/firebase-config'
import { createLogger } from '@repo/utils'
import type { LocoFunction } from './types'

const log = createLogger('Functions')

export function useFunctions() {
  const layoutId = useStorage('@DEJA/layoutId', '')

  async function updateFunctions(id: string, functions: LocoFunction[]) {
    try {
      log.debug('Updating functions for loco ', id, functions)
      const locoDoc = doc(db, `layouts/${layoutId.value}/locos`, id)
      await setDoc(locoDoc, { functions }, { merge: true })
    } catch (e) {
      log.error('Error updating functions: ', e)
    }
  }

  return {
    updateFunctions,
  }
}

export default useFunctions
