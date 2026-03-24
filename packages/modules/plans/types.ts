// packages/modules/plans/types.ts
import type { Timestamp } from 'firebase/firestore'
import type { UserRole } from '../features/types'

export type PlanTier = 'hobbyist' | 'engineer' | 'conductor'

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'

export type BillingCycle = 'monthly' | 'annual'

export interface UserSubscription {
  plan: PlanTier
  status: SubscriptionStatus
  billingCycle: BillingCycle | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  trialEndsAt: Timestamp | null
  currentPeriodEnd: Timestamp | null
  cancelAtPeriodEnd: boolean
  updatedAt: Timestamp
}

export interface UserDocument {
  email: string
  displayName: string | null
  createdAt: Timestamp
  subscription: UserSubscription
  role?: UserRole
}

export interface PlanLimits {
  locos: number
  turnouts: number
  signals: number
  effects: number
  sounds: number
  routes: number
  layouts: number
  tourApp: boolean
  remoteMonitoring: boolean
}

export interface PlanDisplayInfo {
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  features: string[]
}
