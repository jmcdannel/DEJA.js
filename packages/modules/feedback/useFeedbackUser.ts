// packages/modules/feedback/useFeedbackUser.ts
import { ref, onMounted, onUnmounted } from 'vue'
import { getAuth, onAuthStateChanged, type Unsubscribe } from 'firebase/auth'
import type { FeedbackUser } from './types'

export function useFeedbackUser() {
  const feedbackUser = ref<FeedbackUser | null>(null)
  let unsubscribe: Unsubscribe | null = null

  onMounted(() => {
    const auth = getAuth()
    unsubscribe = onAuthStateChanged(auth, (user) => {
      feedbackUser.value = user
        ? {
            email: user.email ?? undefined,
            username: user.displayName ?? undefined, // maps to Sentry User.username for name pre-fill
            id: user.uid,
          }
        : null
    })
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return { feedbackUser }
}

export default useFeedbackUser
