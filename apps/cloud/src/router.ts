import { ref } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'
import { getCurrentUser } from 'vuefire'
import type { User } from 'firebase/auth'
import { useStorage } from '@vueuse/core'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { createLogger } from '@repo/utils'
import Dashboard from './Dashboard/Dashboard.vue'
import Login from './views/Login.vue'

const log = createLogger('Router')

// ---------------------------------------------------------------------------
// Route meta types – each boolean flag declares a guard requirement.
// Guards run in a fixed order inside a single beforeEach, sharing the
// resolved auth state so we never call getCurrentUser() more than once per
// navigation.
// ---------------------------------------------------------------------------
declare module 'vue-router' {
  interface RouteMeta {
    /** Redirect away if the user is already authenticated (login/signup pages) */
    redirectIfAuthenticated?: boolean
    /** Require an authenticated user – redirect to /login if missing */
    requireAuth?: boolean
    /** Require that the user has completed onboarding (has at least one layout) */
    requireOnboarding?: boolean
    /** Require that at least one of the user's layouts is approved */
    requireApproval?: boolean
    /** Require that a layout is selected in localStorage */
    requireLayout?: boolean
    /** Require a DCC-EX device on the selected layout */
    requireDccEx?: boolean
  }
}

// ---------------------------------------------------------------------------
// Reactive navigation state – allows App.vue to show a loading indicator
// while the guard chain resolves.
// ---------------------------------------------------------------------------
export const isNavigating = ref(false)

// ---------------------------------------------------------------------------
// Route definitions
// ---------------------------------------------------------------------------
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Dashboard,
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { redirectIfAuthenticated: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('./views/Signup.vue'),
      meta: { redirectIfAuthenticated: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('./views/ForgotPassword.vue'),
    },
    {
      path: '/pending-approval',
      name: 'pending-approval',
      component: () => import('./views/PendingApproval.vue'),
      meta: { requireAuth: true, requireOnboarding: true },
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('./Onboarding/OnboardingWizard.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/select-layout',
      name: 'Select Layout',
      component: () => import('./Layout/SelectLayout.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/locos',
      name: 'Roster',
      component: () => import('./Roster/Roster.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireDccEx: true, requireLayout: true },
    },
    {
      path: '/locos/new',
      name: 'Add Loco',
      component: () => import('./Roster/AddLoco.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/locos/:address',
      name: 'Edit Loco',
      component: () => import('./Roster/EditLoco.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/effects',
      name: 'Effects',
      component: () => import('./Effects/Effects.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/effects/new',
      name: 'Add Effect',
      component: () => import('./Effects/AddEffect.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/effects/:effectId',
      name: 'Edit Effect',
      component: () => import('./Effects/EditEffect.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/routes',
      name: 'Routes',
      component: () => import('./Routes/Routes.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/routes/new',
      name: 'Add Route',
      component: () => import('./Routes/AddRoute.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/routes/:routeId',
      name: 'Edit Route',
      component: () => import('./Routes/EditRoute.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/signals',
      name: 'Signals',
      component: () => import('./Signals/Signals.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/signals/new',
      name: 'Add Signal',
      component: () => import('./Signals/AddSignal.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/signals/:signalId',
      name: 'Edit Signal',
      component: () => import('./Signals/EditSignal.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/sensors',
      name: 'Sensors',
      component: () => import('./Sensors/Sensors.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/sensors/new',
      name: 'Add Sensor',
      component: () => import('./Sensors/AddSensor.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/sensors/automations',
      name: 'Automations',
      component: () => import('./Sensors/Automations.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/sensors/automations/new',
      name: 'Add Automation',
      component: () => import('./Sensors/AutomationForm.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/sensors/automations/:automationId',
      name: 'Edit Automation',
      component: () => import('./Sensors/AutomationForm.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/sensors/:sensorId',
      name: 'Edit Sensor',
      component: () => import('./Sensors/EditSensor.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/turnouts',
      name: 'Turnouts',
      component: () => import('./Turnouts/Turnouts.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/turnouts/new',
      name: 'Add Turnout',
      component: () => import('./Turnouts/AddTurnout.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/turnouts/:turnoutId',
      name: 'Edit Turnout',
      component: () => import('./Turnouts/EditTurnout.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/turnouts/labels',
      name: 'Turnout Labels',
      component: () => import('./Turnouts/TurnoutLabels.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/dccex',
      name: 'DCC-EX',
      component: () => import('./DCCEX/DCCEX.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireDccEx: true, requireLayout: true },
    },
    {
      path: '/layout',
      name: 'Layout',
      component: () => import('./Layout/Layout.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('./Settings/Settings.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/layout/device/:deviceId',
      name: 'Device',
      component: () => import('./Layout/Devices/DeviceDetails.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireApproval: true, requireLayout: true },
    },
    // 404 - Catch all unmatched routes
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('./views/NotFound.vue'),
      meta: { requireAuth: true },
    },
  ],
})

// ---------------------------------------------------------------------------
// Guard implementations
//
// Each guard receives the resolved Firebase user (from a single
// getCurrentUser() call) and the target route. Returning a
// RouteLocationRaw triggers a redirect; returning undefined continues.
// ---------------------------------------------------------------------------

function checkRedirectIfAuthenticated(
  user: User | null,
): RouteLocationRaw | undefined {
  if (user) {
    return { path: '/' }
  }
}

function checkRequireAuth(
  user: User | null,
  to: RouteLocationNormalized,
): RouteLocationRaw | undefined {
  if (!user) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }
}

async function checkRequireOnboarding(
  user: User,
  to: RouteLocationNormalized,
): Promise<RouteLocationRaw | undefined> {
  const layoutsQuery = query(
    collection(db, 'layouts'),
    where('owner', '==', user.email),
  )
  const layoutsSnap = await getDocs(layoutsQuery)

  if (layoutsSnap.empty) {
    return {
      path: '/onboarding',
      query: { redirect: to.fullPath },
    }
  }
}

async function checkRequireApproval(
  user: User,
): Promise<RouteLocationRaw | undefined> {
  const layoutsQuery = query(
    collection(db, 'layouts'),
    where('owner', '==', user.email),
  )
  const layoutsSnap = await getDocs(layoutsQuery)

  // If the user has no layouts the onboarding guard should have caught it.
  if (layoutsSnap.empty) {
    return
  }

  const hasApprovedLayout = layoutsSnap.docs.some(
    (doc) => doc.data().approved === true,
  )

  if (!hasApprovedLayout) {
    return { path: '/pending-approval' }
  }
}

function checkRequireLayout(
  to: RouteLocationNormalized,
): RouteLocationRaw | undefined {
  const layoutId = useStorage<string | null>('@DEJA/layoutId', null)

  if (!layoutId.value || layoutId.value === '') {
    return {
      path: '/select-layout',
      query: { redirect: to.fullPath },
    }
  }
}

function checkRequireDccEx(): RouteLocationRaw | undefined {
  // DCC-EX guard is currently informational only (the check is commented
  // out in the original code). Kept as a no-op placeholder so the meta
  // flag still works when the check is eventually re-enabled.
  return undefined
}

// ---------------------------------------------------------------------------
// Unified beforeEach guard
//
// Resolves Firebase auth exactly once per navigation, then runs each
// guard in dependency order. The first guard that returns a redirect
// wins — subsequent guards are skipped.
// ---------------------------------------------------------------------------
router.beforeEach(async (to) => {
  isNavigating.value = true

  try {
    const { meta } = to

    // Resolve Firebase auth state once for the entire guard chain.
    const currentUser = await getCurrentUser()

    // 1. Redirect-if-authenticated (login / signup pages)
    if (meta.redirectIfAuthenticated) {
      const redirect = checkRedirectIfAuthenticated(currentUser)
      if (redirect) {
        log.debug('redirectIfAuthenticated → redirecting', redirect)
        return redirect
      }
    }

    // 2. Require authentication
    if (meta.requireAuth) {
      const redirect = checkRequireAuth(currentUser, to)
      if (redirect) {
        log.debug('requireAuth → redirecting to login')
        return redirect
      }
    }

    // From this point on, currentUser is guaranteed non-null when
    // requireAuth is set (the guard above would have returned).
    const user = currentUser as User

    // 3. Require onboarding (user must have at least one layout)
    if (meta.requireOnboarding) {
      const redirect = await checkRequireOnboarding(user, to)
      if (redirect) {
        log.debug('requireOnboarding → redirecting to onboarding')
        return redirect
      }
    }

    // 4. Require layout approval
    if (meta.requireApproval) {
      const redirect = await checkRequireApproval(user)
      if (redirect) {
        log.debug('requireApproval → redirecting to pending-approval')
        return redirect
      }
    }

    // 5. Require a selected layout in localStorage
    if (meta.requireLayout) {
      const redirect = checkRequireLayout(to)
      if (redirect) {
        log.debug('requireLayout → redirecting to select-layout')
        return redirect
      }
    }

    // 6. Require DCC-EX device
    if (meta.requireDccEx) {
      const redirect = checkRequireDccEx()
      if (redirect) {
        log.debug('requireDccEx → redirecting')
        return redirect
      }
    }

    // All guards passed — allow navigation.
  } catch (error) {
    log.error('Navigation guard error:', error)
    // On unexpected errors in the guard chain, redirect to login as a
    // safe fallback to avoid leaving the user in a broken state.
    return { path: '/login' }
  } finally {
    isNavigating.value = false
  }
})

export default router
