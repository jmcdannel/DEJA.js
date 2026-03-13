import { createApp } from 'vue'
import * as Sentry from '@sentry/vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
// Vuetify components
import { VBtn } from 'vuetify/components/VBtn'
import { VCard } from 'vuetify/components/VCard'

// VueFire
import { VueFire, VueFireAuth } from 'vuefire'
// Firebase
import { firebaseApp } from '@repo/firebase-config'
import { createVuetifyThemes } from '@repo/ui'
// Motion
import { MotionPlugin } from '@vueuse/motion'
// Pinia
import { createPinia } from 'pinia'

// Components
import App from './App.vue'
import router from './router'

// Styles
import './style.css'
import '@mdi/font/css/materialdesignicons.css'


const vuetify = createVuetify({
  components,
  defaults: {
    global: {
      density: 'compact',
    },
    VBtn: {
      color: 'primary',
      rounded: 'sm',
      size: 'small',
      variant: 'tonal',
    },
    VCard: {
      class: 'monitor-card',
      color: 'surface',
      elevation: 0,
      padding: 0,
      rounded: 'lg',
    },
    VCardIten: {
      padding: 0,
    },
    VTextField: {
      color: 'primary',
      density: 'compact',
      variant: 'outlined',
    },
    VSwitch: {
      color: 'primary',
      inset: true,
    },
    VAlert: {
      density: 'compact',
    },
    VChip: {
      color: 'primary',
      size: 'small',
      variant: 'tonal',
    },
    VDialog: {
      transition: 'dialog-bottom-transition',
    },
    VMenu: {
      transition: 'scale-transition',
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
    themes: createVuetifyThemes({
      primary: '#38bdf8',
      secondary: '#22d3ee',
      accent: '#a78bfa',
      light: {
        background: '#f1f5f9',
        surface: '#ffffff',
      },
      custom: {
        dark: { 'monitor-glow': '#38bdf8' },
        light: { 'monitor-glow': '#0284c7' },
        'high-contrast': { 'monitor-glow': '#00FFFF' },
      },
    }),
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

app.use(createPinia())
app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
})
app.use(router)
app.use(vuetify)
app.use(MotionPlugin)
app.mount('#app')
