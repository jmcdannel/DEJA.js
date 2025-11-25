export interface MenuItem {
  color: string;
  icon: string;
  label: string;
  name: string;
  path: string;
  componentPath: string;
  isFavorite?: boolean;
  requireDccEx?: boolean;
}
