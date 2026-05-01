import type { OnboardingState, OnboardingStepInfo } from './types'

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  layoutNamed: false,
  pendingLayoutName: null,
  pendingLayoutId: null,
  planSelected: false,
  pendingPlan: null,
  pendingBillingCycle: null,
  paymentComplete: false,
  layoutCreated: false,
  installStarted: false,
  installStartedAt: null,
  serverStarted: false,
  serverStartedAt: null,
}

export const ONBOARDING_STEPS: OnboardingStepInfo[] = [
  {
    key: 'account',
    label: 'Create Account',
    description: 'Sign up to get started',
    icon: 'mdi-account-plus',
  },
  {
    key: 'layout',
    label: 'Name Layout',
    description: 'Give your railroad a name',
    icon: 'mdi-map-marker',
  },
  {
    key: 'plan',
    label: 'Choose Plan',
    description: 'Pick a plan or start free',
    icon: 'mdi-star',
  },
  {
    key: 'install',
    label: 'Install Server',
    description: 'One command to connect your railroad',
    icon: 'mdi-download',
  },
  {
    key: 'ready',
    label: 'Ready to Drive!',
    description: 'Your railroad is connected',
    icon: 'mdi-train',
  },
]

export const INSTALL_TIPS = [
  {
    title: 'DCC Addresses',
    text: 'DCC addresses are usually printed on the decoder or in the locomotive manual. Default address for new decoders is typically 3.',
    icon: 'mdi-information',
  },
  {
    title: 'Raspberry Pi',
    text: 'DEJA Server runs great on a Raspberry Pi 4 or 5. Just plug your CommandStation in via USB and you\'re set.',
    icon: 'mdi-raspberry-pi',
  },
  {
    title: 'Multi-Device',
    text: 'Once your server is running, open the Throttle app on any phone, tablet, or laptop on your network. All devices stay in sync automatically.',
    icon: 'mdi-cellphone-link',
  },
  {
    title: 'No WiFi Required on CommandStation',
    text: 'Your DCC-EX CommandStation connects via USB — no WiFi module needed. DEJA Server handles the network communication.',
    icon: 'mdi-usb',
  },
  {
    title: 'Cloud Sync',
    text: 'Your roster, turnout positions, and settings sync to the cloud in real time. Change something on your phone and see it on your tablet instantly.',
    icon: 'mdi-cloud-sync',
  },
]
