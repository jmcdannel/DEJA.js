// 🚀 deploy trigger
import { createApp } from 'vue'
import * as Sentry from '@sentry/vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
// VueFire
import { VueFire, VueFireAuth } from 'vuefire'
// Firebase
import { firebaseApp } from '@repo/firebase-config'
import { createVuetifyThemes } from '@repo/ui'
import { feedbackConfig } from '@repo/modules/feedback'

// Motion
import { MotionPlugin } from '@vueuse/motion'

// Components
import App from './App.vue'
import router from './router'

// Styles
import './style.css'
import '@mdi/font/css/materialdesignicons.css'

const themes = createVuetifyThemes({
  primary: '#00E5FF',
  secondary: '#D500F9',
  accent: '#C6FF00',
  light: {
    primary: '#00B8D4',
  },
})

const vuetify = createVuetify({
  components,
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
    themes,
  },
})
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
    Sentry.captureException(err, { extra: { info } })
  }
}

app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
})
app.use(router)
app.use(vuetify)
app.use(MotionPlugin)
app.mount('#app')
