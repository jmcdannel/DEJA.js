import { getCurrentUser } from 'vuefire'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@repo/firebase-config'

export async function requireApproval() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return

  const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
  if (!userDoc.exists()) {
    return { path: '/pending-approval' }
  }

  const userData = userDoc.data()
  const layoutIds = userData?.layoutIds as string[] | undefined
  if (!layoutIds || layoutIds.length === 0) {
    return { path: '/pending-approval' }
  }

  // Check if the user's primary layout is approved
  const layoutDoc = await getDoc(doc(db, 'layouts', layoutIds[0]))
  if (!layoutDoc.exists() || !layoutDoc.data()?.approved) {
    return { path: '/pending-approval' }
  }
}
