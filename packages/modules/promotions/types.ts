import type { Timestamp } from 'firebase/firestore'

export type PromoVariant = 'info' | 'success' | 'launch' | 'warning'

export type PromoCTAStyle = 'primary' | 'secondary' | 'ghost'

export interface PromoCTA {
  label: string
  url: string
  style: PromoCTAStyle
}

export interface Promotion {
  id: string
  slug: string
  title: string
  body: string
  ctas: PromoCTA[]
  slots: string[]
  startDate: Timestamp | null
  endDate: Timestamp | null
  active: boolean
  variant: PromoVariant
  icon: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
