// 🎯 Shared types and helpers for Sanity-sourced promotions

export interface PromoCTA {
  label: string
  url: string
  style: 'primary' | 'secondary' | 'ghost'
}

export interface SanityPromotion {
  _id: string
  slug: string
  title: string
  body: string
  icon: string | null
  variant: string
  ctas: PromoCTA[]
  slots: string[]
  startDate: string | null
  endDate: string | null
}

export function isActiveNow(promo: SanityPromotion): boolean {
  const now = new Date()
  if (promo.startDate && new Date(promo.startDate) > now) return false
  if (promo.endDate && new Date(promo.endDate) < now) return false
  return true
}
