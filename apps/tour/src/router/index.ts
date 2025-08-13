import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth } from '@repo/auth'
import Home from '../views/Home.vue'
import Welcome from '../views/Welcome.vue'
import EffectsControl from '../views/EffectsControl.vue'
import MediaLibrary from '../views/MediaLibrary.vue'
import AreaDetail from '../views/AreaDetail.vue'
import TourLogin from '../views/TourLogin.vue'

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

// Auth guard that respects demo mode
const authGuard = isDemoMode ? [] : [requireAuth]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: TourLogin
    },
    {
      path: '/',
      name: 'home',
      component: Home,
      beforeEnter: authGuard
    },
    {
      path: '/welcome',
      name: 'welcome',
      component: Welcome,
      beforeEnter: authGuard
    },
    {
      path: '/effects',
      name: 'effects',
      component: EffectsControl,
      beforeEnter: authGuard
    },
    {
      path: '/media',
      name: 'media',
      component: MediaLibrary,
      beforeEnter: authGuard
    },
    {
      path: '/area/:id',
      name: 'area-detail',
      component: AreaDetail,
      props: true,
      beforeEnter: authGuard
    }
  ]
})

export default router