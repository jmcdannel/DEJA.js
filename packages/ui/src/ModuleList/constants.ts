export const DEFAULT_VIEW_OPTIONS = [
  { label: 'Button', value: 'button' },
  { label: 'Card', value: 'card' },
  { label: 'Switch', value: 'switch' },
  { label: 'Table', value: 'table' },
  { label: 'Raw', value: 'raw' }
]
export const DEFAULT_VIEW_OPTION = DEFAULT_VIEW_OPTIONS[0]
export const DEFAULT_SORT_OPTIONS = [
  { label: 'Default', value: 'order' },
  { label: 'Device', value: 'device' },
  { label: 'Name', value: 'name' },
  { label: 'Type', value: 'type' }
]
export const DEFAULT_SORT_OPTION = DEFAULT_SORT_OPTIONS[0]

export const DEFAULT_MENU_OPTIONS = [
  { color: 'purple', title: 'View', icon: 'mdi-eye', value: 'view', ref: 'viewAs' },
  { color: 'teal', title: 'Sort', icon: 'mdi-sort', value: 'sort', ref: 'sortBy' },
  { color: 'red', title: 'Filter', icon: 'mdi-filter', value: 'filter' , ref: 'filterBy'}
]
