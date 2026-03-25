import { collection, deleteDoc, doc, getDoc, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { useCollection } from 'vuefire'
import { db } from '@repo/firebase-config'
import { createLogger } from '@repo/utils'
import type { TrackDiagram, TrackDiagramInput } from './types'

const log = createLogger('TrackDiagrams')

export const useTrackDiagrams = () => {
  const layoutId = useStorage<string | null>('@DEJA/layoutId', null)

  const trackDiagramsCol = () => {
    if (!layoutId.value) return null
    return query(
      collection(db, `layouts/${layoutId.value}/trackDiagrams`),
      orderBy('name')
    )
  }

  function getTrackDiagrams() {
    return useCollection<TrackDiagram>(trackDiagramsCol, { ssrKey: 'trackDiagrams' })
  }

  async function getTrackDiagram(id: string): Promise<TrackDiagram | undefined> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return
    }
    try {
      const docRef = doc(db, `layouts/${layoutId.value}/trackDiagrams`, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as TrackDiagram
      }
    } catch (error) {
      log.error('Error fetching track diagram:', error)
    }
  }

  async function setTrackDiagram(diagramId: string, diagram: TrackDiagramInput): Promise<boolean> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return false
    }
    try {
      await setDoc(
        doc(db, `layouts/${layoutId.value}/trackDiagrams`, diagramId),
        { ...diagram, id: diagramId, updatedAt: serverTimestamp() },
        { merge: true }
      )
      return true
    } catch (error) {
      log.error('Error saving track diagram:', error)
      return false
    }
  }

  async function deleteTrackDiagram(diagramId: string): Promise<void> {
    if (!layoutId.value) {
      log.error('Layout ID is not set')
      return
    }
    try {
      await deleteDoc(doc(db, `layouts/${layoutId.value}/trackDiagrams`, diagramId))
    } catch (error) {
      log.error('Error deleting track diagram:', error)
    }
  }

  return {
    getTrackDiagrams,
    getTrackDiagram,
    setTrackDiagram,
    deleteTrackDiagram,
    trackDiagramsCol,
  }
}
