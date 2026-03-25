import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from 'vuefire'
import type { User } from 'firebase/auth'
import { requireLayout } from '@repo/auth'
import { createTryDemoRoute } from '@repo/auth'
import { createLogger } from '@repo/utils'
import HomeView from './views/HomeView.vue'
import LoginView from './views/LoginView.vue'
import { LogoutView } from '@repo/auth'

const log = createLogger('Router')

// ---------------------------------------------------------------------------
// Route meta types – each boolean flag declares a guard requirement.
// ---------------------------------------------------------------------------
declare module 'vue-router' {
  interface RouteMeta {
    /** Redirect away if the user is already authenticated (login page) */
    redirectIfAuthenticated?: boolean
    /** Require an authenticated user – redirect to /login if missing */
    requireAuth?: boolean
    /** Require that a layout is selected in localStorage */
    requireLayout?: boolean
    /** Require a DCC-EX device on the selected layout */
    requireDccEx?: boolean
    /** Fullscreen mode – hides nav chrome (header, menu, footer) */
    fullscreen?: boolean
  }
}

// ---------------------------------------------------------------------------
// Route definitions
// ---------------------------------------------------------------------------
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requireAuth: true, requireLayout: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { redirectIfAuthenticated: true, fullscreen: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('./views/SignupView.vue'),
      meta: { redirectIfAuthenticated: true, fullscreen: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('./views/ForgotPasswordView.vue'),
      meta: { fullscreen: true },
    },
    {
      path: '/logout',
      name: 'logout',
      component: LogoutView,
      meta: { fullscreen: true },
    },
    {
      path: '/connect',
      name: 'connect',
      component: () => import('./connect/Connect.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/locos',
      name: 'roster',
      component: () => import('./views/RosterView.vue'),
      meta: { requireAuth: true, requireLayout: true },
    },
    {
      path: '/effects',
      name: 'effects',
      component: () => import('./views/EffectsView.vue'),
      meta: { requireAuth: true, requireLayout: true },
    },
    {
      path: '/signals',
      name: 'signals',
      component: () => import('./views/SignalsView.vue'),
      meta: { requireAuth: true, requireLayout: true },
    },
    {
      path: '/routes',
      name: 'routes',
      component: () => import('./views/RoutesView.vue'),
      meta: { requireAuth: true, requireLayout: true },
    },
    {
      path: '/turnouts',
      name: 'turnouts',
      component: () => import('./views/TurnoutsView.vue'),
      meta: { requireAuth: true, requireLayout: true },
    },
    {
      path: '/conductor',
      name: 'conductor',
      component: () => import('./views/ConductorView.vue'),
      meta: { requireAuth: true, requireLayout: true, requireDccEx: true },
    },
    {
      path: '/throttle/:address',
      name: 'throttle',
      component: () => import('./views/ThrottleView.vue'),
      meta: { requireAuth: true, requireLayout: true, requireDccEx: true },
    },
    {
      path: '/throttles',
      name: 'throttles',
      component: () => import('./views/ThrottleListView.vue'),
      meta: { requireAuth: true, requireLayout: true, requireDccEx: true },
    },
    {
      path: '/throttle-list',
      name: 'throttle-list',
      component: () => import('./views/ThrottleListView.vue'),
      meta: { requireAuth: true, requireLayout: true, requireDccEx: true },
    },
    {
      path: '/select-layout',
      name: 'Select Layout',
      component: () => import('./views/SelectLayoutView.vue'),
      meta: { requireAuth: true, fullscreen: true },
    },
    {
      path: '/programming',
      name: 'programming',
      component: () => import('./views/ProgrammingView.vue'),
      meta: { requireAuth: true, requireLayout: true, requireDccEx: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('./views/SettingsView.vue'),
      meta: { requireAuth: true },
    },
    createTryDemoRoute(),
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('./views/NotFound.vue'),
      meta: { requireAuth: true },
    },
  ],
})

// ---------------------------------------------------------------------------
// Unified beforeEach guard
//
// Resolves Firebase auth exactly once per navigation, then runs each
// guard in dependency order. The first guard that returns a redirect
// wins — subsequent guards are skipped.
// ---------------------------------------------------------------------------
router.beforeEach(async (to) => {
  try {
    const { meta } = to

    // Demo mode auto-login bypass (local dev only)
    if (import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === 'true') {
      return
    }

    // Resolve Firebase auth state once for the entire guard chain.
    const currentUser = await getCurrentUser()

    // 1. Redirect-if-authenticated (login page)
    if (meta.redirectIfAuthenticated) {
      if (currentUser) {
        log.debug('redirectIfAuthenticated → redirecting to home')
        return { path: '/' }
      }
    }

    // 2. Require authentication
    if (meta.requireAuth) {
      if (!currentUser) {
        log.debug('requireAuth → redirecting to login')
        return { path: '/login', query: { redirect: to.fullPath } }
      }
    }

    // From this point on, currentUser is guaranteed non-null when
    // requireAuth is set (the guard above would have returned).
    const user = currentUser as User

    // 3. Require a selected layout (auto-selects single layout)
    if (meta.requireLayout) {
      const redirect = await requireLayout(user.email!, to)
      if (redirect) {
        log.debug('requireLayout → redirecting')
        return redirect
      }
    }

    // 4. Require DCC-EX device (placeholder — currently informational only)
    if (meta.requireDccEx) {
      // TODO: re-enable when DCC-EX device check is fully implemented
    }

    // All guards passed — allow navigation.
  } catch (error) {
    log.error('Navigation guard error:', error)
    return { path: '/login' }
  }
})

export default router
