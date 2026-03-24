import type { FeatureName } from '@repo/modules'

export interface MenuItem {
  color: string;
  icon: string;
  label: string;
  name: string;
  section?: 'modules' | 'hardware' | 'system';
  isFavorite?: boolean;
  feature?: FeatureName;
}

export interface SuiteApp {
  label: string;
  icon: string;
  href: string;
}
