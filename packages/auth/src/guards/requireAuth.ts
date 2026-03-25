import { getCurrentUser } from 'vuefire'

export async function requireAuth() {
  if (import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === 'true') {
    return
  }

  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return {
      path: '/login',
      query: { redirect: window.location.pathname },
    }
  }
}
