import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from 'vuefire'
import { Login, LogoutView, requireLayout } from '@repo/auth'
import Dashboard from './Dashboard/Dashboard.vue'

declare module 'vue-router' {
  interface RouteMeta {
    requireAuth?: boolean
    requireLayout?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      component: Dashboard,
      name: 'home',
      path: '/',
      meta: { requireAuth: true, requireLayout: true },
    },
    {
      component: Login,
      name: 'login',
      path: '/login',
    },
    {
      component: LogoutView,
      name: 'logout',
      path: '/logout',
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('./Settings/Settings.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/logs/:logType',
      name: 'log-view',
      component: () => import('./views/LogView.vue'),
      meta: { requireAuth: true, requireLayout: true },
    },
    {
      path: '/logs/devices/:deviceId',
      name: 'device-log-view',
      component: () => import('./views/DeviceSerialMonitorView.vue'),
      meta: { requireAuth: true, requireLayout: true },
    },
    {
      path: '/demo',
      name: 'Device Monitor Demo',
      component: () => import('./Dashboard/components/DeviceSerialMonitor/DeviceSerialMonitorDemo.vue'),
      meta: { requireAuth: true, requireLayout: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('./views/NotFound.vue'),
      meta: { requireAuth: true },
    },
    // {
    //   path: '/dccex',
    //   name: 'DCC-EX',
    //   component: () => import('./DCCEX/DCCEX.vue'),
    //   meta: { requireAuth: true, requireLayout: true },
    // },
    // {
    //   path: '/layout',
    //   name: 'Layout',
    //   component: () => import('./Layout/Layout.vue'),
    //   meta: { requireAuth: true, requireLayout: true },
    // },
  ],
})

router.beforeEach(async (to) => {
  const meta = to.meta ?? {}

  // 1. Require authentication
  if (meta.requireAuth) {
    if (import.meta.env.DEV && import.meta.env.VITE_DEV_AUTO_LOGIN === 'true') {
      // skip auth in dev auto-login mode
    } else {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        return { path: '/login', query: { redirect: to.fullPath } }
      }

      // 2. Require a selected layout
      if (meta.requireLayout) {
        const redirect = await requireLayout(currentUser.email!, to)
        if (redirect) return redirect
      }
    }
  }
})

export default router
