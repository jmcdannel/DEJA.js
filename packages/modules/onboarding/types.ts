import type { Timestamp } from 'firebase/firestore'

export interface OnboardingState {
  layoutNamed: boolean
  pendingLayoutName: string | null
  pendingLayoutId: string | null
  planSelected: boolean
  layoutCreated: boolean
  installStarted: boolean
  installStartedAt: Timestamp | null
  serverStarted: boolean
  serverStartedAt: Timestamp | null
}

export type OnboardingStep =
  | 'account'
  | 'layout'
  | 'plan'
  | 'install'
  | 'ready'

export interface OnboardingStepInfo {
  key: OnboardingStep
  label: string
  description: string
  icon: string
}
