import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './Dashboard/Dashboard.vue'
import { Login, requireAuth, requireDccEx, requireLayout } from '@repo/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      beforeEnter: [requireAuth, requireLayout],
      component: Dashboard,
      name: 'home',
      path: '/',
    },
    {
      component: Login,
      name: 'login',
      path: '/login',
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('./Settings/Settings.vue'),
      beforeEnter: [requireAuth],
    },
    {
      path: '/demo',
      name: 'Device Monitor Demo',
      component: () => import('./Dashboard/components/DeviceSerialMonitor/DeviceSerialMonitorDemo.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    // {
    //   path: '/dccex',
    //   name: 'DCC-EX',
    //   component: () => import('./DCCEX/DCCEX.vue'),
    //   beforeEnter: [requireAuth, requireDccEx, requireLayout],
    // },
    // {
    //   path: '/layout',
    //   name: 'Layout',
    //   component: () => import('./Layout/Layout.vue'),
    //   beforeEnter: [requireAuth, requireDccEx, requireLayout],
    // },
  ],
})

export default router
