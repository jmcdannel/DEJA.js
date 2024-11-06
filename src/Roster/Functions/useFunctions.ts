import { doc, setDoc } from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { db } from '@/firebase'

export function useFunctions() {
  const layoutId = useStorage('@DEJA/cloud/layoutId', 'betatrack')

  const MAX = 32
  const defaultFunctions = Array.from({ length: MAX }, (_, n) => ({
    id: n,
    label: `F${n}`,
  }))

  async function updateFunctions(id: string, functions) {
    console.log('updateFunctions', id, functions)
    try {
      const locoDoc = doc(db, `layouts/${layoutId.value}/locos`, id)
      await setDoc(locoDoc, { functions }, { merge: true })
    } catch (e) {
      console.error('Error updating functions: ', e)
    }
  }

  return {
    defaultFunctions,
    updateFunctions,
  }
}

export default useFunctions
