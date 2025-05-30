import { doc, setDoc } from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { db } from '@repo/firebase-config/firebase'
import type { LocoFunction } from './types'

export function useFunctions() {
  const layoutId = useStorage('@DEJA/layoutId', '')

  async function updateFunctions(id: string, functions: LocoFunction[]) {
    try {
      const locoDoc = doc(db, `layouts/${layoutId.value}/locos`, id)
      await setDoc(locoDoc, { functions }, { merge: true })
    } catch (e) {
      console.error('Error updating functions: ', e)
    }
  }

  return {
    updateFunctions,
  }
}

export default useFunctions
