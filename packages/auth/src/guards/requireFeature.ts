import type { RouteLocationRaw } from 'vue-router'
import type { FeatureName, UserRole } from '@repo/modules'
import { isFeatureAccessible } from '@repo/modules'

/**
 * Route guard that checks if a feature is accessible to the current user.
 * Used in the Cloud app's beforeEach chain via route meta.
 */
export function checkRequireFeature(
  featureName: FeatureName,
  userRole: UserRole,
  devFeaturesEnv: boolean,
): RouteLocationRaw | undefined {
  if (!isFeatureAccessible(featureName, userRole, devFeaturesEnv)) {
    return { path: '/' }
  }
}
