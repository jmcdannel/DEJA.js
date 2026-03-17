// packages/modules/plans/constants.ts
import type { PlanLimits, PlanTier, PlanDisplayInfo } from './types'

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  hobbyist: {
    locos: 5,
    turnouts: 0,
    signals: 0,
    effects: 0,
    sounds: 0,
    routes: 0,
    layouts: 1,
    tourApp: false,
    remoteMonitoring: false,
  },
  engineer: {
    locos: 25,
    turnouts: 15,
    signals: 15,
    effects: 15,
    sounds: 15,
    routes: 10,
    layouts: 2,
    tourApp: false,
    remoteMonitoring: true,
  },
  conductor: {
    locos: Infinity,
    turnouts: Infinity,
    signals: Infinity,
    effects: Infinity,
    sounds: Infinity,
    routes: Infinity,
    layouts: Infinity,
    tourApp: true,
    remoteMonitoring: true,
  },
} as const

export const TIER_ORDER: PlanTier[] = ['hobbyist', 'engineer', 'conductor']

export const PLAN_DISPLAY: Record<PlanTier, PlanDisplayInfo> = {
  hobbyist: {
    name: 'Hobbyist',
    description: 'Get started with basic train control',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      'Up to 5 locomotives',
      'Basic throttle control',
      '1 layout configuration',
      'Community docs access',
      'Local network access only',
    ],
  },
  engineer: {
    name: 'Engineer',
    description: 'Full cloud control for serious hobbyists',
    monthlyPrice: 7,
    annualPrice: 67,
    features: [
      'Up to 25 locomotives',
      '15 turnouts, signals & effects',
      '2 layout configurations',
      'Remote monitoring via secure tunnel',
      'Basic macros & scheduling',
      'Community forum access',
      'Support tickets (72hr SLA)',
    ],
  },
  conductor: {
    name: 'Conductor',
    description: 'Unlimited power for your railroad empire',
    monthlyPrice: 18,
    annualPrice: 173,
    features: [
      'Unlimited locomotives',
      'Unlimited turnouts, signals & effects',
      'Unlimited layout configurations',
      'Remote monitoring via secure tunnel',
      'Tour App access',
      'Advanced macros & automations',
      'Priority support (24hr SLA)',
      'Beta testing program',
    ],
  },
}
