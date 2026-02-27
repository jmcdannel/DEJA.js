import { getCurrentUser } from 'vuefire'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@repo/firebase-config'

export async function requireApproval() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return

  const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
  if (!userDoc.exists() || !userDoc.data()?.approved) {
    return { path: '/pending-approval' }
  }
}
