import type { FeatureStage, FeatureName, UserRole } from './types'
import featureFlags from './feature-flags.json'

/** Stage access hierarchy — each role can see stages at or above its access level. */
export const STAGE_ACCESS: Record<UserRole, FeatureStage[]> = {
  admin: ['dev', 'alpha', 'beta', 'ga'],
  user: ['ga'],
  demo: ['dev', 'alpha', 'beta', 'ga'],
}

/**
 * Feature flag registry — loaded from feature-flags.json.
 * To add/change flags, edit feature-flags.json — TypeScript derives
 * the FeatureName type from its keys automatically.
 */
export const FEATURE_FLAGS = featureFlags as Record<FeatureName, FeatureStage>

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
