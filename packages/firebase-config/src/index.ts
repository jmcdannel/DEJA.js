// Re-export browser-compatible firebase configuration
export { firebaseApp, db, rtdb } from './firebase'

// App Check — call initAppCheck(firebaseApp) in each app's main.ts
export { initAppCheck } from './app-check'

// Note: For Node.js/server usage, import directly from:
// - './firebase-node' for client-side Node.js
// - './firebase-admin-node' for server-side admin operations
