import { useStorage } from '@vueuse/core'
import { createLogger } from '@repo/utils'

const log = createLogger('Auth')

// Prefer the Vite environment variable VITE_LAYOUT_ID when available.
const defaultLayoutId = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_LAYOUT_ID)
  ? String(import.meta.env.VITE_LAYOUT_ID)
  : null

export async function requireLayout() {
  // initialize storage with the env value (if present) so pages can default to it
  log.debug('defaultLayoutId', defaultLayoutId)
  const layoutId = useStorage('@DEJA/layoutId', defaultLayoutId)

  if (!layoutId.value || layoutId.value === '') {
    return {
      path: '/select-layout',
      query: { redirect: window.location.pathname },
    }
  }
}
