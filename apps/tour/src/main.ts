import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import colors from 'vuetify/util/colors'
// VueFire
import { VueFire, VueFireAuth } from 'vuefire'
// Firebase
import { firebaseApp } from '@repo/firebase-config/firebase'

import App from './App.vue'
import router from './router'

import './style.css'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  defaults: {
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
    defaultTheme: 'tourDark',
    themes: {
      tourLight: {
        dark: false,
        colors: {
          primary: '#FFD700', // Yellow
          secondary: '#FF4444', // Red  
          accent: '#4CAF50', // Green
          info: '#2196F3', // Blue
          warning: '#FF9800',
          error: '#F44336',
          success: '#4CAF50',
          surface: '#FFFFFF',
          background: '#F5F5F5',
        }
      },
      tourDark: {
        dark: true,
        colors: {
          primary: '#FFD700', // Yellow
          secondary: '#FF6B6B', // Lighter Red for dark mode
          accent: '#66BB6A', // Lighter Green for dark mode
          info: '#42A5F5', // Lighter Blue for dark mode
          warning: '#FFA726',
          error: '#EF5350',
          success: '#66BB6A',
          surface: '#1E1E1E',
          background: '#121212',
          'surface-variant': '#2D2D2D',
          'on-surface': '#E0E0E0',
          'on-background': '#E0E0E0',
        }
      }
    }
  }
})
const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
})
app.use(router)
app.use(vuetify)
app.mount('#app')
