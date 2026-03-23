import type { FeatureStage, FeatureName, UserRole } from './types'

/** Stage access hierarchy — each role can see stages at or above its access level. */
export const STAGE_ACCESS: Record<UserRole, FeatureStage[]> = {
  admin: ['dev', 'alpha', 'beta', 'ga'],
  user: ['ga'],
}

/**
 * Feature flag registry — maps feature names to their current release stage.
 * Typed as Record<FeatureName, FeatureStage> so TypeScript catches mismatches
 * when the FeatureName union is updated.
 */
export const FEATURE_FLAGS: Record<FeatureName, FeatureStage> = {
  sounds: 'dev',
  trackDiagrams: 'dev',
  routes: 'dev',
  sensors: 'dev',
  tourApp: 'dev',
}

/**
 * Pure function to check feature accessibility.
 * Shared by both the Vue composable and the route guard.
 */
export function isFeatureAccessible(
  feature: FeatureName,
  userRole: UserRole,
  devFeaturesEnv = false,
): boolean {
  if (devFeaturesEnv) return true
  const stage = FEATURE_FLAGS[feature]
  return STAGE_ACCESS[userRole].includes(stage)
}
