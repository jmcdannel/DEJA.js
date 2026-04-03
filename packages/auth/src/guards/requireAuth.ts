import { getCurrentUser } from 'vuefire'

export async function requireAuth() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return {
      path: '/login',
      query: { redirect: window.location.pathname },
    }
  }
}
