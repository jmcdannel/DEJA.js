import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from 'vuefire'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { isFeatureAccessible } from '@repo/modules'
import type { UserRole } from '@repo/modules'
import { useDemoAuth } from '@repo/auth'
import { requireGuestOrAuth } from '../auth/guest-auth'
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
    },
    {
      path: '/not-available',
      name: 'not-available',
      component: () => import('../views/NotAvailable.vue'),
    },
    {
      path: '/try-demo',
      name: 'try-demo',
      beforeEnter: async () => {
        const { signInAsDemo } = useDemoAuth()
        await signInAsDemo()
        return { path: '/' }
      },
      component: TourLogin,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFound.vue'),
      beforeEnter: authGuard,
    },
  ]
})

const devFeaturesEnv = import.meta.env.VITE_DEV_FEATURES === 'true'
let cachedTourUserRole: UserRole | null = null
let cachedTourUserId: string | null = null

router.beforeEach(async (to) => {
  // Skip pages that don't need feature checks
  if (to.name === 'not-available' || to.name === 'login') return

  // In demo mode, skip feature check
  if (isDemoMode) return

  // Resolve user role from Firestore (cached per session)
  const currentUser = await getCurrentUser()
  if (!currentUser) return // let per-route beforeEnter auth guards handle this

  if (!cachedTourUserRole || cachedTourUserId !== currentUser.uid) {
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
    cachedTourUserRole = (userDoc.data()?.role as UserRole) ?? 'user'
    cachedTourUserId = currentUser.uid
  }

  if (!isFeatureAccessible('tourApp', cachedTourUserRole, devFeaturesEnv)) {
    return { name: 'not-available' }
  }
})

export default router