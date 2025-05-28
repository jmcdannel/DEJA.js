import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueFire, VueFireAuth } from 'vuefire'
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import App from './App.vue'
import router from './router'
import { firebaseApp } from '@repo/firebase-config/firebase'
// Styles
import './style.css'
import '@mdi/font/css/materialdesignicons.css'

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
})
const pinia = createPinia()
const vfireConfig = { firebaseApp, modules: [VueFireAuth()] }
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vuetify)
app.use(VueFire, vfireConfig)
app.mount('#app')
