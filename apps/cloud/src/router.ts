import { ref } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'
import { getCurrentUser } from 'vuefire'
import type { User } from 'firebase/auth'
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { requireLayout, ensureAutoLogin, checkRequireFeature, LogoutView } from '@repo/auth'
import { createLogger } from '@repo/utils'
import type { FeatureName, UserRole } from '@repo/modules'
import Dashboard from './Dashboard/Dashboard.vue'
import Login from './views/Login.vue'

const log = createLogger('Router')

let cachedUserRole: UserRole | null = null
let cachedUserId: string | null = null

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
    /** Require that a layout is selected in localStorage */
    requireLayout?: boolean
    /** Require a DCC-EX device on the selected layout */
    requireDccEx?: boolean
    /** Require a feature flag to be enabled for the current user */
    requireFeature?: FeatureName
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
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true },
    },
    {
      path: '/tracker-prototypes',
      name: 'TrackerPrototypes',
      component: () => import('./views/TrackerPrototypes.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { redirectIfAuthenticated: true, fullscreen: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('./views/Signup.vue'),
      meta: { redirectIfAuthenticated: true, fullscreen: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('./views/ForgotPassword.vue'),
      meta: { fullscreen: true },
    },
    {
      path: '/logout',
      name: 'logout',
      component: LogoutView,
      meta: { fullscreen: true },
    },
    {
      path: '/setup-complete',
      name: 'setup-complete',
      component: () => import('./views/SetupComplete.vue'),
      meta: { requireAuth: true, requireOnboarding: true, fullscreen: true },
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('./Onboarding/OnboardingWizard.vue'),
      meta: { requireAuth: true, fullscreen: true },
    },
    {
      path: '/connect',
      name: 'Connect',
      component: () => import('./Connect/Connect.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/select-layout',
      name: 'Select Layout',
      component: () => import('./Layout/SelectLayout.vue'),
      meta: { requireAuth: true, fullscreen: true },
    },
    {
      path: '/locos',
      name: 'Roster',
      component: () => import('./Roster/Roster.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true },
    },
    {
      path: '/locos/new',
      name: 'Add Loco',
      component: () => import('./Roster/AddLoco.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true },
    },
    {
      path: '/locos/:address',
      name: 'Edit Loco',
      component: () => import('./Roster/EditLoco.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true },
    },
    {
      path: '/sounds',
      name: 'Sounds',
      component: () => import('./Sounds/Sounds.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true, requireFeature: 'sounds' },
    },
    {
      path: '/sounds/new',
      name: 'Add Sound',
      component: () => import('./Sounds/AddSound.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true, requireFeature: 'sounds' },
    },
    {
      path: '/effects',
      name: 'Effects',
      component: () => import('./Effects/Effects.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true },
    },
    {
      path: '/effects/new',
      name: 'Add Effect',
      component: () => import('./Effects/AddEffect.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true },
    },
    {
      path: '/effects/:effectId',
      name: 'Edit Effect',
      component: () => import('./Effects/EditEffect.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true },
    },
    {
      path: '/routes',
      name: 'Routes',
      component: () => import('./Routes/Routes.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true, requireFeature: 'routes' },
    },
    {
      path: '/routes/new',
      name: 'Add Route',
      component: () => import('./Routes/AddRoute.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true, requireFeature: 'routes' },
    },
    {
      path: '/routes/:routeId',
      name: 'Edit Route',
      component: () => import('./Routes/EditRoute.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true, requireFeature: 'routes' },
    },
    {
      path: '/signals',
      name: 'Signals',
      component: () => import('./Signals/Signals.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true },
    },
    {
      path: '/signals/new',
      name: 'Add Signal',
      component: () => import('./Signals/AddSignal.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true },
    },
    {
      path: '/signals/:signalId',
      name: 'Edit Signal',
      component: () => import('./Signals/EditSignal.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true },
    },
    {
      path: '/sensors',
      name: 'Sensors',
      component: () => import('./Sensors/Sensors.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true, requireFeature: 'sensors' },
    },
    {
      path: '/sensors/new',
      name: 'Add Sensor',
      component: () => import('./Sensors/AddSensor.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true, requireFeature: 'sensors' },
    },
    {
      path: '/sensors/automations',
      name: 'Automations',
      component: () => import('./Sensors/Automations.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true, requireFeature: 'sensors' },
    },
    {
      path: '/sensors/automations/new',
      name: 'Add Automation',
      component: () => import('./Sensors/AutomationForm.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true, requireFeature: 'sensors' },
    },
    {
      path: '/sensors/automations/:automationId',
      name: 'Edit Automation',
      component: () => import('./Sensors/AutomationForm.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true, requireFeature: 'sensors' },
    },
    {
      path: '/sensors/:sensorId',
      name: 'Edit Sensor',
      component: () => import('./Sensors/EditSensor.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true, requireFeature: 'sensors' },
    },
    {
      path: '/turnouts',
      name: 'Turnouts',
      component: () => import('./Turnouts/Turnouts.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true },
    },
    {
      path: '/turnouts/new',
      name: 'Add Turnout',
      component: () => import('./Turnouts/AddTurnout.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true },
    },
    {
      path: '/turnouts/:turnoutId',
      name: 'Edit Turnout',
      component: () => import('./Turnouts/EditTurnout.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true },
    },
    {
      path: '/turnouts/labels',
      name: 'Turnout Labels',
      component: () => import('./Turnouts/TurnoutLabels.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true },
    },
    {
      path: '/track-diagrams',
      name: 'Track Diagrams',
      component: () => import('./TrackDiagram/TrackDiagram.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true, requireFeature: 'trackDiagrams' },
    },
    {
      path: '/track-diagrams/new',
      name: 'Add Track Diagram',
      component: () => import('./TrackDiagram/AddTrackDiagram.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true, requireFeature: 'trackDiagrams' },
    },
    {
      path: '/track-diagrams/:diagramId',
      name: 'Edit Track Diagram',
      component: () => import('./TrackDiagram/EditTrackDiagram.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true, requireFeature: 'trackDiagrams' },
    },
    {
      path: '/power-districts',
      name: 'Power Districts',
      component: () => import('./PowerDistricts/PowerDistricts.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true },
    },
    {
      path: '/dccex',
      name: 'DCC-EX',
      component: () => import('./DCCEX/DCCEX.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireDccEx: true, requireLayout: true },
    },
    {
      path: '/devices',
      name: 'Devices',
      component: () => import('./Layout/Layout.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true },
    },
    {
      path: '/device',
      name: 'device-approval',
      component: () => import('./Device/DeviceApprovalView.vue'),
      meta: { requireAuth: true },
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('./Settings/Settings.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true },
    },
    {
      path: '/upgrade',
      name: 'Upgrade',
      component: () => import('./Upgrade/Upgrade.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true },
    },
    {
      path: '/devices/:deviceId',
      name: 'DeviceDetails',
      component: () => import('./Layout/Devices/DeviceDetails.vue'),
      meta: { requireAuth: true, requireOnboarding: true, requireLayout: true },
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

/** Fetch the user's layouts once for the onboarding guard. */
async function getUserLayouts(user: User) {
  const layoutsQuery = query(
    collection(db, 'layouts'),
    where('ownerUid', '==', user.uid),
  )
  return getDocs(layoutsQuery)
}

function checkRequireOnboarding(
  layoutsSnap: Awaited<ReturnType<typeof getDocs>>,
  to: RouteLocationNormalized,
): RouteLocationRaw | undefined {
  if (layoutsSnap.empty) {
    return {
      path: '/onboarding',
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

    // Dev auto-login (pnpm dev:demo)
    await ensureAutoLogin()

    // Resolve Firebase auth state once for the entire guard chain.
    const currentUser = await getCurrentUser()

    // 1. Redirect-if-authenticated (login / signup pages)
    if (meta.redirectIfAuthenticated) {
      const redirect = checkRedirectIfAuthenticated(currentUser ?? null)
      if (redirect) {
        log.debug('redirectIfAuthenticated → redirecting', redirect)
        return redirect
      }
    }

    // 2. Require authentication
    if (meta.requireAuth) {
      const redirect = checkRequireAuth(currentUser ?? null, to)
      if (redirect) {
        log.debug('requireAuth → redirecting to login')
        return redirect
      }
    }

    // From this point on, currentUser is guaranteed non-null when
    // requireAuth is set (the guard above would have returned).
    const user = currentUser as User

    // Fetch user layouts for the onboarding guard.
    const layoutsSnap = meta.requireOnboarding ? await getUserLayouts(user) : null

    // 3. Require onboarding (user must have at least one layout)
    if (meta.requireOnboarding && layoutsSnap) {
      const redirect = checkRequireOnboarding(layoutsSnap, to)
      if (redirect) {
        log.debug('requireOnboarding → redirecting to onboarding')
        return redirect
      }
    }

    // 4. Require a selected layout (auto-selects single layout)
    if (meta.requireLayout) {
      const redirect = await requireLayout(user.email!, to)
      if (redirect) {
        log.debug('requireLayout → redirecting')
        return redirect
      }
    }

    // 5. Require DCC-EX device
    if (meta.requireDccEx) {
      const redirect = checkRequireDccEx()
      if (redirect) {
        log.debug('requireDccEx → redirecting')
        return redirect
      }
    }

    // 6. Require feature flag
    if (meta.requireFeature) {
      if (!cachedUserRole || cachedUserId !== user.uid) {
        const userSnap = await getDoc(doc(db, 'users', user.uid))
        cachedUserRole = (userSnap.data()?.role as UserRole) ?? 'user'
        cachedUserId = user.uid
      }
      const devFeaturesEnv = import.meta.env.VITE_DEV_FEATURES === 'true'
      const redirect = checkRequireFeature(meta.requireFeature, cachedUserRole, devFeaturesEnv)
      if (redirect) {
        log.debug('requireFeature → redirecting (feature not enabled)')
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
