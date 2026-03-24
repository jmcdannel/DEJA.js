import { createRouter, createWebHistory } from 'vue-router'
import { Login, LogoutView, requireAuth, requireLayout } from '@repo/auth'
import Dashboard from './Dashboard/Dashboard.vue'

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
      component: LogoutView,
      name: 'logout',
      path: '/logout',
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('./Settings/Settings.vue'),
      beforeEnter: [requireAuth],
    },
    {
      path: '/logs/:logType',
      name: 'log-view',
      component: () => import('./views/LogView.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/logs/devices/:deviceId',
      name: 'device-log-view',
      component: () => import('./views/DeviceSerialMonitorView.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/demo',
      name: 'Device Monitor Demo',
      component: () => import('./Dashboard/components/DeviceSerialMonitor/DeviceSerialMonitorDemo.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('./views/NotFound.vue'),
      beforeEnter: [requireAuth],
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
