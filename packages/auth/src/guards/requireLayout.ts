import { useStorage } from '@vueuse/core'

// Prefer the Vite environment variable VITE_LAYOUT_ID when available.
// import.meta.env is provided by Vite in the browser; cast to any to avoid
// TypeScript issues in environments where import.meta may be unavailable.
const defaultLayoutId = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_LAYOUT_ID)
  ? String((import.meta as any).env.VITE_LAYOUT_ID)
  : null

export async function requireLayout() {
  // initialize storage with the env value (if present) so pages can default to it
  console.log('defaultLayoutId', defaultLayoutId)
  const layoutId = useStorage('@DEJA/layoutId', defaultLayoutId)

  if (!layoutId.value || layoutId.value === '') {
    return {
      path: '/select-layout',
      query: { redirect: window.location.pathname },
    }
  }
}
