import type { FeatureName } from '@repo/modules'

export interface MenuItem {
  color: string;
  icon: string;
  label: string;
  name: string;
  section?: 'modules' | 'hardware' | 'system';
  isFavorite?: boolean;
  feature?: FeatureName;
  /** Set at runtime by useMenu — true when the feature flag is off for the current user */
  gated?: boolean;
}

export interface SuiteApp {
  label: string;
  icon: string;
  href: string;
}
