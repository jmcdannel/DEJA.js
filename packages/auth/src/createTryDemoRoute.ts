import type { RouteRecordRaw } from 'vue-router'
import { useDemoAuth } from './useDemoAuth'

export function createTryDemoRoute(fallbackComponent?: object): RouteRecordRaw {
  return {
    path: '/try-demo',
    name: 'try-demo',
    beforeEnter: async () => {
      const { signInAsDemo } = useDemoAuth()
      const success = await signInAsDemo()
      if (!success) {
        return { path: '/login' }
      }
      return { path: '/' }
    },
    component: fallbackComponent ?? { template: '<div />' },
  }
}
