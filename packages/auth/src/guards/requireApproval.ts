import { getCurrentUser } from 'vuefire'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@repo/firebase-config'

export async function requireApproval() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return

  // Check if the user has any layouts
  const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
  const userData = userDoc.exists() ? userDoc.data() : null
  const layoutIds = userData?.layoutIds as string[] | undefined

  // A user without a layout hasn't completed onboarding yet — let them through
  // (requireOnboarding will handle redirecting them)
  if (!layoutIds || layoutIds.length === 0) {
    return
  }

  // Check if the user's primary layout is approved
  const layoutDoc = await getDoc(doc(db, 'layouts', layoutIds[0]))
  if (!layoutDoc.exists() || !layoutDoc.data()?.approved) {
    return { path: '/pending-approval' }
  }
}
