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
// Motion
import { MotionPlugin } from '@vueuse/motion'

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
    VDialog: { transition: 'dialog-bottom-transition' },
    VMenu: { transition: 'scale-transition' },
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
          primary: '#511784ff', // Yellow
          secondary: '#236ab0ff'
        }
      },
      tourDark: {
        dark: true,
        colors: {
          primary: '#7846a3ff', // Yellow
          secondary: '#4080c0ff'
        }
      }
    }
  }
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(vuetify)
app.use(MotionPlugin)
app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()]
})

// Initialize guest store
// const guestStore = useGuestStore()
// guestStore.initialize()

app.use(router)

app.mount('#app')
