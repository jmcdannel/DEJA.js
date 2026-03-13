import { getCurrentUser } from 'vuefire'

export async function requireAuth() {
  if (import.meta.env.DEV && import.meta.env.VITE_DEV_AUTO_LOGIN === 'true') {
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
