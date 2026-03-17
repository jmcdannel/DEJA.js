import { getStorage } from 'firebase/storage'
import { firebaseApp } from './firebase'

export function getFirebaseStorage() {
  return getStorage(firebaseApp)
}
