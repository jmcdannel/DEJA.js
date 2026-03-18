export interface MenuItem {
  color: string;
  icon: string;
  label: string;
  name: string;
  section?: 'modules' | 'hardware' | 'system';
  isFavorite?: boolean;
}

export interface SuiteApp {
  label: string;
  icon: string;
  href: string;
}
