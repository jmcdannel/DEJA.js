import { createApp } from 'vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
// VueFire
import { VueFire, VueFireAuth } from 'vuefire'
// Flowbite
import 'flowbite'
// Firebase
import { firebaseApp } from './firebase'

// Components
import App from './App.vue'

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
const app = createApp(App)
app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
})
app.use(vuetify)
app.mount('#app')
