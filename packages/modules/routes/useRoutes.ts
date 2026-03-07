import { ref } from 'vue'
import { collection, deleteDoc, doc, getDoc, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { useCollection } from 'vuefire'
import { db } from '@repo/firebase-config'
import { useTurnouts, type Turnout } from '@repo/modules'
import { createLogger } from '@repo/utils'
import type { Route, RouteInput, RouteTurnoutConfig } from './types'

const log = createLogger('Routes')

const VALID_ROUTE_SORT_FIELDS = new Set(['name', 'order', 'color'])
const DEFAULT_ROUTE_SORT = 'name'

function validRouteSortField(field: string | undefined): string {
  return field && VALID_ROUTE_SORT_FIELDS.has(field) ? field : DEFAULT_ROUTE_SORT
}

export const useRoutes = () => {
  const layoutId = useStorage<string | null>('@DEJA/layoutId', null)
  const sortBy = useStorage<string[]>('@DEJA/prefs/routes/Sort', ['name'])
  const { setTurnout } = useTurnouts()

  const routesCol = () => {
    if (!layoutId.value) return null

    const sortField = validRouteSortField(sortBy.value?.[0])
    return query(collection(db, `layouts/${layoutId.value}/routes`), orderBy(sortField))
  }

  function getRoutes() {
    return useCollection(routesCol, { ssrKey: 'routes' })
  }

  async function getRoute(id: string): Promise<Route | undefined> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
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
      log.error('Error fetching route:', error)
    }
  }
  
  async function runRoute(route: Route ) {
      log.debug('runRoute', route)

      const turnoutSteps = ref<RouteTurnoutConfig[]>(route.turnouts || [])

      for (let i = 0; i < turnoutSteps.value.length; i++) {
          const chip = turnoutSteps.value[i];
          const newState = chip.state ?? true
          const turnout: Partial<Turnout> = {
              state: newState,
              timestamp: Date.now()
          }
          if (chip.id) {
              setTurnout(chip.id?.toString(), { ...turnout })
          }
      }
  }

  async function setRoute(routeId: string, route: RouteInput): Promise<boolean> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return false
    }

    if (!route) {
      log.error('Route data is not provided')
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
      log.error('Error saving route:', error)
      return false
    }
  }

  async function deleteRoute(routeId: string): Promise<void> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return
    }

    try {
      await deleteDoc(doc(db, `layouts/${layoutId.value}/routes`, routeId))
    } catch (error) {
      log.error('Error deleting route:', error)
    }
  }

  return {
    deleteRoute,
    getRoute,
    getRoutes,
    routesCol,
    runRoute,
    setRoute,
  }
}

export default useRoutes
