import { computed } from 'vue'
import { collection, query, where } from 'firebase/firestore'
import { useCollection, useFirestore } from 'vuefire'
import type { Promotion } from './types'

export function usePromotions(slotId: string) {
  const db = useFirestore()

  const promotionsRef = computed(() => {
    return query(
      collection(db, 'promotions'),
      where('active', '==', true),
    )
  })

  const allActive = useCollection<Promotion>(promotionsRef)

  const promotions = computed(() => {
    const now = new Date()
    return (allActive.value ?? []).filter((promo) => {
      if (!promo.slots.includes(slotId)) return false
      if (promo.startDate && promo.startDate.toDate() > now) return false
      if (promo.endDate && promo.endDate.toDate() < now) return false
      return true
    })
  })

  const hasPromotions = computed(() => promotions.value.length > 0)

  return {
    promotions,
    hasPromotions,
  }
}
