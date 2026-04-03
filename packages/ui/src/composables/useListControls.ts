import { computed, type Ref } from 'vue'
import { useStorage } from '@vueuse/core'
import type { ListControlsOptions, ListControlsReturn } from '../ListControls/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useListControls<T extends Record<string, any> = Record<string, any>>(
  moduleName: string,
  options: ListControlsOptions<T>
): ListControlsReturn<T> {
  const { list, defaultView = 'card', defaultSort = 'order' } = options

  // Persisted state — same localStorage keys as existing code for seamless migration.
  // Old code stored viewAs as string[] (e.g., ['card']). We read and unwrap if needed.
  const rawView = useStorage<string | string[]>(
    `@DEJA/prefs/${moduleName}/View`,
    defaultView
  )
  const viewAs = computed({
    get: () =>
      Array.isArray(rawView.value)
        ? rawView.value[0] ?? defaultView
        : rawView.value,
    set: (val: string) => {
      rawView.value = val
    },
  }) as Ref<string>

  const rawSort = useStorage<string | string[]>(
    `@DEJA/prefs/${moduleName}/Sort`,
    defaultSort
  )
  const sortBy = computed({
    get: () =>
      Array.isArray(rawSort.value)
        ? rawSort.value[0] ?? defaultSort
        : rawSort.value,
    set: (val: string) => {
      rawSort.value = val
    },
  }) as Ref<string>

  const activeFilters = useStorage<Record<string, string[]>>(
    `@DEJA/prefs/${moduleName}/Filter`,
    {}
  )
  const searchQuery = useStorage<string>(
    `@DEJA/prefs/${moduleName}/Search`,
    ''
  )

  // Computed
  const hasActiveFilters = computed(() =>
    Object.values(activeFilters.value).some((arr) => arr.length > 0)
  )
  const activeFilterCount = computed(() =>
    Object.values(activeFilters.value).reduce(
      (sum, arr) => sum + arr.length,
      0
    )
  )
  const isNonDefaultSort = computed(() => sortBy.value !== defaultSort)

  // Filter + search + sort pipeline
  const filteredList = computed(() => {
    if (!Array.isArray(list.value)) return []

    let result = [...list.value]

    // Apply filters: AND across types, OR within a type
    const active = Object.entries(activeFilters.value).filter(
      ([, values]) => values.length > 0
    )
    if (active.length) {
      result = result.filter((item) =>
        active.every(([key, selected]) => {
          const val = (item as Record<string, unknown>)[key]
          if (val == null) return false
          if (Array.isArray(val))
            return selected.some((s) => val.includes(s))
          return selected.includes(String(val))
        })
      )
    }

    // Apply search
    const query = searchQuery.value?.trim().toLowerCase()
    if (query) {
      result = result.filter((item) => {
        const name = (item as Record<string, unknown>).name
        return typeof name === 'string' && name.toLowerCase().includes(query)
      })
    }

    // Apply sort
    if (sortBy.value && sortBy.value !== 'order') {
      result.sort((a, b) => {
        const aVal = String(
          (a as Record<string, unknown>)[sortBy.value] ?? ''
        )
        const bVal = String(
          (b as Record<string, unknown>)[sortBy.value] ?? ''
        )
        return aVal.localeCompare(bVal)
      })
    }

    return result
  })

  // Actions
  function clearFilters() {
    activeFilters.value = {}
  }

  function clearAll() {
    clearFilters()
    searchQuery.value = ''
    sortBy.value = defaultSort
    viewAs.value = defaultView
  }

  function setFilter(type: string, values: string[]) {
    activeFilters.value = { ...activeFilters.value, [type]: values }
  }

  function removeFilter(type: string, value: string) {
    const current = activeFilters.value[type] ?? []
    activeFilters.value = {
      ...activeFilters.value,
      [type]: current.filter((v) => v !== value),
    }
  }

  return {
    searchQuery,
    viewAs,
    sortBy,
    activeFilters,
    filteredList,
    hasActiveFilters,
    activeFilterCount,
    isNonDefaultSort,
    clearFilters,
    clearAll,
    setFilter,
    removeFilter,
  }
}
