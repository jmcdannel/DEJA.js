import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage'
import { getFirebaseStorage } from '@repo/firebase-config'
import { useStorage } from '@vueuse/core'
import { createLogger } from '@repo/utils'

const log = createLogger('TrackDiagramStorage')

export const useTrackDiagramStorage = () => {
  const layoutId = useStorage<string | null>('@DEJA/layoutId', null)

  async function uploadSvg(diagramId: string, svgContent: string): Promise<string | null> {
    if (!layoutId.value) return null
    try {
      const path = `layouts/${layoutId.value}/maps/${diagramId}.svg`
      const fileRef = storageRef(getFirebaseStorage(), path)
      await uploadString(fileRef, svgContent, 'raw', { contentType: 'image/svg+xml' })
      return await getDownloadURL(fileRef)
    } catch (error) {
      log.error('Error uploading SVG:', error)
      return null
    }
  }

  async function uploadCss(diagramId: string, cssContent: string): Promise<string | null> {
    if (!layoutId.value) return null
    try {
      const path = `layouts/${layoutId.value}/maps/${diagramId}.css`
      const fileRef = storageRef(getFirebaseStorage(), path)
      await uploadString(fileRef, cssContent, 'raw', { contentType: 'text/css' })
      return await getDownloadURL(fileRef)
    } catch (error) {
      log.error('Error uploading CSS:', error)
      return null
    }
  }

  return { uploadSvg, uploadCss }
}
