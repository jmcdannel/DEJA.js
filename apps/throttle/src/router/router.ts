import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import SelectConnections from '@/connections/SelectConnections.component.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/locos',
      name: 'roster',
      component: () => import('../views/RosterView.vue'),
    },
    {
      path: '/connect',
      name: 'connect',
      component: SelectConnections,
    },
    {
      path: '/effects',
      name: 'effects',
      component: () => import('../views/EffectsView.vue'),
    },
    {
      path: '/routes',
      name: 'routes',
      component: () => import('../views/RoutesView.vue'),
    },
    {
      path: '/turnouts',
      name: 'turnouts',
      component: () => import('../views/TurnoutsView.vue'),
    },
    {
      path: '/conductor',
      name: 'conductor',
      component: () => import('../views/ConductorView.vue'),
    },
    {
      path: '/throttle/:address',
      name: 'throttle',
      component: () => import('../views/ThrottleView.vue'),
    },
    {
      path: '/throttle-list',
      name: 'throttle-list',
      component: () => import('../views/ThrottleList.vue'),
    },
    {
      path: '/connect/dejajs',
      name: 'dejajs',
      component: () => import('../connections/deja/DejaJs.vue'),
    },
    {
      path: '/connect/deja-cloud',
      name: 'deja-cloud',
      component: () => import('../connections/deja/DejaCloud.vue'),
    },
    {
      path: '/connect/deja-direct',
      name: 'deja-direct',
      component: () => import('../connections/deja/DejaServer.vue'),
    },
  ],
})

export default router
