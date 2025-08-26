import { useStorage } from '@vueuse/core'

export async function requireLayout() {
  const layoutId = useStorage('@DEJA/layoutId', null)

  if (!layoutId.value || layoutId.value === '') {
    return {
      path: '/select-layout',
      query: { redirect: window.location.pathname },
    }
  }
}
