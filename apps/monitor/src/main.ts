import { createApp } from 'vue'

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
      color: 'surface',
      elevation: 3,
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
    defaultTheme: 'monitorDark',
    themes: {
      monitorDark: {
        dark: true,
        colors: {
          background: '#020617',
          surface: '#0f172a',
          primary: '#38bdf8',
          secondary: '#22d3ee',
          info: '#0ea5e9',
          success: '#10b981',
          warning: '#f97316',
          error: '#ef4444',
        },
        variables: {
          'border-color': '#1e293b',
          'overlay-scrim-background': '#020617cc',
          'selection-control-size': 18,
        },
      },
    },
  },
})
const app = createApp(App)
app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
})
app.use(router)
app.use(vuetify)
app.mount('#app')
