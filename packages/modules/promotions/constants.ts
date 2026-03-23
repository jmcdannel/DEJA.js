export const PROMO_SLOTS = {
  BANNER_TOP: 'banner-top',
  HERO_SECTION: 'hero-section',
} as const

export type PromoSlot = (typeof PROMO_SLOTS)[keyof typeof PROMO_SLOTS]

export const VARIANT_COLORS: Record<string, string> = {
  info: 'info',
  success: 'success',
  launch: 'success',
  warning: 'warning',
} as const
