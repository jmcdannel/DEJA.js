import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.dejajs.throttle',
  appName: 'DEJA Throttle',
  webDir: 'dist',
  server: {
    // Use https scheme on Android for secure WebViews
    androidScheme: 'https',
    // Allow Firebase and Google API domains for auth & Firestore
    allowNavigation: [
      '*.firebaseapp.com',
      '*.googleapis.com',
      '*.firebase.google.com',
      '*.gstatic.com',
    ],
  },
  ios: {
    // Allow the status bar to overlap app content so Vuetify can manage its own insets
    contentInset: 'automatic',
    // Allow HTTP connections to the local DEJA server on the same network
    allowsLinkPreview: false,
  },
  android: {
    // Allow cleartext (HTTP/WS) traffic to the local DEJA server on the same LAN
    allowMixedContent: true,
  },
}

export default config
