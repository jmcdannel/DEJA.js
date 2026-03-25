import { computed } from 'vue'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useDocument, useCurrentUser, useFirestore } from 'vuefire'
import { useStorage } from '@vueuse/core'
import { DEFAULT_ONBOARDING_STATE } from './constants'
import type { OnboardingState } from './types'

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
  // Starts at 1 (plan step), not 0 (account step), because useOnboarding
  // requires an authenticated user — the account step is always complete.
  const currentStepIndex = computed(() => {
    if (!state.value.planSelected) return 1 // plan step
    if (!state.value.layoutCreated) return 2 // layout step
    if (!state.value.serverStarted) return 3 // install step
    return 4 // ready
  })

  // Write helpers — each is write-once (only writes if field is not already true)
  async function setPlanSelected(): Promise<void> {
    if (!user.value || state.value.planSelected) return
    await setDoc(
      doc(db, 'users', user.value.uid),
      { onboarding: { planSelected: true } },
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
    needsInstall,
    needsLocos,
    isComplete,
    currentStepIndex,
    setPlanSelected,
    setLayoutCreated,
    setInstallStarted,
  }
}
