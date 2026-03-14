/**
 * Shared mock router for Storybook stories.
 *
 * Uses createMemoryHistory so stories do not depend on browser URL state.
 * Routes are stubbed with empty components — only the path matters for
 * components that use `useRouter()` or `<router-link>`.
 */

import { defineComponent, h } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'

/** Minimal placeholder component used for all stub routes */
const StubView = defineComponent({
  name: 'StubView',
  render() {
    return h('div', 'Stub route view')
  },
})

/** Create a fresh router instance (call once per Storybook setup) */
export function createMockRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: StubView },
      { path: '/throttle', name: 'throttle-list', component: StubView },
      { path: '/throttle/:address', name: 'throttle', component: StubView },
      { path: '/turnouts', name: 'turnouts', component: StubView },
      { path: '/effects', name: 'effects', component: StubView },
      { path: '/roster', name: 'roster', component: StubView },
      { path: '/routes', name: 'routes', component: StubView },
      { path: '/signals', name: 'signals', component: StubView },
      { path: '/conductor', name: 'conductor', component: StubView },
      { path: '/sensors', name: 'sensors', component: StubView },
      { path: '/settings', name: 'settings', component: StubView },
      { path: '/select-layout', name: 'select-layout', component: StubView },
      { path: '/devices', name: 'Devices', component: StubView },
    ],
  })
}

/** Singleton router used by the global Storybook decorator in preview.ts */
export const mockRouter = createMockRouter()

export default mockRouter
