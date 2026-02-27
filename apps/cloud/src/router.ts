import { createRouter, createWebHistory } from 'vue-router'
import { requireApproval, requireAuth, requireDccEx, requireLayout, requireOnboarding } from '@repo/auth'
import Dashboard from './Dashboard/Dashboard.vue'
import Login from './views/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Dashboard,
      beforeEnter: [requireAuth, requireApproval, requireOnboarding, requireLayout],
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('./views/Signup.vue'),
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
      beforeEnter: [requireAuth],
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('./Onboarding/OnboardingWizard.vue'),
      beforeEnter: [requireAuth, requireApproval],
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
      beforeEnter: [requireAuth, requireApproval, requireOnboarding, requireDccEx, requireLayout],
    },
    {
      path: '/locos/new',
      name: 'Add Loco',
      component: () => import('./Roster/AddLoco.vue'),
      beforeEnter: [requireAuth, requireApproval, requireOnboarding, requireLayout],
    },
    {
      path: '/locos/:address',
      name: 'Edit Loco',
      component: () => import('./Roster/EditLoco.vue'),
      beforeEnter: [requireAuth, requireApproval, requireOnboarding, requireLayout],
    },
    {
      path: '/effects',
      name: 'Effects',
      component: () => import('./Effects/Effects.vue'),
      beforeEnter: [requireAuth, requireApproval, requireOnboarding, requireLayout],
    },
    {
      path: '/effects/new',
      name: 'Add Effect',
      component: () => import('./Effects/AddEffect.vue'),
      beforeEnter: [requireAuth, requireApproval, requireOnboarding, requireLayout],
    },
    {
      path: '/effects/:effectId',
      name: 'Edit Effect',
      component: () => import('./Effects/EditEffect.vue'),
      beforeEnter: [requireAuth, requireApproval, requireOnboarding, requireLayout],
    },
    {
      path: '/routes',
      name: 'Routes',
      component: () => import('./Routes/Routes.vue'),
      beforeEnter: [requireAuth, requireApproval, requireOnboarding, requireLayout],
    },
    {
      path: '/routes/new',
      name: 'Add Route',
      component: () => import('./Routes/AddRoute.vue'),
      beforeEnter: [requireAuth, requireApproval, requireOnboarding, requireLayout],
    },
    {
      path: '/routes/:routeId',
      name: 'Edit Route',
      component: () => import('./Routes/EditRoute.vue'),
      beforeEnter: [requireAuth, requireApproval, requireOnboarding, requireLayout],
    },
    {
      path: '/signals',
      name: 'Signals',
      component: () => import('./Signals/Signals.vue'),
      beforeEnter: [requireAuth, requireApproval, requireOnboarding, requireLayout],
    },
    {
      path: '/signals/new',
      name: 'Add Signal',
      component: () => import('./Signals/AddSignal.vue'),
      beforeEnter: [requireAuth, requireApproval, requireOnboarding, requireLayout],
    },
    {
      path: '/signals/:signalId',
      name: 'Edit Signal',
      component: () => import('./Signals/EditSignal.vue'),
      beforeEnter: [requireAuth, requireApproval, requireOnboarding, requireLayout],
    },
    {
      path: '/turnouts',
      name: 'Turnouts',
      component: () => import('./Turnouts/Turnouts.vue'),
      beforeEnter: [requireAuth, requireApproval, requireOnboarding, requireLayout],
    },
    {
      path: '/turnouts/new',
      name: 'Add Turnout',
      component: () => import('./Turnouts/AddTurnout.vue'),
      beforeEnter: [requireAuth, requireApproval, requireOnboarding, requireLayout],
    },
    {
      path: '/turnouts/:turnoutId',
      name: 'Edit Turnout',
      component: () => import('./Turnouts/EditTurnout.vue'),
      beforeEnter: [requireAuth, requireApproval, requireOnboarding, requireLayout],
    },
    {
      path: '/turnouts/labels',
      name: 'Turnout Labels',
      component: () => import('./Turnouts/TurnoutLabels.vue'),
      beforeEnter: [requireAuth, requireApproval, requireOnboarding, requireLayout],
    },
    {
      path: '/dccex',
      name: 'DCC-EX',
      component: () => import('./DCCEX/DCCEX.vue'),
      beforeEnter: [requireAuth, requireApproval, requireOnboarding, requireDccEx, requireLayout],
    },
    {
      path: '/layout',
      name: 'Layout',
      component: () => import('./Layout/Layout.vue'),
      beforeEnter: [requireAuth, requireApproval, requireOnboarding, requireLayout],
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('./Settings/Settings.vue'),
      beforeEnter: [requireAuth],
    },
    {
      path: '/layout/device/:deviceId',
      name: 'Device',
      component: () => import('./Layout/Devices/DeviceDetails.vue'),
      beforeEnter: [requireAuth, requireApproval, requireOnboarding, requireLayout],
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

export default router
