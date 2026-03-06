import { getCurrentUser } from 'vuefire'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@repo/firebase-config'

export async function requireApproval() {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { path: '/login' }
  }

  const layoutsQuery = query(
    collection(db, 'layouts'),
    where('owner', '==', currentUser.email),
  )
  const layoutsSnap = await getDocs(layoutsQuery)

  if (layoutsSnap.empty) {
    return
  }

  const hasApprovedLayout = layoutsSnap.docs.some(
    (doc) => doc.data().approved === true,
  )

  if (!hasApprovedLayout) {
    return { path: '/pending-approval' }
  }
}
