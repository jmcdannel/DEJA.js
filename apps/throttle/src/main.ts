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
import { firebaseApp } from '@repo/firebase-config'
import { createVuetifyThemes } from '@repo/ui'
import { feedbackConfig } from '@repo/modules/feedback'
import router from './router'
import App from './App.vue'
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
    light: { 'device-connected': '#2E7D32', 'device-disconnected': '#C62828', 'stat-card': '#E8EDF2' },
    dark: { 'device-connected': '#66BB6A', 'device-disconnected': '#EF5350', 'stat-card': '#1A2332' },
    'high-contrast': { 'device-connected': '#00FF00', 'device-disconnected': '#FF0000', 'stat-card': '#000000' },
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

if (import.meta.env.PROD) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production',
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration(),
      Sentry.feedbackIntegration(feedbackConfig),
    ],
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  })

  app.config.errorHandler = (err, _instance, info) => {
    const eventId = Sentry.captureException(err, { extra: { info } })
    Sentry.showReportDialog({ eventId })
  }
}

if (import.meta.env.PROD) {
  injectAnalytics()
}

app.use(pinia)
app.use(router)
app.use(vuetify)
app.use(VueFire, vfireConfig)
app.use(MotionPlugin)
app.mount('#app')
