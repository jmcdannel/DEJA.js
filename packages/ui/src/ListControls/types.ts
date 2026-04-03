import type { ComputedRef, Ref } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

export interface ViewOption {
  value: string
  icon: string
  label: string
}

export interface SortOption {
  value: string
  label: string
}

export interface FilterOption {
  value: string
  label: string
}

export interface ListFilter {
  type: string
  label: string
  options: FilterOption[]
}

export interface ListControlsOptions<T extends AnyRecord = AnyRecord> {
  list: Ref<T[]> | ComputedRef<T[]>
  filters?: ListFilter[]
  viewOptions?: ViewOption[]
  sortOptions?: SortOption[]
  defaultView?: string
  defaultSort?: string
}

export interface ListControlsReturn<T extends AnyRecord = AnyRecord> {
  searchQuery: Ref<string>
  viewAs: Ref<string>
  sortBy: Ref<string>
  activeFilters: Ref<Record<string, string[]>>
  filteredList: ComputedRef<T[]>
  hasActiveFilters: ComputedRef<boolean>
  activeFilterCount: ComputedRef<number>
  isNonDefaultSort: ComputedRef<boolean>
  clearFilters: () => void
  clearAll: () => void
  setFilter: (type: string, values: string[]) => void
  removeFilter: (type: string, value: string) => void
}
