import { computed } from 'vue'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useDocument, useCurrentUser, useFirestore } from 'vuefire'
import { useStorage } from '@vueuse/core'
import { DEFAULT_ONBOARDING_STATE } from './constants'
import type { OnboardingState } from './types'
import type { PlanTier, BillingCycle } from '../plans/types'

interface UserDocWithOnboarding {
  onboarding?: Partial<OnboardingState>
}

export function useOnboarding() {
  const user = useCurrentUser()
  const db = useFirestore()
  const layoutId = useStorage('@DEJA/layoutId', '')

  const userDocRef = computed(() => {
    if (!user.value) return null
    return doc(db, 'users', user.value.uid)
  })

  const userDoc = useDocument<UserDocWithOnboarding>(userDocRef)

  // `useDocument` returns `undefined` while loading, then the data (or null if missing)
  const ready = computed(() => userDoc.value !== undefined)

  const state = computed<OnboardingState>(() => ({
    ...DEFAULT_ONBOARDING_STATE,
    ...(userDoc.value?.onboarding ?? {}),
  }))

  // Derived helpers for persistent prompts
  const needsInstall = computed(() => !state.value.serverStarted)
  const needsLocos = computed(() => state.value.serverStarted) // loco count check is caller's responsibility
  const isComplete = computed(
    () => state.value.planSelected && state.value.layoutCreated && state.value.serverStarted
  )

  // Current step index for progress tracker.
  // New order: 0=Account, 1=NameLayout, 2=Plan, 3=Install, 4=Ready
  // Starts at 1 because useOnboarding requires an authenticated user — account step is always complete.
  const currentStepIndex = computed(() => {
    if (!state.value.layoutNamed) return 1  // name layout step
    if (!state.value.planSelected) return 2 // plan step
    if (!state.value.layoutCreated) return 3 // install step (creates the layout)
    if (!state.value.serverStarted) return 3 // still on install, waiting for server
    return 4 // ready
  })

  // Write helpers — each is write-once (only writes if field is not already set)

  async function setLayoutNamed(name: string, id: string): Promise<void> {
    if (!user.value || state.value.layoutNamed) return
    await setDoc(
      doc(db, 'users', user.value.uid),
      {
        onboarding: {
          layoutNamed: true,
          pendingLayoutName: name,
          pendingLayoutId: id,
        },
      },
      { merge: true }
    )
  }

  async function setPlanSelected(plan: PlanTier, billingCycle: BillingCycle | null): Promise<void> {
    if (!user.value || state.value.planSelected) return
    await setDoc(
      doc(db, 'users', user.value.uid),
      {
        onboarding: {
          planSelected: true,
          pendingPlan: plan,
          pendingBillingCycle: billingCycle,
        },
      },
      { merge: true }
    )
  }

  async function setPaymentComplete(): Promise<void> {
    if (!user.value || state.value.paymentComplete) return
    await setDoc(
      doc(db, 'users', user.value.uid),
      { onboarding: { paymentComplete: true } },
      { merge: true }
    )
  }

  async function setLayoutCreated(): Promise<void> {
    if (!user.value || state.value.layoutCreated) return
    await setDoc(
      doc(db, 'users', user.value.uid),
      { onboarding: { layoutCreated: true } },
      { merge: true }
    )
  }

  async function setInstallStarted(): Promise<void> {
    if (!user.value || state.value.installStarted) return
    await setDoc(
      doc(db, 'users', user.value.uid),
      {
        onboarding: {
          installStarted: true,
          installStartedAt: serverTimestamp(),
        },
      },
      { merge: true }
    )
  }

  return {
    state,
    ready,
    needsInstall,
    needsLocos,
    isComplete,
    currentStepIndex,
    setLayoutNamed,
    setPlanSelected,
    setPaymentComplete,
    setLayoutCreated,
    setInstallStarted,
  }
}
