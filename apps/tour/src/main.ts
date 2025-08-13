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
import { firebaseApp } from '@repo/firebase-config'

import App from './App.vue'
import router from './router'
import { useGuestStore } from './stores/guest'

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
          secondary: '#FF4444'
        }
      },
      tourDark: {
        dark: true,
        colors: {
          primary: '#FFD700', // Yellow
          secondary: '#FF4444'
        }
      }
    }
  }
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(vuetify)
app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()]
})

// Initialize guest store
// const guestStore = useGuestStore()
// guestStore.initialize()

app.use(router)

app.mount('#app')
