import { ref, computed } from 'vue'
import { WLED_EFFECTS, type WledEffectMeta } from '../constants/effects'

/**
 * Searchable/filterable effect list composable.
 */
export function useWledEffects() {
  const searchQuery = ref('')

  const filteredEffects = computed<WledEffectMeta[]>(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return WLED_EFFECTS
    return WLED_EFFECTS.filter((fx) =>
      fx.name.toLowerCase().includes(query)
    )
  })

  function getEffectName(id: number): string {
    return WLED_EFFECTS.find((fx) => fx.id === id)?.name ?? `Effect ${id}`
  }

  return {
    searchQuery,
    filteredEffects,
    allEffects: WLED_EFFECTS,
    getEffectName,
  }
}
