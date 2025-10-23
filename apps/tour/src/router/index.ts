import { createRouter, createWebHistory } from 'vue-router'
import { requireGuestOrAuth } from '../auth/guestAuth'
import Home from '../views/Home.vue'
import Welcome from '../views/Welcome.vue'
import EffectsControl from '../views/EffectsControl.vue'
import MediaLibrary from '../views/MediaLibrary.vue'
import AreaDetail from '../views/AreaDetail.vue'
import TourLogin from '../views/TourLogin.vue'
import ExploreSections from '../views/ExploreSections.vue'

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

// Auth guard that allows both Firebase users and guest users
const authGuard = isDemoMode ? [] : [requireGuestOrAuth]

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
      path: '/sections',
      name: 'sections',
      component: ExploreSections,
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