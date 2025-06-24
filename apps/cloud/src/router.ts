import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireDccEx, requireLayout } from './auth/guards'
import Dashboard from './Dashboard/Dashboard.vue'
import Login from './auth/Login.vue'

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
      path: '/routes',
      name: 'Routes',
      component: () => import('./Routes/Routes.vue'),
      beforeEnter: [requireAuth, requireLayout],
    },
    {
      path: '/turnouts',
      name: 'Turnouts',
      component: () => import('./Turnouts/Turnouts.vue'),
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
      path: '/signals',
      name: 'Signals',
      component: () => import('./Signals/SignalList.vue'),
      beforeEnter: [requireAuth, requireLayout],
    }
  ],
})

export default router
