import './assets/main.css'

import { createApp } from 'vue'
import * as Sentry from '@sentry/vue'
import { inject as injectAnalytics } from '@vercel/analytics'
import { createPinia } from 'pinia'
import { VueFire, VueFireAuth } from 'vuefire'
import { MotionPlugin } from '@vueuse/motion'
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import App from './App.vue'
import router from './router'
import { firebaseApp } from '@repo/firebase-config'
import { createVuetifyThemes } from '@repo/ui'
// Style
import './style.css'
import '@mdi/font/css/materialdesignicons.css'

const themes = createVuetifyThemes({
  primary: '#00E5FF',
  secondary: '#D500F9',
  accent: '#C6FF00',
  light: {
    primary: '#00B8D4',
  },
  custom: {
    light: { 'device-connected': '#4CAF50', 'device-disconnected': '#F44336', 'stat-card': '#F5F7FA' },
    dark: { 'device-connected': '#66BB6A', 'device-disconnected': '#EF5350', 'stat-card': '#1A2332' },
    'high-contrast': { 'device-connected': '#00FF00', 'device-disconnected': '#FF0000', 'stat-card': '#1A1A1A' },
  },
})

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  defaults: {
    VDialog: { transition: 'dialog-bottom-transition' },
    VMenu: { transition: 'scale-transition' },
  },
  theme: {
    defaultTheme: 'dark',
    themes,
  },
})
const pinia = createPinia()
const vfireConfig = { firebaseApp, modules: [VueFireAuth()] }
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

if (import.meta.env.PROD) {
  injectAnalytics()
}

app.use(pinia)
app.use(router)
app.use(vuetify)
app.use(VueFire, vfireConfig)
app.use(MotionPlugin)
app.mount('#app')
