import { useStorage } from '@vueuse/core'

export async function requireLayout() {
  const layoutId = useStorage('@DEJA/layoutId', '')

  if (!layoutId.value) {
    return {
      path: '/connect',
      query: { redirect: window.location.pathname },
    }
  }
}
