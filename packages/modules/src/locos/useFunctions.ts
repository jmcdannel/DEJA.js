import { doc, setDoc } from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { db } from '@repo/firebase-config/firebase'

export function useFunctions() {
  const layoutId = useStorage('@DEJA/layoutId', 'betatrack')

  async function updateFunctions(id: string, functions) {
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
