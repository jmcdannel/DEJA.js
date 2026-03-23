import type { ComputedRef, Ref } from 'vue'
import type { DocumentData } from 'firebase/firestore'

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

export interface ListControlsOptions {
  list: Ref<DocumentData[]> | ComputedRef<DocumentData[]>
  filters?: ListFilter[]
  viewOptions?: ViewOption[]
  sortOptions?: SortOption[]
  defaultView?: string
  defaultSort?: string
}

export interface ListControlsReturn {
  searchQuery: Ref<string>
  viewAs: Ref<string>
  sortBy: Ref<string>
  activeFilters: Ref<Record<string, string[]>>
  filteredList: ComputedRef<DocumentData[]>
  hasActiveFilters: ComputedRef<boolean>
  activeFilterCount: ComputedRef<number>
  isNonDefaultSort: ComputedRef<boolean>
  clearFilters: () => void
  clearAll: () => void
  setFilter: (type: string, values: string[]) => void
  removeFilter: (type: string, value: string) => void
}
