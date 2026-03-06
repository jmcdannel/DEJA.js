import { getCurrentUser } from 'vuefire'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@repo/firebase-config'

export async function requireOnboarding() {
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
    return {
      path: '/onboarding',
      query: { redirect: window.location.pathname },
    }
  }
}
