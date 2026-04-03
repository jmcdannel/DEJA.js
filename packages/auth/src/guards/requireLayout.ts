import { nextTick } from 'vue'
import { useStorage } from '@vueuse/core'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { createLogger } from '@repo/utils'
import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'

const log = createLogger('Auth')

// Hoisted to module level so useStorage doesn't create a new ref per navigation.
// Default is empty string (not null) to ensure useStorage always uses the string serializer.
// When empty, the guard queries Firestore to auto-select or redirect to layout selection.
const layoutId = useStorage('@DEJA/layoutId', '')

export async function requireLayout(
  userEmail: string,
  to: RouteLocationNormalized,
): Promise<RouteLocationRaw | undefined> {
  // Allow useStorage to hydrate from localStorage
  await nextTick()

  if (layoutId.value) {
    return undefined
  }

  // No layoutId — fetch layouts from Firestore
  try {
    const layoutsQuery = query(
      collection(db, 'layouts'),
      where('owner', '==', userEmail),
    )
    const snap = await getDocs(layoutsQuery)

    if (snap.empty) {
      // 0 layouts → onboarding
      log.debug('requireLayout: 0 layouts → onboarding')
      return { path: '/onboarding', query: { redirect: to.fullPath } }
    }

    if (snap.size === 1) {
      // 1 layout → auto-select silently
      const layout = snap.docs[0]
      log.debug('requireLayout: auto-selecting single layout', layout.id)
      layoutId.value = layout.id
      return undefined
    }

    // 2+ layouts → select-layout page
    log.debug('requireLayout: multiple layouts → select-layout')
    return { path: '/select-layout', query: { redirect: to.fullPath } }
  } catch (error) {
    log.error('requireLayout: failed to fetch layouts:', error)
    // Fail-safe: redirect to select-layout page which handles its own error/retry
    return { path: '/select-layout', query: { redirect: to.fullPath } }
  }
}
