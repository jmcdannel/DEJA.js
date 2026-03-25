// No imports from other feature files — this is the base type module.

export type FeatureStage = 'dev' | 'alpha' | 'beta' | 'ga'

/** Explicit union of all feature flag keys. Update when adding new flags. */
export type FeatureName = 'sounds' | 'trackDiagrams' | 'routes' | 'sensors' | 'tourApp' | 'quickMenuFavorites'

export type UserRole = 'admin' | 'user'
