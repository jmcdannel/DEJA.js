import { collection, deleteDoc, doc, getDoc, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { useCollection } from 'vuefire'
import { db } from '@repo/firebase-config'
import type { Route, RouteInput } from './types'

export const useRoutes = () => {
  const layoutId = useStorage('@DEJA/layoutId', 'betatrack')
  const sortBy = useStorage<string[]>('@DEJA/prefs/routes/Sort', ['name'])

  const routesCol = () => {
    if (!layoutId.value) return null

    const sortField = sortBy.value?.[0] || 'name'
    return query(collection(db, `layouts/${layoutId.value}/routes`), orderBy(sortField))
  }

  function getRoutes() {
    return useCollection(routesCol, { ssrKey: 'routes' })
  }

  async function getRoute(id: string): Promise<Route | undefined> {
    if (!layoutId.value) {
      console.error('Layout ID is not set')
      return
    }

    try {
      const docRef = doc(db, `layouts/${layoutId.value}/routes`, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data() as Route
        return {
          ...data,
          id: docSnap.id,
        }
      }
    } catch (error) {
      console.error('Error fetching route:', error)
    }
  }

  async function setRoute(routeId: string, route: RouteInput): Promise<boolean> {
    if (!layoutId.value) {
      console.error('Layout ID is not set')
      return false
    }

    if (!route) {
      console.error('Route data is not provided')
      return false
    }

    try {
      await setDoc(doc(db, `layouts/${layoutId.value}/routes`, routeId), {
        ...route,
        id: routeId,
        timestamp: serverTimestamp(),
      }, { merge: true })
      return true
    } catch (error) {
      console.error('Error saving route:', error)
      return false
    }
  }

  async function deleteRoute(routeId: string): Promise<void> {
    if (!layoutId.value) {
      console.error('Layout ID is not set')
      return
    }

    try {
      await deleteDoc(doc(db, `layouts/${layoutId.value}/routes`, routeId))
    } catch (error) {
      console.error('Error deleting route:', error)
    }
  }

  return {
    deleteRoute,
    getRoute,
    getRoutes,
    routesCol,
    setRoute,
  }
}

export default useRoutes
