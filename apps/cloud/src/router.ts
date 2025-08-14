import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './Dashboard/Dashboard.vue'
import { Login, requireAuth, requireDccEx, requireLayout } from '@repo/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Dashboard,
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/locos',
      name: 'Roster',
      component: () => import('./Roster/Roster.vue'),
      beforeEnter: [requireAuth, requireDccEx, requireLayout],
    },
    { 
      path: '/locos/new',
      name: 'Add Loco',
      component: () => import('./Roster/AddLoco.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    { 
      path: '/locos/:address',
      name: 'Edit Loco',
      component: () => import('./Roster/EditLoco.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/effects',
      name: 'Effects',
      component: () => import('./Effects/Effects.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/effects/sound-test',
      name: 'Sound Test',
      component: () => import('./Effects/SoundTest.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/routes',
      name: 'Routes',
      component: () => import('./Routes/Routes.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/signals',
      name: 'Signals',
      component: () => import('./Signals/Signals.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/turnouts',
      name: 'Turnouts',
      component: () => import('./Turnouts/Turnouts.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/turnouts/labels',
      name: 'Turnout Labels',
      component: () => import('./Turnouts/TurnoutLabels.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/dccex',
      name: 'DCC-EX',
      component: () => import('./DCCEX/DCCEX.vue'),
      beforeEnter: [requireAuth, requireDccEx, requireLayout],
    },
    {
      path: '/layout',
      name: 'Layout',
      component: () => import('./Layout/Layout.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/layout/device/:deviceId',
      name: 'Device',
      component: () => import('./Layout/Devices/DeviceDetails.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/signals',
      name: 'Signals',
      component: () => import('./Signals/SignalsList.vue'),
      beforeEnter: [requireAuth, requireLayout],
    }
  ],
})

export default router
