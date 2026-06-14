// packages/modules/plans/useSubscription.ts
import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useDocument, useCurrentUser, useFirestore } from 'vuefire'
import { PLAN_LIMITS, TIER_ORDER } from './constants'
import type { PlanTier, PlanLimits, UserDocument, SubscriptionStatus } from './types'

export function useSubscription() {
  const user = useCurrentUser()
  const db = useFirestore()

  const userDocRef = computed(() => {
    if (!user.value) return null
    return doc(db, 'users', user.value.uid)
  })

  const userDoc = useDocument<UserDocument>(userDocRef)

  const subscription = computed(() => userDoc.value?.subscription ?? null)

  // Firestore data is untyped at runtime — guard against legacy/unknown plan
  // values (e.g. a stale Stripe price id or an empty string) so that lookups
  // like PLAN_DISPLAY[plan.value] / PLAN_LIMITS[plan.value] never resolve to
  // undefined and throw during render. Falls back to the free tier.
  const plan = computed<PlanTier>(() => {
    const value = subscription.value?.plan
    return value && TIER_ORDER.includes(value) ? value : 'hobbyist'
  })

  const status = computed<SubscriptionStatus>(() => subscription.value?.status ?? 'active')

  const limits = computed<PlanLimits>(() => PLAN_LIMITS[plan.value])

  const isTrialing = computed(() => status.value === 'trialing')

  const trialDaysLeft = computed(() => {
    if (!isTrialing.value || !subscription.value?.trialEndsAt) return 0
    const trialEnd = subscription.value.trialEndsAt.toDate()
    const now = new Date()
    const diff = trialEnd.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })

  const isActive = computed(() =>
    status.value === 'active' || status.value === 'trialing'
  )

  function canAdd(resource: keyof PlanLimits, currentCount: number): boolean {
    const limit = limits.value[resource]
    if (typeof limit === 'boolean') return limit
    return currentCount < limit
  }

  function requiresPlan(minPlan: PlanTier): boolean {
    const currentIndex = TIER_ORDER.indexOf(plan.value)
    const requiredIndex = TIER_ORDER.indexOf(minPlan)
    return currentIndex < requiredIndex
  }

  return {
    plan,
    status,
    limits,
    isTrialing,
    isActive,
    trialDaysLeft,
    canAdd,
    requiresPlan,
    subscription,
    userDoc,
  }
}
