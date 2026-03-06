import { getCurrentUser } from 'vuefire'

export async function redirectIfAuthenticated() {
  const currentUser = await getCurrentUser()

  if (currentUser) {
    return { path: '/' }
  }
}
