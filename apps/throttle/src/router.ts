import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { requireAuth, requireDccEx, requireLayout } from '@repo/auth'
import HomeView from './views/HomeView.vue'
import Connect from './connect/Connect.vue'
import { DEFAULT_MENU_CONFIG } from './Core/Menu/useMenu'
import { Login } from '@repo/auth'

type MenuItem = {
  color: string
  icon: string
  label: string
  name: string
  path: string
  componentPath: string
  isFavorite?: boolean
  requireDccEx?: boolean
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/select-layout',
      name: 'Select Layout',
      component: () => import('./views/SelectLayoutView.vue'),
      beforeEnter: [requireAuth],
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('./views/SettingsView.vue'),
      beforeEnter: [requireAuth],
    },
    {
      path: '/roadname-logos',
      name: 'roadname-logos',
      component: () => import('./views/RoadnameLogosView.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    ...DEFAULT_MENU_CONFIG.map((m: MenuItem): RouteRecordRaw => {
      const component = m.componentPath
        ? // dynamic import from string (allow non-literal with Vite)
          () => import(/* @vite-ignore */ m.componentPath)
        : undefined

      const beforeEnter = m.requireDccEx ? [requireDccEx] : undefined

      const route: RouteRecordRaw = {
        path: m.path,
        name: m.name,
        // only include component/beforeEnter when defined to avoid matching the redirect route type
        ...(component ? { component } : {}),
        ...(beforeEnter ? { beforeEnter } : {}),
      }

      return route
    }),
  ],
})

export default router
