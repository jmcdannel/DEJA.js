import { createApp } from 'vue'
import * as Sentry from '@sentry/vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VStepperVertical } from 'vuetify/labs/VStepperVertical'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import colors from 'vuetify/util/colors'
// VueFire
import { VueFire, VueFireAuth } from 'vuefire'
// Firebase
import { firebaseApp, initAppCheck } from '@repo/firebase-config'

// Motion
import { MotionPlugin } from '@vueuse/motion'

// Components
import App from './App.vue'
import router from './router'

// Styles
import './style.css'
import '@mdi/font/css/materialdesignicons.css'

const light = {
  colors: {
    /* eslint-disable sort-keys -- theme order matters */
    background: '#F0F4F8',
    surface: '#FFFFFF',
    'surface-bright': '#FFFFFF',
    'surface-light': '#F8FAFC',
    'on-surface-variant': '#334155',
    'surface-variant': '#E2E8F0',
    primary: '#00B8D4', // Cyan
    'primary-darken-1': '#0097A7',
    secondary: '#D500F9', // Magenta
    'secondary-darken-1': '#AA00FF',
    error: '#FF1744',
    info: '#2979FF',
    success: '#00E676',
    warning: '#FF9100',
    accent: '#C6FF00', // Lime
    'device-connected': '#4CAF50',
    'device-disconnected': '#F44336',
    'stat-card': '#F5F7FA',
  },
  dark: false,
  variables: {
    /* eslint-disable sort-keys -- theme order matters */
    'border-color': '#000000',
    'border-opacity': 0.12,
    'high-emphasis-opacity': 0.87,
    'medium-emphasis-opacity': 0.60,
    'disabled-opacity': 0.38,
    'idle-opacity': 0.04,
    'hover-opacity': 0.04,
    'focus-opacity': 0.12,
    'selected-opacity': 0.08,
    'activated-opacity': 0.12,
    'pressed-opacity': 0.12,
    'dragged-opacity': 0.08,
    'theme-kbd': '#212529',
    'theme-on-kbd': '#FFFFFF',
    'theme-code': '#F5F5F5',
    'theme-on-code': '#000000',
  }
}
const dark = {
  colors: {
    /* eslint-disable sort-keys -- theme order matters */
    background: '#0B1120', // Deep slate for popping neo aesthetics
    surface: '#111827', // A slightly lighter slate
    'surface-bright': '#1F2937',
    'surface-light': '#374151',
    'on-surface-variant': '#E2E8F0',
    'surface-variant': '#374151',
    primary: '#00E5FF', // Neon Cyan
    secondary: '#D500F9', // Bright Magenta
    'secondary-darken-1': '#AA00FF',
    error: '#FF1744',
    info: '#2979FF',
    success: '#00E676',
    warning: '#FF9100',
    accent: '#C6FF00', // Vivid Lime
    'device-connected': '#4CAF50',
    'device-disconnected': '#F44336',
    'stat-card': '#1E1E2E',
  },
  dark: true,
  variables: {
    /* eslint-disable sort-keys -- theme order matters */
    'border-color': '#FFFFFF',
    'border-opacity': 0.12,
    'high-emphasis-opacity': 0.87,
    'medium-emphasis-opacity': 0.60,
    'disabled-opacity': 0.38,
    'idle-opacity': 0.04,
    'hover-opacity': 0.04,
    'focus-opacity': 0.12,
    'selected-opacity': 0.08,
    'activated-opacity': 0.12,
    'pressed-opacity': 0.12,
    'dragged-opacity':  0.08,
    'theme-kbd': '#212529',
    'theme-on-kbd': '#FFFFFF',
    'theme-code': '#F5F5F5',
    'theme-on-code': '#000000',
  }
}

const highContrast = {
  colors: {
    /* eslint-disable sort-keys -- theme order matters */
    background: '#000000',
    surface: '#1A1A1A',
    'surface-variant': '#2A2A2A',
    'surface-bright': '#333333',
    'surface-light': '#2A2A2A',
    'on-surface-variant': '#FFFFFF',
    primary: '#00FFFF',
    'primary-darken-1': '#00CCCC',
    secondary: '#FF00FF',
    'secondary-darken-1': '#CC00CC',
    accent: '#FFFF00',
    success: '#00FF00',
    error: '#FF0000',
    warning: '#FFA500',
    info: '#00BFFF',
    'device-connected': '#00FF00',
    'device-disconnected': '#FF0000',
    'stat-card': '#1A1A1A',
  },
  dark: true,
  variables: {
    /* eslint-disable sort-keys -- theme order matters */
    'border-color': '#FFFFFF',
    'border-opacity': 0.3,
    'high-emphasis-opacity': 1,
    'medium-emphasis-opacity': 0.8,
    'disabled-opacity': 0.5,
    'idle-opacity': 0.2,
  },
}

const vuetify = createVuetify({
  components: {
    ...components,
    VStepperVertical,
  },
  defaults: {
    VDialog: { transition: 'dialog-bottom-transition' },
    VMenu: { transition: 'scale-transition' },
    VNavigationDrawer: {
      VListItem: {
        density: 'compact',
        rounded: 'lg',
        class: 'mx-4 py-4',
      }
    },
  },
  directives,
  icons: {
    aliases,
    defaultSet: 'mdi',
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark,
      'high-contrast': highContrast,
      light,
    },
  },
})
const app = createApp(App)

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration({ router }),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})

initAppCheck(firebaseApp)

app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
})
app.use(router)
app.use(vuetify)
app.use(MotionPlugin)
app.mount('#app')
