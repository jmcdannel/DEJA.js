import featureFlags from './feature-flags.json'

export type FeatureStage = 'dev' | 'alpha' | 'beta' | 'ga'

/** Derived from feature-flags.json keys — add new flags there, not here. */
export type FeatureName = keyof typeof featureFlags

export type UserRole = 'admin' | 'user' | 'demo'
