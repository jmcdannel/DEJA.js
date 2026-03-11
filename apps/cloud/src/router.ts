import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from 'vuefire'
import { redirectIfAuthenticated, requireApproval, requireAuth, requireDccEx, requireLayout, requireOnboarding } from '@repo/auth'
import Dashboard from './Dashboard/Dashboard.vue'
import Login from './views/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Dashboard,
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      beforeEnter: [redirectIfAuthenticated],
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('./views/Signup.vue'),
      beforeEnter: [redirectIfAuthenticated],
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
      beforeEnter: [requireAuth, requireOnboarding],
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('./Onboarding/OnboardingWizard.vue'),
      beforeEnter: [requireAuth],
    },
    {
      path: '/select-layout',
      name: 'Select Layout',
      component: () => import('./Layout/SelectLayout.vue'),
      beforeEnter: [requireAuth],
    },
    {
      path: '/locos',
      name: 'Roster',
      component: () => import('./Roster/Roster.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireDccEx, requireLayout],
    },
    {
      path: '/locos/new',
      name: 'Add Loco',
      component: () => import('./Roster/AddLoco.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/locos/:address',
      name: 'Edit Loco',
      component: () => import('./Roster/EditLoco.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/effects',
      name: 'Effects',
      component: () => import('./Effects/Effects.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/effects/new',
      name: 'Add Effect',
      component: () => import('./Effects/AddEffect.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/effects/:effectId',
      name: 'Edit Effect',
      component: () => import('./Effects/EditEffect.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/routes',
      name: 'Routes',
      component: () => import('./Routes/Routes.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/routes/new',
      name: 'Add Route',
      component: () => import('./Routes/AddRoute.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/routes/:routeId',
      name: 'Edit Route',
      component: () => import('./Routes/EditRoute.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/signals',
      name: 'Signals',
      component: () => import('./Signals/Signals.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/signals/new',
      name: 'Add Signal',
      component: () => import('./Signals/AddSignal.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/signals/:signalId',
      name: 'Edit Signal',
      component: () => import('./Signals/EditSignal.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/sensors',
      name: 'Sensors',
      component: () => import('./Sensors/Sensors.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/sensors/new',
      name: 'Add Sensor',
      component: () => import('./Sensors/AddSensor.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/sensors/automations',
      name: 'Automations',
      component: () => import('./Sensors/Automations.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/sensors/automations/new',
      name: 'Add Automation',
      component: () => import('./Sensors/AutomationForm.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/sensors/automations/:automationId',
      name: 'Edit Automation',
      component: () => import('./Sensors/AutomationForm.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/sensors/:sensorId',
      name: 'Edit Sensor',
      component: () => import('./Sensors/EditSensor.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/turnouts',
      name: 'Turnouts',
      component: () => import('./Turnouts/Turnouts.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/turnouts/new',
      name: 'Add Turnout',
      component: () => import('./Turnouts/AddTurnout.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/turnouts/:turnoutId',
      name: 'Edit Turnout',
      component: () => import('./Turnouts/EditTurnout.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/turnouts/labels',
      name: 'Turnout Labels',
      component: () => import('./Turnouts/TurnoutLabels.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/dccex',
      name: 'DCC-EX',
      component: () => import('./DCCEX/DCCEX.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireDccEx, requireLayout],
    },
    {
      path: '/devices',
      name: 'Devices',
      component: () => import('./Layout/Layout.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('./Settings/Settings.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    {
      path: '/devices/:deviceId',
      name: 'DeviceDetails',
      component: () => import('./Layout/Devices/DeviceDetails.vue'),
      beforeEnter: [requireAuth, requireOnboarding, requireApproval, requireLayout],
    },
    // 404 - Catch all unmatched routes
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('./views/NotFound.vue'),
      beforeEnter: [requireAuth],
    }
  ],
})

let authInitialized = false

router.beforeEach(async () => {
  if (!authInitialized) {
    await getCurrentUser()
    authInitialized = true
  }
})

export default router
