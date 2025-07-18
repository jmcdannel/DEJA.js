import { createApp } from 'vue'

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
// import router from './router'

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
  }
})
const app = createApp(App)
app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
})
// app.use(router)
app.use(vuetify)
app.mount('#app')
