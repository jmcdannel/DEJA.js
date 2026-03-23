import type { Timestamp } from 'firebase/firestore'

export interface OnboardingState {
  planSelected: boolean
  layoutCreated: boolean
  installStarted: boolean
  installStartedAt: Timestamp | null
  serverStarted: boolean
  serverStartedAt: Timestamp | null
}

export type OnboardingStep =
  | 'account'
  | 'plan'
  | 'layout'
  | 'install'
  | 'ready'

export interface OnboardingStepInfo {
  key: OnboardingStep
  label: string
  description: string
  icon: string
}
