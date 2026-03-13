import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
})

export function getPriceId(plan: 'engineer' | 'conductor', cycle: 'monthly' | 'annual'): string {
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${cycle.toUpperCase()}`
  const priceId = process.env[key]
  if (!priceId) throw new Error(`Missing env var: ${key}`)
  return priceId
}
