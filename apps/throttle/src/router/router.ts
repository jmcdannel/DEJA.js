import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireDccEx, requireLayout } from '../auth/guards'
import HomeView from '../views/HomeView.vue'
import Connect from '../connect/Connect.vue'
import Login from '../auth/Login.vue'

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
      component: () => Login,
    },
    {
      path: '/connect',
      name: 'connect',
      component: Connect,
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
      path: '/routes',
      name: 'routes',
      component: () => import('../views/RoutesView.vue'),
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
      path: '/throttle-list',
      name: 'throttle-list',
      component: () => import('../views/ThrottleList.vue'),
      beforeEnter: [requireAuth, requireDccEx, requireLayout],
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
