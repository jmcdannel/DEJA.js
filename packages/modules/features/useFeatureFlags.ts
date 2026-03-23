import { computed } from 'vue'
import { useCurrentUser, useFirestore, useDocument } from 'vuefire'
import { doc } from 'firebase/firestore'
import { isFeatureAccessible, FEATURE_FLAGS } from './flags'
import type { FeatureName, UserRole } from './types'

export function useFeatureFlags() {
  const user = useCurrentUser()
  const db = useFirestore()

  const userDocRef = computed(() => {
    if (!user.value) return null
    return doc(db, 'users', user.value.uid)
  })
  const userDoc = useDocument(userDocRef)

  const devFeaturesEnv = import.meta.env.VITE_DEV_FEATURES === 'true'

  const userRole = computed<UserRole>(() => userDoc.value?.role ?? 'user')

  const isAdmin = computed(() => userRole.value === 'admin' || devFeaturesEnv)

  function isEnabled(feature: FeatureName): boolean {
    return isFeatureAccessible(feature, userRole.value, devFeaturesEnv)
  }

  const enabledFeatures = computed<FeatureName[]>(() =>
    (Object.keys(FEATURE_FLAGS) as FeatureName[]).filter(f => isEnabled(f))
  )

  return { isEnabled, enabledFeatures, userRole, isAdmin }
}
