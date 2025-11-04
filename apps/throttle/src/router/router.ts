import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireDccEx, requireLayout } from '@repo/auth'
import HomeView from '../views/HomeView.vue'
import Connect from '../connect/Connect.vue'
import { Login } from '@repo/auth'

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
      path: '/connect',
      name: 'connect',
      component: Connect,
      beforeEnter: [requireAuth],
    },
    {
      path: '/locos',
      name: 'roster',
      component: () => import('../views/RosterView.vue'),
      beforeEnter: [requireAuth, requireDccEx, requireLayout],
    },
    {
      path: '/effects',
      name: 'effects',
      component: () => import('../views/EffectsView.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/signals',
      name: 'signals',
      component: () => import('../views/SignalsView.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/routes',
      name: 'routes',
      component: () => import('../views/RoutesView.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/roadname-logos',
      name: 'roadname-logos',
      component: () => import('../views/RoadnameLogosView.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/turnouts',
      name: 'turnouts',
      component: () => import('../views/TurnoutsView.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/conductor',
      name: 'conductor',
      component: () => import('../views/ConductorView.vue'),
      beforeEnter: [requireAuth, requireDccEx, requireLayout],
    },
    {
      path: '/throttle/:address',
      name: 'throttle',
      component: () => import('../views/ThrottleView.vue'),
      beforeEnter: [requireAuth, requireDccEx, requireLayout],
    },
    {
      path: '/throttles',
      name: 'throttles',
      component: () => import('../views/ThrottleView.vue'),
      beforeEnter: [requireAuth, requireDccEx, requireLayout],
    },
    {
      path: '/throttle-list',
      name: 'throttle-list',
      component: () => import('../views/ThrottleList.vue'),
      beforeEnter: [requireAuth, requireDccEx, requireLayout],
    },
    {
      path: '/select-layout',
      name: 'Select Layout',
      component: () => import('../views/SelectLayoutView.vue'),
      beforeEnter: [requireAuth],
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      beforeEnter: [requireAuth],
    },
    // {
    //   path: '/connect/dejajs',
    //   name: 'dejajs',
    //   component: () => import('../connections/deja/DejaJs.vue'),
    // },
    // {
    //   path: '/connect/deja-cloud',
    //   name: 'deja-cloud',
    //   component: () => import('../connections/deja/DejaCloud.vue'),
    // },
    // {
    //   path: '/connect/deja-direct',
    //   name: 'deja-direct',
    //   component: () => import('../connections/deja/DejaServer.vue'),
    // },
  ],
})

export default router
