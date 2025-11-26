import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireDccEx, requireLayout } from '@repo/auth'
import Dashboard from './Dashboard/Dashboard.vue'
import Login from './views/Login.vue'

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
      path: '/select-layout',
      name: 'Select Layout',
      component: () => import('./Layout/SelectLayout.vue'),
      beforeEnter: [requireAuth],
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
      path: '/effects/new',
      name: 'Add Effect',
      component: () => import('./Effects/AddEffect.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/effects/:effectId',
      name: 'Edit Effect',
      component: () => import('./Effects/EditEffect.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/routes',
      name: 'Routes',
      component: () => import('./Routes/Routes.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/routes/new',
      name: 'Add Route',
      component: () => import('./Routes/AddRoute.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/routes/:routeId',
      name: 'Edit Route',
      component: () => import('./Routes/EditRoute.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/signals',
      name: 'Signals',
      component: () => import('./Signals/Signals.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/signals/new',
      name: 'Add Signal',
      component: () => import('./Signals/AddSignal.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/signals/:signalId',
      name: 'Edit Signal',
      component: () => import('./Signals/EditSignal.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/turnouts',
      name: 'Turnouts',
      component: () => import('./Turnouts/Turnouts.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/turnouts/new',
      name: 'Add Turnout',
      component: () => import('./Turnouts/AddTurnout.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/turnouts/:turnoutId',
      name: 'Edit Turnout',
      component: () => import('./Turnouts/EditTurnout.vue'),
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
      path: '/settings',
      name: 'Settings',
      component: () => import('./Settings/Settings.vue'),
      beforeEnter: [requireAuth],
    },
    {
      path: '/layout/device/:deviceId',
      name: 'Device',
      component: () => import('./Layout/Devices/DeviceDetails.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    // 404 - Catch all unmatched routes
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('./views/NotFound.vue'),
      beforeEnter: [requireAuth],
    }
  ],
})

export default router
